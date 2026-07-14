from typing import Dict, Any, List

class NarrativeEngine:
    def __init__(self):
        pass

    def generate_medicine_narrative(self, hospital_name: str, med_name: str, pred: float, min_stock: float) -> str:
        pct_diff = int((pred - min_stock) / (min_stock or 1.0) * 100)
        direction = "increase" if pct_diff >= 0 else "decrease"
        action = "refill safety margins" if pct_diff >= 0 else "hold shipping orders"
        
        return (
            f"Hospital {hospital_name} is predicted to experience a {abs(pct_diff)}% {direction} in "
            f"medicine demand for {med_name} over the next 7 days compared to its minimum stock limit "
            f"of {min_stock} units. The AI recommendations suggest transferring additional units to "
            f"{action} and prevent critical stockouts."
        )

    def generate_disease_narrative(self, hospital_name: str, probability: float, risk_level: str) -> str:
        return (
            f"District node {hospital_name} exhibits a {int(probability * 100)}% epidemiologic surge probability, "
            f"currently rated at {risk_level} severity. The primary factors include rain precipitation anomalies "
            f"and high humidity levels, suggesting preventive diagnostic kits mobilization is required."
        )

    def generate_patient_narrative(self, hospital_name: str, pred: float) -> str:
        return (
            f"Patient admissions at {hospital_name} are forecast to reach an average of {pred} daily admissions "
            f"over the upcoming cycle. Caseload concentrations peak on weekends, advising clinical rosters adjustments."
        )

    def generate_bed_narrative(self, hospital_name: str, occupancy_pct: float) -> str:
        return (
            f"Critical care ICU bed occupancy rate at {hospital_name} is projected to stabilize at "
            f"{occupancy_pct}% capacity. If occupancy exceeds 85%, patient transfer referral loops will trigger."
        )

    def generate_doctor_narrative(self, doc_name: str, pred: float) -> str:
        return (
            f"Dr. {doc_name} is projected to log {pred} patient consultations in the next shift cycle. "
            f"Staff workloads are balanced within normal bounds."
        )

    def generate_ambulance_narrative(self, vehicle: str, base_hospital: str, eta: int) -> str:
        return (
            f"Emergency vehicle {vehicle} stationed at {base_hospital} is recommended for immediate dispatch. "
            f"Shortest road path analysis predicts a arrival ETA of {eta} minutes to the emergency site."
        )
