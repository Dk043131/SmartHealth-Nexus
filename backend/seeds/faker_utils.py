import random
import uuid
from faker import Faker

# Initialize Faker with Indian locale
fake = Faker('en_IN')

# Indian districts and taluks structure for realistic Indian district modeling
DISTRICT_TALUKS = {
    "Srinagar": ["Srinagar West", "Srinagar East", "Srinagar North", "Srinagar South", "Eidgah", "Khanyar"],
    "Budgam": ["Budgam", "Chadoora", "Beerwah", "Khansahib", "Charar-i-Sharief"],
    "Anantnag": ["Anantnag", "Bijbehara", "Dooru", "Kokernag", "Shangus", "Pahalgam"],
    "Baramulla": ["Baramulla", "Sopore", "Pattan", "Tangmarg", "Uri", "Rafiabad"],
    "Jammu": ["Jammu", "Ranbir Singh Pura", "Akhnoor", "Bishnah", "Khour"]
}

MEDICINE_COMPOUNDS = [
    ("Paracetamol", "Analgesic", "tablets", 100, 1000),
    ("Amoxicillin", "Antibiotic", "capsules", 150, 1200),
    ("Metformin", "Antidiabetic", "tablets", 200, 1500),
    ("Atorvastatin", "Cardiovascular", "tablets", 100, 1000),
    ("Ibuprofen", "NSAID", "tablets", 100, 800),
    ("Omeprazole", "Antacid", "capsules", 150, 1500),
    ("Amlodipine", "Antihypertensive", "tablets", 100, 1000),
    ("Montelukast", "Respiratory", "tablets", 100, 600),
    ("Cetirizine", "Antihistamine", "tablets", 50, 500),
    ("Pantoprazole", "Antacid", "tablets", 150, 1200),
    ("Losartan", "Antihypertensive", "tablets", 100, 1000),
    ("Gabapentin", "Anticonvulsant", "capsules", 80, 500),
    ("Sertraline", "Antidepressant", "tablets", 50, 600),
    ("Azithromycin", "Antibiotic", "tablets", 50, 400),
    ("Ciprofloxacin", "Antibiotic", "tablets", 100, 800),
    ("ORS Packet", "Rehydration", "sachets", 300, 3000),
    ("Insulin Glargine", "Antidiabetic", "vials", 20, 200),
    ("Oxygen Cylinder", "Respiratory Support", "cylinders", 15, 100),
    ("Amoxicillin-Clavulanate", "Antibiotic", "tablets", 100, 800),
    ("Dolo-650", "Analgesic", "tablets", 200, 2000),
    ("Salbutamol Inhaler", "Respiratory", "inhalers", 30, 300),
    ("Ranitidine", "Antacid", "tablets", 150, 1000),
    ("Metoprolol", "Cardiovascular", "tablets", 100, 1000),
    ("Furosemide", "Diuretic", "tablets", 80, 800),
    ("Prednisolone", "Corticosteroid", "tablets", 50, 500)
]

STRENGTHS = ["10mg", "20mg", "50mg", "100mg", "250mg", "500mg", "650mg", "1g", "5ml", "10ml", "100ml"]
BRAND_PREFIXES = ["Med", "Sina", "Nexus", "Care", "Apex", "Cipla", "Sun", "Lupin", "Abbott", "Glenmark"]

DOCTOR_SPECIALIZATIONS = [
    ("General Medicine", "MBBS, MD"),
    ("Pediatrics", "MBBS, DCH, MD"),
    ("Obstetrics & Gynecology", "MBBS, MS, DGO"),
    ("Cardiology", "MBBS, MD, DM"),
    ("Orthopedics", "MBBS, MS"),
    ("Dermatology", "MBBS, MD"),
    ("Ophthalmology", "MBBS, MS"),
    ("ENT", "MBBS, DLO, MS"),
    ("Psychiatry", "MBBS, MD"),
    ("General Surgery", "MBBS, MS")
]

def generate_indian_phone():
    return f"+91 {random.randint(6, 9)}{random.randint(10000000, 99999999)}"

def generate_unique_hospitals(phc_count, chc_count, gov_hospital_count, seed=42):
    random.seed(seed)
    fake.seed_instance(seed)
    
    hospitals = []
    
    # Coordinates bounding box for Srinagar/Jammu Kashmir region
    # Srinagar center: Lat 34.0837, Lon 74.7973
    
    def get_coords():
        lat = round(34.0837 + random.uniform(-0.6, 0.6), 4)
        lon = round(74.7973 + random.uniform(-0.6, 0.6), 4)
        return lat, lon

    # Major Government Hospitals
    for i in range(1, gov_hospital_count + 1):
        lat, lon = get_coords()
        dist = random.choice(list(DISTRICT_TALUKS.keys()))
        taluk = random.choice(DISTRICT_TALUKS[dist])
        hospitals.append({
            "id": uuid.uuid4(),
            "hospital_code": f"GH-{i:03d}",
            "hospital_name": f"District Government Hospital {fake.city()}",
            "hospital_type": "CHC", # CHC mapping for larger facility beds
            "district": dist,
            "taluk": taluk,
            "address": f"Civil Lines Sector {random.randint(1, 10)}, {taluk}, {dist}",
            "latitude": lat,
            "longitude": lon,
            "phone": generate_indian_phone(),
            "email": f"contact@gh{i}.{dist.lower()}health.gov",
            "status": "Active",
            # Demographic attributes (Simulated in engine logic)
            "pop_served": random.randint(150000, 500000),
            "urban_rural": "Urban",
            "elderly_pct": round(random.uniform(8.0, 15.0), 1),
            "child_pct": round(random.uniform(15.0, 22.0), 1),
            "avg_footfall": random.randint(250, 600)
        })

    # CHCs
    for i in range(1, chc_count + 1):
        lat, lon = get_coords()
        dist = random.choice(list(DISTRICT_TALUKS.keys()))
        taluk = random.choice(DISTRICT_TALUKS[dist])
        hospitals.append({
            "id": uuid.uuid4(),
            "hospital_code": f"CHC-{i:03d}",
            "hospital_name": f"{fake.last_name()} Community Health Centre",
            "hospital_type": "CHC",
            "district": dist,
            "taluk": taluk,
            "address": f"Main Chowk, {taluk}, {dist}",
            "latitude": lat,
            "longitude": lon,
            "phone": generate_indian_phone(),
            "email": f"operator@chc{i}.{dist.lower()}health.gov",
            "status": "Active",
            "pop_served": random.randint(50000, 150000),
            "urban_rural": "Rural-Town",
            "elderly_pct": round(random.uniform(7.0, 12.0), 1),
            "child_pct": round(random.uniform(18.0, 25.0), 1),
            "avg_footfall": random.randint(80, 200)
        })

    # PHCs
    for i in range(1, phc_count + 1):
        lat, lon = get_coords()
        dist = random.choice(list(DISTRICT_TALUKS.keys()))
        taluk = random.choice(DISTRICT_TALUKS[dist])
        hospitals.append({
            "id": uuid.uuid4(),
            "hospital_code": f"PHC-{i:03d}",
            "hospital_name": f"{fake.first_name()} Primary Health Centre",
            "hospital_type": "PHC",
            "district": dist,
            "taluk": taluk,
            "address": f"Village Road, Block {random.randint(1, 15)}, {taluk}, {dist}",
            "latitude": lat,
            "longitude": lon,
            "phone": generate_indian_phone(),
            "email": f"staff@phc{i}.{dist.lower()}health.gov",
            "status": "Active",
            "pop_served": random.randint(10000, 45000),
            "urban_rural": "Rural",
            "elderly_pct": round(random.uniform(6.0, 10.0), 1),
            "child_pct": round(random.uniform(20.0, 28.0), 1),
            "avg_footfall": random.randint(25, 80)
        })

    return hospitals

def generate_medicines_catalog(count=550, seed=42):
    random.seed(seed)
    
    catalog = []
    seen_codes = set()
    
    # Generate combinations dynamically to guarantee 500+ items
    while len(catalog) < count:
        compound, category, unit, min_stock, max_stock = random.choice(MEDICINE_COMPOUNDS)
        brand = random.choice(BRAND_PREFIXES)
        strength = random.choice(STRENGTHS)
        
        name = f"{brand}-{compound} {strength}"
        code = f"{brand.upper()}-{compound.replace(' ', '-').upper()}-{strength.upper()}"
        
        if code in seen_codes:
            continue
            
        seen_codes.add(code)
        catalog.append({
            "id": uuid.uuid4(),
            "medicine_code": code,
            "medicine_name": name,
            "category": category,
            "unit": unit,
            "minimum_stock": min_stock,
            "description": f"Generic composition: {compound} ({strength}). Shelf life: {random.randint(12, 36)} months. Baseline daily footfall usage: {random.randint(5, 50)} units."
        })
        
    return catalog
