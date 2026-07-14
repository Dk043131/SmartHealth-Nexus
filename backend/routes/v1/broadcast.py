from fastapi import APIRouter, Depends, Query, status
from typing import Dict, List, Any
from backend.schemas.schemas import APIResponse
from backend.broadcast.broadcast_engine import BroadcastEngine
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/broadcast", tags=["Emergency Broadcast System"])

# Instantiate engine
broadcast_engine = BroadcastEngine()

@router.post("/send", response_model=APIResponse[dict])
def send_emergency_notice_broadcast(
    title: str = Query(...),
    category: str = Query(...),
    priority: str = Query(...),
    message: str = Query(...),
    target_taluk: str = Query("ALL"),
    expiry_hours: int = Query(24),
    current_user: User = Depends(verify_read_access)
):
    """
    District administrators route to broadcast emergency notices district-wide.
    """
    res = broadcast_engine.create_broadcast(
        title=title,
        category=category,
        priority=priority,
        message=message,
        target_taluk=target_taluk,
        expiry_hours=expiry_hours
    )
    return APIResponse(success=True, message="Emergency notice broadcasted successfully.", data=res)

@router.get("/active", response_model=APIResponse[list])
def get_active_emergency_broadcasts():
    """
    Public-facing route to retrieve active district announcements.
    """
    res = broadcast_engine.get_active_broadcasts()
    return APIResponse(success=True, message="Active announcements fetched.", data=res)
