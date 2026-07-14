from typing import Dict, Any

class ConstraintEngine:
    def __init__(self, max_referral_distance: float = 50.0):
        self.max_referral_distance = max_referral_distance

    def check_hospital_capacity(self, occupied: int, total: int) -> bool:
        """
        Returns True if the hospital has vacant bed capacity.
        """
        return occupied < total

    def check_referral_distance(self, distance_km: float) -> bool:
        """
        Returns True if referral path distance is within policy limits.
        """
        return distance_km <= self.max_referral_distance

    def check_doctor_work_hours(self, assigned_hours: int) -> bool:
        """
        Returns True if doctor work hours do not exceed safety limits.
        """
        return assigned_hours <= 12
