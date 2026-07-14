import logging
from sqlalchemy.orm import Session
from backend.core.logging_config import logger

def seed_database(db: Session):
    """
    Seed Database with initial lookup values and configuration details.
    Real mock datasets will be injected here during Module 3.
    """
    logger.info("Initializing database seeder...")
    # Seed Global System Settings
    # Seed Medicines Master
    # Seed placeholder hospitals
    logger.info("Seeder execution completed. No synthetic data generated in Module 2.")
    pass
