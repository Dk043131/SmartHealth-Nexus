from enum import Enum

class UserRole(str, Enum):
    DISTRICT_ADMIN = "DISTRICT_ADMIN"
    PHC_STAFF = "PHC_STAFF"
    GOV_HEALTH_OFFICER = "GOV_HEALTH_OFFICER"

class HospitalType(str, Enum):
    PHC = "PHC"
    CHC = "CHC"

class BedType(str, Enum):
    GENERAL = "GENERAL"
    ICU = "ICU"
    OXYGEN = "OXYGEN"
    VENTILATOR = "VENTILATOR"

class AlertPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertStatus(str, Enum):
    UNRESOLVED = "UNRESOLVED"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"

class AmbulanceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    DISPATCHED = "DISPATCHED"
    MAINTENANCE = "MAINTENANCE"

class PredictionType(str, Enum):
    INVENTORY_SHORTAGE = "INVENTORY_SHORTAGE"
    DISEASE_OUTBREAK = "DISEASE_OUTBREAK"
    BED_OCCUPANCY = "BED_OCCUPANCY"

class NotificationType(str, Enum):
    INVENTORY_ALERT = "INVENTORY_ALERT"
    EMERGENCY_ALERT = "EMERGENCY_ALERT"
    SYSTEM_BROADCAST = "SYSTEM_BROADCAST"
    RECOMMENDATION = "RECOMMENDATION"

class TransferStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
