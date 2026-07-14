import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.services import diagnostic_service
from backend.schemas.schemas import (
    APIResponse, PaginatedData, DiagnosticTestCreate, DiagnosticTestUpdate, DiagnosticTestResponse
)
from backend.auth.dependencies import verify_write_access, verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/diagnostics", tags=["Diagnostics & Capacities"])

@router.post("", response_model=APIResponse[DiagnosticTestResponse], status_code=status.HTTP_201_CREATED)
def create_diagnostic(
    diagnostic_in: DiagnosticTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Register diagnostic capabilities (write permissions enforced)."""
    verify_write_access(diagnostic_in.hospital_id, current_user)
    diagnostic = diagnostic_service.create_entity(db, obj_in=diagnostic_in, actor=current_user)
    return APIResponse(data=diagnostic, message="Diagnostic test capability registered.")

@router.get("", response_model=APIResponse[PaginatedData[DiagnosticTestResponse]])
def list_diagnostics(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hospital_id: uuid.UUID = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """List facility diagnostic capabilities with search filters."""
    filters = {}
    if hospital_id:
        filters["hospital_id"] = hospital_id

    search_query = None
    if search:
        search_query = (["test_name"], search)

    items, total = diagnostic_service.get_all(db, skip=skip, limit=limit, filters=filters, search_query=search_query)
    pages = (total + limit - 1) // limit
    paginated = PaginatedData(items=items, total=total, page=(skip // limit) + 1, pages=pages, limit=limit)
    return APIResponse(data=paginated, message="Diagnostics capabilities loaded.")

@router.get("/{id}", response_model=APIResponse[DiagnosticTestResponse])
def get_diagnostic(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Fetch diagnostic parameters by UUID."""
    diagnostic = diagnostic_service.get_by_id(db, id)
    return APIResponse(data=diagnostic)

@router.put("/{id}", response_model=APIResponse[DiagnosticTestResponse])
def update_diagnostic(
    id: uuid.UUID,
    diagnostic_in: DiagnosticTestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Update diagnostic parameters (write permissions enforced)."""
    diagnostic = diagnostic_service.get_by_id(db, id)
    verify_write_access(diagnostic.hospital_id, current_user)
    updated = diagnostic_service.update_entity(db, id=id, obj_in=diagnostic_in, actor=current_user)
    return APIResponse(data=updated, message="Diagnostic test attributes updated.")

@router.delete("/{id}", response_model=APIResponse[DiagnosticTestResponse])
def delete_diagnostic(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_read_access)
):
    """Soft delete diagnostic parameters (write permissions enforced)."""
    diagnostic = diagnostic_service.get_by_id(db, id)
    verify_write_access(diagnostic.hospital_id, current_user)
    deleted = diagnostic_service.delete_entity(db, id=id, actor=current_user)
    return APIResponse(data=deleted, message="Diagnostic test soft-deleted.")
