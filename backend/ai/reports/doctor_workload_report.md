# Model Training and Evaluation Report: doctor_workload

## I. Summary Statistics
- **Report Date**: 2026-07-04T10:46:33
- **Selected Best Model**: GradientBoosting
- **Parameters**: {'alpha': 0.9, 'ccp_alpha': 0.0, 'criterion': 'friedman_mse', 'init': None, 'learning_rate': 0.1, 'loss': 'squared_error', 'max_depth': 3, 'max_features': None, 'max_leaf_nodes': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'n_estimators': 10, 'n_iter_no_change': None, 'random_state': 42, 'subsample': 1.0, 'tol': 0.0001, 'validation_fraction': 0.1, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "MAE": 10.6398,
  "MSE": 142.767,
  "RMSE": 11.9485,
  "R2": -0.0503,
  "MAPE": 81.4699
}

## III. Candidate Comparison
| Model | MAE | RMSE | R2 | Training Time |
|-------|-----|------|----|---------------|
| RandomForest | 11.2909 | 14.1702 | -0.4772 | 0.030s |
| GradientBoosting | 10.6398 | 11.9485 | -0.0503 | 0.011s |
| XGBoost | 10.7226 | 13.2303 | -0.2877 | 0.029s |
