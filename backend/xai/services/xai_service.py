from typing import Dict, Any, List
from backend.xai.explainers.engine import ExplainersEngine
from backend.xai.narratives.engine import NarrativeEngine
from backend.xai.confidence.engine import ConfidenceEngine
from backend.xai.alerts.engine import SmartAlertEngine
from backend.xai.risk.engine import RiskIntelligenceEngine
from backend.xai.audit.engine import DecisionAuditTrail
from backend.xai.governance.engine import GovernanceManager
from backend.optimization.services.opt_service import OptimizationService

class ExplainableAiService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ExplainableAiService, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.explainers = ExplainersEngine()
        self.narratives = NarrativeEngine()
        self.confidence = ConfidenceEngine()
        self.alerts = SmartAlertEngine()
        self.risk = RiskIntelligenceEngine()
        self.audit = DecisionAuditTrail()
        self.governance = GovernanceManager()
        self.opt_service = OptimizationService()
        
        # Populate initial dummy audit events
        self.audit.log_decision(
            action_name="Auto Medicine Transfer",
            category="MEDICINE",
            features_used=["minimum_stock", "taluk", "available_quantity"],
            confidence_score=0.94,
            outcome_summary="ORS redistributed from GH Srinagar to CHC Ganderbal."
        )
        self.audit.log_decision(
            action_name="Epidemiology Alert Scan",
            category="DISEASE",
            features_used=["rainfall", "humidity", "temperature"],
            confidence_score=0.88,
            outcome_summary="Risk warnings flagged for Srinagar block."
        )
        self._initialized = True

    def get_prediction_explanation(self, model_name: str, base_val: float, input_values: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates dynamic explanations (narrative, local shap attributions, confidence rating) for a prediction.
        """
        attributions = self.explainers.compute_local_attribution(model_name, input_values)
        
        # Select narrative
        h_name = input_values.get("hospital_name", "District PHC")
        if model_name == "medicine_forecast":
            m_name = input_values.get("medicine_name", "Paracetamol")
            min_stk = input_values.get("minimum_stock", 50.0)
            text = self.narratives.generate_medicine_narrative(h_name, m_name, base_val, min_stk)
        elif model_name == "disease_prediction":
            prob = input_values.get("probability", 0.15)
            level = "CRITICAL" if prob > 0.7 else "NORMAL"
            text = self.narratives.generate_disease_narrative(h_name, prob, level)
        elif model_name == "patient_forecast":
            text = self.narratives.generate_patient_narrative(h_name, base_val)
        else:
            text = f"Feature weights indicate input deviations within normal standard parameters."

        conf_report = self.confidence.compile_confidence_report(model_name, base_val, 8.5)
        
        # Commit to audit trail
        self.audit.log_decision(
            action_name=f"Explain Prediction: {model_name}",
            category="PREDICTION",
            features_used=list(input_values.keys()),
            confidence_score=conf_report["confidence_interval"][1] - conf_report["confidence_interval"][0],
            outcome_summary=text
        )

        return {
            "narrative_explanation": text,
            "feature_attributions": attributions,
            "confidence_report": conf_report,
            "metadata": {
                "model_version": "1.0.4",
                "model_type": "GradientBoosting"
            }
        }

    def get_risk_analysis(self) -> Dict[str, Any]:
        readiness = self.opt_service.get_district_readiness()
        
        h_risks = [self.risk.compute_hospital_risk(r) for r in readiness]
        d_risk = self.risk.compute_district_risk(h_risks)
        
        return {
            "hospital_risks": h_risks,
            "district_risk": d_risk
        }

    def get_smart_alerts(self) -> List[Dict[str, Any]]:
        readiness = self.opt_service.get_district_readiness()
        return self.alerts.scan_for_predictive_alerts(readiness)
