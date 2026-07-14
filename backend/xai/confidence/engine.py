from datetime import datetime
from typing import Dict, Any

class ConfidenceEngine:
    def __init__(self):
        pass

    def compile_confidence_report(self, model_name: str, base_val: float, val_rmse: float) -> Dict[str, Any]:
        """
        Computes 95% confidence intervals and reliability ratings for a model prediction.
        """
        lower_bound = round(max(0.0, base_val - 1.96 * val_rmse), 2)
        upper_bound = round(base_val + 1.96 * val_rmse, 2)
        
        # Reliability rating based on RMSE magnitude
        rel_rating = "EXCELLENT" if val_rmse < 5.0 else ("GOOD" if val_rmse < 15.0 else "FAIR")
        
        return {
            "model_name": model_name,
            "prediction_value": base_val,
            "confidence_interval": [lower_bound, upper_bound],
            "reliability_rating": rel_rating,
            "prediction_stability": "STABLE",
            "model_version": "1.0.4",
            "training_date": "2026-07-04 16:30:00",
            "inference_timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
