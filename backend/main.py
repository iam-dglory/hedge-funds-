from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json

from data_engine import fetch_data
from ml_model import get_predictions, train_model

app = FastAPI(title="Quant Hedge System API", description="AI Powered Trading Signals")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TickerRequest(BaseModel):
    ticker: str

@app.get("/")
def read_root():
    return {"status": "Quant Hedge System API is running"}

@app.post("/api/train")
def api_train_model(request: TickerRequest):
    """Force train a model for a specific ticker"""
    try:
        metrics = train_model(request.ticker.upper())
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/{ticker}")
def get_ticker_data(ticker: str):
    """
    Get historical data, technical indicators, and ML predictions for a ticker.
    This data format is tailored for lightweight-charts on the frontend.
    """
    try:
        ticker = ticker.upper()
        # Fetch base data
        df = fetch_data(ticker, period="1y")
        
        # Get predictions (will train if model doesn't exist)
        df_pred = get_predictions(ticker, df)
        
        # Format for frontend (convert timestamps to string dates)
        df_pred.reset_index(inplace=True)
        # Handle index name mapping for yfinance
        date_col = 'Date' if 'Date' in df_pred.columns else 'Datetime'
        
        chart_data = []
        signals = []
        
        for index, row in df_pred.iterrows():
            date_str = row[date_col].strftime('%Y-%m-%d')
            
            # Candlestick data
            chart_data.append({
                "time": date_str,
                "open": row['Open'],
                "high": row['High'],
                "low": row['Low'],
                "close": row['Close'],
                "value": row['Volume'] # For volume chart
            })
            
            # Extract ML Signals (1 = Buy, 0 = Sell)
            # Only add signals if the probability is strong, or on transitions
            # For simplicity, we highlight every 'Buy' signal
            if row['Predicted_Signal'] == 1:
                signals.append({
                    "time": date_str,
                    "position": "belowBar",
                    "color": "#00ffcc",
                    "shape": "arrowUp",
                    "text": "BUY",
                    "size": 1
                })
            elif row['Predicted_Signal'] == 0:
                 signals.append({
                    "time": date_str,
                    "position": "aboveBar",
                    "color": "#ff3366",
                    "shape": "arrowDown",
                    "text": "SELL",
                    "size": 1
                })
                
        # Get latest metrics
        metrics = train_model(ticker) # Just gets the evaluation of the existing model on train split

        return {
            "ticker": ticker,
            "chart_data": chart_data,
            "signals": signals,
            "metrics": metrics
        }
        
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
