import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import csv
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from src.predict import predict_waittime
import pandas as pd

app = FastAPI(title="Hospital Queue Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

LOGS_PATH = "outputs/prediction_logs.csv"
METRICS_PATH = "outputs/metrics.csv"


class PredictRequest(BaseModel):
    admission_date: str
    admission_time: str
    gender: str
    age: int = Field(ge=1, le=120)
    urgency_level: str
    department: str
    admission_flag: str


class FeedbackRequest(BaseModel):
    predicted_wait_time: float
    actual_wait_time: float
    department: str


def categorize(wait_time: float):
    if wait_time <= 20:
        return "Short Wait", "green"
    elif wait_time <= 40:
        return "Moderate Wait", "orange"
    return "Long Wait", "red"


def log_prediction(req: PredictRequest, wait_time: float, category: str):
    os.makedirs("outputs", exist_ok=True)
    file_exists = os.path.exists(LOGS_PATH)
    with open(LOGS_PATH, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["timestamp", "admission_date", "admission_time", "gender",
                             "age", "urgency_level", "department", "admission_flag",
                             "predicted_wait_time", "category"])
        writer.writerow([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            req.admission_date, req.admission_time, req.gender,
            req.age, req.urgency_level, req.department, req.admission_flag,
            wait_time, category,
        ])


@app.get("/")
def root():
    return {"status": "Hospital Queue Prediction API is running"}


@app.post("/predict")
def predict(req: PredictRequest):
    try:
        wait_time = predict_waittime(
            admission_date=req.admission_date,
            admission_time=req.admission_time,
            gender=req.gender,
            age=req.age,
            urgency_level=req.urgency_level,
            department=req.department,
            admission_flag=req.admission_flag,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    category, color = categorize(wait_time)
    log_prediction(req, wait_time, category)
    return {"wait_time": wait_time, "category": category, "color": color}


@app.get("/metrics")
def get_metrics():
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(status_code=404, detail="Metrics not found. Run training first.")
    df = pd.read_csv(METRICS_PATH)
    return df.to_dict(orient="records")


@app.get("/charts/{chart_name}")
def get_chart(chart_name: str):
    allowed = {
        "comparison": "outputs/model_comparison.png",
        "importance": "outputs/feature_importance.png",
    }
    if chart_name not in allowed:
        raise HTTPException(status_code=404, detail="Chart not found.")
    path = allowed[chart_name]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Chart file not found. Run training first.")
    return FileResponse(path, media_type="image/png")


@app.post("/feedback")
def submit_feedback(fb: FeedbackRequest):
    os.makedirs("outputs", exist_ok=True)
    feedback_path = "outputs/feedback.csv"
    file_exists = os.path.exists(feedback_path)
    with open(feedback_path, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["timestamp", "department", "predicted_wait_time", "actual_wait_time", "error"])
        error = round(abs(fb.predicted_wait_time - fb.actual_wait_time), 1)
        writer.writerow([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            fb.department, fb.predicted_wait_time, fb.actual_wait_time, error,
        ])
    return {"message": "Feedback recorded. Thank you!"}


@app.get("/logs")
def get_logs():
    if not os.path.exists(LOGS_PATH):
        return []
    df = pd.read_csv(LOGS_PATH)
    return df.tail(50).to_dict(orient="records")


@app.get("/stats")
def get_stats():
    if not os.path.exists(LOGS_PATH):
        return {"total": 0, "avg_wait": 0, "short": 0, "moderate": 0, "long": 0}
    df = pd.read_csv(LOGS_PATH)
    return {
        "total": len(df),
        "avg_wait": round(df["predicted_wait_time"].mean(), 1) if len(df) else 0,
        "short": int((df["category"] == "Short Wait").sum()),
        "moderate": int((df["category"] == "Moderate Wait").sum()),
        "long": int((df["category"] == "Long Wait").sum()),
    }
