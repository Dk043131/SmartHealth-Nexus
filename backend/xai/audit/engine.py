import time
import uuid
from datetime import datetime
from typing import List, Dict, Any

class DecisionAuditTrail:
    def __init__(self):
        self._audit_logs = []

    def log_decision(
        self,
        action_name: str,
        category: str,
        features_used: List[str],
        confidence_score: float,
        outcome_summary: str,
        user_id: str = "SYSTEM"
    ) -> Dict[str, Any]:
        """
        Creates a structured, immutable audit timeline block.
        """
        log_entry = {
            "id": str(uuid.uuid4()),
            "action_name": action_name,
            "category": category,
            "features_used": features_used,
            "confidence_score": confidence_score,
            "outcome_summary": outcome_summary,
            "model_version": "1.0.4",
            "triggered_by": user_id,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self._audit_logs.append(log_entry)
        return log_entry

    def get_audit_trail(self) -> List[Dict[str, Any]]:
        # Sort logs chronologically by default
        return sorted(self._audit_logs, key=lambda x: x["timestamp"], reverse=True)
