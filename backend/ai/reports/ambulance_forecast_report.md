# Model Training and Evaluation Report: ambulance_forecast

## I. Summary Statistics
- **Report Date**: 2026-07-04T10:46:34
- **Selected Best Model**: GradientBoosting
- **Parameters**: {'alpha': 0.9, 'ccp_alpha': 0.0, 'criterion': 'friedman_mse', 'init': None, 'learning_rate': 0.1, 'loss': 'squared_error', 'max_depth': 3, 'max_features': None, 'max_leaf_nodes': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'n_estimators': 10, 'n_iter_no_change': None, 'random_state': 42, 'subsample': 1.0, 'tol': 0.0001, 'validation_fraction': 0.1, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "MAE": 2.0165,
  "MSE": 5.2995,
  "RMSE": 2.3021,
  "R2": 0.0,
  "MAPE": 70.0787
}

## III. Candidate Comparison
| Model | MAE | RMSE | R2 | Training Time |
|-------|-----|------|----|---------------|
| RandomForest | 2.1957 | 2.6262 | -0.3015 | 0.513s |
| GradientBoosting | 2.0165 | 2.3021 | 0.0 | 0.101s |
| XGBoost | 2.0171 | 2.3125 | -0.0091 | 0.046s |
