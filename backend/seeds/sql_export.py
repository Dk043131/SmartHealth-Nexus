import os

def export_to_sql(data_dict, file_path="backend/seeds/data/seed_data.sql"):
    """
    Exports simulated data collections into a single raw SQL transaction script.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    print(f"Constructing raw SQL transaction script at '{file_path}'...")
    
    # Correct order of insertion to maintain foreign keys
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
    
    with open(file_path, mode='w', encoding='utf-8') as f:
        f.write("-- SmartHealth Nexus District Telemetry Database SQL Seed Script\n")
        f.write("BEGIN;\n\n")
        
        # Turn off foreign keys temporarily for performance
        f.write("ALTER TABLE IF EXISTS users DISABLE TRIGGER ALL;\n")
        f.write("ALTER TABLE IF EXISTS doctors DISABLE TRIGGER ALL;\n")
        f.write("ALTER TABLE IF EXISTS medicine_inventory DISABLE TRIGGER ALL;\n")
        f.write("ALTER TABLE IF EXISTS beds DISABLE TRIGGER ALL;\n\n")

        for table in insertion_order:
            records = data_dict.get(table, [])
            if not records:
                continue
                
            f.write(f"-- Seeding table '{table}' ({len(records)} records)\n")
            
            for r in records:
                columns = []
                values = []
                for k, v in r.items():
                    columns.append(k)
                    if v is None:
                        values.append("NULL")
                    elif isinstance(v, bool):
                        values.append("TRUE" if v else "FALSE")
                    elif isinstance(v, (int, float)):
                        values.append(str(v))
                    else:
                        # String/UUID/Dates
                        val_str = str(v).replace("'", "''")
                        values.append(f"'{val_str}'")
                        
                col_str = ", ".join(columns)
                val_str = ", ".join(values)
                f.write(f"INSERT INTO {table} ({col_str}) VALUES ({val_str}) ON CONFLICT DO NOTHING;\n")
                
            f.write("\n")
            
        # Re-enable triggers
        f.write("ALTER TABLE IF EXISTS users ENABLE TRIGGER ALL;\n")
        f.write("ALTER TABLE IF EXISTS doctors ENABLE TRIGGER ALL;\n")
        f.write("ALTER TABLE IF EXISTS medicine_inventory ENABLE TRIGGER ALL;\n")
        f.write("ALTER TABLE IF EXISTS beds ENABLE TRIGGER ALL;\n\n")
        
        f.write("COMMIT;\n")
        
    print(f"Successfully generated database SQL seed transaction script.")
