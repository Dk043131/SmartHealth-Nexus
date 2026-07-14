from fastapi import APIRouter, Depends, Query, status
from typing import Dict, List, Any
from backend.schemas.schemas import APIResponse
from backend.workers.scheduler import JobScheduler
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/jobs", tags=["Background Worker System"])

# Instantiate scheduler
scheduler = JobScheduler()

@router.get("/active", response_model=APIResponse[list])
def get_active_scheduler_jobs(
    current_user: User = Depends(verify_read_access)
):
    """
    Returns lists of background jobs, schedules, and last execution logs.
    """
    res = scheduler.get_jobs_status()
    return APIResponse(success=True, message="Active jobs list fetched.", data=res)

@router.post("/trigger", response_model=APIResponse[dict])
def trigger_background_job_execution(
    job_id: str = Query(...),
    current_user: User = Depends(verify_read_access)
):
    """
    Forces instant manual execution of a background task.
    """
    res = scheduler.trigger_job(job_id)
    if res["success"]:
        return APIResponse(success=True, message="Background task triggered successfully.", data=res["job"])
    return APIResponse(success=False, message=res["message"], data={})
