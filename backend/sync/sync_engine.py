import time
from typing import Dict, List, Any
from datetime import datetime

class SynchronizationEngine:
    def __init__(self):
        self.sync_logs = []
        
        # Initial dummy logs
        self.sync_logs.append({
            "sync_id": "sync-89a1-0987",
            "timestamp": "2026-07-06 22:15:00",
            "direction": "UPLOAD",
            "records_processed": 5,
            "status": "SUCCESS"
        })

    def process_upload_queue(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Reconciles client-side offline queued changes. Checks for conflicts using version counters or timestamps.
        """
        processed_count = 0
        conflicts_count = 0
        resolved_records = []

        for item in payload:
            action = item.get("action")
            table = item.get("table")
            record_id = item.get("id")
            client_timestamp = item.get("timestamp")
            
            # Simple conflict check: if client update is older than nominal 1 hour, flag conflict and resolve to Server Winner
            is_conflict = False
            if client_timestamp:
                try:
                    dt = datetime.strptime(client_timestamp, "%Y-%m-%d %H:%M:%S")
                    if (datetime.now() - dt).total_seconds() > 3600:
                        is_conflict = True
                except Exception:
                    pass

            if is_conflict:
                conflicts_count += 1
                # Resolution strategy: Server Wins
                resolved_records.append({
                    "id": record_id,
                    "table": table,
                    "resolution": "SERVER_WINS",
                    "status": "RESOLVED"
                })
            else:
                processed_count += 1
                resolved_records.append({
                    "id": record_id,
                    "table": table,
                    "resolution": "APPLIED",
                    "status": "SUCCESS"
                })

        sync_id = f"sync-{int(time.time())}"
        log_entry = {
            "sync_id": sync_id,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "direction": "UPLOAD",
            "records_processed": processed_count + conflicts_count,
            "status": "SUCCESS" if conflicts_count == 0 else "PARTIAL_SUCCESS"
        }
        self.sync_logs.append(log_entry)

        return {
            "sync_id": sync_id,
            "records_processed": processed_count,
            "conflicts_detected": conflicts_count,
            "resolutions": resolved_records,
            "status": log_entry["status"]
        }

    def get_sync_history(self) -> List[Dict[str, Any]]:
        return sorted(self.sync_logs, key=lambda x: x["timestamp"], reverse=True)
