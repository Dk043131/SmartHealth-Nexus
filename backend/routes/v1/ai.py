import uuid
from datetime import datetime
from typing import Dict, List, Any
from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.models import Hospital, Medicine, Bed, Doctor
from backend.schemas.schemas import APIResponse
from backend.ai.prediction.services import PredictionService
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Predictive Analytics"])

# Instantiate Prediction Service singleton
ai_service = PredictionService()

# Encodings mapping helper (to match label encoder fit indices from training)
TALUK_MAP = {'Srinagar': 0, 'Ganderbal': 1, 'Budgam': 2, 'Baramulla': 3, 'Anantnag': 4}
HOSP_TYPE_MAP = {'PHC': 0, 'CHC': 1, 'GH': 2}
MED_CAT_MAP = {'Analgesic': 0, 'Antibiotic': 1, 'Antiviral': 2, 'Rehydration': 3, 'Respiratory Support': 4}

@router.get("/medicine-demand", response_model=APIResponse[dict])
def get_medicine_demand_prediction(
    hospital_id: uuid.UUID = Query(...),
    medicine_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db)
):
    """
    Predicts medicine consumption demand for a given hospital node and drug item.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()

    if not hospital or not medicine:
        return APIResponse(success=False, message="Hospital or Medicine entity not found.", data={})

    # Encode categories
    taluk_idx = TALUK_MAP.get(hospital.taluk, 0)
    type_idx = HOSP_TYPE_MAP.get(hospital.hospital_type.value if hasattr(hospital.hospital_type, 'value') else hospital.hospital_type, 0)
    cat_idx = MED_CAT_MAP.get(medicine.category, 0)
    min_stock = medicine.minimum_stock or 50

    pred_res = ai_service.predict_medicine_demand(
        category=cat_idx,
        hospital_type=type_idx,
        taluk=taluk_idx,
        minimum_stock=min_stock
    )
    
    return APIResponse(
        success=True,
        message="Medicine demand forecast compiled successfully.",
        data=pred_res
    )

@router.get("/disease-forecast", response_model=APIResponse[dict])
def get_disease_forecast_prediction(
    hospital_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db)
):
    """
    Classifies disease outbreak risk levels (CRITICAL, WARNING, NORMAL) using weather parameters.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        return APIResponse(success=False, message="Hospital not found.", data={})

    taluk_idx = TALUK_MAP.get(hospital.taluk, 0)
    type_idx = HOSP_TYPE_MAP.get(hospital.hospital_type.value if hasattr(hospital.hospital_type, 'value') else hospital.hospital_type, 0)

    # Use nominal seasonal values
    pred_res = ai_service.predict_disease_outbreak(
        hospital_type=type_idx,
        taluk=taluk_idx,
        temperature=22.5,
        humidity=70.0,
        rainfall=25.0,
        season=2 # Monsoon
    )

    return APIResponse(
        success=True,
        message="Disease outbreak forecast generated.",
        data=pred_res
    )

@router.get("/patient-forecast", response_model=APIResponse[dict])
def get_patient_forecast_prediction(
    hospital_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db)
):
    """
    Forecasts patient footfall admissions for the next 7 days.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        return APIResponse(success=False, message="Hospital not found.", data={})

    taluk_idx = TALUK_MAP.get(hospital.taluk, 0)
    type_idx = HOSP_TYPE_MAP.get(hospital.hospital_type.value if hasattr(hospital.hospital_type, 'value') else hospital.hospital_type, 0)

    pred_res = ai_service.predict_patient_footfall(
        hospital_type=type_idx,
        taluk=taluk_idx,
        temperature=24.0,
        humidity=65.0,
        season=2
    )

    return APIResponse(
        success=True,
        message="Patient footfall admissions forecast compiled.",
        data=pred_res
    )

@router.get("/bed-forecast", response_model=APIResponse[dict])
def get_bed_forecast_prediction(
    hospital_id: uuid.UUID = Query(...),
    bed_type: str = Query("ICU"),
    db: Session = Depends(get_db)
):
    """
    Forecasts critical care bed occupancy rates (ICU, general isolation).
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        return APIResponse(success=False, message="Hospital not found.", data={})

    taluk_idx = TALUK_MAP.get(hospital.taluk, 0)
    type_idx = HOSP_TYPE_MAP.get(hospital.hospital_type.value if hasattr(hospital.hospital_type, 'value') else hospital.hospital_type, 0)
    
    # Map bed type index
    bed_type_idx = 0 if bed_type == "ICU" else (1 if bed_type == "Ventilator" else (2 if bed_type == "Oxygen" else 3))

    pred_res = ai_service.predict_bed_occupancy(
        hospital_type=type_idx,
        taluk=taluk_idx,
        bed_type=bed_type_idx,
        total_beds=20
    )

    return APIResponse(
        success=True,
        message="Bed occupancy rate forecast calculated.",
        data=pred_res
    )

@router.get("/doctor-workload", response_model=APIResponse[dict])
def get_doctor_workload_prediction(
    doctor_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db)
):
    """
    Predicts workload consultation volumes for a given physician.
    """
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return APIResponse(success=False, message="Doctor not found.", data={})

    hospital = doctor.hospital
    taluk_idx = TALUK_MAP.get(hospital.taluk, 0) if hospital else 0
    type_idx = HOSP_TYPE_MAP.get(hospital.hospital_type.value if hospital and hasattr(hospital.hospital_type, 'value') else (hospital.hospital_type if hospital else 'PHC'), 0)
    
    spec_map = {'General Medicine': 0, 'Pediatrics': 1, 'Cardiology': 2}
    spec_idx = spec_map.get(doctor.specialization, 0)

    pred_res = ai_service.predict_doctor_workload(
        hospital_type=type_idx,
        taluk=taluk_idx,
        specialization=spec_idx,
        qualification=0
    )

    return APIResponse(
        success=True,
        message="Doctor workload consultation forecast compiled.",
        data=pred_res
    )

@router.get("/ambulance-demand", response_model=APIResponse[dict])
def get_ambulance_demand_prediction(
    hospital_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db)
):
    """
    Forecasts ambulance emergency trip demand indices.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        return APIResponse(success=False, message="Hospital not found.", data={})

    taluk_idx = TALUK_MAP.get(hospital.taluk, 0)
    type_idx = HOSP_TYPE_MAP.get(hospital.hospital_type.value if hasattr(hospital.hospital_type, 'value') else hospital.hospital_type, 0)

    pred_res = ai_service.predict_ambulance_demand(
        hospital_type=type_idx,
        taluk=taluk_idx,
        season=2,
        temperature=25.0,
        rainfall=10.0
    )

    return APIResponse(
        success=True,
        message="Ambulance dispatch demand forecast compiled.",
        data=pred_res
    )

def run_background_retrain():
    from backend.ai.training.train import ModelRegistry
    print("Initiating background models retraining...")
    registry = ModelRegistry()
    registry.run_all()
    # Reload model weights in predictions singleton
    PredictionService().load_models()

@router.post("/retrain", response_model=APIResponse[dict])
def trigger_ai_models_retraining(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(verify_read_access)
):
    """
    Triggers asynchronous retraining of all 6 predictive models as a background task.
    """
    background_tasks.add_task(run_background_retrain)
    return APIResponse(
        success=True,
        message="AI models background retraining triggered successfully.",
        data={
            "status": "IN_PROGRESS",
            "triggered_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    )
