import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import alert_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, AlertCreate, AlertUpdate, AlertResponse
)
from backend.auth.dependencies import verify_alert_access, verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/alerts", tags=["System & Logistics Alerts"])

@router.post("", response_model=APIResponse[AlertResponse], status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Trigger a new logistics alert (alert creation guards enforced)."""
    verify_alert_access(alert_in.hospital_id, current_user)
    alert = alert_service.create_entity(db, obj_in=alert_in, actor=current_user)
    return APIResponse(data=alert, message="Telemetry alert logged.")

@router.get("", response_model=APIResponse[PaginatedData[AlertResponse]])
def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hospital_id: uuid.UUID = Query(None),
    priority: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """List facility alert telemetry reports."""
    filters = {}
    if hospital_id:
        filters["hospital_id"] = hospital_id
    if priority:
        filters["priority"] = priority
    if status:
        filters["status"] = status

    items, total = alert_service.get_all(db, skip=skip, limit=limit, filters=filters)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="System alert list loaded.")

@router.get("/{id}", response_model=APIResponse[AlertResponse])
def get_alert(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch specific alert parameters by UUID."""
    alert = alert_service.get_by_id(db, id)
    return APIResponse(data=alert)

@router.put("/{id}", response_model=APIResponse[AlertResponse])
def update_alert(
    id: uuid.UUID,
    alert_in: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Modify alert priority, message, or resolution state (guards enforced)."""
    alert = alert_service.get_by_id(db, id)
    verify_alert_access(alert.hospital_id, current_user)
    updated = alert_service.update_entity(db, id=id, obj_in=alert_in, actor=current_user)
    return APIResponse(data=updated, message="Alert parameters modified.")

@router.delete("/{id}", response_model=APIResponse[AlertResponse])
def delete_alert(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Delete alert records (guards enforced)."""
    alert = alert_service.get_by_id(db, id)
    verify_alert_access(alert.hospital_id, current_user)
    deleted = alert_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Telemetry alert deleted.")
