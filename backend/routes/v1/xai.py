from fastapi import APIRouter, Depends, Query, status
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.models import Hospital
from backend.schemas.schemas import APIResponse
from backend.xai.services.xai_service import ExplainableAiService
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/xai", tags=["Explainable AI (XAI) & Governance"])

# Instantiate XAI service
xai_service = ExplainableAiService()

@router.get("/explanations", response_model=APIResponse[dict])
def get_prediction_explanation(
    model_name: str = Query("disease_prediction"),
    base_value: float = Query(0.15),
    hospital_name: str = Query("Srinagar GH"),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns SHAP-approximated local attributions and natural language narratives explaining a model prediction.
    """
    hosp = db.query(Hospital).filter(Hospital.hospital_name == hospital_name, Hospital.is_deleted == False).first()
    hosp_type = hosp.hospital_type.value if hosp and hasattr(hosp.hospital_type, "value") else (hosp.hospital_type if hosp else "PHC")
    taluk = hosp.taluk if hosp else "Nagpur"

    # Deterministic weather based on hospital properties to show dynamic graphs
    h_hash = sum(ord(c) for c in hospital_name)
    temperature = 20.0 + (h_hash % 15)
    humidity = 40.0 + (h_hash % 50)
    rainfall = float(h_hash % 30)

    input_values = {
        "hospital_name": hospital_name,
        "hospital_type": hosp_type,
        "taluk": taluk,
        "temperature": temperature,
        "humidity": humidity,
        "rainfall": rainfall,
        "season": 2, # Monsoon
        "probability": base_value
    }
    
    res = xai_service.get_prediction_explanation(model_name, base_value, input_values)
    return APIResponse(success=True, message="Prediction explanations generated.", data=res)

@router.get("/alerts", response_model=APIResponse[list])
def get_predictive_alerts(
    current_user: User = Depends(verify_read_access)
):
    """
    Returns dynamically generated predictive and preventive warnings for the district.
    """
    res = xai_service.get_smart_alerts()
    return APIResponse(success=True, message="Predictive alerts scanned.", data=res)

@router.get("/risk", response_model=APIResponse[dict])
def get_risk_assessment(
    current_user: User = Depends(verify_read_access)
):
    """
    Returns current and projected hospital and district risk scores (0-100).
    """
    res = xai_service.get_risk_analysis()
    return APIResponse(success=True, message="District risk assessment completed.", data=res)

@router.get("/confidence", response_model=APIResponse[dict])
def get_confidence_analytics(
    model_name: str = Query("disease_prediction"),
    prediction_value: float = Query(18.0),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns model accuracy metrics, prediction intervals, and reliability scores.
    """
    res = xai_service.confidence.compile_confidence_report(model_name, prediction_value, 5.2)
    return APIResponse(success=True, message="Confidence analytics compiled.", data=res)

@router.get("/audit", response_model=APIResponse[list])
def get_decision_audit_trail(
    current_user: User = Depends(verify_read_access)
):
    """
    Returns searchable list of AI decisions, features used, and model versions.
    """
    res = xai_service.audit.get_audit_trail()
    return APIResponse(success=True, message="Decision audit trail retrieved.", data=res)

@router.get("/narratives", response_model=APIResponse[dict])
def get_dynamic_narratives(
    model_name: str = Query("disease_prediction"),
    base_value: float = Query(0.15),
    hospital_name: str = Query("Srinagar GH"),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns dynamic natural language insight summaries.
    """
    hosp = db.query(Hospital).filter(Hospital.hospital_name == hospital_name, Hospital.is_deleted == False).first()
    hosp_type = hosp.hospital_type.value if hosp and hasattr(hosp.hospital_type, "value") else (hosp.hospital_type if hosp else "PHC")
    taluk = hosp.taluk if hosp else "Nagpur"

    h_hash = sum(ord(c) for c in hospital_name)
    temperature = 20.0 + (h_hash % 15)
    humidity = 40.0 + (h_hash % 50)
    rainfall = float(h_hash % 30)

    input_values = {
        "hospital_name": hospital_name,
        "hospital_type": hosp_type,
        "taluk": taluk,
        "temperature": temperature,
        "humidity": humidity,
        "rainfall": rainfall,
        "season": 2,
        "probability": base_value
    }
    res = xai_service.get_prediction_explanation(model_name, base_value, input_values)
    return APIResponse(
        success=True, 
        message="Dynamic narrative insight generated.", 
        data={"narrative": res["narrative_explanation"]}
    )

@router.get("/feature-importance", response_model=APIResponse[dict])
def get_model_feature_importances(
    model_name: str = Query("disease_prediction"),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns global relative feature importances for a trained model.
    """
    res = xai_service.explainers.get_global_importance(model_name)
    return APIResponse(success=True, message="Model global feature importances retrieved.", data=res)
