import networkx as nx
from typing import List, Dict, Any
from backend.optimization.core.distance import calculate_haversine_distance

class StaffAllocationSolver:
    def __init__(self):
        pass

    def solve(self, doctors: List[Dict[str, Any]], hospitals: List[Dict[str, Any]], alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Allocates available doctors to under-staffed hospitals using bipartite matching optimization.
        """
        # Determine hospitals in critical staffing need (hospitals with active alerts or high occupancy)
        alert_hosp_ids = {str(a["hospital_id"]).replace("-", "") for a in alerts if a["priority"] == "CRITICAL"}
        
        # Bipartite matching nodes
        # Set A: Available doctors at hospitals with low alert volume
        available_doctors = [d for d in doctors if d["availability_status"] == "Available" and d["attendance_status"] == "Present"]
        
        # Set B: Target hospitals requiring doctors
        hosp_map = {str(h["id"]).replace("-", ""): h for h in hospitals}
        target_hosp_ids = alert_hosp_ids.intersection(hosp_map.keys())
        
        if not available_doctors or not target_hosp_ids:
            return []

        # Build Bipartite Graph
        G = nx.Graph()
        
        # Map IDs to distinguish Sets
        doc_nodes = [f"doc_{str(d['id']).replace('-', '')}" for d in available_doctors]
        hosp_nodes = [f"hosp_{h_id}" for h_id in target_hosp_ids]
        
        G.add_nodes_from(doc_nodes, bipartite=0)
        G.add_nodes_from(hosp_nodes, bipartite=1)

        doc_by_node = {f"doc_{str(d['id']).replace('-', '')}": d for d in available_doctors}
        hosp_by_node = {f"hosp_{h_id}": hosp_map[h_id] for h_id in target_hosp_ids}

        # Add edges with matching weights
        for d_node in doc_nodes:
            d = doc_by_node[d_node]
            # Doctor base hospital coords
            base_hosp = hosp_map.get(str(d["hospital_id"]).replace("-", ""))
            if not base_hosp:
                continue
                
            for h_node in hosp_nodes:
                h = hosp_by_node[h_node]
                # Distance
                dist = calculate_haversine_distance(base_hosp["latitude"], base_hosp["longitude"], h["latitude"], h["longitude"])
                
                if dist > 40.0: # Skip if too far
                    continue
                    
                # Weight calculation: higher weight is preferred
                # 1. Proximity weight (up to 50 points)
                proximity_score = max(0, 50 - dist)
                
                # 2. Priority/Specialization weight
                # In a real setup, we match specialization to outbreak alerts
                specialization_score = 30 if d["specialization"] == "General Medicine" else 10
                
                total_weight = int(proximity_score + specialization_score)
                G.add_edge(d_node, h_node, weight=total_weight)

        if not G.edges():
            return []

        # Solve Maximum Weight Matching
        matching = nx.max_weight_matching(G, maxcardinality=True)
        
        reallocations = []
        for u, v in matching:
            # Determine which node is doctor and which is hospital
            d_node = u if u.startswith("doc_") else v
            h_node = v if u.startswith("doc_") else u
            
            d = doc_by_node[d_node]
            h = hosp_by_node[h_node]
            
            src_hosp = hosp_map.get(str(d["hospital_id"]).replace("-", ""))
            dist = calculate_haversine_distance(src_hosp["latitude"], src_hosp["longitude"], h["latitude"], h["longitude"]) if src_hosp else 0.0
            
            reallocations.append({
                "doctor_id": str(d["id"]),
                "doctor_name": d["doctor_name"],
                "specialization": d["specialization"],
                "source_hospital_id": str(d["hospital_id"]),
                "source_hospital_name": src_hosp["hospital_name"] if src_hosp else "HQ Central",
                "destination_hospital_id": str(h["id"]),
                "destination_hospital_name": h["hospital_name"],
                "distance_km": round(dist, 2),
                "estimated_benefit_index": 85.0
            })

        return reallocations
