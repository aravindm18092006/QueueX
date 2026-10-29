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
│   ├── metrics.csv             # Evaluation metrics for all models
│   ├── prediction_logs.csv     # Log of all predictions made via the API
│   ├── feedback.csv            # User-submitted actual wait time feedback
│   ├── model_comparison.png    # Model comparison chart (generated after training)
│   └── feature_importance.png  # Feature importance chart (generated after training)
│
├── frontend/               # React web application (Vite)
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Predict.jsx     # Prediction form & animated result card
│   │   │   ├── History.jsx     # Local prediction history with filters
│   │   │   └── Dashboard.jsx   # Model metrics, live stats & charts
│   │   ├── App.jsx             # Root component with tab navigation
│   │   ├── App.css             # Full design system & styles
│   │   └── main.jsx            # React entry point
│   ├── index.html
│   └── package.json
│
├── api.py                  # FastAPI backend with all endpoints
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
| `patient_gender` | Categorical | Female / Male |
| `patient_age` | Numerical | Age in years |
| `urgency_level` | Categorical | Emergency / Urgent / Semi-Urgent / Non-Urgent |
| `department_referral` | Categorical | Department referred to (No Referral if missing) |
| `patient_admission_flag` | Categorical | Admission / Not Admission |
| `day_of_week` | Categorical | Day name (Monday–Sunday) |
| `month` | Numerical | Month of admission (1–12) |
| `day` | Numerical | Day of month (1–31) |
| `admission_hour` | Numerical | Hour of admission (0–23) |
| `admission_minute` | Numerical | Minute of admission (0–59) |
| `time_period` | Categorical | Morning / Afternoon / Evening / Night |
| `patient_waittime` | **Target** | **Wait time in minutes** |

---

## ⚙️ Data Cleaning

- Corrected inconsistent gender values: `Femaleemale` → `Female`
- Filled missing department values with `No Referral`
- Parsed admission dates with mixed formats (e.g. `9/9/2024`, `31/12/2023`) using day-first parsing
- Split admission time into `admission_hour`, `admission_minute`, and `time_period`
- Extracted `day_of_week`, `month`, and `day` from the admission date
- Removed patient identifiers and name columns (not useful for prediction)
- Excluded `Patient Satisfaction Score` — only available after the visit
- No missing values remain in the cleaned dataset

---

## 🔧 Preprocessing (`src/preprocess.py`)

A shared `sklearn` `ColumnTransformer` pipeline is used in both training and prediction:

| Feature | Type | Transform |
|---|---|---|
| `patient_gender` | Categorical | One-hot encoded |
| `urgency_level` | Categorical | One-hot encoded |
| `department_referral` | Categorical | One-hot encoded |
| `patient_admission_flag` | Categorical | One-hot encoded |
| `day_of_week` | Categorical | One-hot encoded |
| `time_period` | Categorical | One-hot encoded |
| `patient_age` | Numerical | Passed as-is |
| `month` | Numerical | Passed as-is |
| `day` | Numerical | Passed as-is |
| `admission_hour` | Numerical | Passed as-is |
| `admission_minute` | Numerical | Passed as-is |

---

## 🤖 Models Trained (`src/train.py`)

| Model | Description |
|---|---|
| Linear Regression | Simple baseline linear model |
| Random Forest | Ensemble of decision trees (bagging) |
| Gradient Boosting | Sequential boosting — each tree fixes the previous one's mistakes |
| XGBoost | Optimized gradient boosting framework |

All models are compared against a **mean-prediction baseline**. The best model by MAE is saved as `models/queue_model.pkl`.

---

## 📈 Model Results

| Model | MAE | RMSE | R² |
|---|---|---|---|
| Linear Regression | 12.83 | 15.06 | 0.23 |
| Random Forest | 13.09 | 15.46 | 0.19 |
| **Gradient Boosting** 👑 | **12.72** | **14.90** | **0.25** |
| XGBoost | 13.48 | 16.17 | 0.12 |

- **MAE** — average minutes the prediction is off by
- **RMSE** — like MAE but penalizes large errors more
- **R²** — how much variation the model explains (1.0 = perfect, 0 = same as guessing the mean)

**Gradient Boosting** is saved as the best model.

---

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 18+

### Install Python dependencies

```bash
pip install -r requirements.txt
```

### Install React dependencies

```bash
cd frontend
npm install
```

---

## 🚀 Running the App

### 1. Train the model (only needed once)

```bash
python src/train.py
```

### 2. Start the backend API — Terminal 1

```bash
python -m uvicorn api:app --reload
```

API runs at `http://localhost:8000` — docs at `http://localhost:8000/docs`

### 3. Start the frontend — Terminal 2

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/predict` | Predict wait time from patient details |
| GET | `/metrics` | Model evaluation scores from last training run |
| GET | `/stats` | Live prediction stats (total, avg, short/moderate/long counts) |
| GET | `/logs` | Last 50 predictions made |
| GET | `/charts/comparison` | Model comparison chart image |
| GET | `/charts/importance` | Feature importance chart image |
| POST | `/feedback` | Submit actual wait time for a prediction |

### POST `/predict` — Request

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

### POST `/predict` — Response

```json
{
  "wait_time": 32.5,
  "category": "Moderate Wait",
  "color": "orange"
}
```

Every `/predict` call is automatically logged to `outputs/prediction_logs.csv`.

---

## 🖥️ Web Application

### 🔍 Predict Tab
- Form with three sections: Admission Info, Patient Info, Clinical Info
- Visual urgency level selector (Emergency / Urgent / Semi-Urgent / Non-Urgent)
- Animated result card with:
  - Large colored wait time number
  - Gradient hero banner (green / amber / red)
  - Animated gauge bar (0–60 min)
  - Stats row showing department, urgency, and admission time
  - Optional feedback form to submit actual wait time
- Wait categories (illustrative, not clinical standards):
  - 🟢 Short wait — ≤ 20 min
  - 🟡 Moderate wait — 21–40 min
  - 🔴 Long wait — > 40 min

### 📋 History Tab
- Summary stats: total predictions, short / moderate / long counts, average wait time
- Filter tabs by wait category
- Color-coded prediction cards stored in browser `localStorage`
- Clear all button

### 📊 Dashboard Tab
- Live stats bar: total predictions, average wait, short/long counts (from `GET /stats`)
- Best model banner with trophy 🏆
- Animated metric bar cards per model (MAE, RMSE, R²)
- Full comparison table with best model highlighted
- Model comparison and feature importance charts served from the API

---

## 🔁 Full Flow Diagram

```
User fills form in browser
        │
        ▼
React frontend (localhost:5173)
        │  POST /predict
        ▼
FastAPI backend (localhost:8000)
        │
        ▼
predict_waittime()  ←── src/predict.py
        │
        ├── Parse date & time → extract 5 time features
        ├── Build one-row DataFrame (11 features)
        └── Load models/queue_model.pkl
                │
                ▼
        ColumnTransformer  ←── src/preprocess.py
                │  One-hot encode 6 categorical columns
                │  Pass through 5 numerical columns
                ▼
        Gradient Boosting model
                │
                ▼
        Predicted wait time (e.g. 32.5 min)
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
  Return to API    Log to prediction_logs.csv
        │
        ▼
React shows animated result card
```

---

## 📁 File Reference

| File | Purpose |
|---|---|
| `data/processed/hospital_queue_cleaned.csv` | Cleaned dataset used for training |
| `src/preprocess.py` | Feature definitions and sklearn ColumnTransformer pipeline |
| `src/train.py` | Model training, evaluation, chart and metrics generation |
| `src/predict.py` | Prediction function used by the API |
| `api.py` | FastAPI backend with all endpoints |
| `models/queue_model.pkl` | Serialized best model pipeline |
| `outputs/metrics.csv` | Evaluation metrics for all models |
| `outputs/prediction_logs.csv` | Log of all API predictions |
| `outputs/feedback.csv` | User-submitted actual wait time feedback |
| `outputs/model_comparison.png` | Model comparison bar charts |
| `outputs/feature_importance.png` | Top feature importances chart |
| `frontend/src/App.jsx` | Root component with tab navigation |
| `frontend/src/App.css` | Full design system and styles |
| `frontend/src/pages/Predict.jsx` | Prediction form and animated result card |
| `frontend/src/pages/History.jsx` | Local prediction history with filters |
| `frontend/src/pages/Dashboard.jsx` | Model metrics, live stats, and charts |
| `requirements.txt` | Python package dependencies |

---

## 🔮 Future Ideas

- Add real-time queue count (how many patients are already waiting)
- Include doctor availability and shift schedules
- Deploy on AWS (EC2 / Elastic Beanstalk / SageMaker)
- Collect real hospital data for stronger predictions
- Add time-series forecasting for queue trends
