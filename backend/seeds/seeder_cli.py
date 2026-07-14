import argparse
import sys
import os
from sqlalchemy import text

# Setup PYTHONPATH support
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.core.database import SessionLocal, Base, engine
from backend.seeds.generate_dataset import generate_and_export_all
from backend.seeds.seed import seed_database

BANNER = """
========================================================================
   __  __            _   _      _   _                      
  |  \/  |          | | | |    | \ | |                     
  | \  / | ___   __| | | | ___ |  \| | _____  ___   _ ___ 
  | |\/| |/ _ \ / _` | | |/ _ \| . ` |/ _ \ \/ / | | / __|
  | |  | | (_) | (_| | | | (_) | |\  |  __/>  <| |_| \__ \\
  |_|  |_|\___/ \__,_| |_|\___/|_| \_|\___/_/\_\\\\__,_|___/
                                                           
      SmartHealth Nexus - District Telemetry Dataset Engine
========================================================================
"""

def clean_database(db):
    print("Flushing all tables in active database...")
    # Truncate tables for SQLite or Postgres
    # Order matters due to foreign keys
    tables = [
        "weather_data",
        "disease_trends",
        "resource_transfers",
        "notifications",
        "audit_logs",
        "alerts",
        "patients",
        "ambulances",
        "diagnostic_tests",
        "beds",
        "medicine_inventory",
        "doctors",
        "users",
        "medicines",
        "hospitals"
    ]
    
    db.execute(text("PRAGMA foreign_keys = OFF;")) # SQLite support
    for t in tables:
        try:
            db.execute(text(f"DELETE FROM {t};"))
            print(f"Table '{t}' cleared.")
        except Exception as e:
            # Fallback for postgres
            try:
                db.execute(text(f"TRUNCATE TABLE {t} CASCADE;"))
                print(f"Table '{t}' truncated.")
            except Exception as ex:
                print(f"Failed to clear table {t}: {ex}")
                
    db.execute(text("PRAGMA foreign_keys = ON;"))
    db.commit()
    print("Database flush completed.")

def main():
    print(BANNER)
    parser = argparse.ArgumentParser(description="SmartHealth Nexus Simulation & Seeder CLI Utility")
    
    parser.add_argument("--generate", action="store_true", help="Generate the synthetic time-series dataset")
    parser.add_argument("--seed", action="store_true", help="Seed the active database with CSV data")
    parser.add_argument("--clean", action="store_true", help="Clear all database tables before seeding")
    parser.add_argument("--all", action="store_true", help="Generate, export, flush database, and seed all in one command")
    
    args = parser.parse_args()
    
    if not (args.generate or args.seed or args.clean or args.all):
        parser.print_help()
        sys.exit(0)

    db = SessionLocal()
    
    try:
        if args.clean or args.all:
            clean_database(db)
            
        if args.generate or args.all:
            print("\n[STEP 1] Running operational data simulation and generation...")
            generate_and_export_all()
            print("Dataset generation completed.")
            
        if args.seed or args.all:
            print("\n[STEP 2] Seeding database with generated CSV data...")
            seed_database(db)
            print("Database population completed successfully!")
            
    except Exception as e:
        print(f"\n[ERROR] Seeder execution halted: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
