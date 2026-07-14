import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import patient_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, PatientCreate, PatientUpdate, PatientResponse
)
from backend.auth.dependencies import verify_write_access, verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/patients", tags=["Patient Registry"])

@router.post("", response_model=APIResponse[PatientResponse], status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Admit a new patient record (write permissions enforced)."""
    verify_write_access(patient_in.hospital_id, current_user)
    patient = patient_service.create_entity(db, obj_in=patient_in, actor=current_user)
    return APIResponse(data=patient, message="Patient record registered successfully.")

@router.get("", response_model=APIResponse[PaginatedData[PatientResponse]])
def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hospital_id: uuid.UUID = Query(None),
    disease: str = Query(None),
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Retrieve patient records with facility filtering and disease classification search."""
    filters = {}
    if hospital_id:
        filters["hospital_id"] = hospital_id
    if disease:
        filters["disease"] = disease
    if status:
        filters["status"] = status

    search_query = None
    if search:
        search_query = (["patient_identifier", "disease", "status"], search)

    items, total = patient_service.get_all(db, skip=skip, limit=limit, filters=filters, search_query=search_query)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Patient list loaded.")

@router.get("/{id}", response_model=APIResponse[PatientResponse])
def get_patient(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch patient details by UUID."""
    patient = patient_service.get_by_id(db, id)
    return APIResponse(data=patient)

@router.put("/{id}", response_model=APIResponse[PatientResponse])
def update_patient(
    id: uuid.UUID,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Modify patient status parameters (write permissions enforced)."""
    patient = patient_service.get_by_id(db, id)
    verify_write_access(patient.hospital_id, current_user)
    updated = patient_service.update_entity(db, id=id, obj_in=patient_in, actor=current_user)
    return APIResponse(data=updated, message="Patient details modified.")

@router.delete("/{id}", response_model=APIResponse[PatientResponse])
def delete_patient(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Soft delete patient records (write permissions enforced)."""
    patient = patient_service.get_by_id(db, id)
    verify_write_access(patient.hospital_id, current_user)
    deleted = patient_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Patient record soft-deleted.")
