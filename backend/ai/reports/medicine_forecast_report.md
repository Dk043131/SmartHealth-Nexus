# Model Training and Evaluation Report: medicine_forecast

## I. Summary Statistics
- **Report Date**: 2026-07-04T10:46:32
- **Selected Best Model**: GradientBoosting
- **Parameters**: {'alpha': 0.9, 'ccp_alpha': 0.0, 'criterion': 'friedman_mse', 'init': None, 'learning_rate': 0.1, 'loss': 'squared_error', 'max_depth': 3, 'max_features': None, 'max_leaf_nodes': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'n_estimators': 10, 'n_iter_no_change': None, 'random_state': 42, 'subsample': 1.0, 'tol': 0.0001, 'validation_fraction': 0.1, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "MAE": 11.2386,
  "MSE": 168.4955,
  "RMSE": 12.9806,
  "R2": -0.0003,
  "MAPE": 70.9872
}

## III. Candidate Comparison
| Model | MAE | RMSE | R2 | Training Time |
|-------|-----|------|----|---------------|
| RandomForest | 11.3475 | 13.1698 | -0.0297 | 0.197s |
| GradientBoosting | 11.2386 | 12.9806 | -0.0003 | 0.125s |
| XGBoost | 11.2584 | 13.0127 | -0.0053 | 0.054s |
