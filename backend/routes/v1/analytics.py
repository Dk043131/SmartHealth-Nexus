from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.core.database import get_db
from backend.models.models import Patient, MedicineInventory, Medicine, Bed, Doctor
from backend.schemas.schemas import APIResponse
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/analytics", tags=["Clinical Analytics"])

@router.get("/patient-trends", response_model=APIResponse[list])
def get_patient_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns aggregated case counts grouped by disease designation.
    Future AI forecasting modules will consume this data directly.
    """
    trends = db.query(
        Patient.disease,
        func.count(Patient.id).label("case_count")
    ).filter(Patient.is_deleted == False).group_by(Patient.disease).all()

    data = [{"disease": t.disease, "case_count": t.case_count} for t in trends]
    return APIResponse(
        success=True,
        message="Patient disease trends aggregated successfully.",
        data=data
    )

@router.get("/inventory-summary", response_model=APIResponse[list])
def get_inventory_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns stock statistics grouped by medicine category.
    """
    summary = db.query(
        Medicine.category,
        func.sum(MedicineInventory.available_quantity).label("total_quantity"),
        func.count(Medicine.id).label("unique_medicines")
    ).join(
        MedicineInventory, Medicine.id == MedicineInventory.medicine_id
    ).filter(
        Medicine.is_deleted == False,
        MedicineInventory.is_deleted == False
    ).group_by(Medicine.category).all()

    data = [
        {
            "category": s.category,
            "total_quantity": int(s.total_quantity or 0),
            "unique_medicines": s.unique_medicines
        }
        for s in summary
    ]
    return APIResponse(
        success=True,
        message="Inventory metrics by category retrieved successfully.",
        data=data
    )

@router.get("/bed-utilization", response_model=APIResponse[list])
def get_bed_utilization(
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns bed capacity statistics grouped by bed type.
    """
    utilization = db.query(
        Bed.bed_type,
        func.sum(Bed.total_beds).label("total"),
        func.sum(Bed.occupied_beds).label("occupied"),
        func.sum(Bed.available_beds).label("available")
    ).filter(Bed.is_deleted == False).group_by(Bed.bed_type).all()

    data = [
        {
            "bed_type": u.bed_type.value,
            "total": int(u.total or 0),
            "occupied": int(u.occupied or 0),
            "available": int(u.available or 0)
        }
        for u in utilization
    ]
    return APIResponse(
        success=True,
        message="Bed utilization distributions retrieved successfully.",
        data=data
    )

@router.get("/doctor-availability", response_model=APIResponse[dict])
def get_doctor_availability(
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """
    Returns general doctor availability and attendance ratios.
    """
    total = db.query(Doctor).filter(Doctor.is_deleted == False).count()
    available = db.query(Doctor).filter(
        Doctor.is_deleted == False,
        Doctor.availability_status == "Available"
    ).count()
    present = db.query(Doctor).filter(
        Doctor.is_deleted == False,
        Doctor.attendance_status == "Present"
    ).count()

    return APIResponse(
        success=True,
        message="Doctor clinical duty ratios compiled successfully.",
        data={
            "total_doctors": total,
            "available_doctors": available,
            "present_doctors": present,
            "attendance_rate": round((present / total * 100), 2) if total else 0.0,
            "availability_rate": round((available / total * 100), 2) if total else 0.0
        }
    )
