from typing import Dict, Any

class InventoryReconciler:
    def __init__(self):
        pass

    def reconcile_stock(self, scanned_qty: int, db_qty: int, med_name: str) -> Dict[str, Any]:
        """
        Compares scanned shelf counts against database values to output suggest reconciliation items.
        """
        diff = scanned_qty - db_qty
        
        status = "MATCH"
        suggestion = "No discrepancy detected."
        
        if diff > 0:
            status = "SURPLUS"
            suggestion = f"Scanned stock shows {diff} extra units of {med_name} on shelf. Confirm to update DB count."
        elif diff < 0:
            status = "DEFICIT"
            suggestion = f"Scanned stock shows {abs(diff)} missing units of {med_name}. Confirm to log inventory shrinkage."

        return {
            "medicine_name": med_name,
            "detected_quantity": scanned_qty,
            "database_quantity": db_qty,
            "difference": diff,
            "status": status,
            "suggested_update_action": suggestion,
            "requires_manual_audit": abs(diff) > 50
        }
