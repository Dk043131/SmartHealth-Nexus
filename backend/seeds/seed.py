import os
import csv
import uuid
import datetime
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal, engine, Base
from backend.models.models import (
    Hospital, Medicine, MedicineInventory, Bed, DiagnosticTest, Ambulance,
    Patient, Alert, AuditLog, Notification, ResourceTransfer, DiseaseTrend, WeatherData
)
from backend.models.user import User
from backend.core.logging_config import logger

# Map CSV file basenames to SQLAlchemy Model classes
MODEL_MAPPING = {
    "hospitals": Hospital,
    "medicines": Medicine,
    "users": User,
    "doctors": None,  # Special case due to back-references/circular checks if any, or directly map
    "medicine_inventory": MedicineInventory,
    "beds": Bed,
    "diagnostic_tests": DiagnosticTest,
    "ambulances": Ambulance,
    "patients": Patient,
    "alerts": Alert,
    "audit_logs": AuditLog,
    "notifications": Notification,
    "resource_transfers": ResourceTransfer,
    "disease_trends": DiseaseTrend,
    "weather_data": WeatherData
}

# Import Doctor model separately
from backend.models.models import Doctor
MODEL_MAPPING["doctors"] = Doctor

def clean_row_data(row, model_class):
    """
    Cleans string parameters from CSV into correct typed values for database column constraints.
    """
    cleaned = {}
    for col, val in row.items():
        # Skip if column not on model table columns
        if not hasattr(model_class, col):
            continue
            
        if val == "" or val == "None" or val is None:
            cleaned[col] = None
            continue
            
        # Parse Boolean values
        if val.upper() in ["TRUE", "FALSE"]:
            cleaned[col] = val.upper() == "IN_LINE_TRUE" or val.upper() == "TRUE"
            continue
            
        # Retrieve column type details to map types precisely
        column_prop = getattr(model_class, col)
        col_type = str(column_prop.type).upper()

        # Parse UUIDs if column type expects it
        if "UUID" in col_type:
            try:
                cleaned[col] = uuid.UUID(val)
                continue
            except ValueError:
                pass
                
        # Parse Dates/Times
        if "DATETIME" in col_type or "TIMESTAMP" in col_type:
            try:
                dt_str = val.split("+")[0].split("Z")[0]
                cleaned[col] = datetime.datetime.fromisoformat(dt_str)
                continue
            except ValueError:
                pass
        elif "DATE" in col_type:
            try:
                cleaned[col] = datetime.date.fromisoformat(val)
                continue
            except ValueError:
                pass
                
        # Parse Numbers
        if "INT" in col_type:
            cleaned[col] = int(val)
        elif "FLOAT" in col_type or "NUMERIC" in col_type:
            cleaned[col] = float(val)
        else:
            cleaned[col] = val
            
    return cleaned

def seed_database(db: Session, data_dir="backend/seeds/data"):
    """
    Populates all 17 database tables using generated CSV files.
    """
    logger.info("Executing relational database seeder...")
    
    # Correct order of insertion to prevent foreign key errors
    insertion_order = [
        "hospitals",
        "medicines",
        "users",
        "doctors",
        "medicine_inventory",
        "beds",
        "diagnostic_tests",
        "ambulances",
        "patients",
        "alerts",
        "audit_logs",
        "notifications",
        "resource_transfers",
        "disease_trends",
        "weather_data"
    ]
    
    for table_name in insertion_order:
        csv_path = os.path.join(data_dir, f"{table_name}.csv")
        if not os.path.exists(csv_path):
            logger.warning(f"Seed file {csv_path} not found. Skipping seeding for {table_name}.")
            continue
            
        model_class = MODEL_MAPPING[table_name]
        logger.info(f"Seeding table '{table_name}' from CSV...")
        
        # Read CSV records
        mappings = []
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cleaned = clean_row_data(row, model_class)
                mappings.append(cleaned)
                
        # Bulk Insert in batches of 10000 for high performance
        batch_size = 10000
        for idx in range(0, len(mappings), batch_size):
            batch = mappings[idx:idx + batch_size]
            db.bulk_insert_mappings(model_class, batch)
        db.commit()
            
        logger.info(f"Successfully seeded {len(mappings)} records into table '{table_name}'.")

    logger.info("Database seeding process completed successfully.")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
