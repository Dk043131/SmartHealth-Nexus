import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import bed_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, BedCreate, BedUpdate, BedResponse
)
from backend.auth.dependencies import verify_write_access, verify_read_access
from backend.models.user import User
from backend.core.constants import BedType

router = APIRouter(prefix="/beds", tags=["Beds Allocation Telemetry"])

@router.post("", response_model=APIResponse[BedResponse], status_code=status.HTTP_201_CREATED)
def create_bed(
    bed_in: BedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Register a new bed categorization at a facility (write permissions enforced)."""
    verify_write_access(bed_in.hospital_id, current_user)
    bed = bed_service.create_entity(db, obj_in=bed_in, actor=current_user)
    return APIResponse(data=bed, message="Bed count registered.")

@router.get("", response_model=APIResponse[PaginatedData[BedResponse]])
def list_beds(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hospital_id: uuid.UUID = Query(None),
    bed_type: BedType = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """List facility bed occupancies."""
    filters = {}
    if hospital_id:
        filters["hospital_id"] = hospital_id
    if bed_type:
        filters["bed_type"] = bed_type

    items, total = bed_service.get_all(db, skip=skip, limit=limit, filters=filters)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Beds telemetry loaded.")

@router.get("/{id}", response_model=APIResponse[BedResponse])
def get_bed(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch specific bed status by UUID."""
    bed = bed_service.get_by_id(db, id)
    return APIResponse(data=bed)

@router.put("/{id}", response_model=APIResponse[BedResponse])
def update_bed(
    id: uuid.UUID,
    bed_in: BedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Modify total, occupied, or available bed levels (write permissions enforced)."""
    bed = bed_service.get_by_id(db, id)
    verify_write_access(bed.hospital_id, current_user)
    updated = bed_service.update_entity(db, id=id, obj_in=bed_in, actor=current_user)
    return APIResponse(data=updated, message="Bed levels updated.")

@router.delete("/{id}", response_model=APIResponse[BedResponse])
def delete_bed(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Soft delete bed levels from facility (write permissions enforced)."""
    bed = bed_service.get_by_id(db, id)
    verify_write_access(bed.hospital_id, current_user)
    deleted = bed_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Bed count deleted.")
