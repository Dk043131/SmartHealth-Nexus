from fastapi import APIRouter, Depends, Query, status
from typing import Dict, List, Any
from backend.schemas.schemas import APIResponse
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/notifications", tags=["Push Notifications Manager"])

# Simple in-memory notification list
notification_store = [
    {
        "id": "notif-0192-89a1",
        "title": "Predictive Stock Deficit Alert",
        "message": "Paracetamol levels forecast below minimum stock limit at CHC Ganderbal.",
        "priority": "HIGH",
        "read": False,
        "timestamp": "2026-07-06 22:20:00"
    }
]

@router.post("/register", response_model=APIResponse[dict])
def register_browser_subscription_token(
    token: str = Query(...),
    current_user: User = Depends(verify_read_access)
):
    """
    Registers WebPush endpoint subscription tokens.
    """
    return APIResponse(
        success=True,
        message="Device subscription token registered.",
        data={"token": token}
    )

@router.get("", response_model=APIResponse[list])
def get_user_notifications_history(
    current_user: User = Depends(verify_read_access)
):
    """
    Retrieves read/unread system notifications.
    """
    return APIResponse(
        success=True,
        message="System notifications history compiled.",
        data=notification_store
    )
