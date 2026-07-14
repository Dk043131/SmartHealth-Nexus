# Model Training and Evaluation Report: bed_forecast

## I. Summary Statistics
- **Report Date**: 2026-07-04T10:46:33
- **Selected Best Model**: GradientBoosting
- **Parameters**: {'alpha': 0.9, 'ccp_alpha': 0.0, 'criterion': 'friedman_mse', 'init': None, 'learning_rate': 0.1, 'loss': 'squared_error', 'max_depth': 3, 'max_features': None, 'max_leaf_nodes': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'n_estimators': 10, 'n_iter_no_change': None, 'random_state': 42, 'subsample': 1.0, 'tol': 0.0001, 'validation_fraction': 0.1, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "MAE": 0.2038,
  "MSE": 0.0578,
  "RMSE": 0.2403,
  "R2": -0.071,
  "MAPE": 63.5324
}

## III. Candidate Comparison
| Model | MAE | RMSE | R2 | Training Time |
|-------|-----|------|----|---------------|
| RandomForest | 0.2218 | 0.2625 | -0.2772 | 0.028s |
| GradientBoosting | 0.2038 | 0.2403 | -0.071 | 0.012s |
| XGBoost | 0.2297 | 0.2638 | -0.2908 | 0.024s |
