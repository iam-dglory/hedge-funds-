import os
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv('ALPACA_API_KEY')
SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')

# Initialize the Alpaca Trading Client (Paper Trading)
if API_KEY and API_KEY != 'your_api_key_here':
    trading_client = TradingClient(API_KEY, SECRET_KEY, paper=True)
else:
    trading_client = None
    print("WARNING: Alpaca API keys are missing or invalid in .env. Paper trading will be disabled.")

def get_portfolio():
    """Returns the current paper trading account equity and buying power."""
    if not trading_client:
        return {"error": "Alpaca client not configured. Check .env"}
    
    try:
        account = trading_client.get_account()
        return {
            "equity": account.equity,
            "buying_power": account.buying_power,
            "currency": account.currency
        }
    except Exception as e:
        return {"error": str(e)}

def get_open_positions():
    """Returns a list of all current open positions in the paper account."""
    if not trading_client:
        return {"error": "Alpaca client not configured. Check .env"}
    
    try:
        positions = trading_client.get_all_positions()
        formatted_positions = []
        for pos in positions:
            formatted_positions.append({
                "symbol": pos.symbol,
                "qty": pos.qty,
                "market_value": pos.market_value,
                "current_price": pos.current_price,
                "unrealized_pl": pos.unrealized_pl,
                "unrealized_plpc": pos.unrealized_plpc
            })
        return formatted_positions
    except Exception as e:
        return {"error": str(e)}

def execute_trade(ticker: str, signal: int, qty: int = 10):
    """
    Executes a paper trade based on the AI signal.
    Signal 1: Buy (or hold if already own)
    Signal 0: Sell/Liquidate
    """
    if not trading_client:
        return {"error": "Alpaca client not configured. Check .env"}
    
    try:
        positions = trading_client.get_all_positions()
        holds_position = any(p.symbol == ticker for p in positions)
        
        if signal == 1:
            if holds_position:
                return {"status": "skipped", "message": f"Already holding {ticker}. No action taken."}
            
            # Submit a market order to buy
            order_data = MarketOrderRequest(
                symbol=ticker,
                qty=qty,
                side=OrderSide.BUY,
                time_in_force=TimeInForce.GTC
            )
            order = trading_client.submit_order(order_data)
            return {"status": "executed", "action": "BUY", "symbol": ticker, "qty": qty, "order_id": str(order.id)}
            
        elif signal == 0:
            if not holds_position:
                 return {"status": "skipped", "message": f"Not holding {ticker}. No action taken."}
            
            # Liquidate position
            trading_client.close_position(ticker)
            return {"status": "executed", "action": "SELL", "symbol": ticker, "message": f"Liquidated entire position for {ticker}."}
            
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Test connection if keys are present
    if trading_client:
        print("Portfolio:", get_portfolio())
