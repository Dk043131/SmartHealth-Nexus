from backend.repositories.base import BaseRepository
from backend.models.user import User
from backend.models.models import (
    Hospital,
    Doctor,
    Medicine,
    MedicineInventory,
    Bed,
    DiagnosticTest,
    Ambulance,
    Patient,
    Alert,
    AuditLog,
    Notification,
    ResourceTransfer,
    DiseaseTrend,
    WeatherData,
    Prediction,
    SystemSettings
)

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

class HospitalRepository(BaseRepository[Hospital]):
    def __init__(self):
        super().__init__(Hospital)

class DoctorRepository(BaseRepository[Doctor]):
    def __init__(self):
        super().__init__(Doctor)

class MedicineRepository(BaseRepository[Medicine]):
    def __init__(self):
        super().__init__(Medicine)

class MedicineInventoryRepository(BaseRepository[MedicineInventory]):
    def __init__(self):
        super().__init__(MedicineInventory)

class BedRepository(BaseRepository[Bed]):
    def __init__(self):
        super().__init__(Bed)

class DiagnosticTestRepository(BaseRepository[DiagnosticTest]):
    def __init__(self):
        super().__init__(DiagnosticTest)

class AmbulanceRepository(BaseRepository[Ambulance]):
    def __init__(self):
        super().__init__(Ambulance)

class PatientRepository(BaseRepository[Patient]):
    def __init__(self):
        super().__init__(Patient)

class AlertRepository(BaseRepository[Alert]):
    def __init__(self):
        super().__init__(Alert)

class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self):
        super().__init__(AuditLog)

class NotificationRepository(BaseRepository[Notification]):
    def __init__(self):
        super().__init__(Notification)

class ResourceTransferRepository(BaseRepository[ResourceTransfer]):
    def __init__(self):
        super().__init__(ResourceTransfer)

class DiseaseTrendRepository(BaseRepository[DiseaseTrend]):
    def __init__(self):
        super().__init__(DiseaseTrend)

class WeatherDataRepository(BaseRepository[WeatherData]):
    def __init__(self):
        super().__init__(WeatherData)

class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self):
        super().__init__(Prediction)

class SystemSettingsRepository(BaseRepository[SystemSettings]):
    def __init__(self):
        super().__init__(SystemSettings)

# Export instantiated repositories for services to import
user_repo = UserRepository()
hospital_repo = HospitalRepository()
doctor_repo = DoctorRepository()
medicine_repo = MedicineRepository()
inventory_repo = MedicineInventoryRepository()
bed_repo = BedRepository()
diagnostic_repo = DiagnosticTestRepository()
ambulance_repo = AmbulanceRepository()
patient_repo = PatientRepository()
alert_repo = AlertRepository()
audit_repo = AuditLogRepository()
notification_repo = NotificationRepository()
transfer_repo = ResourceTransferRepository()
disease_trend_repo = DiseaseTrendRepository()
weather_repo = WeatherDataRepository()
prediction_repo = PredictionRepository()
settings_repo = SystemSettingsRepository()
