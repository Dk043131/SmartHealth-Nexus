import uuid
from sqlalchemy import Column, DateTime, Boolean, String, func, UUID
from backend.core.database import Base

class BaseModelMixin:
    """
    Common Base Model mixin for all database entities.
    Uses native UUID primary key and audit timestamps/trackers.
    """
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        index=True
    )
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )
    created_by = Column(String(100), nullable=True)
    updated_by = Column(String(100), nullable=True)

class SoftDeleteModelMixin:
    """
    Mixin for entities that support soft deletion instead of hard deletes.
    """
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def soft_delete(self, deleted_by: str = None):
        self.is_deleted = True
        self.deleted_at = func.now()
        if deleted_by:
            self.updated_by = deleted_by

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
