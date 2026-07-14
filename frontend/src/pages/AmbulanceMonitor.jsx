import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Ambulance, 
  Search, 
  Sliders, 
  MapPin, 
  PhoneCall, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';
import { ambulanceService } from '../services/ambulance';
import { hospitalService } from '../services/hospital';

export default function AmbulanceMonitor() {
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ambulanceService.getAllAmbulances({ limit: 100 }),
      hospitalService.getAllHospitals()
    ])
      .then(([ambRes, hospRes]) => {
        if (ambRes.success && ambRes.data) {
          setAmbulances(ambRes.data.items || []);
        }
        if (hospRes.success && hospRes.data) {
          setHospitals(hospRes.data.items || []);
        }
      })
      .catch(err => console.error("Error loading ambulance telemetries", err))
      .finally(() => setLoading(false));
  }, []);

  const getHospitalName = (hospitalId) => {
    const hosp = hospitals.find(h => h.id === hospitalId);
    return hosp ? hosp.hospital_name : 'District Base HQ';
  };

  const filteredAmbulances = ambulances.filter(a => {
    const matchesSearch = a.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
                          a.driver_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statuses
  const totalFleet = filteredAmbulances.length;
  const availableFleet = filteredAmbulances.filter(a => a.status === 'AVAILABLE').length;
  const busyFleet = filteredAmbulances.filter(a => a.status === 'DISPATCHED').length;
  const maintenanceFleet = filteredAmbulances.filter(a => a.status === 'MAINTENANCE').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Fleet Logistics Command</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Ambulance className="w-6 h-6 text-teal-400 animate-pulse" /> Emergency Ambulance Telemetry
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Monitor real-time vehicle positions, active emergency dispatch status, response durations, and mechanical maintenance parameters.
          </p>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Fleet Strength", value: totalFleet, desc: "Ambulance units across taluks", color: "text-slate-800" },
          { title: "Units Available Now", value: availableFleet, desc: "Standby ready for emergency dispatch", color: "text-teal-600" },
          { title: "Active Dispatches", value: busyFleet, desc: "En route to trauma site or hospital", color: "text-blue-600" },
          { title: "In Maintenance", value: maintenanceFleet, desc: "Mechanical service or safety audits", color: "text-red-500" }
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
            <span className={`block text-3xl font-extrabold ${card.color} tracking-tight`}>{card.value}</span>
            <span className="text-[10px] text-slate-500">{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Search and Filters row */}
      <div className="glass-card rounded-3xl p-5 border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl px-4 py-2.5 max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search vehicle number or driver name..." 
            className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-slate-400" />
          <div className="flex gap-2">
            {['ALL', 'AVAILABLE', 'DISPATCHED', 'MAINTENANCE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase border transition ${
                  statusFilter === st 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'All Units' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List Grid display */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-44 w-full bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredAmbulances.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 border-slate-200/80 shadow-sm text-center text-slate-400 text-xs">
          No fleet vehicles match current search filter parameters.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAmbulances.slice(0, 30).map((a) => (
            <div 
              key={a.id} 
              className="glass-card rounded-3xl p-5 border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between h-48 text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 text-sm tracking-tight">{a.vehicle_number}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                    a.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
                    a.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] font-semibold truncate max-w-[200px]" title={getHospitalName(a.hospital_id)}>
                    Base: {getHospitalName(a.hospital_id)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px]">
                <div className="space-y-0.5">
                  <span className="block text-slate-400 uppercase text-[8px]">Driver Assignment</span>
                  <span className="font-semibold text-slate-700 block">{a.driver_name}</span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400 uppercase text-[8px]">Emergency Contact</span>
                  <span className="font-semibold text-slate-700 block">{a.driver_phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
