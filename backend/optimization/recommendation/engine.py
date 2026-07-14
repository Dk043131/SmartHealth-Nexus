import uuid
from typing import List, Dict, Any

class RecommendationEngine:
    def __init__(self):
        pass

    def build_recommendations(
        self, 
        medicine_plans: List[Dict[str, Any]], 
        staff_plans: List[Dict[str, Any]], 
        ambulance_plans: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Consolidates raw mathematical flows and assignments into structured, prioritized recommendation cards.
        """
        recommendations = []

        # 1. Medicine Transfers
        for plan in medicine_plans:
            qty = plan["quantity"]
            src = plan["source_hospital_name"]
            dest = plan["destination_hospital_name"]
            cost = plan["estimated_transport_cost"]
            benefit = round(qty * 12.5, 2) # Arbitrary cost savings index
            
            # Priority logic based on transport size
            priority = "CRITICAL" if qty > 40 else "WARNING"
            impact_score = int(qty * 0.8 + 20)
            
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": f"Redistribute Medicine: {src} -> {dest}",
                "category": "MEDICINE",
                "priority": priority,
                "reason": f"{dest} stock has fallen below minimum safety limit. {src} holds surplus stock.",
                "expected_impact": f"Refills safety margins. Reduces stockout probability by {impact_score}%.",
                "estimated_cost": f"${cost}",
                "estimated_benefit": f"${benefit} saved in emergency orders",
                "affected_hospitals": [src, dest],
                "implementation_time": "4 - 8 hours",
                "confidence_score": 0.94,
                "impact_score": min(100, impact_score)
            })

        # 2. Staffing Allocations
        for plan in staff_plans:
            doc = plan["doctor_name"]
            spec = plan["specialization"]
            src = plan["source_hospital_name"]
            dest = plan["destination_hospital_name"]
            dist = plan["distance_km"]
            
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": f"Temporary Staff Shift: Dr. {doc} ({spec})",
                "category": "DOCTOR",
                "priority": "CRITICAL",
                "reason": f"{dest} is experiencing a clinical consultation surge. Dr. {doc} is available at {src}.",
                "expected_impact": f"Lowers caseload queue times. Restores patient-to-doctor ratios.",
                "estimated_cost": f"${round(dist * 0.85, 2)} travel allowance",
                "estimated_benefit": "Restores consultation coverage",
                "affected_hospitals": [src, dest],
                "implementation_time": "2 - 4 hours",
                "confidence_score": 0.88,
                "impact_score": 85
            })

        # 3. Ambulance Dispatches
        for idx, plan in enumerate(ambulance_plans[:3]): # top 3 closest ambulance routes
            veh = plan["vehicle_number"]
            driver = plan["driver_name"]
            base = plan["base_hospital_name"]
            eta = plan["estimated_eta_minutes"]
            
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": f"Dispatch Emergency Vehicle: {veh}",
                "category": "AMBULANCE",
                "priority": "CRITICAL",
                "reason": f"Active emergency alert at target site. Vehicle {veh} is available at {base}.",
                "expected_impact": f"Estimated site arrival in {eta} minutes.",
                "estimated_cost": "Fuel expenses only",
                "estimated_benefit": "Saves critical response minutes",
                "affected_hospitals": [base],
                "implementation_time": f"{eta} minutes",
                "confidence_score": 0.96,
                "impact_score": max(50, 100 - eta * 2)
            })

        # Sort recommendations by impact score descending (prioritization)
        recommendations.sort(key=lambda x: x["impact_score"], reverse=True)
        return recommendations
