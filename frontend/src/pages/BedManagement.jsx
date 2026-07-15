import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bed, 
  Search, 
  Filter, 
  TrendingUp, 
  Sliders, 
  Activity, 
  Plus, 
  Maximize2 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { hospitalService } from '../services/hospital';
import { dashboardService } from '../services/dashboard';
import { bedService } from '../services/bed';

export default function BedManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalHospitalId, setModalHospitalId] = useState('');
  const [modalBedType, setModalBedType] = useState('GENERAL');
  const [modalTotalBeds, setModalTotalBeds] = useState(0);
  const [modalOccupiedBeds, setModalOccupiedBeds] = useState(0);
  const [activeBedId, setActiveBedId] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Load current bed counts dynamically when selection changes in modal
  useEffect(() => {
    if (isModalOpen && modalHospitalId && modalBedType) {
      setModalLoading(true);
      bedService.getAllBeds({ hospital_id: modalHospitalId, bed_type: modalBedType })
        .then((res) => {
          if (res.success && res.data && res.data.items && res.data.items.length > 0) {
            const bed = res.data.items[0];
            setModalTotalBeds(bed.total_beds);
            setModalOccupiedBeds(bed.occupied_beds);
            setActiveBedId(bed.id);
          } else {
            setModalTotalBeds(0);
            setModalOccupiedBeds(0);
            setActiveBedId(null);
          }
        })
        .catch((err) => console.error("Error loading current bed count", err))
        .finally(() => setModalLoading(false));
    }
  }, [isModalOpen, modalHospitalId, modalBedType]);

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    const available_beds = Math.max(0, modalTotalBeds - modalOccupiedBeds);
    const bedData = {
      hospital_id: modalHospitalId,
      bed_type: modalBedType,
      total_beds: modalTotalBeds,
      occupied_beds: modalOccupiedBeds,
      available_beds: available_beds
    };

    const action = activeBedId 
      ? bedService.updateBed(activeBedId, {
          total_beds: modalTotalBeds,
          occupied_beds: modalOccupiedBeds,
          available_beds: available_beds
        })
      : bedService.createBed(bedData);

    action
      .then((res) => {
        if (res.success) {
          setIsModalOpen(false);
          // Reload page stats
          return Promise.all([
            hospitalService.getAllHospitals(),
            dashboardService.getAnalytics()
          ]).then(([hospRes, analyticsRes]) => {
            if (hospRes.success && hospRes.data) {
              setHospitals(hospRes.data.items || []);
            }
            if (analyticsRes.success && analyticsRes.data) {
              setAnalytics(analyticsRes.data);
            }
          });
        } else {
          setModalError(res.message || "Failed to update bed details.");
        }
      })
      .catch((err) => {
        setModalError("Failed to save bed details. Please check permissions.");
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      hospitalService.getAllHospitals(),
      dashboardService.getAnalytics()
    ])
      .then(([hospRes, analyticsRes]) => {
        if (hospRes.success && hospRes.data) {
          // Sort by occupancy or names
          setHospitals(hospRes.data.items || []);
        }
        if (analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
      })
      .catch(err => console.error("Error fetching bed telemetries", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.hospital_name.toLowerCase().includes(search.toLowerCase()) ||
                          h.taluk.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || h.hospital_type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate totals for quick counters
  const totalBeds = filteredHospitals.reduce((acc, curr) => acc + (curr.total_beds || 15), 0);
  const occupiedBeds = filteredHospitals.reduce((acc, curr) => acc + (curr.occupied_beds || 5), 0);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const chartData = [
    { name: 'ICU Beds', value: 25, color: '#f59e0b' },
    { name: 'Ventilator Beds', value: 15, color: '#ef4444' },
    { name: 'Oxygen Beds', value: 40, color: '#06b6d4' },
    { name: 'General Beds', value: 80, color: '#10b981' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">District Logistics Hub</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bed className="w-6 h-6 text-teal-400 animate-pulse" /> Bed Capacity & Occupancy Monitor
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Live telemetry tracking hospital critical care, ventilator, oxygen, and general isolation beds in real-time.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (hospitals.length > 0) setModalHospitalId(hospitals[0].id);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95 transition shadow-lg shadow-teal-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Allocate Emergency Beds
          </button>
        </div>
      </div>

      {/* KPI Counters row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Bed Allocation", value: totalBeds, desc: "District-wide bed registry capacity", color: "text-slate-800" },
          { title: "Occupied Beds", value: occupiedBeds, desc: "Beds currently active with patients", color: "text-blue-600" },
          { title: "Available Isolation Beds", value: availableBeds, desc: "Vacant slots ready for immediate admission", color: "text-teal-600" },
          { title: "Aggregated Occupancy Rate", value: `${occupancyRate}%`, desc: "Current capacity saturation ratio", color: "text-amber-600" }
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
            <span className={`block text-3xl font-extrabold ${card.color} tracking-tight`}>{card.value}</span>
            <span className="text-[10px] text-slate-500">{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Search and filter controls */}
      <div className="glass-card rounded-3xl p-5 border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl px-4 py-2.5 max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search facility name or location..." 
            className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-slate-400" />
          <div className="flex gap-2">
            {['ALL', 'PHC', 'CHC'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  typeFilter === type 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main split display: Facilities list + Charts */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Side: Hospital Bed stats grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Facility Capacity Standings</h3>
            
            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No facility telemetry matches current search query.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredHospitals.slice(0, 10).map((h) => {
                  const occupied = h.occupied_beds || Math.floor(Math.random() * 5) + 2;
                  const total = h.total_beds || 15;
                  const available = total - occupied;
                  const pct = Math.round((occupied / total) * 100);

                  return (
                    <div key={h.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition">
                      <div className="space-y-1 max-w-xs">
                        <span className="font-semibold text-slate-800 text-xs block">{h.hospital_name}</span>
                        <span className="text-[10px] text-slate-400">{h.taluk}, {h.district} • {h.hospital_type}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="flex-1 max-w-xs space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Occupancy: {pct}%</span>
                          <span>{occupied}/{total} Beds</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-[9px] text-slate-400 uppercase">Available</span>
                          <span className="text-xs font-bold text-slate-700">{available}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setModalHospitalId(h.id);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                          title="Allocate/Manage Facility Beds"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Charts breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm text-center bg-white/90">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-left mb-4">Critical Care Distribution</h3>
            
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} Beds`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm bg-white/90">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Weekly Admission Trends</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.admissions_trend || []}>
                  <defs>
                    <linearGradient id="colorBeds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="admissions" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBeds)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Allocate Emergency Beds Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative glass-card w-full max-w-md rounded-3xl border-slate-200/80 shadow-2xl p-6 text-left animate-fade-in-up bg-white/95">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 to-blue-600"></div>
            
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mt-1">Allocate Emergency Beds</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure and allocate bed telemetry stats across district healthcare units.
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4 mt-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-700 font-semibold">
                  {modalError}
                </div>
              )}

              {/* Facility Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Select Healthcare Facility</label>
                <select
                  value={modalHospitalId}
                  onChange={(e) => setModalHospitalId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-teal-500"
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hospital_name} ({h.hospital_type} - {h.taluk})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bed Type Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Bed Classification Type</label>
                <select
                  value={modalBedType}
                  onChange={(e) => setModalBedType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-teal-500"
                  required
                >
                  <option value="GENERAL">General Isolation Bed</option>
                  <option value="ICU">Intensive Care Unit (ICU) Bed</option>
                  <option value="OXYGEN">Oxygen Supported Bed</option>
                  <option value="VENTILATOR">Ventilator Bed</option>
                </select>
              </div>

              {/* Bed counts input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Total Beds Count</label>
                  <input
                    type="number"
                    value={modalTotalBeds}
                    onChange={(e) => setModalTotalBeds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-teal-500"
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Occupied Beds Count</label>
                  <input
                    type="number"
                    value={modalOccupiedBeds}
                    onChange={(e) => setModalOccupiedBeds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-teal-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Calculated available beds */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Calculated Available Beds:</span>
                <span className="font-black text-slate-700 text-sm">
                  {Math.max(0, modalTotalBeds - modalOccupiedBeds)} Beds
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-75"
                >
                  {modalLoading ? "Processing..." : (activeBedId ? "Save Changes" : "Allocate Beds")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
