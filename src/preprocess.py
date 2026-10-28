import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer


CATEGORICAL_FEATURES = [
    'patient_gender',
    'urgency_level',
    'department_referral',
    'patient_admission_flag',
    'day_of_week',
    'time_period',
]

NUMERICAL_FEATURES = [
    'patient_age',
    'month',
    'day',
    'admission_hour',
    'admission_minute',
]

TARGET = 'patient_waittime'


def load_data(filepath):
    df = pd.read_csv(filepath)
    return df


def get_features_target(df):
    X = df[CATEGORICAL_FEATURES + NUMERICAL_FEATURES]
    y = df[TARGET]
    return X, y


def build_preprocessor():
    categorical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='No Referral')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False)),
    ])

    numerical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
    ])

    preprocessor = ColumnTransformer([
        ('cat', categorical_transformer, CATEGORICAL_FEATURES),
        ('num', numerical_transformer, NUMERICAL_FEATURES),
    ])

    return preprocessor
