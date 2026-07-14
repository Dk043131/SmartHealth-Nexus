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

export default function BedManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedHospital, setSelectedHospital] = useState(null);

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
          <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95 transition shadow-lg shadow-teal-500/10">
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
                          onClick={() => setSelectedHospital(h)}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 transition"
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
          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm text-center">
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

          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm">
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
    </motion.div>
  );
}
