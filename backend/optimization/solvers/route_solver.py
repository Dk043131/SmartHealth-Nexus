import networkx as nx
from typing import List, Dict, Any
from backend.optimization.core.distance import calculate_haversine_distance

class RouteRoutingSolver:
    def __init__(self):
        pass

    def solve(self, ambulances: List[Dict[str, Any]], hospitals: List[Dict[str, Any]], target_hospital_id: str) -> List[Dict[str, Any]]:
        """
        Solves shortest path routing to dispatch the closest available ambulance to a target hospital.
        """
        hosp_map = {str(h["id"]).replace("-", ""): h for h in hospitals}
        target_hosp = hosp_map.get(target_hospital_id.replace("-", ""))
        
        if not target_hosp:
            return []

        # Filter available ambulances
        avail_ambs = [a for a in ambulances if a["status"] == "AVAILABLE"]
        if not avail_ambs:
            return []

        # Construct a network graph of hospitals connected by geographical distance
        G = nx.Graph()
        for h_id, h in hosp_map.items():
            G.add_node(h_id, lat=h["latitude"], lon=h["longitude"])

        # Add edges between nearby hospitals (e.g. distance < 15km) to simulate taluk roadways
        h_ids = list(hosp_map.keys())
        for i in range(len(h_ids)):
            for j in range(i + 1, len(h_ids)):
                id1, id2 = h_ids[i], h_ids[j]
                h1, h2 = hosp_map[id1], hosp_map[id2]
                dist = calculate_haversine_distance(h1["latitude"], h1["longitude"], h2["latitude"], h2["longitude"])
                if dist < 20.0: # Road network link threshold
                    G.add_edge(id1, id2, weight=dist)

        dispatch_candidates = []
        for a in avail_ambs:
            base_h_id = str(a["hospital_id"]).replace("-", "")
            if base_h_id not in hosp_map:
                continue

            # Calculate shortest path using NetworkX Dijkstra
            try:
                path = nx.shortest_path(G, source=base_h_id, target=target_hospital_id.replace("-", ""), weight="weight")
                path_length = nx.shortest_path_length(G, source=base_h_id, target=target_hospital_id.replace("-", ""), weight="weight")
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                # Fallback to direct Haversine distance
                base_h = hosp_map[base_h_id]
                path_length = calculate_haversine_distance(base_h["latitude"], base_h["longitude"], target_hosp["latitude"], target_hosp["longitude"])
                path = [base_h_id, target_hospital_id.replace("-", "")]

            dispatch_candidates.append({
                "ambulance_id": str(a["id"]),
                "vehicle_number": a["vehicle_number"],
                "driver_name": a["driver_name"],
                "base_hospital_id": base_h_id,
                "base_hospital_name": hosp_map[base_h_id]["hospital_name"],
                "path_route": [hosp_map[node]["hospital_name"] for node in path],
                "distance_km": round(path_length, 2),
                "estimated_eta_minutes": int(path_length * 2.0 + 3) # Assumes 30 km/h taluk speed + 3min startup delay
            })

        # Sort candidates by ETA/Distance
        dispatch_candidates.sort(key=lambda x: x["distance_km"])
        return dispatch_candidates
