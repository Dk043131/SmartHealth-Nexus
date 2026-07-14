import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

class PreprocessingPipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def fit_transform_categorical(self, df: pd.DataFrame, columns: list) -> pd.DataFrame:
        df_encoded = df.copy()
        for col in columns:
            if col in df_encoded.columns:
                le = LabelEncoder()
                df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
                self.label_encoders[col] = le
        return df_encoded
        
    def transform_categorical(self, df: pd.DataFrame, columns: list) -> pd.DataFrame:
        df_encoded = df.copy()
        for col in columns:
            if col in df_encoded.columns and col in self.label_encoders:
                le = self.label_encoders[col]
                # Handle unseen labels by mapping them to 0 or first class
                classes = dict(zip(le.classes_, range(len(le.classes_))))
                df_encoded[col] = df_encoded[col].astype(str).map(classes).fillna(0).astype(int)
        return df_encoded

    def extract_date_features(self, df: pd.DataFrame, date_column: str) -> pd.DataFrame:
        df_dates = df.copy()
        if date_column in df_dates.columns:
            dates = pd.to_datetime(df_dates[date_column])
            df_dates['year'] = dates.dt.year
            df_dates['month'] = dates.dt.month
            df_dates['day'] = dates.dt.day
            df_dates['dayofweek'] = dates.dt.dayofweek
            df_dates['weekofyear'] = dates.dt.isocalendar().week.astype(int)
            df_dates['season'] = df_dates['month'].map(lambda m: 0 if m in [11, 12, 1, 2] else (1 if m in [3, 4, 5, 6] else 2)) # 0: Winter, 1: Summer, 2: Monsoon
        return df_dates

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        for col in df_clean.columns:
            if df_clean[col].dtype in [np.float64, np.int64]:
                df_clean[col] = df_clean[col].fillna(df_clean[col].median() if not df_clean[col].isnull().all() else 0)
            else:
                df_clean[col] = df_clean[col].fillna('Missing')
        return df_clean

    def serialize(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self, path)

    @staticmethod
    def deserialize(path: str) -> 'PreprocessingPipeline':
        return joblib.load(path)
