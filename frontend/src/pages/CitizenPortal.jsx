import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { citizenService } from '../services/citizen';

export default function CitizenPortal() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [availability, setAvailability] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search parameters
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchTaluk, setSearchTaluk] = useState('');

  useEffect(() => {
    fetchHospitals();
    Promise.all([
      citizenService.emergency(),
      citizenService.alerts()
    ])
      .then(([emRes, warnRes]) => {
        if (emRes?.success) setEmergencies(emRes.data);
        if (warnRes?.success) setWarnings(warnRes.data);
      })
      .catch(err => console.error("Error loading citizen alerts", err));
  }, []);

  const fetchHospitals = () => {
    setLoading(true);
    citizenService.hospitals({ district: searchDistrict, taluk: searchTaluk })
      .then(res => {
        if (res?.success) {
          setHospitals(res.data);
          if (res.data.length > 0) {
            setSelectedHospital(res.data[0].id);
          } else {
            setAvailability(null);
          }
        }
      })
      .catch(err => console.error("Error fetching public hospitals list", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedHospital) {
      citizenService.availability(selectedHospital)
        .then(res => {
          if (res?.success) setAvailability(res.data);
        })
        .catch(err => console.error("Error fetching hospital availability", err));
    }
  }, [selectedHospital]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-6 text-left max-w-lg mx-auto pb-20"
    >
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col gap-2">
        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Public Health Access Portal</span>
        <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-400" /> Citizen Health Link
        </h2>
        <p className="text-slate-300 text-[10px]">
          Real-time access to diagnostic availability, bed slots, ambulance tracking, and emergency alerts across district clinics.
        </p>
      </div>

      {/* Emergency Alert Banner */}
      {emergencies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-900 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <span className="block text-[10px] font-bold text-red-700 uppercase">Active District Emergency Notice</span>
            <p className="mt-0.5">{emergencies[0].message}</p>
          </div>
        </div>
      )}

      {/* Outbreaks advisory */}
      {warnings.map((w, idx) => (
        <div key={idx} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs font-semibold">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="block text-[10px] font-bold text-amber-700 uppercase">{w.title}</span>
            <p className="mt-0.5">{w.message}</p>
          </div>
        </div>
      ))}

      {/* Filters search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Find Nearby Hospital</span>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="District (e.g. Srinagar)"
            value={searchDistrict}
            onChange={(e) => setSearchDistrict(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Taluk (e.g. Srinagar)"
            value={searchTaluk}
            onChange={(e) => setSearchTaluk(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchHospitals}
          className="w-full py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition"
        >
          Search Clinics
        </button>
      </div>

      {/* Main Split: Hospitals List & Availability */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading hospital directory...</div>
      ) : (
        <div className="space-y-4">
          
          {/* Availability Details Card */}
          {availability && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{availability.hospital_name}</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Live Stock & Bed Inventory</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Wait Time: {availability.estimated_waiting_minutes}m
                </span>
              </div>

              {/* Grid of indicators */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between h-20">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Available Beds</span>
                  <span className="text-xl font-black text-slate-900 mt-1">{availability.available_beds} slots</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between h-20">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Medicines Available</span>
                  <span className="text-xl font-black text-slate-900 mt-1">{availability.available_medicines_count} types</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between h-20">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Doctors Present</span>
                  <span className="text-xl font-black text-slate-900 mt-1">{availability.doctors_present} present</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between h-20">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Standby Vehicles</span>
                  <span className="text-xl font-black text-slate-900 mt-1">{availability.available_ambulances} ready</span>
                </div>

              </div>
            </div>
          )}

          {/* Hospitals results list */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hospitals Found ({hospitals.length})</span>
            {hospitals.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHospital(h.id)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all border ${
                  selectedHospital === h.id 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold block">{h.hospital_name}</span>
                  <span className={`text-[9px] font-medium block ${selectedHospital === h.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    Type: {h.hospital_type} | Taluk: {h.taluk}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            ))}
          </div>

        </div>
      )}
    </motion.div>
  );
}
