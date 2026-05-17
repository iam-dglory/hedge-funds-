import yfinance as yf
import pandas as pd
import pandas_ta as ta

def fetch_data(ticker: str, period: str = "2y", interval: str = "1d") -> pd.DataFrame:
    """
    Fetches historical stock data from Yahoo Finance and calculates technical indicators.
    """
    print(f"Fetching data for {ticker}...")
    stock = yf.Ticker(ticker)
    df = stock.history(period=period, interval=interval)
    
    if df.empty:
        raise ValueError(f"No data found for ticker {ticker}")

    # Clean data (remove timezone info which can cause issues with some ML libraries)
    df.index = df.index.tz_localize(None)

    # Calculate Technical Indicators
    # Moving Averages
    df.ta.sma(length=10, append=True)
    df.ta.sma(length=50, append=True)
    
    # RSI (Relative Strength Index)
    df.ta.rsi(length=14, append=True)
    
    # MACD (Moving Average Convergence Divergence)
    df.ta.macd(fast=12, slow=26, signal=9, append=True)
    
    # Bollinger Bands
    df.ta.bbands(length=20, std=2, append=True)
    
    # Volatility / ATR
    df.ta.atr(length=14, append=True)

    # Drop rows with NaN values created by indicators (e.g. first 50 days for SMA_50)
    df.dropna(inplace=True)
    
    return df

if __name__ == "__main__":
    # Quick test
    data = fetch_data("AAPL")
    print(data.tail())
