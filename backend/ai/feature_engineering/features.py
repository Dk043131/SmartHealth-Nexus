import pandas as pd
import numpy as np
import os
import joblib

class FeatureStore:
    def __init__(self, cache_dir="backend/ai/datasets"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        
    def get_cache_path(self, feature_name: str) -> str:
        return os.path.join(self.cache_dir, f"{feature_name}_features.joblib")
        
    def save_features(self, feature_name: str, df: pd.DataFrame):
        path = self.get_cache_path(feature_name)
        joblib.dump(df, path)
        
    def load_features(self, feature_name: str) -> pd.DataFrame:
        path = self.get_cache_path(feature_name)
        if os.path.exists(path):
            return joblib.load(path)
        return None

    def build_rolling_features(self, df: pd.DataFrame, group_col: str, value_col: str, windows=[3, 7, 14]) -> pd.DataFrame:
        """
        Calculates time-series rolling means and lag features grouped by hospital/facility.
        """
        df_feat = df.copy()
        # Sort to ensure chronological order before rolling
        if 'visit_date' in df_feat.columns:
            df_feat = df_feat.sort_values(by=['visit_date'])
        elif 'created_at' in df_feat.columns:
            df_feat = df_feat.sort_values(by=['created_at'])

        for w in windows:
            df_feat[f"{value_col}_rolling_mean_{w}"] = df_feat.groupby(group_col)[value_col].transform(
                lambda x: x.rolling(w, min_periods=1).mean()
            )
            df_feat[f"{value_col}_rolling_std_{w}"] = df_feat.groupby(group_col)[value_col].transform(
                lambda x: x.rolling(w, min_periods=1).std()
            ).fillna(0)
            
        # Add lag features
        for lag in [1, 2, 7]:
            df_feat[f"{value_col}_lag_{lag}"] = df_feat.groupby(group_col)[value_col].shift(lag).fillna(0)
            
        return df_feat
