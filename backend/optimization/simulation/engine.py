from typing import Dict, Any, List

class WhatIfSimulator:
    def __init__(self):
        pass

    def simulate_scenario(self, scenario_name: str, base_kpis: Dict[str, Any], severity_multiplier: float = 1.0) -> Dict[str, Any]:
        """
        Simulates the projected district impacts of emergency scenarios.
        """
        # Deep copy base KPIs to modify
        projected = dict(base_kpis)
        
        # Initial values
        med_shortages = base_kpis.get("medicine_shortages", 12)
        bed_occupancy = base_kpis.get("beds", {}).get("occupancy_rate", 68.4)
        active_alerts = base_kpis.get("active_alerts", 5)

        impact_desc = ""

        if scenario_name == "Outbreak":
            # Surges patients, increases medicine shortages, triggers new alerts
            projected_shortages = int(med_shortages * (1.5 * severity_multiplier))
            projected_occupancy = min(100.0, bed_occupancy * (1.35 * severity_multiplier))
            projected_alerts = int(active_alerts * (2.0 * severity_multiplier))
            impact_desc = "Outbreak triggers viral fever cases. Demands critical care isolation slots."
            
        elif scenario_name == "Flood":
            # Shuts down low-lying CHCs, spikes emergency calls, limits ambulance availability
            projected_shortages = int(med_shortages * (1.8 * severity_multiplier))
            projected_occupancy = min(100.0, bed_occupancy * (1.4 * severity_multiplier))
            projected_alerts = int(active_alerts * (3.0 * severity_multiplier))
            impact_desc = "Taluk roadways blocked by flooding. Transports redirected to Major GH."

        elif scenario_name == "Strike":
            # 30% doctor reduction, spikes workload, triggers staffing emergency alerts
            projected_shortages = med_shortages
            projected_occupancy = min(100.0, bed_occupancy * (1.2 * severity_multiplier))
            projected_alerts = int(active_alerts * (2.5 * severity_multiplier))
            impact_desc = "Practitioners strike locks clinic duties. Redistributing emergency shifts."
            
        else:
            # Default mild multiplier
            projected_shortages = int(med_shortages * 1.1)
            projected_occupancy = min(100.0, bed_occupancy * 1.05)
            projected_alerts = active_alerts + 1
            impact_desc = "Standard climate variations trigger mild resource reallocation shifts."

        # Re-calculate readiness index score
        readiness_score = max(20.0, min(100.0, 92.5 - (projected_shortages * 0.5 + (projected_occupancy - 50.0) * 0.3 + projected_alerts * 1.5)))

        return {
            "scenario": scenario_name,
            "impact_summary": impact_desc,
            "projected_readiness_score": round(readiness_score, 1),
            "projected_medicine_shortages": projected_shortages,
            "projected_bed_occupancy_pct": round(projected_occupancy, 1),
            "projected_active_alerts": projected_alerts,
            "estimated_emergency_response_delay": int(10 * severity_multiplier)
        }
