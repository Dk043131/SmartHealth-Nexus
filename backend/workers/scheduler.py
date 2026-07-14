import time
from datetime import datetime
from typing import List, Dict, Any

class JobScheduler:
    def __init__(self):
        self.jobs = [
            {"id": "job-01", "name": "Daily DB Backup", "interval": "Daily (02:00)", "status": "SCHEDULED", "last_run": "2026-07-06 02:00:00"},
            {"id": "job-02", "name": "AI Model Retraining", "interval": "Weekly (Sunday)", "status": "SCHEDULED", "last_run": "2026-07-05 03:00:00"},
            {"id": "job-03", "name": "Cache Maintenance", "interval": "Hourly", "status": "ACTIVE", "last_run": "2026-07-06 22:00:00"},
            {"id": "job-04", "name": "Log Rotation", "interval": "Daily (00:00)", "status": "SCHEDULED", "last_run": "2026-07-06 00:00:00"}
        ]

    def trigger_job(self, job_id: str) -> Dict[str, Any]:
        """
        Manually triggers a scheduler job.
        """
        for job in self.jobs:
            if job["id"] == job_id:
                job["status"] = "ACTIVE"
                job["last_run"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                # Simulate small execution logic
                time.sleep(0.1)
                job["status"] = "SCHEDULED"
                return {"success": True, "job": job}
        return {"success": False, "message": "Job ID not found."}

    def get_jobs_status(self) -> List[Dict[str, Any]]:
        return self.jobs
