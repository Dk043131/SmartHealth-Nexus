# Model Training and Evaluation Report: disease_prediction

## I. Summary Statistics
- **Report Date**: 2026-07-04T10:46:32
- **Selected Best Model**: RandomForestClassifier
- **Parameters**: {'bootstrap': True, 'ccp_alpha': 0.0, 'class_weight': None, 'criterion': 'gini', 'max_depth': None, 'max_features': 'sqrt', 'max_leaf_nodes': None, 'max_samples': None, 'min_impurity_decrease': 0.0, 'min_samples_leaf': 1, 'min_samples_split': 2, 'min_weight_fraction_leaf': 0.0, 'monotonic_cst': None, 'n_estimators': 10, 'n_jobs': None, 'oob_score': False, 'random_state': 42, 'verbose': 0, 'warm_start': False}

## II. Validation Metrics
{
  "Accuracy": 1.0,
  "Precision": 1.0,
  "Recall": 1.0,
  "F1_Score": 1.0,
  "ROC_AUC": 1.0
}

## III. Candidate Comparison
| Model | Accuracy | Precision | Recall | F1 Score | Training Time |
|-------|----------|-----------|--------|----------|---------------|
| RandomForestClassifier | 1.0 | 1.0 | 1.0 | 1.0 | 0.046s |
| GradientBoostingClassifier | 1.0 | 1.0 | 1.0 | 1.0 | 0.103s |
| XGBClassifier | 1.0 | 1.0 | 1.0 | 1.0 | 0.032s |
