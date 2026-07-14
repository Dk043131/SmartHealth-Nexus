import os
import random
import uuid
import datetime
from backend.core.constants import UserRole, HospitalType, BedType, AlertPriority, AlertStatus, AmbulanceStatus, NotificationType, TransferStatus, PredictionType
from backend.seeds.faker_utils import (
    fake,
    generate_unique_hospitals,
    generate_medicines_catalog,
    DOCTOR_SPECIALIZATIONS,
    generate_indian_phone
)

# Seed bcrypt passwords directly (pre-computed hash of "password123" to make seeding fast!)
# Precomputed bcrypt hash: $2b$12$R9h/lIPzNgb.O71IReV5XeT8B1c1gY/R.GvAeh1LgEa6e2YQ7Nf1e
BCRYPT_PASSWORD_HASH = "$2b$12$R9h/lIPzNgb.O71IReV5XeT8B1c1gY/R.GvAeh1LgEa6e2YQ7Nf1e"

def run_district_simulation(config):
    seed = config.get("seed", 42)
    simulation_days = config.get("days", 365)
    
    random.seed(seed)
    fake.seed_instance(seed)

    # 1. Base Setup
    hospitals_raw = generate_unique_hospitals(
        phc_count=config["hospitals"]["phc_count"],
        chc_count=config["hospitals"]["chc_count"],
        gov_hospital_count=config["hospitals"]["gov_hospital_count"],
        seed=seed
    )
    
    medicines_raw = generate_medicines_catalog(count=550, seed=seed)
    medicines_map = {m["id"]: m for m in medicines_raw}
    
    print(f"Generating framework entities for {len(hospitals_raw)} hospitals and {len(medicines_raw)} medicines...")

    # 2. System Users
    users = []
    # 1 District Admin
    admin_id = uuid.uuid4()
    users.append({
        "id": admin_id,
        "name": "District Chief Medical Officer",
        "email": "district-admin@health.gov",
        "hashed_password": BCRYPT_PASSWORD_HASH,
        "role": UserRole.DISTRICT_ADMIN,
        "hospital_id": None
    })

    # 5 Government Health Officers
    for i in range(1, 6):
        users.append({
            "id": uuid.uuid4(),
            "name": f"Auditor {fake.first_name()}",
            "email": f"officer-{i}@health.gov",
            "hashed_password": BCRYPT_PASSWORD_HASH,
            "role": UserRole.GOV_HEALTH_OFFICER,
            "hospital_id": None
        })

    # Staff & Doctors definitions
    doctors = []
    beds = []
    diagnostics = []
    ambulances = []
    inventories = []

    # Map target details per hospital
    for hosp in hospitals_raw:
        h_id = hosp["id"]
        h_type = hosp["hospital_type"]
        h_code = hosp["hospital_code"]

        # Staff users per hospital
        users.append({
            "id": uuid.uuid4(),
            "name": f"Admin {fake.first_name()}",
            "email": f"admin@{h_code.lower()}.gov",
            "hashed_password": BCRYPT_PASSWORD_HASH,
            "role": UserRole.PHC_STAFF,
            "hospital_id": h_id
        })
        
        users.append({
            "id": uuid.uuid4(),
            "name": f"Store Keeper {fake.first_name()}",
            "email": f"logistics@{h_code.lower()}.gov",
            "hashed_password": BCRYPT_PASSWORD_HASH,
            "role": UserRole.PHC_STAFF,
            "hospital_id": h_id
        })

        # Doctors allocation
        doc_count = 2 if h_type == "PHC" else (5 if h_code.startswith("CHC") else 15)
        for d in range(1, doc_count + 1):
            spec, qual = random.choice(DOCTOR_SPECIALIZATIONS)
            doctors.append({
                "id": uuid.uuid4(),
                "hospital_id": h_id,
                "doctor_name": f"Dr. {fake.first_name()} {fake.last_name()}",
                "specialization": spec,
                "qualification": qual,
                "phone": generate_indian_phone(),
                "email": f"dr.{fake.first_name().lower()}@{h_code.lower()}.gov",
                "availability_status": "Available",
                "attendance_status": "Present"
            })

        # Beds allocation
        if h_type == "PHC":
            # Mostly general and oxygen beds
            beds.append({"id": uuid.uuid4(), "hospital_id": h_id, "bed_type": BedType.GENERAL, "total_beds": 15, "occupied_beds": 2, "available_beds": 13})
            beds.append({"id": uuid.uuid4(), "hospital_id": h_id, "bed_type": BedType.OXYGEN, "total_beds": 5, "occupied_beds": 0, "available_beds": 5})
        else:
            is_gh = h_code.startswith("GH")
            gen_beds = 150 if is_gh else 45
            ox_beds = 50 if is_gh else 15
            icu_beds = 25 if is_gh else 5
            vent_beds = 10 if is_gh else 2
            
            beds.append({"id": uuid.uuid4(), "hospital_id": h_id, "bed_type": BedType.GENERAL, "total_beds": gen_beds, "occupied_beds": int(gen_beds*0.4), "available_beds": gen_beds - int(gen_beds*0.4)})
            beds.append({"id": uuid.uuid4(), "hospital_id": h_id, "bed_type": BedType.OXYGEN, "total_beds": ox_beds, "occupied_beds": int(ox_beds*0.3), "available_beds": ox_beds - int(ox_beds*0.3)})
            beds.append({"id": uuid.uuid4(), "hospital_id": h_id, "bed_type": BedType.ICU, "total_beds": icu_beds, "occupied_beds": int(icu_beds*0.2), "available_beds": icu_beds - int(icu_beds*0.2)})
            beds.append({"id": uuid.uuid4(), "hospital_id": h_id, "bed_type": BedType.VENTILATOR, "total_beds": vent_beds, "occupied_beds": int(vent_beds*0.1), "available_beds": vent_beds - int(vent_beds*0.1)})

        # Diagnostic tests
        tests = ["Blood Count", "Malaria Smear", "TyphiDot Test"]
        if h_type != "PHC":
            tests.extend(["X-Ray Chest", "Dengue NS1 Antigen", "RT-PCR COVID Test"])
        for t in tests:
            diagnostics.append({
                "id": uuid.uuid4(),
                "hospital_id": h_id,
                "test_name": t,
                "availability": True,
                "daily_capacity": 15 if h_type == "PHC" else 50
            })

        # Ambulances
        amb_count = 1 if h_type == "PHC" else (3 if h_code.startswith("CHC") else 8)
        for a in range(1, amb_count + 1):
            ambulances.append({
                "id": uuid.uuid4(),
                "hospital_id": h_id,
                "vehicle_number": f"JK-01-{chr(65 + random.randint(0, 25))}{chr(65 + random.randint(0, 25))}-{random.randint(1000, 9999)}",
                "driver_name": f"{fake.first_name()} Singh",
                "status": AmbulanceStatus.AVAILABLE,
                "gps_enabled": True
            })

        # Base Inventory initial seeding for every hospital
        for med in medicines_raw:
            inventories.append({
                "id": uuid.uuid4(),
                "hospital_id": h_id,
                "medicine_id": med["id"],
                "available_quantity": random.randint(med["minimum_stock"] + 150, med["minimum_stock"] + 800),
                "reserved_quantity": random.randint(5, 30),
                "expiry_date": datetime.date.today() + datetime.timedelta(days=random.randint(180, 720))
            })

    print(f"Generated {len(users)} users, {len(doctors)} doctors, {len(beds)} bed slots, {len(inventories)} inventory links.")

    # 3. Dynamic Daily Operational Simulation
    print(f"Starting operational simulation loop for {simulation_days} days...")
    
    patients = []
    weather_data = []
    disease_trends = []
    alerts = []
    audit_logs = []
    notifications = []
    resource_transfers = []
    
    start_date = datetime.date.today() - datetime.timedelta(days=simulation_days)

    # Cache list of facility IDs by type for transfers
    phc_ids = [h["id"] for h in hospitals_raw if h["hospital_type"] == "PHC"]
    chc_ids = [h["id"] for h in hospitals_raw if h["hospital_type"] == "CHC"]
    gh_ids = [h["id"] for h in hospitals_raw if h["hospital_code"].startswith("GH")]

    # Track inventory supply delays locally in simulation
    supply_delays = {}  # (hospital_id, medicine_id) -> days_remaining

    # Pre-index beds and inventories by hospital_id for O(1) daily lookup
    beds_by_hosp = {h["id"]: [] for h in hospitals_raw}
    for b in beds:
        beds_by_hosp[b["hospital_id"]].append(b)

    inventories_by_hosp = {h["id"]: [] for h in hospitals_raw}
    for inv in inventories:
        inventories_by_hosp[inv["hospital_id"]].append(inv)

    patient_counter = 1
    for day in range(1, simulation_days + 1):
        current_date = start_date + datetime.timedelta(days=day)
        
        # Determine seasons
        # Winter: Days 1-90, 270-365
        # Summer: Days 91-180
        # Monsoon: Days 181-269
        day_of_year = day % 365
        if day_of_year < 90 or day_of_year > 270:
            season = "Winter"
            base_temp = 8.0 + random.uniform(-4, 4)
            base_hum = 45.0 + random.uniform(-10, 10)
            base_rain = random.choices([0.0, 5.0, 12.0], weights=[0.85, 0.12, 0.03])[0]
        elif day_of_year < 180:
            season = "Summer"
            base_temp = 32.0 + random.uniform(-5, 5)
            base_hum = 35.0 + random.uniform(-10, 10)
            base_rain = random.choices([0.0, 2.0, 15.0], weights=[0.9, 0.08, 0.02])[0]
        else:
            season = "Monsoon"
            base_temp = 24.0 + random.uniform(-3, 3)
            base_hum = 85.0 + random.uniform(-10, 8)
            base_rain = random.uniform(5.0, 60.0) if random.random() < 0.6 else 0.0

        # Special Events
        special_event = None
        event_multiplier = 1.0
        
        # Simulate local events on specific days
        if season == "Summer" and base_temp > 35.0 and random.random() < 0.2:
            special_event = "Heat Wave"
            event_multiplier = 1.3
        elif season == "Monsoon" and base_rain > 40.0 and random.random() < 0.15:
            special_event = "Flooding"
            event_multiplier = 1.5
        elif day_of_year in [15, 120, 240, 310] or random.random() < 0.01:
            special_event = "Festival Season"
            event_multiplier = 1.25
        elif day_of_year == 182: # July school re-opening
            special_event = "School Reopening"
            event_multiplier = 1.15

        # Process Supply delays count down
        for key in list(supply_delays.keys()):
            if supply_delays[key] > 0:
                supply_delays[key] -= 1
            else:
                del supply_delays[key]

        # Hospital operations loops
        for hosp in hospitals_raw:
            h_id = hosp["id"]
            avg_foot = hosp["avg_footfall"]
            
            # Daily Weather Log
            h_temp = round(base_temp + random.uniform(-2, 2), 1)
            h_hum = round(base_hum + random.uniform(-5, 5), 1)
            h_rain = round(base_rain * random.uniform(0.8, 1.2), 1)
            
            cond = "Sunny"
            if h_rain > 20.0:
                cond = "Stormy"
            elif h_rain > 2.0:
                cond = "Rainy"
            elif h_hum > 80.0:
                cond = "Cloudy"
            elif h_temp < 10.0:
                cond = "Foggy"
                
            weather_data.append({
                "id": uuid.uuid4(),
                "hospital_id": h_id,
                "temperature": h_temp,
                "humidity": h_hum,
                "rainfall": h_rain,
                "weather_condition": cond,
                "recorded_at": datetime.datetime.combine(current_date, datetime.time(8, 0))
            })

            # Calculate disease weights
            disease_weights = {
                "Viral Fever": 30,
                "Respiratory Infection": 20,
                "Diarrhea": 15,
                "Typhoid": 10,
                "COVID": 5,
                "Dengue": 2 if season != "Monsoon" else 15,
                "Malaria": 1 if season != "Monsoon" else 10,
                "Heat Stroke": 0.1 if special_event != "Heat Wave" else 20
            }
            
            # Inflate weights during monsoon/summer heavy events
            if season == "Monsoon":
                disease_weights["Dengue"] *= 2.5
                disease_weights["Malaria"] *= 2.5
                disease_weights["Diarrhea"] *= 2.0
            if special_event == "Flooding":
                disease_weights["Diarrhea"] *= 3.0
                disease_weights["Typhoid"] *= 2.5
                disease_weights["Dengue"] *= 2.0

            # Daily Footfall
            daily_footfall = int(avg_foot * event_multiplier * random.uniform(0.85, 1.15))
            
            # Record Disease trends
            for disease, weight in disease_weights.items():
                cases = int(daily_footfall * (weight / 100.0) * random.uniform(0.5, 1.5))
                if cases > 0:
                    disease_trends.append({
                        "id": uuid.uuid4(),
                        "hospital_id": h_id,
                        "disease_name": disease,
                        "reported_cases": cases,
                        "week": current_date.isocalendar()[1],
                        "month": current_date.month,
                        "year": current_date.year
                    })

                    # Write patients records
                    # Save a sample subset to DB (to save space, we log 5-10% of cases as actual admitted patient profiles)
                    sample_size = max(1, cases // 5)
                    for _ in range(sample_size):
                        p_id = f"PAT-{patient_counter:07d}"
                        patient_counter += 1
                        status_choices = ["Admitted", "Discharged", "Transferred"]
                        patients.append({
                            "id": uuid.uuid4(),
                            "hospital_id": h_id,
                            "patient_identifier": p_id,
                            "age": random.randint(1, 95),
                            "gender": random.choice(["Male", "Female", "Other"]),
                            "disease": disease,
                            "visit_date": current_date,
                            "status": random.choices(status_choices, weights=[0.15, 0.75, 0.10])[0]
                        })

            # Bed occupancy daily fluctuation
            # GHs and CHCs manage ICU & general beds
            hosp_beds = beds_by_hosp[h_id]
            for b in hosp_beds:
                # Fluctuate occupancy
                b["occupied_beds"] = min(b["total_beds"], max(0, int(b["total_beds"] * random.uniform(0.2, 0.85))))
                b["available_beds"] = b["total_beds"] - b["occupied_beds"]

            # Medicine Inventory consumption logic
            hosp_inv = inventories_by_hosp[h_id]
            for inv in hosp_inv:
                med = medicines_map[inv["medicine_id"]]
                
                # Baseline consumption + disease weight modifier
                base_consume = random.randint(1, 15)
                disease_cat = med["category"]
                
                # Check if this medicine relates to active diseases
                inflator = 1.0
                if disease_cat == "Analgesic" and season == "Monsoon":
                    inflator = 2.0
                elif disease_cat == "Rehydration" and (special_event == "Flooding" or special_event == "Heat Wave"):
                    inflator = 3.0
                elif disease_cat == "Respiratory Support" and season == "Winter":
                    inflator = 1.8
                    
                total_consumed = int(base_consume * inflator * config["medicine_consumption_rate"])
                
                # Decrement stock
                inv["available_quantity"] = max(0, inv["available_quantity"] - total_consumed)

                # Supply chain events or replenishments
                # Check if stock falls below minimum threshold
                if inv["available_quantity"] < med["minimum_stock"]:
                    # Check if there is an active supplier delay
                    delay_key = (h_id, inv["medicine_id"])
                    if delay_key in supply_delays:
                        # Cannot replenish! Stock stays low.
                        pass
                    else:
                        # Logistics warning event simulation
                        if random.random() < config["emergency_frequency"]:
                            # Supplier delay event
                            supply_delays[delay_key] = random.randint(5, 12)
                            alerts.append({
                                "id": uuid.uuid4(),
                                "hospital_id": h_id,
                                "alert_type": NotificationType.INVENTORY_ALERT,
                                "priority": AlertPriority.CRITICAL,
                                "message": f"Supplier Delay for {med['medicine_name']}: Restock delayed by {supply_delays[delay_key]} days.",
                                "status": AlertStatus.UNRESOLVED,
                                "created_by": "System Simulation Engine"
                            })
                        else:
                            # Auto-Replenishment / Resource Transfer
                            # Staff orders medicine from the nearest Government Hospital
                            source_gh = random.choice(gh_ids) if gh_ids else h_id
                            if source_gh != h_id:
                                qty_transferred = med["minimum_stock"] * 3
                                resource_transfers.append({
                                    "id": uuid.uuid4(),
                                    "source_hospital_id": source_gh,
                                    "destination_hospital_id": h_id,
                                    "resource_type": "MEDICINE",
                                    "resource_id": med["id"],
                                    "quantity": qty_transferred,
                                    "recommendation_source": "AI" if random.random() < 0.5 else "MANUAL",
                                    "approved_by": admin_id,
                                    "transfer_status": TransferStatus.COMPLETED
                                })
                                # Refill inventory
                                inv["available_quantity"] += qty_transferred

            # Audit logging logs
            if random.random() < 0.15:
                audit_logs.append({
                    "id": uuid.uuid4(),
                    "user_id": admin_id,
                    "hospital_id": h_id,
                    "action": "UPDATE_INVENTORY",
                    "entity_name": "MedicineInventory",
                    "entity_id": str(h_id),
                    "ip_address": fake.ipv4()
                })

    # Prepare return lists
    # Format and strip metadata parameters before passing to export scripts
    return {
        "hospitals": hospitals_raw,
        "users": users,
        "doctors": doctors,
        "medicines": medicines_raw,
        "medicine_inventory": inventories,
        "beds": beds,
        "diagnostic_tests": diagnostics,
        "ambulances": ambulances,
        "patients": patients,
        "alerts": alerts,
        "audit_logs": audit_logs,
        "notifications": notifications,
        "resource_transfers": resource_transfers,
        "disease_trends": disease_trends,
        "weather_data": weather_data,
        "predictions": []  # Empty as requested
    }
