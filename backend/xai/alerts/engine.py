import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

class SmartAlertEngine:
    def __init__(self):
        pass

    def scan_for_predictive_alerts(self, readiness_indices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Scans hospital readiness indices and triggers smart predictive alerts for failing thresholds.
        """
        alerts = []
        for r in readiness_indices:
            h_name = r["hospital_name"]
            score = r["overall_score"]
            
            if score < 75:
                # Trigger predictive alert
                priority = "CRITICAL" if score < 60 else "HIGH"
                reason = f"Readiness Index at {h_name} has fallen to {score}/100."
                evidence = f"Medicine stockout risk index: {100 - r['medicine_score']} | Staff saturation: {100 - r['doctor_score']}."
                
                alerts.append({
                    "id": str(uuid.uuid4()),
                    "category": "PREDICTIVE",
                    "priority": priority,
                    "reason": reason,
                    "evidence": evidence,
                    "confidence": 0.92,
                    "affected_facility": h_name,
                    "recommended_action": "Trigger autonomous medicine transfers and dispatch standby clinical staff.",
                    "estimated_impact": "Restores readiness to 85+ bounds.",
                    "expiration_time": (datetime.now() + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S")
                })
        return alerts
