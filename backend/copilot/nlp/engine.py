import re
from typing import Dict, Any, Tuple

class IntentClassifier:
    def __init__(self):
        self.rules = [
            (r"(medicine|drug|stock|shortage)", "MEDICINE_SHORTAGE"),
            (r"(doctor|staff|physician|need doctor)", "STAFF_DEMAND"),
            (r"(predict|outbreak|forecast|dengue)", "DISEASE_PREDICTION"),
            (r"(bed|icu|occupancy|vacant)", "BED_AVAILABILITY"),
            (r"(ambulance|dispatch|vehicle)", "AMBULANCE_LOCATION"),
            (r"(optimize|transfer|recommendation)", "OPTIMIZATION_RECOMMENDATION"),
            (r"(district|summary|ready|readiness)", "DISTRICT_ANALYTICS"),
            (r"(help|commands|options)", "GENERAL_HELP")
        ]

    def classify(self, text: str) -> Tuple[str, float]:
        """
        Classifies query text to an intent and returns a confidence score.
        """
        text_lower = text.lower()
        for pattern, intent in self.rules:
            if re.search(pattern, text_lower):
                return intent, 0.95
        return "UNKNOWN_INTENT", 0.35
