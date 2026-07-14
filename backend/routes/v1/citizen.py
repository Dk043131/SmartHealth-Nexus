import uuid
from typing import Dict, List, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.models import Hospital, MedicineInventory, Doctor, Ambulance, Alert, Bed
from backend.schemas.schemas import APIResponse

router = APIRouter(prefix="/citizen", tags=["Citizen Public Portal"])

@router.get("/hospitals", response_model=APIResponse[list])
def search_hospitals_for_citizens(
    district: str = Query(None),
    taluk: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Public-facing endpoint to search hospitals by district or taluk.
    """
    query = db.query(Hospital).filter(Hospital.is_deleted == False)
    if district:
        query = query.filter(Hospital.district.ilike(f"%{district}%"))
    if taluk:
        query = query.filter(Hospital.taluk.ilike(f"%{taluk}%"))
        
    hospitals = [
        {
            "id": h.id,
            "hospital_name": h.hospital_name,
            "hospital_type": h.hospital_type.value if hasattr(h.hospital_type, "value") else h.hospital_type,
            "taluk": h.taluk,
            "district": h.district,
            "latitude": h.latitude,
            "longitude": h.longitude
        }
        for h in query.all()
    ]
    return APIResponse(success=True, message="Hospitals fetched.", data=hospitals)

@router.get("/availability", response_model=APIResponse[dict])
def get_hospital_availability_for_citizens(
    hospital_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db)
):
    """
    Returns live medicine, bed, doctor, and ambulance availability aggregates for citizens.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        return APIResponse(success=False, message="Hospital not found.", data={})

    # Count inventories
    medicines = db.query(MedicineInventory).filter(
        MedicineInventory.hospital_id == hospital_id,
        MedicineInventory.available_quantity > 0
    ).count()

    # Count beds
    beds_count = db.query(Bed).filter(Bed.hospital_id == hospital_id).count()
    occupied = db.query(Bed).filter(Bed.hospital_id == hospital_id, Bed.status == "OCCUPIED").count()
    available_beds = beds_count - occupied

    # Count doctors present
    doctors = db.query(Doctor).filter(
        Doctor.hospital_id == hospital_id,
        Doctor.attendance_status == "Present"
    ).count()

    # Count ambulances available
    ambulances = db.query(Ambulance).filter(
        Ambulance.hospital_id == hospital_id,
        Ambulance.status == "AVAILABLE"
    ).count()

    return APIResponse(
        success=True,
        message="Live availability metrics compiled.",
        data={
            "hospital_name": hospital.hospital_name,
            "available_medicines_count": medicines,
            "total_beds": beds_count,
            "available_beds": available_beds,
            "occupied_beds": occupied,
            "doctors_present": doctors,
            "available_ambulances": ambulances,
            "estimated_waiting_minutes": 15
        }
    )

@router.get("/emergency", response_model=APIResponse[list])
def get_active_emergency_alerts(
    db: Session = Depends(get_db)
):
    """
    Returns active high-priority alert notices.
    """
    alerts = db.query(Alert).filter(Alert.status == "UNRESOLVED", Alert.priority == "CRITICAL").all()
    res = [
        {
            "id": a.id,
            "alert_type": a.alert_type.value if hasattr(a.alert_type, "value") else a.alert_type,
            "message": a.message,
            "timestamp": a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else None
        }
        for a in alerts
    ]
    return APIResponse(success=True, message="Active emergencies compiled.", data=res)

@router.get("/alerts", response_model=APIResponse[list])
def get_public_epidemiology_warnings():
    """
    Returns public health warnings.
    """
    warnings = [
        {
            "title": "Seasonal Monsoon Alert",
            "message": "Potential vector-borne disease outbreak surge due to persistent rainfall.",
            "severity": "WARNING"
        }
    ]
    return APIResponse(success=True, message="Epidemiology warnings compiled.", data=warnings)
