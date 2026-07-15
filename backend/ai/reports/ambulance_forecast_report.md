# Model Training and Evaluation Report: ambulance_forecast

## I. Summary Statistics
- **Report Date**: 2026-07-15T05:03:39
- **Selected Best Model**: GradientBoosting
- **Parameters**: {'alpha': 0.9, 'ccp_alpha': 0.0, 'criterion': 'deprecated', 'init': None, 'learning_rate': 0.1, 'loss': 'squared_error', 'max_depth': 3, 'max_features': None, 'max_leaf_nodes': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'n_estimators': 10, 'n_iter_no_change': None, 'random_state': 42, 'subsample': 1.0, 'tol': 0.0001, 'validation_fraction': 0.1, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "MAE": 2.0017,
  "MSE": 5.2505,
  "RMSE": 2.2914,
  "R2": -0.001,
  "MAPE": 69.5801
}

## III. Candidate Comparison
| Model | MAE | RMSE | R2 | Training Time |
|-------|-----|------|----|---------------|
| RandomForest | 2.1657 | 2.5961 | -0.285 | 0.184s |
| GradientBoosting | 2.0017 | 2.2914 | -0.001 | 0.045s |
