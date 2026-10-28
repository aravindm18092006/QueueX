# 🏥 Hospital Queue Wait Time Prediction

A machine learning web application that predicts how long a patient will wait before consulting a doctor. Built with a **FastAPI** backend, a **React + Vite** frontend, and **scikit-learn / XGBoost** ML models.

---

## 📌 Problem Statement

Hospital queues are a major challenge in healthcare management. Long and unpredictable wait times lead to patient dissatisfaction and inefficient resource allocation. This project builds a predictive model that estimates patient wait time (in minutes) using historical patient flow data, enabling hospitals to better manage queues and improve patient experience.

---

## 📂 Project Structure

```
HospitalQueuePrediction/
│
├── data/
│   ├── raw/
│   │   └── healthcare_analytics_patient_flow_data.csv   # Original raw dataset
│   └── processed/
│       └── hospital_queue_cleaned.csv                   # Cleaned dataset used for training
│
├── src/
│   ├── preprocess.py       # Feature definitions & sklearn preprocessing pipeline
│   ├── train.py            # Model training, evaluation & saving
│   └── predict.py          # Prediction interface
│
├── models/
│   └── queue_model.pkl     # Saved best model pipeline (generated after training)
│
├── outputs/
│   ├── model_comparison.png    # Model comparison chart (generated after training)
│   ├── feature_importance.png  # Feature importance chart (generated after training)
│   ├── metrics.csv             # Evaluation metrics for all models
│   ├── prediction_logs.csv     # Log of all predictions made via the API
│   └── feedback.csv            # User-submitted actual wait time feedback
│
├── frontend/               # React web application (Vite)
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Predict.jsx     # Prediction form & result display
│   │   │   ├── History.jsx     # Local prediction history
│   │   │   └── Dashboard.jsx   # Model metrics & live stats
│   │   ├── App.jsx             # Root component with tab navigation
│   │   ├── App.css             # Full design system & styles
│   │   └── main.jsx            # React entry point
│   ├── index.html
│   └── package.json
│
├── api.py                  # FastAPI backend
├── requirements.txt        # Python dependencies
└── README.md
```

---

## 📊 Dataset

**Raw File:** `data/raw/healthcare_analytics_patient_flow_data.csv`
**Cleaned File:** `data/processed/hospital_queue_cleaned.csv`

**Records:** 9,216 patient entries

| Column | Type | Description |
|---|---|---|
| patient_gender | Categorical | Female / Male |
| patient_age | Numerical | Age in years |
| urgency_level | Categorical | Emergency / Urgent / Semi-Urgent / Non-Urgent |
| department_referral | Categorical | Department referred to (No Referral if missing) |
| patient_admission_flag | Categorical | Admission / Not Admission |
| day_of_week | Categorical | Day name (Monday–Sunday) |
| month | Numerical | Month of admission (1–12) |
| day | Numerical | Day of month (1–31) |
| admission_hour | Numerical | Hour of admission (0–23) |
| admission_minute | Numerical | Minute of admission (0–59) |
| time_period | Categorical | Morning / Afternoon / Evening / Night |
| **patient_waittime** | **Target** | **Wait time in minutes (10–60)** |

---

## ⚙️ Data Quality & Preprocessing

- Corrected inconsistent gender values: `Femaleemale` → `Female`
- Filled missing `Department Referral` values with `No Referral`
- Converted admission dates using day-first parsing to handle mixed formats (e.g. `9/9/2024`, `31/12/2023`)
- Converted admission time into `admission_hour`, `admission_minute`, and `time_period` features
- Created `day_of_week`, `month`, and `day` features from the admission date
- Removed patient identifiers (`Patient Id`, `Merged`) and name-like fields
- Excluded `Patient Satisfaction Score` from model features — only available after the visit
- No missing values remain in the cleaned dataset

---

## 🔧 Feature Engineering

| Feature | Type | Description |
|---|---|---|
| patient_gender | Categorical | One-hot encoded |
| urgency_level | Categorical | One-hot encoded (Emergency / Urgent / Semi-Urgent / Non-Urgent) |
| department_referral | Categorical | One-hot encoded (includes No Referral) |
| patient_admission_flag | Categorical | One-hot encoded |
| day_of_week | Categorical | One-hot encoded (Monday–Sunday) |
| time_period | Categorical | One-hot encoded (Morning/Afternoon/Evening/Night) |
| patient_age | Numerical | Passed as-is |
| month | Numerical | Passed as-is |
| day | Numerical | Passed as-is |
| admission_hour | Numerical | Passed as-is |
| admission_minute | Numerical | Passed as-is |

A shared `sklearn` `ColumnTransformer` pipeline is used in both training and prediction to ensure consistent feature transformations.

---

## 🤖 Models Trained

| Model | Description |
|---|---|
| Linear Regression | Baseline linear model |
| Random Forest | Ensemble of decision trees (bagging) |
| Gradient Boosting | Sequential boosting with decision trees |
| XGBoost | Optimized gradient boosting framework |

All models are compared against a **mean-prediction baseline**. The best model by MAE is saved as `models/queue_model.pkl`.

**Evaluation Metrics:** MAE (primary), RMSE, R²

---

## 📈 Model Evaluation

| Model | MAE | RMSE | R² |
|---|---|---|---|
| Mean Baseline | 12.59 | 14.63 | -0.003 |
| Linear Regression | 12.59 | 14.65 | -0.005 |
| Random Forest | 12.80 | 14.96 | -0.048 |
| Gradient Boosting | 12.62 | 14.71 | -0.014 |
| XGBoost | 13.44 | 16.00 | -0.199 |

> **Note:** The dataset has a near-uniform distribution of wait times (10–60 min), meaning there is limited predictive signal in the available features. Model performance is close to the mean baseline, which is a characteristic of this dataset. Results will vary on real hospital data with natural patterns.

---

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- pip & npm

### Step 1 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Python Dependencies:**
```
pandas
numpy
scikit-learn
xgboost
matplotlib
seaborn
joblib
fastapi
uvicorn
```

### Step 2 — Install React Dependencies

```bash
cd frontend
npm install
```

---

## 🚀 Usage

### Step 1 — Train the Models

Run from the project root directory:

```bash
python src/train.py
```

This will:
1. Load `data/processed/hospital_queue_cleaned.csv`
2. Build a shared preprocessing + model pipeline
3. Train all 4 models and compare against a mean baseline
4. Save the best model pipeline to `models/queue_model.pkl`
5. Save evaluation metrics to `outputs/metrics.csv`
6. Generate `outputs/model_comparison.png` and `outputs/feature_importance.png`

### Step 2 — Start the FastAPI Backend

Open a terminal in the project root and run:

```bash
python -m uvicorn api:app --reload
```

The API will be available at `http://localhost:8000`

> API docs (auto-generated by FastAPI) available at `http://localhost:8000/docs`

### Step 3 — Start the React Frontend

Open a second terminal and run:

```bash
cd frontend
npm run dev
```

The app will open at `http://localhost:5173` in your browser.

### Step 4 — Make a Prediction (Programmatically)

```python
from src.predict import predict_waittime

wait_time = predict_waittime(
    admission_date='09/09/2024',
    admission_time='09:25:00',
    gender='Female',
    age=45,
    urgency_level='Non-Urgent',
    department='Cardiology',
    admission_flag='Not Admission',
)

print(f"Predicted Wait Time: {wait_time} minutes")
```

---

## 🌐 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{ "status": "Hospital Queue Prediction API is running" }
```

### `POST /predict`
Predict patient wait time.

**Request Body:**
```json
{
  "admission_date": "09/09/2024",
  "admission_time": "09:25:00",
  "gender": "Female",
  "age": 45,
  "urgency_level": "Non-Urgent",
  "department": "Cardiology",
  "admission_flag": "Not Admission"
}
```

**Response:**
```json
{
  "wait_time": 32.5,
  "category": "Moderate Wait",
  "color": "orange"
}
```

### `GET /metrics`
Returns model evaluation metrics from the last training run.

**Response:** Array of `{ Model, MAE, RMSE, R2 }` objects.

### `GET /stats`
Returns aggregated prediction statistics from the log file.

**Response:**
```json
{
  "total": 42,
  "avg_wait": 31.4,
  "short": 10,
  "moderate": 22,
  "long": 10
}
```

### `GET /logs`
Returns the last 50 prediction log entries.

### `GET /charts/{chart_name}`
Serves training output charts. Valid values: `comparison`, `importance`.

### `POST /feedback`
Submit actual wait time to compare against prediction.

**Request Body:**
```json
{
  "predicted_wait_time": 32.5,
  "actual_wait_time": 28.0,
  "department": "Cardiology"
}
```

---

## 🖥️ Web Application

The React app (`frontend/`) has three pages accessible via the top navigation bar.

### 🔍 Predict Tab
- Two-column form with three sections: Admission Info, Patient Info, Clinical Info
- Visual urgency level selector (Emergency / Urgent / Semi-Urgent / Non-Urgent)
- Department referral dropdown and admission type selector
- Animated result card with:
  - Large colored wait time number
  - Gradient hero banner (green / amber / red)
  - Animated gauge bar (0–60 min)
  - Stats row (department, urgency, admission time)
  - Optional feedback form to submit actual wait time
- Wait categories (illustrative, not clinical standards):
  - 🟢 Short wait (≤ 20 min)
  - 🟡 Moderate wait (21–40 min)
  - 🔴 Long wait (> 40 min)

### 📋 History Tab
- Summary stats bar: total, short / moderate / long counts, average wait
- Filter tabs by wait category
- Color-coded history cards stored in browser `localStorage`
- Clear all button

### 📊 Dashboard Tab
- Live stats bar: total predictions, average wait, short/long counts (from `/stats`)
- Best model banner with trophy
- Animated metric bar cards per model (MAE, RMSE, R²)
- Full comparison table with best model highlighted
- Model comparison and feature importance charts served from the API

---

## 🔁 How It Works — End to End

```
Raw CSV
   │
   ▼
data/processed/hospital_queue_cleaned.csv
   │
   ▼
src/preprocess.py
   ├── Define categorical & numerical features
   └── Build ColumnTransformer pipeline
   │
   ▼
src/train.py
   ├── Load cleaned data
   ├── Split 80% train / 20% test
   ├── Compare against mean baseline
   ├── Train 4 models inside sklearn Pipeline
   ├── Evaluate with MAE, RMSE, R²
   └── Save best pipeline → models/queue_model.pkl
   │
   ▼
api.py (FastAPI)
   ├── POST /predict → predict_waittime() → returns wait_time, category, color
   ├── GET  /metrics → model evaluation results
   ├── GET  /stats   → aggregated prediction log stats
   ├── GET  /logs    → last 50 prediction entries
   ├── GET  /charts/{name} → training output charts
   └── POST /feedback → records actual vs predicted wait time
   │
   ▼
frontend/ (React + Vite)
   ├── Predict  → form → POST /predict → animated result
   ├── History  → localStorage prediction log
   └── Dashboard → GET /metrics + /stats + /charts
```

---

## 🔮 Future Improvements

- Add real-time patient queue count as a feature
- Incorporate doctor availability and shift schedules
- Use time-series models for queue forecasting
- Add EDA notebook with detailed visualizations
- Deploy on AWS (EC2 / Elastic Beanstalk / SageMaker)
- Add patient history tracking
- Collect real hospital data with stronger predictive signal

---

## 📁 File Reference

| File | Purpose |
|---|---|
| `data/raw/` | Original unmodified dataset |
| `data/processed/hospital_queue_cleaned.csv` | Cleaned dataset used for training |
| `src/preprocess.py` | Feature definitions and sklearn ColumnTransformer pipeline |
| `src/train.py` | Model training, evaluation, chart and metrics generation |
| `src/predict.py` | Prediction function used by the API |
| `api.py` | FastAPI backend with all endpoints |
| `frontend/src/App.jsx` | Root component with tab navigation |
| `frontend/src/App.css` | Full design system and styles |
| `frontend/src/pages/Predict.jsx` | Prediction form and animated result card |
| `frontend/src/pages/History.jsx` | Local prediction history with filters |
| `frontend/src/pages/Dashboard.jsx` | Model metrics, live stats, and charts |
| `models/queue_model.pkl` | Serialized best model pipeline |
| `outputs/metrics.csv` | Evaluation metrics for all models |
| `outputs/prediction_logs.csv` | Log of all API predictions |
| `outputs/feedback.csv` | User-submitted actual wait time feedback |
| `outputs/model_comparison.png` | Model comparison bar charts |
| `outputs/feature_importance.png` | Top feature importances chart |
| `requirements.txt` | Python package dependencies |
