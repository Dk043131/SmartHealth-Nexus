import uuid
from fastapi import Depends, HTTPException, status
from backend.models.user import User
from backend.core.constants import UserRole
from backend.auth.security import get_current_user

def verify_district_admin(current_user: User = Depends(get_current_user)) -> User:
    """Restricts route to District Admins only."""
    if current_user.role != UserRole.DISTRICT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This action requires District Admin credentials."
        )
    return current_user

def verify_read_access(current_user: User = Depends(get_current_user)) -> User:
    """Allows read access for all valid authenticated roles."""
    if current_user.role not in [UserRole.DISTRICT_ADMIN, UserRole.GOV_HEALTH_OFFICER, UserRole.PHC_STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Unauthorized access role."
        )
    return current_user

def verify_write_access(
    hospital_id: uuid.UUID, 
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Enforces write permissions:
    - District Admin has full access.
    - PHC Staff can write only to their assigned hospital.
    - Government Health Officer is restricted (read-only).
    """
    if current_user.role == UserRole.DISTRICT_ADMIN:
        return current_user
        
    if current_user.role == UserRole.PHC_STAFF:
        if current_user.hospital_id != hospital_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Facility staff cannot modify records of another hospital."
            )
        return current_user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Government Health Officers have read-only access to this resource."
    )

def verify_alert_access(
    hospital_id: uuid.UUID,
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Alert writing permissions:
    - Admins and Officers can write/modify alerts.
    - Staff can write/modify alerts only for their assigned facility.
    """
    if current_user.role in [UserRole.DISTRICT_ADMIN, UserRole.GOV_HEALTH_OFFICER]:
        return current_user

    if current_user.role == UserRole.PHC_STAFF:
        if current_user.hospital_id != hospital_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Facility staff can only manage alerts for their assigned hospital."
            )
        return current_user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Unauthorized action."
    )
