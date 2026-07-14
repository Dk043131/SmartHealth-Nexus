from typing import Dict, Any, List

class RiskIntelligenceEngine:
    def __init__(self):
        pass

    def compute_hospital_risk(self, readiness_row: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes detailed current and projected future risk parameters (0-100) for a hospital node.
        """
        med_score = readiness_row.get("medicine_score", 80)
        doc_score = readiness_row.get("doctor_score", 85)
        amb_score = readiness_row.get("ambulance_score", 90)
        overall = readiness_row.get("overall_score", 85)

        # Risk is the inverse of readiness
        current_risk = 100 - overall
        
        # Projected risk accounts for future surges (simulated 1.15 multiplier deviation)
        projected_risk = min(100.0, current_risk * 1.15)

        return {
            "hospital_id": readiness_row.get("hospital_id"),
            "hospital_name": readiness_row.get("hospital_name"),
            "medicine_risk": 100 - med_score,
            "bed_risk": 20, # standard baseline
            "doctor_risk": 100 - doc_score,
            "ambulance_risk": 100 - amb_score,
            "current_overall_risk": round(current_risk, 1),
            "projected_overall_risk": round(projected_risk, 1),
            "risk_status": "HIGH" if current_risk > 30 else ("MEDIUM" if current_risk > 15 else "LOW")
        }

    def compute_district_risk(self, hospital_risks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates district-wide risks.
        """
        if not hospital_risks:
            return {"district_overall_risk": 15.0, "risk_status": "LOW"}
            
        avg_risk = sum(h["current_overall_risk"] for h in hospital_risks) / len(hospital_risks)
        projected_avg = sum(h["projected_overall_risk"] for h in hospital_risks) / len(hospital_risks)

        return {
            "district_overall_risk": round(avg_risk, 1),
            "projected_district_risk": round(projected_avg, 1),
            "risk_status": "HIGH" if avg_risk > 25 else ("MEDIUM" if avg_risk > 12 else "LOW")
        }
