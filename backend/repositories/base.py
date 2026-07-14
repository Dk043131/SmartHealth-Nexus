from typing import Generic, TypeVar, Any, List, Optional, Tuple, Dict, Union
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from backend.core.database import Base
from backend.models.base import SoftDeleteModelMixin

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """
    Generic Base Repository encapsulating standard CRUD transactions.
    Supports soft deletes, pagination, dynamic filtering, sorting, and search.
    """
    def __init__(self, model: type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        query = db.query(self.model).filter(self.model.id == id)
        
        # Respect soft delete if the model supports it
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)
            
        return query.first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Dict[str, Any] = None,
        search_query: Tuple[List[str], str] = None,  # (fields, search_term)
        order_by: str = None,
        include_deleted: bool = False
    ) -> Tuple[List[ModelType], int]:
        """
        Fetch paginated records with dynamic filtering, sorting, and search.
        Returns a tuple: (list of records, total count matching query)
        """
        query = db.query(self.model)

        # Apply soft delete filter by default
        if hasattr(self.model, "is_deleted") and not include_deleted:
            query = query.filter(self.model.is_deleted == False)

        # Apply basic column filters
        if filters:
            for field, val in filters.items():
                if hasattr(self.model, field) and val is not None:
                    query = query.filter(getattr(self.model, field) == val)

        # Apply text search if query supplied
        if search_query:
            fields, term = search_query
            if fields and term:
                search_filters = []
                for field in fields:
                    if hasattr(self.model, field):
                        search_filters.append(getattr(self.model, field).ilike(f"%{term}%"))
                if search_filters:
                    query = query.filter(or_(*search_filters))

        # Count total records before applying limit/offset
        total_count = query.count()

        # Apply sorting
        if order_by:
            is_desc = order_by.startswith("-")
            field_name = order_by[1:] if is_desc else order_by
            if hasattr(self.model, field_name):
                sort_col = getattr(self.model, field_name)
                query = query.order_by(sort_col.desc() if is_desc else sort_col.asc())
        else:
            # Default sort by created_at desc if available, or id
            if hasattr(self.model, "created_at"):
                query = query.order_by(self.model.created_at.desc())
            else:
                query = query.order_by(self.model.id)

        # Apply pagination
        items = query.offset(skip).limit(limit).all()
        return items, total_count

    def create(self, db: Session, *, obj_in: Any, created_by: str = None) -> ModelType:
        """Insert a new record into the database."""
        obj_data = obj_in.model_dump() if hasattr(obj_in, "model_dump") else dict(obj_in)
        db_obj = self.model(**obj_data)
        
        # Track auditing details
        if hasattr(db_obj, "created_by") and created_by:
            db_obj.created_by = created_by
        if hasattr(db_obj, "updated_by") and created_by:
            db_obj.updated_by = created_by
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[Any, Dict[str, Any]],
        updated_by: str = None
    ) -> ModelType:
        """Update an existing record in the database."""
        obj_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        
        for field in obj_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, obj_data[field])
                
        # Track auditing details
        if hasattr(db_obj, "updated_by") and updated_by:
            db_obj.updated_by = updated_by
            
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any, deleted_by: str = None, hard: bool = False) -> Optional[ModelType]:
        """Remove a record by soft or hard delete."""
        db_obj = db.query(self.model).filter(self.model.id == id).first()
        if not db_obj:
            return None

        if hasattr(self.model, "is_deleted") and not hard:
            # Execute Soft Delete
            db_obj.is_deleted = True
            db_obj.deleted_at = func.now()
            if deleted_by:
                db_obj.updated_by = deleted_by
            db.commit()
            db.refresh(db_obj)
        else:
            # Execute Hard Delete
            db.delete(db_obj)
            db.commit()

        return db_obj
