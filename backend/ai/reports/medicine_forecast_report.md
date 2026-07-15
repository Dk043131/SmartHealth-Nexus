# Model Training and Evaluation Report: medicine_forecast

## I. Summary Statistics
- **Report Date**: 2026-07-15T05:03:38
- **Selected Best Model**: GradientBoosting
- **Parameters**: {'alpha': 0.9, 'ccp_alpha': 0.0, 'criterion': 'deprecated', 'init': None, 'learning_rate': 0.1, 'loss': 'squared_error', 'max_depth': 3, 'max_features': None, 'max_leaf_nodes': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'n_estimators': 10, 'n_iter_no_change': None, 'random_state': 42, 'subsample': 1.0, 'tol': 0.0001, 'validation_fraction': 0.1, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "MAE": 11.2835,
  "MSE": 169.2696,
  "RMSE": 13.0104,
  "R2": -0.0009,
  "MAPE": 72.4726
}

## III. Candidate Comparison
| Model | MAE | RMSE | R2 | Training Time |
|-------|-----|------|----|---------------|
| RandomForest | 11.3754 | 13.1704 | -0.0256 | 0.087s |
| GradientBoosting | 11.2835 | 13.0104 | -0.0009 | 0.060s |
