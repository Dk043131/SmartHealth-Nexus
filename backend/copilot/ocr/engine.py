import random
from typing import Dict, Any, List

class OcrVisionEngine:
    def __init__(self):
        pass

    def scan_shelf_label(self, filename: str) -> Dict[str, Any]:
        """
        Simulates shelf label reading extracting batch numbers, expiry dates, and manufacturer fields.
        """
        # Match standard boxes based on file keywords or provide default
        name = "Paracetamol"
        strength = "500mg"
        batch = "B-PC890"
        qty = 450
        
        if "ors" in filename.lower():
            name = "ORS Rehydration Salts"
            strength = "20.5g"
            batch = "B-ORS22"
            qty = 280
        elif "amox" in filename.lower():
            name = "Amoxicillin"
            strength = "250mg"
            batch = "B-AMX77"
            qty = 150

        return {
            "detected_text": f"{name} {strength}\nBatch: {batch}\nExp: 12/2028\nQty: {qty}",
            "confidence_score": 0.94,
            "matched_medicine_name": name,
            "strength": strength,
            "batch_number": batch,
            "expiry_date": "2028-12-31",
            "quantity_estimated": qty,
            "manufacturer": "Nexus Pharmaceuticals Ltd",
            "ocr_bounding_boxes": [
                {"label": "Medicine Name", "box": [12, 15, 120, 45]},
                {"label": "Batch", "box": [12, 50, 100, 75]},
                {"label": "Quantity", "box": [12, 80, 80, 105]}
            ]
        }
