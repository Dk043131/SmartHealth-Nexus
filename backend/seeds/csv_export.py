import os
import csv

def export_to_csv(data_dict, output_dir="backend/seeds/data"):
    """
    Exports simulated data collections to clean database-ready CSVs.
    Uses memory-efficient streaming DictWriter.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Exporting tables to CSV files inside '{output_dir}'...")
    
    for table_name, records in data_dict.items():
        if not records:
            # Create empty placeholder file with columns if predictions
            if table_name == "predictions":
                file_path = os.path.join(output_dir, f"{table_name}.csv")
                with open(file_path, mode='w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(["id", "hospital_id", "prediction_type", "predicted_value", "confidence_score", "generated_at"])
            continue

        file_path = os.path.join(output_dir, f"{table_name}.csv")
        
        # Get headers from first record keys
        headers = list(records[0].keys())
        
        with open(file_path, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            
            # Streaming row write
            for r in records:
                # Format dates and datetimes to string ISO format
                row = {}
                for k, v in r.items():
                    if hasattr(v, 'isoformat'):
                        row[k] = v.isoformat()
                    else:
                        row[k] = v
                writer.writerow(row)
                
        print(f"Successfully wrote {len(records)} records to {table_name}.csv")
