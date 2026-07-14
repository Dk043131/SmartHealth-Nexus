# SmartHealth Nexus - District Telemetry Dataset Engine

This package implements a high-fidelity daily operations simulation engine and seeding utility to generate multi-year, AI-ready synthetic healthcare datasets. It populates all 17 relational database tables mapping primary care (PHC) and community care (CHC) networks.

---

## ⚙️ Configuration Parameters

The dataset parameters are controlled dynamically in [simulation_config.yaml](file:///d:/PROJECT/SmartHealth%20Nexus/backend/seeds/simulation_config.yaml):
- **seed**: Seed value for deterministic dataset reproduction.
- **days**: Duration of time-series history (e.g. 365 days, 1095 days for 3-year historical files, etc.).
- **hospitals**: Dict controlling number of PHC, CHC, and major government hospital nodes.
- **weather_severity**: Scales daily weather fluctuations.
- **disease_probability**: Sets probability weight limits for patient diagnostics.

---

## 🌀 Simulator Model Layout

1. **Weather Simulator**: Maps daily temperature, humidity, and rainfall contiguous distributions across three distinct seasons (Winter, Summer, Monsoon).
2. **Epidemiological Outbreaks**: Disease cases correlate realistically to meteorological indexes:
   - *Dengue / Malaria*: Proportional to Monsoon rainfall and high humidity.
   - *Heat Stroke*: Triggered during extreme Summer temperature spikes (Heat waves).
   - *Respiratory / Flu*: Spikes in cold Winter cycles.
3. **Supply Chain Logistics**: Daily medicine inventory depletion triggers alerts. Logistics delay events (e.g., supplier shipment damage) stall restocking, forcing facility managers to issue emergency resource transfers from nearby hub hospitals.
4. **Doctor Workloads**: Tracks practitioner shifts, consultation counts, and leave ratios.
5. **Bed telemetry**: Tracks General, Oxygen, ICU, and Ventilator bed occupancy levels.

---

## ⚡ Execution Command

To run the simulation and seed the database in one unified workflow:

```bash
$env:PYTHONPATH="d:\PROJECT\SmartHealth Nexus"; python backend/seeds/seeder_cli.py --all
```

This clears the database, runs the 365-day weather and clinical simulation, writes CSV, SQL, and JSON outputs to the `backend/seeds/data/` folder, and bulk-inserts them into the active database.
