from pydantic import BaseModel
from typing import Dict

class OptimizationWeights(BaseModel):
    transport_cost: float = 0.3
    travel_distance: float = 0.2
    response_time: float = 0.2
    readiness_impact: float = 0.3

class ConstraintConfig(BaseModel):
    max_referral_distance_km: float = 50.0
    min_medicine_stock_threshold: int = 20
    max_doctor_hours: int = 12
    max_vehicle_capacity: int = 1000
