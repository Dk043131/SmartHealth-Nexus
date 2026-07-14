import enum
from sqlalchemy import Column, String, Float, Integer, Date, DateTime, Boolean, ForeignKey, Enum as SQLEnum, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
from backend.models.base import BaseModelMixin, SoftDeleteModelMixin
from backend.core.constants import (
    HospitalType,
    BedType,
    AlertPriority,
    AlertStatus,
    AmbulanceStatus,
    PredictionType,
    NotificationType,
    TransferStatus
)

class Hospital(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "hospitals"

    hospital_code = Column(String(50), unique=True, index=True, nullable=False)
    hospital_name = Column(String(200), index=True, nullable=False)
    hospital_type = Column(SQLEnum(HospitalType), nullable=False, default=HospitalType.PHC)
    district = Column(String(100), nullable=False, index=True)
    taluk = Column(String(100), nullable=False)
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="Active")

    # Relationships
    users = relationship("User", back_populates="hospital", cascade="all, delete-orphan")
    doctors = relationship("Doctor", back_populates="hospital", cascade="all, delete-orphan")
    inventories = relationship("MedicineInventory", back_populates="hospital", cascade="all, delete-orphan")
    beds = relationship("Bed", back_populates="hospital", cascade="all, delete-orphan")
    diagnostics = relationship("DiagnosticTest", back_populates="hospital", cascade="all, delete-orphan")
    ambulances = relationship("Ambulance", back_populates="hospital", cascade="all, delete-orphan")
    patients = relationship("Patient", back_populates="hospital", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="hospital", cascade="all, delete-orphan")
    transfers_out = relationship("ResourceTransfer", back_populates="source_hospital", foreign_keys="[ResourceTransfer.source_hospital_id]", cascade="all, delete-orphan")
    transfers_in = relationship("ResourceTransfer", back_populates="destination_hospital", foreign_keys="[ResourceTransfer.destination_hospital_id]", cascade="all, delete-orphan")
    weather = relationship("WeatherData", back_populates="hospital", cascade="all, delete-orphan")
    outbreaks = relationship("DiseaseTrend", back_populates="hospital", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="hospital", cascade="all, delete-orphan")


class Doctor(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "doctors"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(150), index=True, nullable=False)
    specialization = Column(String(100), nullable=False, index=True)
    qualification = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    availability_status = Column(String(50), nullable=False, default="Available")
    attendance_status = Column(String(50), nullable=False, default="Present")

    # Relationships
    hospital = relationship("Hospital", back_populates="doctors")


class Medicine(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "medicines"

    medicine_code = Column(String(100), unique=True, index=True, nullable=False)
    medicine_name = Column(String(200), index=True, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    unit = Column(String(50), nullable=False)
    minimum_stock = Column(Integer, nullable=False, default=100)
    description = Column(String(500), nullable=True)

    # Relationships
    inventories = relationship("MedicineInventory", back_populates="medicine", cascade="all, delete-orphan")
    transfers = relationship("ResourceTransfer", back_populates="medicine", cascade="all, delete-orphan")


class MedicineInventory(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "medicine_inventory"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_id = Column(UUID(as_uuid=True), ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    available_quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    expiry_date = Column(Date, nullable=True, index=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    hospital = relationship("Hospital", back_populates="inventories")
    medicine = relationship("Medicine", back_populates="inventories")


class Bed(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "beds"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    bed_type = Column(SQLEnum(BedType), nullable=False, default=BedType.GENERAL, index=True)
    total_beds = Column(Integer, nullable=False, default=0)
    occupied_beds = Column(Integer, nullable=False, default=0)
    available_beds = Column(Integer, nullable=False, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    hospital = relationship("Hospital", back_populates="beds")


class DiagnosticTest(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "diagnostic_tests"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name = Column(String(150), index=True, nullable=False)
    availability = Column(Boolean, nullable=False, default=True)
    daily_capacity = Column(Integer, nullable=False, default=10)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    hospital = relationship("Hospital", back_populates="diagnostics")


class Ambulance(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "ambulances"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_number = Column(String(50), unique=True, index=True, nullable=False)
    driver_name = Column(String(150), nullable=True)
    status = Column(SQLEnum(AmbulanceStatus), nullable=False, default=AmbulanceStatus.AVAILABLE, index=True)
    gps_enabled = Column(Boolean, nullable=False, default=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    hospital = relationship("Hospital", back_populates="ambulances")


class Patient(BaseModelMixin, SoftDeleteModelMixin, Base):
    __tablename__ = "patients"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_identifier = Column(String(100), unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    disease = Column(String(150), index=True, nullable=False)
    visit_date = Column(Date, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Admitted")  # Admitted, Discharged, Transferred

    # Relationships
    hospital = relationship("Hospital", back_populates="patients")


class Alert(BaseModelMixin, Base):
    __tablename__ = "alerts"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(SQLEnum(NotificationType), nullable=False, default=NotificationType.INVENTORY_ALERT, index=True)
    priority = Column(SQLEnum(AlertPriority), nullable=False, default=AlertPriority.MEDIUM, index=True)
    message = Column(String(500), nullable=False)
    status = Column(SQLEnum(AlertStatus), nullable=False, default=AlertStatus.UNRESOLVED, index=True)

    # Relationships
    hospital = relationship("Hospital", back_populates="alerts")


class AuditLog(BaseModelMixin, Base):
    __tablename__ = "audit_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_name = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(50), nullable=True)
    ip_address = Column(String(50), nullable=True)


class Notification(BaseModelMixin, Base):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(String(500), nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False, default=NotificationType.INVENTORY_ALERT)
    status = Column(String(20), nullable=False, default="UNREAD")  # READ, UNREAD
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")


class ResourceTransfer(BaseModelMixin, Base):
    __tablename__ = "resource_transfers"

    source_hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False)  # MEDICINE, EQUIPMENT, STAFF, AMBULANCE
    resource_id = Column(UUID(as_uuid=True), ForeignKey("medicines.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False, default=1)
    recommendation_source = Column(String(50), nullable=False, default="MANUAL")  # AI, MANUAL
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    transfer_status = Column(SQLEnum(TransferStatus), nullable=False, default=TransferStatus.PENDING, index=True)

    # Relationships
    source_hospital = relationship("Hospital", foreign_keys=[source_hospital_id], back_populates="transfers_out")
    destination_hospital = relationship("Hospital", foreign_keys=[destination_hospital_id], back_populates="transfers_in")
    medicine = relationship("Medicine", back_populates="transfers")
    approver = relationship("User", foreign_keys=[approved_by], back_populates="approved_transfers")


class DiseaseTrend(BaseModelMixin, Base):
    __tablename__ = "disease_trends"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    disease_name = Column(String(150), index=True, nullable=False)
    reported_cases = Column(Integer, nullable=False, default=0)
    week = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    # Relationships
    hospital = relationship("Hospital", back_populates="outbreaks")


class WeatherData(BaseModelMixin, Base):
    __tablename__ = "weather_data"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False, default=0.0)
    weather_condition = Column(String(100), nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    hospital = relationship("Hospital", back_populates="weather")


class Prediction(BaseModelMixin, Base):
    __tablename__ = "predictions"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_type = Column(SQLEnum(PredictionType), nullable=False, index=True)
    predicted_value = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False, default=0.0)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    hospital = relationship("Hospital", back_populates="predictions")


class SystemSettings(BaseModelMixin, Base):
    __tablename__ = "system_settings"

    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(String(500), nullable=False)
    description = Column(String(300), nullable=True)
