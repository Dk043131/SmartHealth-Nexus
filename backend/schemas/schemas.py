from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime, date
import uuid
from backend.core.constants import (
    UserRole,
    HospitalType,
    BedType,
    AlertPriority,
    AlertStatus,
    AmbulanceStatus,
    PredictionType,
    NotificationType,
    TransferStatus
)

T = TypeVar("T")

# Standard Envelope Response Schema for ALL REST Endpoints
class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully."
    data: Optional[T] = None
    errors: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None

# Paginated Response Wrapper
class PaginatedData(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    pages: int
    limit: int

# Generic ID Base Schema
class SchemaBase(BaseModel):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


# ==========================================
# 1. Hospital Schemas
# ==========================================
class HospitalBase(BaseModel):
    hospital_code: str = Field(..., min_length=2, max_length=50)
    hospital_name: str = Field(..., min_length=2, max_length=200)
    hospital_type: HospitalType = HospitalType.PHC
    district: str = Field(..., min_length=2, max_length=100)
    taluk: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: str = "Active"

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdate(BaseModel):
    hospital_name: Optional[str] = None
    hospital_type: Optional[HospitalType] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None

class HospitalResponse(SchemaBase, HospitalBase):
    is_deleted: bool


# ==========================================
# 2. Doctor Schemas
# ==========================================
class DoctorBase(BaseModel):
    hospital_id: uuid.UUID
    doctor_name: str = Field(..., min_length=2, max_length=150)
    specialization: str = Field(..., min_length=2, max_length=100)
    qualification: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    availability_status: str = "Available"
    attendance_status: str = "Present"

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    doctor_name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    availability_status: Optional[str] = None
    attendance_status: Optional[str] = None

class DoctorResponse(SchemaBase, DoctorBase):
    is_deleted: bool


# ==========================================
# 3. Medicine Schemas
# ==========================================
class MedicineBase(BaseModel):
    medicine_code: str = Field(..., min_length=2, max_length=100)
    medicine_name: str = Field(..., min_length=2, max_length=200)
    category: str = Field(..., min_length=2, max_length=100)
    unit: str = Field(..., min_length=1, max_length=50)
    minimum_stock: int = Field(100, ge=0)
    description: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    medicine_name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    minimum_stock: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None

class MedicineResponse(SchemaBase, MedicineBase):
    is_deleted: bool


# ==========================================
# 4. MedicineInventory Schemas
# ==========================================
class MedicineInventoryBase(BaseModel):
    hospital_id: uuid.UUID
    medicine_id: uuid.UUID
    available_quantity: int = Field(0, ge=0)
    reserved_quantity: int = Field(0, ge=0)
    expiry_date: Optional[date] = None

class MedicineInventoryCreate(MedicineInventoryBase):
    pass

class MedicineInventoryUpdate(BaseModel):
    available_quantity: Optional[int] = Field(None, ge=0)
    reserved_quantity: Optional[int] = Field(None, ge=0)
    expiry_date: Optional[date] = None

class MedicineInventoryResponse(SchemaBase, MedicineInventoryBase):
    last_updated: datetime
    is_deleted: bool
    medicine: Optional[MedicineResponse] = None


# ==========================================
# 5. Bed Schemas
# ==========================================
class BedBase(BaseModel):
    hospital_id: uuid.UUID
    bed_type: BedType = BedType.GENERAL
    total_beds: int = Field(0, ge=0)
    occupied_beds: int = Field(0, ge=0)
    available_beds: int = Field(0, ge=0)

class BedCreate(BedBase):
    pass

class BedUpdate(BaseModel):
    total_beds: Optional[int] = Field(None, ge=0)
    occupied_beds: Optional[int] = Field(None, ge=0)
    available_beds: Optional[int] = Field(None, ge=0)

class BedResponse(SchemaBase, BedBase):
    last_updated: datetime
    is_deleted: bool


# ==========================================
# 6. DiagnosticTest Schemas
# ==========================================
class DiagnosticTestBase(BaseModel):
    hospital_id: uuid.UUID
    test_name: str = Field(..., min_length=2, max_length=150)
    availability: bool = True
    daily_capacity: int = Field(10, ge=0)

class DiagnosticTestCreate(DiagnosticTestBase):
    pass

class DiagnosticTestUpdate(BaseModel):
    test_name: Optional[str] = None
    availability: Optional[bool] = None
    daily_capacity: Optional[int] = Field(None, ge=0)

class DiagnosticTestResponse(SchemaBase, DiagnosticTestBase):
    last_updated: datetime
    is_deleted: bool


# ==========================================
# 7. Ambulance Schemas
# ==========================================
class AmbulanceBase(BaseModel):
    hospital_id: uuid.UUID
    vehicle_number: str = Field(..., min_length=2, max_length=50)
    driver_name: Optional[str] = None
    status: AmbulanceStatus = AmbulanceStatus.AVAILABLE
    gps_enabled: bool = True

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceUpdate(BaseModel):
    driver_name: Optional[str] = None
    status: Optional[AmbulanceStatus] = None
    gps_enabled: Optional[bool] = None

class AmbulanceResponse(SchemaBase, AmbulanceBase):
    last_updated: datetime
    is_deleted: bool


# ==========================================
# 8. Patient Schemas
# ==========================================
class PatientBase(BaseModel):
    hospital_id: uuid.UUID
    patient_identifier: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=150)
    gender: str = Field(..., min_length=1, max_length=20)
    disease: str = Field(..., min_length=2, max_length=150)
    visit_date: date
    status: str = "Admitted"

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[str] = None
    disease: Optional[str] = None
    visit_date: Optional[date] = None
    status: Optional[str] = None

class PatientResponse(SchemaBase, PatientBase):
    is_deleted: bool


# ==========================================
# 9. Alert Schemas
# ==========================================
class AlertBase(BaseModel):
    hospital_id: uuid.UUID
    alert_type: NotificationType = NotificationType.INVENTORY_ALERT
    priority: AlertPriority = AlertPriority.MEDIUM
    message: str = Field(..., min_length=2, max_length=500)
    status: AlertStatus = AlertStatus.UNRESOLVED

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    priority: Optional[AlertPriority] = None
    message: Optional[str] = None
    status: Optional[AlertStatus] = None

class AlertResponse(SchemaBase, AlertBase):
    pass


# ==========================================
# 10. AuditLog Schemas
# ==========================================
class AuditLogBase(BaseModel):
    user_id: Optional[uuid.UUID] = None
    hospital_id: Optional[uuid.UUID] = None
    action: str = Field(..., min_length=2, max_length=100)
    entity_name: str = Field(..., min_length=2, max_length=100)
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None

class AuditLogResponse(SchemaBase, AuditLogBase):
    pass


# ==========================================
# 11. Notification Schemas
# ==========================================
class NotificationBase(BaseModel):
    user_id: uuid.UUID
    title: str = Field(..., min_length=2, max_length=150)
    message: str = Field(..., min_length=2, max_length=500)
    notification_type: NotificationType = NotificationType.INVENTORY_ALERT
    status: str = "UNREAD"
    read_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    status: Optional[str] = None
    read_at: Optional[datetime] = None

class NotificationResponse(SchemaBase, NotificationBase):
    pass


# ==========================================
# 12. ResourceTransfer Schemas
# ==========================================
class ResourceTransferBase(BaseModel):
    source_hospital_id: uuid.UUID
    destination_hospital_id: uuid.UUID
    resource_type: str = Field(..., min_length=2, max_length=50)
    resource_id: Optional[uuid.UUID] = None
    quantity: int = Field(1, ge=1)
    recommendation_source: str = "MANUAL"
    approved_by: Optional[uuid.UUID] = None
    transfer_status: TransferStatus = TransferStatus.PENDING

class ResourceTransferCreate(ResourceTransferBase):
    pass

class ResourceTransferUpdate(BaseModel):
    approved_by: Optional[uuid.UUID] = None
    transfer_status: Optional[TransferStatus] = None

class ResourceTransferResponse(SchemaBase, ResourceTransferBase):
    pass


# ==========================================
# 13. DiseaseTrend Schemas
# ==========================================
class DiseaseTrendBase(BaseModel):
    hospital_id: uuid.UUID
    disease_name: str = Field(..., min_length=2, max_length=150)
    reported_cases: int = Field(0, ge=0)
    week: int = Field(..., ge=1, le=53)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)

class DiseaseTrendCreate(DiseaseTrendBase):
    pass

class DiseaseTrendUpdate(BaseModel):
    reported_cases: Optional[int] = Field(None, ge=0)

class DiseaseTrendResponse(SchemaBase, DiseaseTrendBase):
    pass


# ==========================================
# 14. WeatherData Schemas
# ==========================================
class WeatherDataBase(BaseModel):
    hospital_id: uuid.UUID
    temperature: float
    humidity: float = Field(..., ge=0.0, le=100.0)
    rainfall: float = Field(0.0, ge=0.0)
    weather_condition: Optional[str] = None

class WeatherDataCreate(WeatherDataBase):
    pass

class WeatherDataResponse(SchemaBase, WeatherDataBase):
    recorded_at: datetime


# ==========================================
# 15. Prediction Schemas
# ==========================================
class PredictionBase(BaseModel):
    hospital_id: uuid.UUID
    prediction_type: PredictionType
    predicted_value: float
    confidence_score: float = Field(0.0, ge=0.0, le=1.0)

class PredictionCreate(PredictionBase):
    pass

class PredictionResponse(SchemaBase, PredictionBase):
    generated_at: datetime


# ==========================================
# 16. SystemSettings Schemas
# ==========================================
class SystemSettingsBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=100)
    value: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None

class SystemSettingsCreate(SystemSettingsBase):
    pass

class SystemSettingsUpdate(BaseModel):
    value: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None

class SystemSettingsResponse(SchemaBase, SystemSettingsBase):
    pass


# ==========================================
# 17. User Schemas
# ==========================================
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: UserRole
    hospital_id: Optional[uuid.UUID] = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(SchemaBase, UserBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
