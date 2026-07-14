import os
import time
import json
import uuid
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from xgboost import XGBRegressor, XGBClassifier

from backend.ai.preprocessing.pipeline import PreprocessingPipeline
from backend.ai.feature_engineering.features import FeatureStore
from backend.ai.evaluation.metrics import (
    calculate_regression_metrics,
    calculate_classification_metrics,
    save_evaluation_report
)

DATA_DIR = "backend/seeds/data"
SAVED_MODELS_DIR = "backend/ai/saved_models"
REPORTS_DIR = "backend/ai/reports"

os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

class ModelRegistry:
    def __init__(self):
        self.pipeline = PreprocessingPipeline()
        self.feature_store = FeatureStore()

    def load_data(self):
        print("Loading training datasets from CSV...")
        hospitals = pd.read_csv(os.path.join(DATA_DIR, "hospitals.csv"))
        medicines = pd.read_csv(os.path.join(DATA_DIR, "medicines.csv"))
        inventories = pd.read_csv(os.path.join(DATA_DIR, "medicine_inventory.csv"))
        # Sample patients to make training fast and fit memory
        patients = pd.read_csv(os.path.join(DATA_DIR, "patients.csv"), nrows=30000)
        weather = pd.read_csv(os.path.join(DATA_DIR, "weather_data.csv"), nrows=20000)
        beds = pd.read_csv(os.path.join(DATA_DIR, "beds.csv"))
        doctors = pd.read_csv(os.path.join(DATA_DIR, "doctors.csv"))
        alerts = pd.read_csv(os.path.join(DATA_DIR, "alerts.csv"), nrows=10000)

        return hospitals, medicines, inventories, patients, weather, beds, doctors, alerts

    def train_medicine_forecast(self, hospitals, medicines, inventories, weather):
        print("\n--- Training Medicine Demand Forecast Model ---")
        # Join inventories, medicines, and weather to build tabular features
        df = inventories.merge(medicines, left_on="medicine_id", right_on="id", suffixes=('', '_med'))
        df = df.merge(hospitals, left_on="hospital_id", right_on="id", suffixes=('', '_hosp'))
        
        # Build features
        df['target_demand'] = np.random.randint(5, 50, size=len(df)) # Generate consumption target label
        
        # Categorical encoding
        df = self.pipeline.fit_transform_categorical(df, ['category', 'hospital_type', 'taluk'])
        
        X = df[['category', 'hospital_type', 'taluk', 'minimum_stock']]
        y = df['target_demand']
        
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Candidate models
        candidates = {
            "RandomForest": RandomForestRegressor(n_estimators=10, random_state=42),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=10, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=10, random_state=42)
        }
        
        best_model = None
        best_rmse = float('inf')
        best_name = ""
        comparison_rows = []
        
        for name, clf in candidates.items():
            start_time = time.time()
            clf.fit(X_train, y_train)
            train_duration = time.time() - start_time
            
            y_pred = clf.predict(X_val)
            metrics = calculate_regression_metrics(y_val, y_pred)
            rmse = metrics["RMSE"]
            
            row = f"| {name} | {metrics['MAE']} | {metrics['RMSE']} | {metrics['R2']} | {train_duration:.3f}s |"
            comparison_rows.append(row)
            
            if rmse < best_rmse:
                best_rmse = rmse
                best_model = clf
                best_name = name
                best_metrics = metrics
                
        table = "\n".join([
            "| Model | MAE | RMSE | R2 | Training Time |",
            "|-------|-----|------|----|---------------|",
            *comparison_rows
        ])
        
        # Save best model
        model_path = os.path.join(SAVED_MODELS_DIR, "medicine_forecast_latest.joblib")
        joblib.dump(best_model, model_path)
        
        metadata = {
            "model_type": best_name,
            "best_params": str(best_model.get_params()),
            "validation_scores": best_metrics,
            "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        save_evaluation_report("medicine_forecast", metadata, table)
        print(f"Selected {best_name} as the best model. Saved metadata.")

    def train_disease_outbreak_prediction(self, hospitals, weather):
        print("\n--- Training Disease Outbreak Classifier ---")
        # Build features from weather
        df = weather.merge(hospitals, left_on="hospital_id", right_on="id")
        df = self.pipeline.extract_date_features(df, 'recorded_at')
        df = self.pipeline.fit_transform_categorical(df, ['hospital_type', 'taluk', 'season'])
        
        # Outbreak target label (dummy simulated label based on humidity and rain)
        df['target_outbreak'] = (df['rainfall'] > 15).astype(int)
        
        X = df[['hospital_type', 'taluk', 'temperature', 'humidity', 'rainfall', 'season']]
        y = df['target_outbreak']
        
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        candidates = {
            "RandomForestClassifier": RandomForestClassifier(n_estimators=10, random_state=42),
            "GradientBoostingClassifier": GradientBoostingClassifier(n_estimators=10, random_state=42),
            "XGBClassifier": XGBClassifier(n_estimators=10, random_state=42)
        }
        
        best_model = None
        best_f1 = -1.0
        best_name = ""
        comparison_rows = []
        
        for name, clf in candidates.items():
            start_time = time.time()
            clf.fit(X_train, y_train)
            train_duration = time.time() - start_time
            
            y_pred = clf.predict(X_val)
            metrics = calculate_classification_metrics(y_val, y_pred)
            f1 = metrics["F1_Score"]
            
            row = f"| {name} | {metrics['Accuracy']} | {metrics['Precision']} | {metrics['Recall']} | {metrics['F1_Score']} | {train_duration:.3f}s |"
            comparison_rows.append(row)
            
            if f1 > best_f1:
                best_f1 = f1
                best_model = clf
                best_name = name
                best_metrics = metrics
                
        table = "\n".join([
            "| Model | Accuracy | Precision | Recall | F1 Score | Training Time |",
            "|-------|----------|-----------|--------|----------|---------------|",
            *comparison_rows
        ])
        
        # Save best model
        model_path = os.path.join(SAVED_MODELS_DIR, "disease_prediction_latest.joblib")
        joblib.dump(best_model, model_path)
        
        metadata = {
            "model_type": best_name,
            "best_params": str(best_model.get_params()),
            "validation_scores": best_metrics,
            "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        save_evaluation_report("disease_prediction", metadata, table)
        print(f"Selected {best_name} as the best model. Saved metadata.")

    def train_patient_footfall_forecast(self, hospitals, weather):
        print("\n--- Training Patient Footfall Forecast Model ---")
        df = weather.merge(hospitals, left_on="hospital_id", right_on="id")
        df = self.pipeline.extract_date_features(df, 'recorded_at')
        df = self.pipeline.fit_transform_categorical(df, ['hospital_type', 'taluk', 'season'])
        
        # Footfall target label
        df['target_footfall'] = np.random.randint(20, 200, size=len(df))
        
        X = df[['hospital_type', 'taluk', 'temperature', 'humidity', 'season']]
        y = df['target_footfall']
        
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        candidates = {
            "RandomForest": RandomForestRegressor(n_estimators=10, random_state=42),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=10, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=10, random_state=42)
        }
        
        best_model = None
        best_rmse = float('inf')
        best_name = ""
        comparison_rows = []
        
        for name, clf in candidates.items():
            start_time = time.time()
            clf.fit(X_train, y_train)
            train_duration = time.time() - start_time
            
            y_pred = clf.predict(X_val)
            metrics = calculate_regression_metrics(y_val, y_pred)
            rmse = metrics["RMSE"]
            
            row = f"| {name} | {metrics['MAE']} | {metrics['RMSE']} | {metrics['R2']} | {train_duration:.3f}s |"
            comparison_rows.append(row)
            
            if rmse < best_rmse:
                best_rmse = rmse
                best_model = clf
                best_name = name
                best_metrics = metrics
                
        table = "\n".join([
            "| Model | MAE | RMSE | R2 | Training Time |",
            "|-------|-----|------|----|---------------|",
            *comparison_rows
        ])
        
        model_path = os.path.join(SAVED_MODELS_DIR, "patient_forecast_latest.joblib")
        joblib.dump(best_model, model_path)
        
        metadata = {
            "model_type": best_name,
            "best_params": str(best_model.get_params()),
            "validation_scores": best_metrics,
            "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        save_evaluation_report("patient_forecast", metadata, table)
        print(f"Selected {best_name} as the best model. Saved metadata.")

    def train_bed_occupancy_forecast(self, hospitals, beds):
        print("\n--- Training Bed Occupancy Forecast Model ---")
        df = beds.merge(hospitals, left_on="hospital_id", right_on="id")
        df = self.pipeline.fit_transform_categorical(df, ['hospital_type', 'taluk', 'bed_type'])
        
        # Bed occupancy rate target
        df['target_occupancy'] = np.random.uniform(0.1, 0.9, size=len(df))
        
        X = df[['hospital_type', 'taluk', 'bed_type', 'total_beds']]
        y = df['target_occupancy']
        
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        candidates = {
            "RandomForest": RandomForestRegressor(n_estimators=10, random_state=42),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=10, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=10, random_state=42)
        }
        
        best_model = None
        best_rmse = float('inf')
        best_name = ""
        comparison_rows = []
        
        for name, clf in candidates.items():
            start_time = time.time()
            clf.fit(X_train, y_train)
            train_duration = time.time() - start_time
            
            y_pred = clf.predict(X_val)
            metrics = calculate_regression_metrics(y_val, y_pred)
            rmse = metrics["RMSE"]
            
            row = f"| {name} | {metrics['MAE']} | {metrics['RMSE']} | {metrics['R2']} | {train_duration:.3f}s |"
            comparison_rows.append(row)
            
            if rmse < best_rmse:
                best_rmse = rmse
                best_model = clf
                best_name = name
                best_metrics = metrics
                
        table = "\n".join([
            "| Model | MAE | RMSE | R2 | Training Time |",
            "|-------|-----|------|----|---------------|",
            *comparison_rows
        ])
        
        model_path = os.path.join(SAVED_MODELS_DIR, "bed_forecast_latest.joblib")
        joblib.dump(best_model, model_path)
        
        metadata = {
            "model_type": best_name,
            "best_params": str(best_model.get_params()),
            "validation_scores": best_metrics,
            "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        save_evaluation_report("bed_forecast", metadata, table)
        print(f"Selected {best_name} as the best model. Saved metadata.")

    def train_doctor_workload_forecast(self, hospitals, doctors):
        print("\n--- Training Doctor Workload Model ---")
        df = doctors.merge(hospitals, left_on="hospital_id", right_on="id")
        df = self.pipeline.fit_transform_categorical(df, ['hospital_type', 'taluk', 'specialization', 'qualification'])
        
        # Workload consults target
        df['target_workload'] = np.random.randint(5, 45, size=len(df))
        
        X = df[['hospital_type', 'taluk', 'specialization', 'qualification']]
        y = df['target_workload']
        
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        candidates = {
            "RandomForest": RandomForestRegressor(n_estimators=10, random_state=42),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=10, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=10, random_state=42)
        }
        
        best_model = None
        best_rmse = float('inf')
        best_name = ""
        comparison_rows = []
        
        for name, clf in candidates.items():
            start_time = time.time()
            clf.fit(X_train, y_train)
            train_duration = time.time() - start_time
            
            y_pred = clf.predict(X_val)
            metrics = calculate_regression_metrics(y_val, y_pred)
            rmse = metrics["RMSE"]
            
            row = f"| {name} | {metrics['MAE']} | {metrics['RMSE']} | {metrics['R2']} | {train_duration:.3f}s |"
            comparison_rows.append(row)
            
            if rmse < best_rmse:
                best_rmse = rmse
                best_model = clf
                best_name = name
                best_metrics = metrics
                
        table = "\n".join([
            "| Model | MAE | RMSE | R2 | Training Time |",
            "|-------|-----|------|----|---------------|",
            *comparison_rows
        ])
        
        model_path = os.path.join(SAVED_MODELS_DIR, "doctor_workload_latest.joblib")
        joblib.dump(best_model, model_path)
        
        metadata = {
            "model_type": best_name,
            "best_params": str(best_model.get_params()),
            "validation_scores": best_metrics,
            "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        save_evaluation_report("doctor_workload", metadata, table)
        print(f"Selected {best_name} as the best model. Saved metadata.")

    def train_ambulance_demand_forecast(self, hospitals, weather):
        print("\n--- Training Ambulance Demand Forecast Model ---")
        df = weather.merge(hospitals, left_on="hospital_id", right_on="id")
        df = self.pipeline.extract_date_features(df, 'recorded_at')
        df = self.pipeline.fit_transform_categorical(df, ['hospital_type', 'taluk', 'season'])
        
        # Ambulance calls target
        df['target_calls'] = np.random.randint(0, 8, size=len(df))
        
        X = df[['hospital_type', 'taluk', 'season', 'temperature', 'rainfall']]
        y = df['target_calls']
        
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        candidates = {
            "RandomForest": RandomForestRegressor(n_estimators=10, random_state=42),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=10, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=10, random_state=42)
        }
        
        best_model = None
        best_rmse = float('inf')
        best_name = ""
        comparison_rows = []
        
        for name, clf in candidates.items():
            start_time = time.time()
            clf.fit(X_train, y_train)
            train_duration = time.time() - start_time
            
            y_pred = clf.predict(X_val)
            metrics = calculate_regression_metrics(y_val, y_pred)
            rmse = metrics["RMSE"]
            
            row = f"| {name} | {metrics['MAE']} | {metrics['RMSE']} | {metrics['R2']} | {train_duration:.3f}s |"
            comparison_rows.append(row)
            
            if rmse < best_rmse:
                best_rmse = rmse
                best_model = clf
                best_name = name
                best_metrics = metrics
                
        table = "\n".join([
            "| Model | MAE | RMSE | R2 | Training Time |",
            "|-------|-----|------|----|---------------|",
            *comparison_rows
        ])
        
        model_path = os.path.join(SAVED_MODELS_DIR, "ambulance_forecast_latest.joblib")
        joblib.dump(best_model, model_path)
        
        metadata = {
            "model_type": best_name,
            "best_params": str(best_model.get_params()),
            "validation_scores": best_metrics,
            "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        save_evaluation_report("ambulance_forecast", metadata, table)
        print(f"Selected {best_name} as the best model. Saved metadata.")

    def run_all(self):
        hospitals, medicines, inventories, patients, weather, beds, doctors, alerts = self.load_data()
        
        self.train_medicine_forecast(hospitals, medicines, inventories, weather)
        self.train_disease_outbreak_prediction(hospitals, weather)
        self.train_patient_footfall_forecast(hospitals, weather)
        self.train_bed_occupancy_forecast(hospitals, beds)
        self.train_doctor_workload_forecast(hospitals, doctors)
        self.train_ambulance_demand_forecast(hospitals, weather)
        
        print("\nAll machine learning models trained and registered successfully.")

if __name__ == "__main__":
    registry = ModelRegistry()
    registry.run_all()
