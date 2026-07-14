# Model Training and Evaluation Report: patient_forecast

## I. Summary Statistics
- **Report Date**: 2026-07-04T10:46:33
- **Selected Best Model**: GradientBoosting
- **Parameters**: {'alpha': 0.9, 'ccp_alpha': 0.0, 'criterion': 'friedman_mse', 'init': None, 'learning_rate': 0.1, 'loss': 'squared_error', 'max_depth': 3, 'max_features': None, 'max_leaf_nodes': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'n_estimators': 10, 'n_iter_no_change': None, 'random_state': 42, 'subsample': 1.0, 'tol': 0.0001, 'validation_fraction': 0.1, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "MAE": 44.8509,
  "MSE": 2688.9436,
  "RMSE": 51.855,
  "R2": -0.0026,
  "MAPE": 71.1368
}

## III. Candidate Comparison
| Model | MAE | RMSE | R2 | Training Time |
|-------|-----|------|----|---------------|
| RandomForest | 47.8911 | 57.0801 | -0.2148 | 0.684s |
| GradientBoosting | 44.8509 | 51.855 | -0.0026 | 0.134s |
| XGBoost | 45.1053 | 52.2035 | -0.0161 | 0.046s |
