from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, UUID
from sqlalchemy.orm import relationship
from backend.core.database import Base
from backend.core.constants import UserRole
from backend.models.base import BaseModelMixin

class User(BaseModelMixin, Base):
    __tablename__ = "users"

    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.PHC_STAFF)
    
    # Hospital association (nullable for District Admin)
    hospital_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("hospitals.id", ondelete="SET NULL"), 
        nullable=True
    )

    # Relationships
    hospital = relationship("Hospital", back_populates="users")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    approved_transfers = relationship("ResourceTransfer", back_populates="approver", foreign_keys="[ResourceTransfer.approved_by]")
