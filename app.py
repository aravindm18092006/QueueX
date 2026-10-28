import streamlit as st
import os
import matplotlib.pyplot as plt
from src.predict import predict_waittime

st.set_page_config(page_title="Hospital Queue Predictor", page_icon="🏥", layout="centered")

# Header
st.title("🏥 Hospital Queue Predictor")
st.markdown("Fill in the patient details below and click **Predict** to estimate the wait time.")
st.markdown("---")

# Form layout — two columns for cleaner look
col1, col2 = st.columns(2)

with col1:
    admission_date = st.date_input("📅 Admission Date")
    gender = st.selectbox("👤 Gender", ["Female", "Male"])
    race = st.selectbox("🌍 Race", [
        "White", "African American", "Asian",
        "Two or More Races", "Declined to Identify",
        "Native American/Alaska Native", "Pacific Islander",
    ])
    department = st.selectbox("🏨 Department", [
        "No Referral", "General Practice", "Orthopedics",
        "Physiotherapy", "Renal", "Gastroenterology",
        "Cardiology", "Neurology",
    ])

with col2:
    admission_time = st.time_input("🕐 Admission Time")
    age = st.number_input("🎂 Age", min_value=1, max_value=100, value=35)
    admission_flag = st.selectbox("🏷️ Admission Type", ["Not Admission", "Admission"])

st.markdown("---")

# Predict button — centered
predict_clicked = st.button("🔍 Predict Wait Time", use_container_width=True)

if predict_clicked:
    if not os.path.exists("models/queue_model.pkl"):
        st.error("⚠️ Model not found. Please run `python src/train.py` first.")
    else:
        date_str = admission_date.strftime("%d/%m/%Y")
        time_str = admission_time.strftime("%H:%M:%S")

        wait_time = predict_waittime(
            admission_date=date_str,
            admission_time=time_str,
            gender=gender,
            age=age,
            race=race,
            department=department,
            admission_flag=admission_flag,
        )

        # Result
        st.markdown("## ⏱️ Estimated Wait Time")

        if wait_time <= 20:
            st.success(f"### 🟢 {wait_time} minutes — Short Wait")
            color = 'green'
        elif wait_time <= 40:
            st.warning(f"### 🟡 {wait_time} minutes — Moderate Wait")
            color = 'orange'
        else:
            st.error(f"### 🔴 {wait_time} minutes — Long Wait")
            color = 'red'

        # Simple progress bar style gauge
        st.markdown("**Wait time gauge (0 – 60 min):**")
        st.progress(int(wait_time) / 60)

        st.caption("ℹ️ Wait categories (Short / Moderate / Long) are illustrative and not clinical standards.")

st.markdown("---")

# Charts section — collapsible so it doesn't overwhelm beginners
if os.path.exists("outputs/model_comparison.png") or os.path.exists("outputs/feature_importance.png"):
    with st.expander("📊 View Model Performance Charts"):
        if os.path.exists("outputs/model_comparison.png"):
            st.subheader("Model Comparison")
            st.image("outputs/model_comparison.png")
        if os.path.exists("outputs/feature_importance.png"):
            st.subheader("Feature Importances")
            st.image("outputs/feature_importance.png")
