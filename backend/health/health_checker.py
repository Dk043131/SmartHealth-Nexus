import os
import psutil
from typing import Dict, Any
from sqlalchemy import text
from backend.core.database import SessionLocal
from backend.ai.prediction.services import PredictionService

class SystemHealthChecker:
    def __init__(self):
        self.ai_service = PredictionService()

    def get_system_stats(self) -> Dict[str, Any]:
        """
        Retrieves real CPU, RAM, and Disk metrics from the host operating system.
        """
        cpu_usage = psutil.cpu_percent(interval=None)
        ram = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "cpu_usage_pct": cpu_usage,
            "ram_used_gb": round(ram.used / (1024**3), 2),
            "ram_total_gb": round(ram.total / (1024**3), 2),
            "ram_usage_pct": ram.percent,
            "disk_used_gb": round(disk.used / (1024**3), 2),
            "disk_total_gb": round(disk.total / (1024**3), 2),
            "disk_usage_pct": disk.percent
        }

    def check_database(self) -> bool:
        """
        Verifies active connectivity to the database engine.
        """
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            return True
        except Exception:
            return False
        finally:
            db.close()

    def check_ai_models(self) -> Dict[str, bool]:
        """
        Confirms if prediction estimators are fully deserialized.
        """
        status = {}
        for name, model in self.ai_service.models.items():
            status[name] = model is not None
        return status
