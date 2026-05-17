# Nexus Quant Hedge System 🚀

A complete, full-stack quantitative trading platform powered by Machine Learning. 

This system fetches historical stock data, computes advanced technical indicators, trains an XGBoost classifier to predict future price movements (Buy/Sell signals), and visualizes the results on a professional, high-performance web dashboard.

## 🧠 The AI Model

### Feature Engineering
The model uses `pandas-ta` to calculate multiple technical indicators that serve as features:
- **Simple Moving Averages (SMA):** 10-day and 50-day to capture short and medium-term trends.
- **Relative Strength Index (RSI):** 14-day RSI to identify overbought or oversold conditions.
- **MACD:** Moving Average Convergence Divergence to spot changes in momentum.
- **Bollinger Bands:** To measure market volatility.
- **Average True Range (ATR):** Another measure of volatility.

### Training & Prediction
- **Algorithm:** XGBoost Classifier.
- **Target Variable:** The model predicts `1` (Buy) if the next day's closing price is strictly higher than today's closing price, and `0` (Sell) otherwise.
- **Evaluation:** The model is evaluated on a chronologically split test set to simulate real-world trading without data leakage. Metrics like Accuracy and Precision are reported directly on the dashboard.

> **Note on "Clear Accuracy":** Predicting stock market movements with 100% accuracy is mathematically and practically impossible due to the high entropy of financial markets. The model aims for a statistical edge (e.g., >50% precision on buy signals) which, when combined with proper risk management, forms the basis of a quantitative hedge strategy.

## 🏗 System Architecture

- **Backend:** Python, FastAPI, XGBoost, Scikit-Learn, yfinance.
- **Frontend:** React, Vite, Lightweight Charts, Lucide-React.

## 🚀 Getting Started

### 1. Start the Backend API

Open a terminal, navigate to the `backend` directory, activate the virtual environment, and run the server:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend Dashboard

Open a second terminal, navigate to the `frontend` directory, and start the Vite dev server:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📁 Repository Structure

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
```
