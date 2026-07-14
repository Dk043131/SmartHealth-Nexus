import os
import json
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, precision_recall_fscore_support, roc_auc_score

def calculate_regression_metrics(y_true, y_pred) -> dict:
    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_true, y_pred))
    
    # Calculate MAPE safely
    y_true_arr = np.array(y_true)
    y_pred_arr = np.array(y_pred)
    non_zero = y_true_arr != 0
    if np.sum(non_zero) > 0:
        mape = float(np.mean(np.abs((y_true_arr[non_zero] - y_pred_arr[non_zero]) / y_true_arr[non_zero])) * 100)
    else:
        mape = 0.0
        
    return {
        "MAE": round(mae, 4),
        "MSE": round(mse, 4),
        "RMSE": round(rmse, 4),
        "R2": round(r2, 4),
        "MAPE": round(mape, 4)
    }

def calculate_classification_metrics(y_true, y_pred) -> dict:
    accuracy = float(accuracy_score(y_true, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary', zero_division=0)
    
    # Safely compute ROC AUC
    try:
        auc = float(roc_auc_score(y_true, y_pred))
    except Exception:
        auc = 0.5
        
    return {
        "Accuracy": round(accuracy, 4),
        "Precision": round(float(precision), 4),
        "Recall": round(float(recall), 4),
        "F1_Score": round(float(f1), 4),
        "ROC_AUC": round(auc, 4)
    }

def save_evaluation_report(model_name: str, metrics: dict, comparison_table: str, report_dir="backend/ai/reports"):
    os.makedirs(report_dir, exist_ok=True)
    
    # JSON log
    json_path = os.path.join(report_dir, f"{model_name}_report.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)
        
    # Markdown audit report
    md_path = os.path.join(report_dir, f"{model_name}_report.md")
    report_content = f"""# Model Training and Evaluation Report: {model_name}

## I. Summary Statistics
- **Report Date**: {np.datetime64('now')}
- **Selected Best Model**: {metrics.get("model_type", "N/A")}
- **Parameters**: {metrics.get("best_params", "Default")}

## II. Validation Metrics
{json.dumps(metrics.get("validation_scores", {}), indent=2)}

## III. Candidate Comparison
{comparison_table}
"""
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
