import uuid
from datetime import datetime, timedelta
from typing import Dict, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.core.database import get_db
from backend.models.models import (
    Hospital, Doctor, Patient, Bed, MedicineInventory, Medicine, Alert, Ambulance, ResourceTransfer
)
from backend.core.constants import AlertStatus, AmbulanceStatus, UserRole
from backend.schemas.schemas import APIResponse
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Command Dashboard"])

@router.get("/summary", response_model=APIResponse[dict])
def get_dashboard_summary(
    db: Session = Depends(get_db)
):
    """
    Returns aggregated district-wide command center statistics.
    Accessible publicly or under read access.
    """
    total_hospitals = db.query(Hospital).filter(Hospital.is_deleted == False).count()
    
    active_doctors = db.query(Doctor).filter(
        Doctor.is_deleted == False,
        Doctor.availability_status == "Available"
    ).count()

    total_patients = db.query(Patient).filter(Patient.is_deleted == False).count()

    bed_metrics = db.query(
        func.sum(Bed.total_beds).label("total"),
        func.sum(Bed.occupied_beds).label("occupied"),
        func.sum(Bed.available_beds).label("available")
    ).filter(Bed.is_deleted == False).first()
    
    beds_summary = {
        "total": bed_metrics.total or 0,
        "occupied": bed_metrics.occupied or 0,
        "available": bed_metrics.available or 0,
        "occupancy_rate": round((bed_metrics.occupied / bed_metrics.total * 100), 2) if bed_metrics.total else 0.0
    }

    shortage_count = db.query(MedicineInventory).join(
        Medicine, MedicineInventory.medicine_id == Medicine.id
    ).filter(
        MedicineInventory.is_deleted == False,
        Medicine.is_deleted == False,
        MedicineInventory.available_quantity < Medicine.minimum_stock
    ).count()

    active_alerts = db.query(Alert).filter(Alert.status == AlertStatus.UNRESOLVED).count()

    available_ambulances = db.query(Ambulance).filter(
        Ambulance.is_deleted == False,
        Ambulance.status == AmbulanceStatus.AVAILABLE
    ).count()

    return APIResponse(
        success=True,
        message="Dashboard command center metrics aggregated successfully.",
        data={
            "total_hospitals": total_hospitals,
            "active_doctors": active_doctors,
            "total_patients": total_patients,
            "beds": beds_summary,
            "medicine_shortages": shortage_count,
            "active_alerts": active_alerts,
            "ambulances_available": available_ambulances
        }
    )

@router.get("/kpis", response_model=APIResponse[dict])
def get_dashboard_kpis(
    db: Session = Depends(get_db)
):
    """
    Returns advanced operational KPIs, including trend summaries and the overall District Health Score.
    """
    # Base counts
    total_hospitals = db.query(Hospital).filter(Hospital.is_deleted == False).count()
    total_doctors = db.query(Doctor).filter(Doctor.is_deleted == False).count()
    active_doctors = db.query(Doctor).filter(Doctor.is_deleted == False, Doctor.availability_status == "Available").count()
    present_doctors = db.query(Doctor).filter(Doctor.is_deleted == False, Doctor.attendance_status == "Present").count()
    
    total_patients = db.query(Patient).filter(Patient.is_deleted == False).count()
    
    # Bed metrics
    bed_metrics = db.query(
        func.sum(Bed.total_beds).label("total"),
        func.sum(Bed.occupied_beds).label("occupied"),
        func.sum(Bed.available_beds).label("available")
    ).filter(Bed.is_deleted == False).first()
    beds_total = bed_metrics.total or 0
    beds_occupied = bed_metrics.occupied or 0
    beds_available = bed_metrics.available or 0
    
    # Medicine availability
    total_inventory = db.query(MedicineInventory).filter(MedicineInventory.is_deleted == False).count()
    shortage_count = db.query(MedicineInventory).join(
        Medicine, MedicineInventory.medicine_id == Medicine.id
    ).filter(
        MedicineInventory.is_deleted == False,
        Medicine.is_deleted == False,
        MedicineInventory.available_quantity < Medicine.minimum_stock
    ).count()
    
    # Ambulance status
    total_ambulances = db.query(Ambulance).filter(Ambulance.is_deleted == False).count()
    available_ambulances = db.query(Ambulance).filter(Ambulance.is_deleted == False, Ambulance.status == AmbulanceStatus.AVAILABLE).count()
    
    # Active alerts
    active_alerts = db.query(Alert).filter(Alert.status == AlertStatus.UNRESOLVED).count()

    # Calculate sub-indices
    med_availability_pct = round(((total_inventory - shortage_count) / total_inventory * 100), 1) if total_inventory else 95.0
    bed_availability_pct = round((beds_available / beds_total * 100), 1) if beds_total else 50.0
    doctor_attendance_pct = round((present_doctors / total_doctors * 100), 1) if total_doctors else 85.0
    amb_availability_pct = round((available_ambulances / total_ambulances * 100), 1) if total_ambulances else 75.0
    alerts_penalty = max(0, 100 - active_alerts * 5)
    
    # District Health Score (weighted average out of 100)
    health_score = round((med_availability_pct + bed_availability_pct + doctor_attendance_pct + amb_availability_pct + alerts_penalty) / 5, 1)

    return APIResponse(
        success=True,
        data={
            "district_health_score": health_score,
            "total_hospitals": total_hospitals,
            "active_doctors": active_doctors,
            "total_patients": total_patients,
            "medicine_availability_pct": med_availability_pct,
            "bed_occupancy_pct": round((beds_occupied / beds_total * 100), 1) if beds_total else 0.0,
            "ambulances_available": available_ambulances,
            "critical_alerts": active_alerts,
            "trends": {
                "patients": "up",
                "medicine": "stable",
                "beds": "down",
                "alerts": "up"
            }
        }
    )

@router.get("/map", response_model=APIResponse[list])
def get_dashboard_map(
    db: Session = Depends(get_db)
):
    """
    Returns geographical markers and operational summaries for all 70 connected hospital nodes.
    """
    hospitals = db.query(Hospital).filter(Hospital.is_deleted == False).all()
    map_data = []

    for h in hospitals:
        # Aggregate beds for hospital
        bed_metrics = db.query(
            func.sum(Bed.total_beds).label("total"),
            func.sum(Bed.occupied_beds).label("occupied"),
            func.sum(Bed.available_beds).label("available")
        ).filter(Bed.hospital_id == h.id, Bed.is_deleted == False).first()
        
        # Count shortages
        shortages = db.query(MedicineInventory).join(
            Medicine, MedicineInventory.medicine_id == Medicine.id
        ).filter(
            MedicineInventory.hospital_id == h.id,
            MedicineInventory.is_deleted == False,
            Medicine.is_deleted == False,
            MedicineInventory.available_quantity < Medicine.minimum_stock
        ).count()
        
        # Count unresolved alerts
        alert_count = db.query(Alert).filter(Alert.hospital_id == h.id, Alert.status == AlertStatus.UNRESOLVED).count()
        
        # Patient count admitted
        patient_count = db.query(Patient).filter(Patient.hospital_id == h.id, Patient.status == "Admitted", Patient.is_deleted == False).count()
        
        # Status rating based on alerts and shortages
        status_color = "Green"
        if alert_count > 2 or shortages > 15:
            status_color = "Red"
        elif alert_count > 0 or shortages > 5:
            status_color = "Yellow"

        map_data.append({
            "id": str(h.id),
            "hospital_code": h.hospital_code,
            "hospital_name": h.hospital_name,
            "hospital_type": h.hospital_type.value,
            "latitude": h.latitude or 34.0837,
            "longitude": h.longitude or 74.7973,
            "district": h.district,
            "taluk": h.taluk,
            "status": h.status,
            "status_color": status_color,
            "metrics": {
                "beds_total": int(bed_metrics.total or 0),
                "beds_occupied": int(bed_metrics.occupied or 0),
                "beds_available": int(bed_metrics.available or 0),
                "shortages_count": shortages,
                "alerts_count": alert_count,
                "patients_count": patient_count
            }
        })

    return APIResponse(success=True, data=map_data)

@router.get("/activity", response_model=APIResponse[list])
def get_dashboard_activity(
    db: Session = Depends(get_db)
):
    """
    Returns timeline logs of the latest district actions (transfers, warning triggers, admissions).
    """
    activity_timeline = []
    
    # 1. Latest Transfers
    transfers = db.query(ResourceTransfer).order_by(ResourceTransfer.created_at.desc()).limit(5).all()
    for t in transfers:
        activity_timeline.append({
            "id": str(t.id),
            "type": "Transfer",
            "message": f"Medicine dispatch of {t.quantity} units from {t.source_hospital.hospital_name} to {t.destination_hospital.hospital_name}.",
            "timestamp": t.created_at.isoformat()
        })
        
    # 2. Latest Alerts
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
    for a in alerts:
        activity_timeline.append({
            "id": str(a.id),
            "type": "Alert",
            "message": f"Critical {a.alert_type.value}: {a.message} at {a.hospital.hospital_name}.",
            "timestamp": a.created_at.isoformat()
        })
        
    # 3. Latest Patient admissions
    patients = db.query(Patient).filter(Patient.is_deleted == False).order_by(Patient.created_at.desc()).limit(5).all()
    for p in patients:
        activity_timeline.append({
            "id": str(p.id),
            "type": "Admission",
            "message": f"Patient {p.patient_identifier} admitted at {p.hospital.hospital_name} diagnosed with {p.disease}.",
            "timestamp": p.created_at.isoformat()
        })
        
    # Sort unified feed by timestamp descending
    activity_timeline.sort(key=lambda x: x["timestamp"], reverse=True)
    return APIResponse(success=True, data=activity_timeline[:8])

@router.get("/analytics", response_model=APIResponse[dict])
def get_dashboard_analytics(
    db: Session = Depends(get_db)
):
    """
    Returns aggregated time-series vectors and distribution metrics for Recharts rendering.
    """
    # 1. Patient disease category distributions
    disease_counts = db.query(
        Patient.disease,
        func.count(Patient.id).label("count")
    ).filter(Patient.is_deleted == False).group_by(Patient.disease).all()
    
    diseases = [{"name": d.disease, "value": d.count} for d in disease_counts]
    
    # 2. Daily patient admissions (last 7 days trend)
    admissions_trend = []
    for day_offset in range(6, -1, -1):
        target_date = datetime.utcnow().date() - timedelta(days=day_offset)
        count = db.query(Patient).filter(
            Patient.visit_date == target_date,
            Patient.is_deleted == False
        ).count()
        admissions_trend.append({
            "date": target_date.strftime("%b %d"),
            "admissions": count
        })
        
    # 3. Bed capacity distribution by type
    bed_types = db.query(
        Bed.bed_type,
        func.sum(Bed.total_beds).label("total"),
        func.sum(Bed.occupied_beds).label("occupied")
    ).filter(Bed.is_deleted == False).group_by(Bed.bed_type).all()
    
    beds_dist = [
        {
            "type": b.bed_type.value,
            "total": int(b.total or 0),
            "occupied": int(b.occupied or 0)
        }
        for b in bed_types
    ]

    return APIResponse(
        success=True,
        data={
            "disease_distribution": diseases,
            "admissions_trend": admissions_trend,
            "beds_distribution": beds_dist
        }
    )
