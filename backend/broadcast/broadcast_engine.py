import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

class BroadcastEngine:
    def __init__(self):
        self.broadcasts = []
        
        # Initial seeding
        self.broadcasts.append({
            "id": "broad-0192-89a1",
            "title": "Vaccination Campaign: Polio Drive",
            "category": "VACCINATION",
            "priority": "HIGH",
            "message": "District-wide polio immunization drive active this Sunday at all CHCs and Government Hospitals.",
            "target_taluk": "ALL",
            "expiry_time": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S"),
            "timestamp": "2026-07-06 12:00:00"
        })

    def create_broadcast(
        self,
        title: str,
        category: str,
        priority: str,
        message: str,
        target_taluk: str = "ALL",
        expiry_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Creates and registers a new district-wide emergency notice broadcast.
        """
        expiry = (datetime.now() + timedelta(hours=expiry_hours)).strftime("%Y-%m-%d %H:%M:%S")
        entry = {
            "id": str(uuid.uuid4()),
            "title": title,
            "category": category,
            "priority": priority,
            "message": message,
            "target_taluk": target_taluk,
            "expiry_time": expiry,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.broadcasts.append(entry)
        return entry

    def get_active_broadcasts(self) -> List[Dict[str, Any]]:
        # Filters out expired notices
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        active = [b for b in self.broadcasts if b["expiry_time"] > now_str]
        return sorted(active, key=lambda x: x["timestamp"], reverse=True)
