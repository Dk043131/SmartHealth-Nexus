from fastapi import APIRouter, Depends, Query, status
from typing import Dict, List, Any
from backend.schemas.schemas import APIResponse
from backend.security.security_hardener import SecurityAuditCenter
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/security", tags=["Security Monitoring Center"])

# Instantiate engine
security_audit = SecurityAuditCenter()

@router.get("/audit", response_model=APIResponse[list])
def get_security_monitoring_audit(
    current_user: User = Depends(verify_read_access)
):
    """
    Returns login histories, IP logs, and rotation event details.
    """
    res = security_audit.get_security_audit_history()
    return APIResponse(success=True, message="Security activity log compiled.", data=res)
