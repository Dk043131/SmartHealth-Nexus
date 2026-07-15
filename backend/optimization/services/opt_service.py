import time
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.models import Hospital, MedicineInventory, Doctor, Ambulance, Alert, Medicine
from backend.optimization.solvers.medicine_solver import MedicineRedistributionSolver
from backend.optimization.solvers.staff_solver import StaffAllocationSolver
from backend.optimization.solvers.route_solver import RouteRoutingSolver
from backend.optimization.recommendation.engine import RecommendationEngine

class OptimizationService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(OptimizationService, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.medicine_solver = MedicineRedistributionSolver()
        self.staff_solver = StaffAllocationSolver()
        self.route_solver = RouteRoutingSolver()
        self.recommender = RecommendationEngine()
        self._cache = {}
        self._initialized = True

    def _get_db_records(self) -> tuple:
        db = SessionLocal()
        try:
            hospitals = [
                {
                    "id": str(h.id),
                    "hospital_name": h.hospital_name,
                    "hospital_type": h.hospital_type.value if hasattr(h.hospital_type, "value") else h.hospital_type,
                    "latitude": h.latitude,
                    "longitude": h.longitude,
                    "taluk": h.taluk,
                    "district": h.district
                }
                for h in db.query(Hospital).filter(Hospital.is_deleted == False).all()
            ]
            
            inventories = [
                {
                    "id": str(inv.id),
                    "hospital_id": str(inv.hospital_id),
                    "medicine_id": str(inv.medicine_id),
                    "available_quantity": inv.available_quantity
                }
                for inv in db.query(MedicineInventory).filter(MedicineInventory.is_deleted == False).all()
            ]
            
            doctors = [
                {
                    "id": str(d.id),
                    "doctor_name": d.doctor_name,
                    "specialization": d.specialization,
                    "availability_status": d.availability_status,
                    "attendance_status": d.attendance_status,
                    "hospital_id": str(d.hospital_id) if d.hospital_id else None
                }
                for d in db.query(Doctor).filter(Doctor.is_deleted == False).all()
            ]
            
            ambulances = [
                {
                    "id": str(a.id),
                    "vehicle_number": a.vehicle_number,
                    "driver_name": a.driver_name,
                    "driver_phone": None,
                    "status": a.status.value if hasattr(a.status, "value") else a.status,
                    "hospital_id": str(a.hospital_id) if a.hospital_id else None
                }
                for a in db.query(Ambulance).filter(Ambulance.is_deleted == False).all()
            ]
            
            alerts = [
                {
                    "id": str(al.id),
                    "hospital_id": str(al.hospital_id),
                    "alert_type": al.alert_type.value if hasattr(al.alert_type, "value") else al.alert_type,
                    "priority": al.priority.value if hasattr(al.priority, "value") else al.priority,
                    "message": al.message,
                    "status": al.status.value if hasattr(al.status, "value") else al.status
                }
                for al in db.query(Alert).filter(Alert.status == "UNRESOLVED").all()
            ]
            
            medicines = [
                {
                    "id": str(m.id),
                    "name": m.medicine_name,
                    "category": m.category,
                    "minimum_stock": m.minimum_stock
                }
                for m in db.query(Medicine).filter(Medicine.is_deleted == False).all()
            ]

            return hospitals, inventories, doctors, ambulances, alerts, medicines
        finally:
            db.close()

    def get_medicine_optimization(self) -> Dict[str, Any]:
        hospitals, inventories, _, _, _, medicines = self._get_db_records()
        
        # Pick first medicine (e.g. Paracetamol) as target
        if not medicines:
            return {"optimization_result": [], "recommendations": [], "duration_ms": 0}
            
        med = medicines[0]
        start_time = time.time()
        
        transfer_plan = self.medicine_solver.solve(hospitals, inventories, med["id"])
        recommendations = self.recommender.build_recommendations(transfer_plan, [], [])
        
        duration = int((time.time() - start_time) * 1000)
        
        return {
            "medicine_name": med["name"],
            "medicine_id": med["id"],
            "optimization_result": transfer_plan,
            "recommendations": recommendations,
            "duration_ms": duration,
            "constraints_applied": ["Hospital Capacity", "Minimum Stock Safety Bounds"],
            "estimated_savings_usd": round(sum(p["quantity"] * p["distance_km"] * 0.15 for p in transfer_plan), 2)
        }

    def get_staff_optimization(self) -> Dict[str, Any]:
        hospitals, _, doctors, _, alerts, _ = self._get_db_records()
        start_time = time.time()
        
        reallocations = self.staff_solver.solve(doctors, hospitals, alerts)
        recommendations = self.recommender.build_recommendations([], reallocations, [])
        
        duration = int((time.time() - start_time) * 1000)
        
        return {
            "optimization_result": reallocations,
            "recommendations": recommendations,
            "duration_ms": duration,
            "constraints_applied": ["Doctor Availability", "Proximity Allocation Limits"],
            "estimated_savings_usd": round(len(reallocations) * 120.0, 2)
        }

    def get_ambulance_optimization(self, target_hospital_id: str) -> Dict[str, Any]:
        hospitals, _, _, ambulances, _, _ = self._get_db_records()
        start_time = time.time()
        
        dispatch_routes = self.route_solver.solve(ambulances, hospitals, target_hospital_id)
        recommendations = self.recommender.build_recommendations([], [], dispatch_routes)
        
        duration = int((time.time() - start_time) * 1000)
        
        return {
            "optimization_result": dispatch_routes,
            "recommendations": recommendations,
            "duration_ms": duration,
            "constraints_applied": ["Vehicle Status", "Road Network Connectors"],
            "estimated_savings_usd": round(sum(100.0 - r["distance_km"] for r in dispatch_routes[:3]), 2)
        }

    def get_district_readiness(self) -> List[Dict[str, Any]]:
        hospitals, inventories, doctors, ambulances, alerts, medicines = self._get_db_records()
        
        readiness_list = []
        for h in hospitals:
            h_id = h["id"]
            # 1. Medicine index
            h_invs = [inv for inv in inventories if inv["hospital_id"] == h_id]
            shortage_count = 0
            for inv in h_invs:
                med = next((m for m in medicines if m["id"] == inv["medicine_id"]), None)
                if med and inv["available_quantity"] < med["minimum_stock"]:
                    shortage_count += 1
            med_score = max(0, 100 - shortage_count * 10)
            
            # 2. Doctor index
            h_docs = [d for d in doctors if d["hospital_id"] == h_id]
            present_docs = [d for d in h_docs if d["attendance_status"] == "Present"]
            doc_score = int(len(present_docs) / len(h_docs) * 100) if h_docs else 85
            
            # 3. Ambulance index
            h_ambs = [a for a in ambulances if a["hospital_id"] == h_id]
            avail_ambs = [a for a in h_ambs if a["status"] == "AVAILABLE"]
            amb_score = int(len(avail_ambs) / len(h_ambs) * 100) if h_ambs else 90

            # 4. Overall composite readiness
            overall = int(med_score * 0.4 + doc_score * 0.3 + amb_score * 0.3)
            
            readiness_list.append({
                "hospital_id": h_id,
                "hospital_name": h["hospital_name"],
                "hospital_type": h["hospital_type"],
                "taluk": h["taluk"],
                "medicine_score": med_score,
                "bed_score": 80, # default placeholder
                "doctor_score": doc_score,
                "ambulance_score": amb_score,
                "overall_score": overall
            })
            
        return readiness_list
        
    def get_consolidated_recommendations(self) -> List[Dict[str, Any]]:
        # Merges medicine, staff, and ambulance top recommendations
        med_res = self.get_medicine_optimization()
        staff_res = self.get_staff_optimization()
        
        # Pick first hospital for ambulance routing demo
        hospitals, _, _, _, _, _ = self._get_db_records()
        amb_res = self.get_ambulance_optimization(hospitals[0]["id"]) if hospitals else {"recommendations": []}
        
        consolidated = []
        consolidated.extend(med_res.get("recommendations", []))
        consolidated.extend(staff_res.get("recommendations", []))
        consolidated.extend(amb_res.get("recommendations", []))
        
        consolidated.sort(key=lambda x: x["impact_score"], reverse=True)
        return consolidated
