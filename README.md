# Nexus Quant Hedge System

A complete quantitative trading system built with Python, FastAPI, React, and Machine Learning (XGBoost). This system predicts daily stock price movements using technical indicators and provides a modern, high-performance web dashboard for analysis.

## Features

- **Data Engineering**: Automatically fetches historical daily price data via `yfinance`.
- **Feature Generation**: Calculates key technical indicators (SMA, RSI, MACD, Bollinger Bands, ATR) using `pandas-ta`.
- **Machine Learning**: Trains an XGBoost Classifier on historical data to predict if the next day's closing price will be higher than today's.
- **API Backend**: Serves predictions and historical data via a robust `FastAPI` server.
- **Trading Terminal UI**: A premium, dark-mode React dashboard utilizing `lightweight-charts` to visualize price action and overlay AI buy/sell signals.

## System Architecture

1. **Backend (`/backend`)**:
   - `data_engine.py`: Handles data ingestion and technical indicator calculations.
   - `ml_model.py`: Handles feature engineering, model training, and prediction generation. Models are saved as `.joblib` files.
   - `main.py`: The FastAPI application that exposes the data to the frontend.
2. **Frontend (`/frontend`)**:
   - Built with React and Vite.
   - `TradingChart.jsx`: Renders the candlestick chart and ML signal markers.
   - `MetricsPanel.jsx`: Displays the backtested accuracy and precision of the model.

## Prerequisites

- Python 3.9+
- Node.js 18+

## Running the System Locally

### 1. Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

The FastAPI server will start on `http://localhost:8000`.

### 2. Start the Frontend

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will start. Open the provided local URL (usually `http://localhost:5173`) in your browser to view the terminal.

## A Note on "Clear Accuracy"

## Repository Structure

```
quant-hedge/
│
├── backend/                  # Python FastAPI Backend
│   ├── data_engine.py        # Data fetching & indicator math
│   ├── ml_model.py           # XGBoost training & prediction
│   ├── main.py               # API endpoints
│   ├── requirements.txt      # Python dependencies
│   └── models/               # Saved trained model weights (.joblib)
│
├── frontend/                 # React Web Application
│   ├── src/
│   │   ├── App.jsx           # Main layout & API integration
│   │   ├── index.css         # Premium dark mode UI styling
│   │   └── components/
│   │       ├── TradingChart.jsx # Interactive candlestick chart
│   │       └── MetricsPanel.jsx # AI performance dashboard
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

This project demonstrates the architecture of a quantitative trading system. It is important to note that predicting financial markets with 100% accuracy is theoretically and practically impossible due to market entropy and external variables. 

The XGBoost model included here uses historical technical indicators. Its accuracy (typically between 50-60%) is transparently displayed on the dashboard for each stock. This should be used for educational and research purposes, not for making real financial decisions.

## License

MIT
