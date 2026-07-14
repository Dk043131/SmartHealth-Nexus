import networkx as nx
import pandas as pd
from typing import List, Dict, Any
from backend.optimization.core.distance import calculate_haversine_distance

class MedicineRedistributionSolver:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {"transport_cost": 0.3, "travel_distance": 0.2}

    def solve(self, hospitals: List[Dict[str, Any]], inventories: List[Dict[str, Any]], medicine_id: str) -> List[Dict[str, Any]]:
        """
        Solves the medicine transport/redistribution problem using NetworkX min_cost_flow.
        """
        # Filter inventories for target medicine
        med_inv = [inv for inv in inventories if str(inv["medicine_id"]).replace("-", "") == medicine_id.replace("-", "")]
        if not med_inv:
            return []

        # Build supply and demand nodes
        # Let's say baseline target stock is 100 units for Major hospitals, 30 for CHC, 15 for PHC
        supply_nodes = []
        demand_nodes = []
        
        hosp_map = {str(h["id"]).replace("-", ""): h for h in hospitals}

        for inv in med_inv:
            h_id = str(inv["hospital_id"]).replace("-", "")
            if h_id not in hosp_map:
                continue
                
            h = hosp_map[h_id]
            qty = inv["available_quantity"]
            
            # Simple threshold rules
            target = 100 if h["hospital_type"] == "GH" else (30 if h["hospital_type"] == "CHC" else 15)
            diff = qty - target
            
            if diff > 15: # Excess stock (Supplier)
                supply_nodes.append({"id": h_id, "excess": int(diff), "lat": h["latitude"], "lon": h["longitude"]})
            elif diff < 0: # Deficit stock (Demander)
                demand_nodes.append({"id": h_id, "deficit": int(abs(diff)), "lat": h["latitude"], "lon": h["longitude"]})

        if not supply_nodes or not demand_nodes:
            return []

        # Create directed graph
        G = nx.DiGraph()
        
        # Add virtual source and sink
        source = "source_virtual"
        sink = "sink_virtual"
        
        G.add_node(source)
        G.add_node(sink)

        # Add supply nodes and capacities
        total_supply = 0
        for s in supply_nodes:
            G.add_node(s["id"])
            # Edge from source to supply node
            G.add_edge(source, s["id"], capacity=s["excess"], weight=0)
            total_supply += s["excess"]

        # Add demand nodes and capacities
        total_demand = 0
        for d in demand_nodes:
            G.add_node(d["id"])
            # Edge from demand node to sink
            G.add_edge(d["id"], sink, capacity=d["deficit"], weight=0)
            total_demand += d["deficit"]

        # Limit flow to the minimum of total supply or demand
        max_flow = min(total_supply, total_demand)
        
        # Connect supply nodes to demand nodes with Haversine distance as cost weights
        for s in supply_nodes:
            for d in demand_nodes:
                dist = calculate_haversine_distance(s["lat"], s["lon"], d["lat"], d["lon"])
                # Add edge with capacity and distance-based weight
                G.add_edge(s["id"], d["id"], capacity=s["excess"], weight=int(dist * 10))

        # We set flow demand at source and sink
        G.nodes[source]['demand'] = -max_flow
        G.nodes[sink]['demand'] = max_flow

        # Solve Minimum Cost Flow
        try:
            flow_dict = nx.min_cost_flow(G)
        except nx.NetworkXUnfeasible:
            return []

        # Parse flow dictionary into recommendations
        transfer_plan = []
        for u in flow_dict:
            if u == source or u == sink:
                continue
            for v, flow in flow_dict[u].items():
                if v == sink or v == source:
                    continue
                if flow > 0:
                    src_hosp = hosp_map[u]
                    dest_hosp = hosp_map[v]
                    dist = calculate_haversine_distance(src_hosp["latitude"], src_hosp["longitude"], dest_hosp["latitude"], dest_hosp["longitude"])
                    
                    transfer_plan.append({
                        "source_hospital_id": u,
                        "source_hospital_name": src_hosp["hospital_name"],
                        "destination_hospital_id": v,
                        "destination_hospital_name": dest_hosp["hospital_name"],
                        "quantity": flow,
                        "distance_km": round(dist, 2),
                        "estimated_transport_cost": round(flow * dist * 0.15, 2)
                    })

        return transfer_plan
