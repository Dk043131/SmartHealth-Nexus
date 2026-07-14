import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import medicine_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, MedicineCreate, MedicineUpdate, MedicineResponse
)
from backend.auth.dependencies import verify_district_admin, verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/medicines", tags=["Medicines Master Directory"])

@router.post("", response_model=APIResponse[MedicineResponse], status_code=status.HTTP_201_CREATED)
def create_medicine(
    medicine_in: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_district_admin)
):
    """Add a new medicine code definition to the global catalog (District Admin only)."""
    medicine = medicine_service.create_entity(db, obj_in=medicine_in, actor=current_user)
    return APIResponse(data=medicine, message="Medicine definition added to global catalog.")

@router.get("", response_model=APIResponse[PaginatedData[MedicineResponse]])
def list_medicines(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Search global medicine database."""
    filters = {}
    if category:
        filters["category"] = category

    search_query = None
    if search:
        search_query = (["medicine_name", "medicine_code", "category"], search)

    items, total = medicine_service.get_all(db, skip=skip, limit=limit, filters=filters, search_query=search_query)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Medicines list retrieved.")

@router.get("/{id}", response_model=APIResponse[MedicineResponse])
def get_medicine(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch medicine parameters by UUID."""
    medicine = medicine_service.get_by_id(db, id)
    return APIResponse(data=medicine)

@router.put("/{id}", response_model=APIResponse[MedicineResponse])
def update_medicine(
    id: uuid.UUID,
    medicine_in: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_district_admin)
):
    """Update medicine parameters (District Admin only)."""
    updated = medicine_service.update_entity(db, id=id, obj_in=medicine_in, actor=current_user)
    return APIResponse(data=updated, message="Medicine definition updated.")

@router.delete("/{id}", response_model=APIResponse[MedicineResponse])
def delete_medicine(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_district_admin)
):
    """Soft delete medicine definition from catalog (District Admin only)."""
    deleted = medicine_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Medicine definition soft-deleted.")
