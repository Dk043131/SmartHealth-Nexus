import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import inventory_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, MedicineInventoryCreate, MedicineInventoryUpdate, MedicineInventoryResponse
)
from backend.auth.dependencies import verify_write_access, verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/inventory", tags=["Medicine Inventory Logistics"])

@router.post("", response_model=APIResponse[MedicineInventoryResponse], status_code=status.HTTP_201_CREATED)
def create_inventory(
    inventory_in: MedicineInventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Log an inventory stock entry (facility write permissions enforced)."""
    verify_write_access(inventory_in.hospital_id, current_user)
    inventory = inventory_service.create_entity(db, obj_in=inventory_in, actor=current_user)
    return APIResponse(data=inventory, message="Stock inventory entry recorded successfully.")

@router.get("", response_model=APIResponse[PaginatedData[MedicineInventoryResponse]])
def list_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hospital_id: uuid.UUID = Query(None),
    medicine_id: uuid.UUID = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Retrieve hospital stock inventories with eager loading for medicine details."""
    filters = {}
    if hospital_id:
        filters["hospital_id"] = hospital_id
    if medicine_id:
        filters["medicine_id"] = medicine_id

    items, total = inventory_service.get_all(db, skip=skip, limit=limit, filters=filters)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Stock inventories loaded.")

@router.get("/{id}", response_model=APIResponse[MedicineInventoryResponse])
def get_inventory(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch specific stock inventory details by UUID."""
    inventory = inventory_service.get_by_id(db, id)
    return APIResponse(data=inventory)

@router.put("/{id}", response_model=APIResponse[MedicineInventoryResponse])
def update_inventory(
    id: uuid.UUID,
    inventory_in: MedicineInventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Modify available or reserved stock counts (facility write permissions enforced)."""
    inventory = inventory_service.get_by_id(db, id)
    verify_write_access(inventory.hospital_id, current_user)
    updated = inventory_service.update_entity(db, id=id, obj_in=inventory_in, actor=current_user)
    return APIResponse(data=updated, message="Inventory stock counts updated.")

@router.delete("/{id}", response_model=APIResponse[MedicineInventoryResponse])
def delete_inventory(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Soft delete inventory stock entry (facility write permissions enforced)."""
    inventory = inventory_service.get_by_id(db, id)
    verify_write_access(inventory.hospital_id, current_user)
    deleted = inventory_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Inventory stock entry soft-deleted.")
