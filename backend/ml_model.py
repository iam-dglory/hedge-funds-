import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, classification_report
import xgboost as xgb
import joblib
import os
from data_engine import fetch_data

MODEL_DIR = "models"

def prepare_features_and_target(df: pd.DataFrame):
    """
    Prepares the feature matrix X and target vector y.
    Target: 1 if next day's close > today's close, else 0.
    """
    # Create target variable: shifted by -1 so today's row has tomorrow's direction
    df['Target'] = (df['Close'].shift(-1) > df['Close']).astype(int)
    
    # Drop the last row because it won't have a target (NaN from shift)
    df = df.dropna()
    
    # Select features (excluding Target, and raw price data except maybe Volume)
    # We use the indicators calculated in data_engine
    feature_cols = [col for col in df.columns if col not in ['Target', 'Open', 'High', 'Low', 'Close', 'Dividends', 'Stock Splits']]
    
    X = df[feature_cols]
    y = df['Target']
    
    return X, y, df

def train_model(ticker: str):
    """
    Trains an XGBoost model for a given ticker and saves it.
    """
    print(f"Training model for {ticker}...")
    df = fetch_data(ticker, period="5y")
    X, y, df = prepare_features_and_target(df)
    
    # Chronological split for financial data (no random shuffle)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Initialize and train XGBoost Classifier
    model = xgb.XGBClassifier(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=4,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    
    print(f"--- Results for {ticker} ---")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, f"{ticker}_xgb_model.joblib")
    joblib.dump(model, model_path)
    
    # Return metrics for API
    return {
        "ticker": ticker,
        "accuracy": accuracy,
        "precision": precision,
        "model_path": model_path
    }

def get_predictions(ticker: str, df: pd.DataFrame = None):
    """
    Loads model and generates predictions for the given dataframe.
    """
    model_path = os.path.join(MODEL_DIR, f"{ticker}_xgb_model.joblib")
    if not os.path.exists(model_path):
        # Train on the fly if not exists
        train_model(ticker)
        
    model = joblib.load(model_path)
    
    if df is None:
        df = fetch_data(ticker, period="1y")
        
    # Prepare features for prediction
    feature_cols = [col for col in df.columns if col not in ['Target', 'Open', 'High', 'Low', 'Close', 'Dividends', 'Stock Splits']]
    
    # If the df is fresh and doesn't have Target, we just use it directly
    # Ensure columns match training
    X = df[feature_cols]
    
    predictions = model.predict(X)
    prediction_probs = model.predict_proba(X)[:, 1] # Probability of Class 1 (Up)
    
    df['Predicted_Signal'] = predictions
    df['Prediction_Probability'] = prediction_probs
    
    return df

if __name__ == "__main__":
    train_model("AAPL")
