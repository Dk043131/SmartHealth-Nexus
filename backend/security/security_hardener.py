import uuid
from datetime import datetime
from typing import List, Dict, Any

class SecurityAuditCenter:
    def __init__(self):
        self.audit_logs = []
        
        # Seed initial entries
        self.audit_logs.append({
            "id": str(uuid.uuid4()),
            "timestamp": "2026-07-06 22:00:00",
            "event_type": "USER_LOGIN",
            "ip_address": "192.168.1.45",
            "username": "admin@nexus.org",
            "status": "SUCCESS",
            "details": "User session established. JWT token rotation initialized."
        })

    def log_security_event(
        self,
        event_type: str,
        username: str,
        ip_address: str,
        status: str = "SUCCESS",
        details: str = ""
    ) -> Dict[str, Any]:
        """
        Appends a security monitoring trace.
        """
        entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "event_type": event_type,
            "ip_address": ip_address,
            "username": username,
            "status": status,
            "details": details
        }
        self.audit_logs.append(entry)
        return entry

    def get_security_audit_history(self) -> List[Dict[str, Any]]:
        return sorted(self.audit_logs, key=lambda x: x["timestamp"], reverse=True)
