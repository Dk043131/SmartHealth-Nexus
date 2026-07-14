from typing import Any, List, Optional, Tuple, Dict, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
import uuid

# Import Repositories
from backend.repositories.repositories import (
    user_repo, hospital_repo, doctor_repo, medicine_repo, inventory_repo,
    bed_repo, diagnostic_repo, ambulance_repo, patient_repo, alert_repo,
    audit_repo, notification_repo, transfer_repo, disease_trend_repo,
    weather_repo, prediction_repo, settings_repo
)

# Import models
from backend.models.user import User
from backend.models.models import Hospital

# Centralized log logger
from backend.core.logging_config import logger

class BaseService:
    """
    Base service layer linking controllers and repositories.
    Injects audit logging automatically for mutation operations.
    """
    def __init__(self, repo: Any, entity_name: str):
        self.repo = repo
        self.entity_name = entity_name

    def get_by_id(self, db: Session, id: uuid.UUID) -> Any:
        db_obj = self.repo.get(db, id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.entity_name} with ID {id} not found."
            )
        return db_obj

    def get_all(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Dict[str, Any] = None,
        search_query: Tuple[List[str], str] = None,
        order_by: str = None
    ) -> Tuple[List[Any], int]:
        return self.repo.get_multi(
            db,
            skip=skip,
            limit=limit,
            filters=filters,
            search_query=search_query,
            order_by=order_by
        )

    def create_entity(self, db: Session, obj_in: Any, actor: User, ip_address: str = None) -> Any:
        db_obj = self.repo.create(db, obj_in=obj_in, created_by=actor.email)
        
        # Log action to AuditLog
        self._write_audit_log(
            db,
            user_id=actor.id,
            hospital_id=actor.hospital_id,
            action="CREATE",
            entity_id=str(db_obj.id),
            ip_address=ip_address
        )
        return db_obj

    def update_entity(self, db: Session, id: uuid.UUID, obj_in: Any, actor: User, ip_address: str = None) -> Any:
        db_obj = self.get_by_id(db, id)
        updated_obj = self.repo.update(db, db_obj=db_obj, obj_in=obj_in, updated_by=actor.email)
        
        # Log action to AuditLog
        self._write_audit_log(
            db,
            user_id=actor.id,
            hospital_id=actor.hospital_id,
            action="UPDATE",
            entity_id=str(updated_obj.id),
            ip_address=ip_address
        )
        return updated_obj

    def delete_entity(self, db: Session, id: uuid.UUID, actor: User, ip_address: str = None) -> Any:
        db_obj = self.get_by_id(db, id)
        deleted_obj = self.repo.remove(db, id=id, deleted_by=actor.email)
        
        # Log action to AuditLog
        self._write_audit_log(
            db,
            user_id=actor.id,
            hospital_id=actor.hospital_id,
            action="DELETE",
            entity_id=str(deleted_obj.id),
            ip_address=ip_address
        )
        return deleted_obj

    def _write_audit_log(
        self,
        db: Session,
        user_id: uuid.UUID,
        hospital_id: Optional[uuid.UUID],
        action: str,
        entity_id: str,
        ip_address: str = None
    ):
        try:
            audit_repo.create(
                db,
                obj_in={
                    "user_id": user_id,
                    "hospital_id": hospital_id,
                    "action": action,
                    "entity_name": self.entity_name,
                    "entity_id": entity_id,
                    "ip_address": ip_address
                }
            )
        except Exception as e:
            logger.error(f"Failed to write audit log for {self.entity_name} {action}: {e}")


# ==========================================
# Domain-Specific Services
# ==========================================

class HospitalService(BaseService):
    def __init__(self):
        super().__init__(hospital_repo, "Hospital")

    def create_entity(self, db: Session, obj_in: Any, actor: User, ip_address: str = None) -> Any:
        # Check if code is already registered
        existing = db.query(Hospital).filter(Hospital.hospital_code == obj_in.hospital_code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A hospital with code {obj_in.hospital_code} already exists."
            )
        return super().create_entity(db, obj_in, actor, ip_address)


class DoctorService(BaseService):
    def __init__(self):
        super().__init__(doctor_repo, "Doctor")


class MedicineService(BaseService):
    def __init__(self):
        super().__init__(medicine_repo, "Medicine")


class InventoryService(BaseService):
    def __init__(self):
        super().__init__(inventory_repo, "MedicineInventory")


class BedService(BaseService):
    def __init__(self):
        super().__init__(bed_repo, "Bed")


class DiagnosticService(BaseService):
    def __init__(self):
        super().__init__(diagnostic_repo, "DiagnosticTest")


class AmbulanceService(BaseService):
    def __init__(self):
        super().__init__(ambulance_repo, "Ambulance")


class PatientService(BaseService):
    def __init__(self):
        super().__init__(patient_repo, "Patient")


class AlertService(BaseService):
    def __init__(self):
        super().__init__(alert_repo, "Alert")


class AuditLogService(BaseService):
    def __init__(self):
        super().__init__(audit_repo, "AuditLog")


class NotificationService(BaseService):
    def __init__(self):
        super().__init__(notification_repo, "Notification")


class TransferService(BaseService):
    def __init__(self):
        super().__init__(transfer_repo, "ResourceTransfer")


class DiseaseTrendService(BaseService):
    def __init__(self):
        super().__init__(disease_trend_repo, "DiseaseTrend")


class WeatherService(BaseService):
    def __init__(self):
        super().__init__(weather_repo, "WeatherData")


class PredictionService(BaseService):
    def __init__(self):
        super().__init__(prediction_repo, "Prediction")


class SettingsService(BaseService):
    def __init__(self):
        super().__init__(settings_repo, "SystemSettings")


# Export instantiated service objects
hospital_service = HospitalService()
doctor_service = DoctorService()
medicine_service = MedicineService()
inventory_service = InventoryService()
bed_service = BedService()
diagnostic_service = DiagnosticService()
ambulance_service = AmbulanceService()
patient_service = PatientService()
alert_service = AlertService()
audit_service = AuditLogService()
notification_service = NotificationService()
transfer_service = TransferService()
disease_trend_service = DiseaseTrendService()
weather_service = WeatherService()
prediction_service = PredictionService()
settings_service = SettingsService()
