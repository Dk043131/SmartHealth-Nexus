import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import hospital_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, HospitalCreate, HospitalUpdate, HospitalResponse
)
from backend.auth.dependencies import verify_district_admin, verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/hospitals", tags=["Hospitals Control"])

@router.post("", response_model=APIResponse[HospitalResponse], status_code=status.HTTP_201_CREATED)
def create_hospital(
    hospital_in: HospitalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_district_admin)
):
    """Register a new PHC or CHC facility (District Admin credentials required)."""
    hospital = hospital_service.create_entity(db, obj_in=hospital_in, actor=current_user)
    return APIResponse(data=hospital, message="Hospital registered successfully.")

@router.get("", response_model=APIResponse[PaginatedData[HospitalResponse]])
def list_hospitals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    district: str = Query(None),
    status: str = Query(None),
    search: str = Query(None),
    order_by: str = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve connected district facilities with sorting and keyword search."""
    filters = {}
    if district:
        filters["district"] = district
    if status:
        filters["status"] = status

    search_query = None
    if search:
        search_query = (["hospital_name", "hospital_code", "district"], search)

    items, total = hospital_service.get_all(
        db, skip=skip, limit=limit, filters=filters, search_query=search_query, order_by=order_by
    )
    
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Connected facilities loaded.")

@router.get("/{id}", response_model=APIResponse[HospitalResponse])
def get_hospital(
    id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Fetch facility profile by UUID."""
    hospital = hospital_service.get_by_id(db, id)
    return APIResponse(data=hospital)

@router.put("/{id}", response_model=APIResponse[HospitalResponse])
def update_hospital(
    id: uuid.UUID,
    hospital_in: HospitalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_district_admin)
):
    """Modify facility profile details (District Admin credentials required)."""
    hospital = hospital_service.update_entity(db, id=id, obj_in=hospital_in, actor=current_user)
    return APIResponse(data=hospital, message="Facility profile updated.")

@router.delete("/{id}", response_model=APIResponse[HospitalResponse])
def delete_hospital(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_district_admin)
):
    """Soft delete a facility from the district command map (District Admin credentials required)."""
    hospital = hospital_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=hospital, message="Facility soft-deleted from telemetry.")
