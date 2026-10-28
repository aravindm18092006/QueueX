import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
import numpy as np


MODEL_PATH = 'models/queue_model.pkl'


def predict_waittime(
    admission_date: str,
    admission_time: str,
    gender: str,
    age: int,
    urgency_level: str,
    department: str,
    admission_flag: str,
) -> float:
    pipeline = joblib.load(MODEL_PATH)

    dt = pd.to_datetime(f"{admission_date} {admission_time}", dayfirst=True, errors='coerce')

    day_of_week = dt.strftime('%A') if pd.notna(dt) else 'Monday'
    month = int(dt.month) if pd.notna(dt) else 1
    day = int(dt.day) if pd.notna(dt) else 1
    admission_hour = int(dt.hour) if pd.notna(dt) else 12
    admission_minute = int(dt.minute) if pd.notna(dt) else 0

    hour = admission_hour
    if 5 <= hour < 12:
        time_period = 'Morning'
    elif 12 <= hour < 17:
        time_period = 'Afternoon'
    elif 17 <= hour < 21:
        time_period = 'Evening'
    else:
        time_period = 'Night'

    input_df = pd.DataFrame([{
        'patient_gender': gender,
        'patient_age': age,
        'urgency_level': urgency_level,
        'department_referral': department,
        'patient_admission_flag': admission_flag,
        'day_of_week': day_of_week,
        'month': month,
        'day': day,
        'admission_hour': admission_hour,
        'admission_minute': admission_minute,
        'time_period': time_period,
    }])

    prediction = pipeline.predict(input_df)[0]
    return round(float(prediction), 1)


if __name__ == '__main__':
    result = predict_waittime(
        admission_date='9/9/2024',
        admission_time='09:25:00',
        gender='Female',
        age=45,
        urgency_level='Urgent',
        department='Cardiology',
        admission_flag='Not Admission',
    )
    print(f"Predicted Wait Time: {result} minutes")
