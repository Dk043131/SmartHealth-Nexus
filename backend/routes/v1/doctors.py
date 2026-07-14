import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import doctor_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, DoctorCreate, DoctorUpdate, DoctorResponse
)
from backend.auth.dependencies import verify_write_access, verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/doctors", tags=["Doctors Registry"])

@router.post("", response_model=APIResponse[DoctorResponse], status_code=status.HTTP_201_CREATED)
def create_doctor(
    doctor_in: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Register a new medical practitioner."""
    # Ensure user has write permission to the target facility
    verify_write_access(doctor_in.hospital_id, current_user)
    doctor = doctor_service.create_entity(db, obj_in=doctor_in, actor=current_user)
    return APIResponse(data=doctor, message="Doctor registered in facility.")

@router.get("", response_model=APIResponse[PaginatedData[DoctorResponse]])
def list_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hospital_id: uuid.UUID = Query(None),
    specialization: str = Query(None),
    availability: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """List medical practitioners with facility filtering and specialization search."""
    filters = {}
    if hospital_id:
        filters["hospital_id"] = hospital_id
    if specialization:
        filters["specialization"] = specialization
    if availability:
        filters["availability_status"] = availability

    search_query = None
    if search:
        search_query = (["doctor_name", "specialization", "qualification"], search)

    items, total = doctor_service.get_all(db, skip=skip, limit=limit, filters=filters, search_query=search_query)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Doctors list retrieved.")

@router.get("/{id}", response_model=APIResponse[DoctorResponse])
def get_doctor(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch doctor details by UUID."""
    doctor = doctor_service.get_by_id(db, id)
    return APIResponse(data=doctor)

@router.put("/{id}", response_model=APIResponse[DoctorResponse])
def update_doctor(
    id: uuid.UUID,
    doctor_in: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Update doctor parameters (attendance status, availability)."""
    doctor = doctor_service.get_by_id(db, id)
    # Check permissions
    verify_write_access(doctor.hospital_id, current_user)
    updated = doctor_service.update_entity(db, id=id, obj_in=doctor_in, actor=current_user)
    return APIResponse(data=updated, message="Doctor credentials modified.")

@router.delete("/{id}", response_model=APIResponse[DoctorResponse])
def delete_doctor(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Soft delete doctor records from the database."""
    doctor = doctor_service.get_by_id(db, id)
    # Check permissions
    verify_write_access(doctor.hospital_id, current_user)
    deleted = doctor_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Doctor soft-deleted.")
