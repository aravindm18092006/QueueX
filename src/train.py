import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

from src.preprocess import load_data, get_features_target, build_preprocessor


DATA_PATH = 'data/processed/hospital_queue_cleaned.csv'
MODEL_PATH = 'models/queue_model.pkl'
OUTPUTS_DIR = 'outputs'


def evaluate(name, model, X_test, y_test):
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    print(f"{name:30s} | MAE: {mae:.2f} | RMSE: {rmse:.2f} | R2: {r2:.4f}")
    return {'Model': name, 'MAE': round(mae, 4), 'RMSE': round(rmse, 4), 'R2': round(r2, 4)}


def train():
    os.makedirs(OUTPUTS_DIR, exist_ok=True)
    os.makedirs('models', exist_ok=True)

    df = load_data(DATA_PATH)
    X, y = get_features_target(df)
    preprocessor = build_preprocessor()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Baseline: mean prediction
    baseline_preds = np.full(len(y_test), y_train.mean())
    baseline_mae = mean_absolute_error(y_test, baseline_preds)
    baseline_rmse = np.sqrt(mean_squared_error(y_test, baseline_preds))
    baseline_r2 = r2_score(y_test, baseline_preds)

    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
        'XGBoost': XGBRegressor(n_estimators=100, random_state=42, verbosity=0),
    }

    results = []
    print(f"\n{'Model':30s} | MAE    | RMSE   | R2")
    print("-" * 65)
    print(f"{'Mean Baseline':30s} | MAE: {baseline_mae:.2f} | RMSE: {baseline_rmse:.2f} | R2: {baseline_r2:.4f}")
    print("-" * 65)

    best_model_pipeline, best_mae, best_name = None, np.inf, ''

    for name, model in models.items():
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('model', model),
        ])
        pipeline.fit(X_train, y_train)
        res = evaluate(name, pipeline, X_test, y_test)
        results.append(res)
        if res['MAE'] < best_mae:
            best_mae = res['MAE']
            best_model_pipeline = pipeline
            best_name = name

    print(f"\nBest Model: {best_name} (MAE={best_mae:.4f})")
    joblib.dump(best_model_pipeline, MODEL_PATH)
    print(f"Pipeline saved to {MODEL_PATH}")

    # Save metrics CSV
    results_df = pd.DataFrame(results)
    results_df.to_csv(f'{OUTPUTS_DIR}/metrics.csv', index=False)
    print(f"Metrics saved to {OUTPUTS_DIR}/metrics.csv")

    # Model comparison chart
    fig, axes = plt.subplots(1, 3, figsize=(14, 5))
    for ax, metric in zip(axes, ['MAE', 'RMSE', 'R2']):
        sns.barplot(data=results_df, x='Model', y=metric, ax=ax, hue='Model', legend=False, palette='Blues_d')
        ax.set_title(metric)
        ax.tick_params(axis='x', rotation=20)
    plt.suptitle('Model Comparison', fontsize=14)
    plt.tight_layout()
    plt.savefig(f'{OUTPUTS_DIR}/model_comparison.png', dpi=100)
    print(f"Comparison chart saved to {OUTPUTS_DIR}/model_comparison.png")

    # Feature importance chart
    final_model = best_model_pipeline.named_steps['model']
    if hasattr(final_model, 'feature_importances_'):
        feature_names = best_model_pipeline.named_steps['preprocessor'].get_feature_names_out()
        fi = pd.Series(final_model.feature_importances_, index=feature_names).sort_values(ascending=False).head(15)
        plt.figure(figsize=(10, 5))
        sns.barplot(x=fi.values, y=fi.index, hue=fi.index, legend=False, palette='viridis')
        plt.title(f'Top 15 Feature Importances — {best_name}')
        plt.tight_layout()
        plt.savefig(f'{OUTPUTS_DIR}/feature_importance.png', dpi=100)
        print(f"Feature importance chart saved to {OUTPUTS_DIR}/feature_importance.png")


if __name__ == '__main__':
    train()
