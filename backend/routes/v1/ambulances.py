import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import ambulance_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, AmbulanceCreate, AmbulanceUpdate, AmbulanceResponse
)
from backend.auth.dependencies import verify_write_access, verify_read_access
from backend.models.user import User
from backend.core.constants import AmbulanceStatus

router = APIRouter(prefix="/ambulances", tags=["Ambulances Logistics"])

@router.post("", response_model=APIResponse[AmbulanceResponse], status_code=status.HTTP_201_CREATED)
def create_ambulance(
    ambulance_in: AmbulanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Register a new emergency response vehicle (write permissions enforced)."""
    verify_write_access(ambulance_in.hospital_id, current_user)
    ambulance = ambulance_service.create_entity(db, obj_in=ambulance_in, actor=current_user)
    return APIResponse(data=ambulance, message="Ambulance registered successfully.")

@router.get("", response_model=APIResponse[PaginatedData[AmbulanceResponse]])
def list_ambulances(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hospital_id: uuid.UUID = Query(None),
    status: AmbulanceStatus = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """List emergency response vehicles with search options."""
    filters = {}
    if hospital_id:
        filters["hospital_id"] = hospital_id
    if status:
        filters["status"] = status

    search_query = None
    if search:
        search_query = (["vehicle_number", "driver_name"], search)

    items, total = ambulance_service.get_all(db, skip=skip, limit=limit, filters=filters, search_query=search_query)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Ambulances loaded.")

@router.get("/{id}", response_model=APIResponse[AmbulanceResponse])
def get_ambulance(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch specific vehicle details by UUID."""
    ambulance = ambulance_service.get_by_id(db, id)
    return APIResponse(data=ambulance)

@router.put("/{id}", response_model=APIResponse[AmbulanceResponse])
def update_ambulance(
    id: uuid.UUID,
    ambulance_in: AmbulanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Modify vehicle status details (write permissions enforced)."""
    ambulance = ambulance_service.get_by_id(db, id)
    verify_write_access(ambulance.hospital_id, current_user)
    updated = ambulance_service.update_entity(db, id=id, obj_in=ambulance_in, actor=current_user)
    return APIResponse(data=updated, message="Ambulance parameters updated.")

@router.delete("/{id}", response_model=APIResponse[AmbulanceResponse])
def delete_ambulance(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Soft delete ambulance details (write permissions enforced)."""
    ambulance = ambulance_service.get_by_id(db, id)
    verify_write_access(ambulance.hospital_id, current_user)
    deleted = ambulance_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Ambulance soft-deleted.")
