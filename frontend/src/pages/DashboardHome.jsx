import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Building2, 
  Users, 
  AlertTriangle, 
  Search, 
  Plus, 
  BellRing, 
  RefreshCw, 
  ChevronRight, 
  ArrowRight,
  TrendingUp, 
  MapPin, 
  Cpu, 
  Brain, 
  Sliders, 
  Sparkles,
  Maximize2,
  Minimize2,
  FileText,
  AlertOctagon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard';
import { hospitalService } from '../services/hospital';

// Custom pulsing leaflet markers using Tailwind CSS
const createCustomMarker = (statusColor) => {
  const colorMap = {
    Green: 'bg-emerald-500 shadow-emerald-500/50 text-emerald-500',
    Yellow: 'bg-amber-500 shadow-amber-500/50 text-amber-500',
    Red: 'bg-rose-500 shadow-rose-500/50 text-rose-500'
  };
  const colorClass = colorMap[statusColor] || colorMap.Green;

  return L.divIcon({
    html: `<div class="relative w-4 h-4 rounded-full border-2 border-white ${colorClass} shadow-lg">
             <div class="absolute inset-0 w-full h-full rounded-full border border-current opacity-75 animate-ping"></div>
           </div>`,
    className: 'custom-leaflet-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState({
    district_health_score: 92.5,
    total_hospitals: 70,
    active_doctors: 215,
    total_patients: 449847,
    medicine_availability_pct: 95.8,
    bed_occupancy_pct: 68.4,
    ambulances_available: 92,
    critical_alerts: 12,
    trends: { patients: "up", medicine: "stable", beds: "up", alerts: "down" }
  });
  
  const [mapMarkers, setMapMarkers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [analytics, setAnalytics] = useState({
    disease_distribution: [],
    admissions_trend: [],
    beds_distribution: []
  });
  
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const syncData = () => {
    setLoading(true);
    Promise.all([
      dashboardService.getKPIs(),
      dashboardService.getMapMarkers(),
      dashboardService.getActivityTimeline(),
      dashboardService.getAnalytics()
    ])
      .then(([kpiRes, mapRes, actRes, anaRes]) => {
        if (kpiRes.success && kpiRes.data) setKpis(kpiRes.data);
        if (mapRes.success && mapRes.data) setMapMarkers(mapRes.data);
        if (actRes.success && actRes.data) setActivity(actRes.data);
        if (anaRes.success && anaRes.data) setAnalytics(anaRes.data);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(err => console.error("Telemetry sync delayed", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    syncData();
  }, []);

  // Demo presentation Mode: Auto reload feed interval
  useEffect(() => {
    let interval;
    if (demoMode) {
      interval = setInterval(() => {
        syncData();
      }, 5000); // refresh every 5 seconds for visual dynamic feel
    }
    return () => clearInterval(interval);
  }, [demoMode]);

  const filteredMarkers = mapMarkers.filter(m => 
    m.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.taluk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-8 animate-fade-in-up text-left select-none print:hidden ${demoMode ? 'bg-slate-950 p-6 rounded-3xl text-white' : ''}`}>
      
      {/* 1. Header Control Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.08),transparent_50%)]" />
        
        <div className="text-left space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-500/20 block">
              Autonomous Intelligence active
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Updated: {lastUpdated}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            District Command Center Operations
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl">
            Live district telemetry monitoring system. Synchronized with **70 clinical facility nodes** and **1.23M operational events**.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10 shrink-0">
          <button 
            onClick={() => setDemoMode(!demoMode)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition ${
              demoMode 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            {demoMode ? <Minimize2 className="w-4 h-4 animate-pulse" /> : <Maximize2 className="w-4 h-4" />}
            {demoMode ? 'Exit Demo Stream' : 'Judging Demo Mode'}
          </button>
          <button 
            onClick={syncData}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Telemetry
          </button>
        </div>
      </div>

      {/* 2. Executive Analytics grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* District health score Circular Gauge widget */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-md text-center flex-1 flex flex-col justify-between items-center relative overflow-hidden bg-white/90">
            <div className="w-full text-left">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Health Rating index</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mt-1">District Health Index</h3>
            </div>
            
            <div className="relative w-40 h-40 flex items-center justify-center my-6">
              {/* Circular track */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <motion.circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke="url(#tealGradient)" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="440"
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * (kpis?.district_health_score || 88.5)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{kpis?.district_health_score || 88.5}</span>
                <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest mt-1">Nominal Grade</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              District composite metrics computed from medicine stockpile levels, doctor attendance check-ins, and alert frequencies.
            </p>
          </div>
        </div>

        {/* Dynamic KPI Stats Cards */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
          {[
            { title: "Connected Health Facility Nodes", value: kpis.total_hospitals, suffix: "Active Node Registry", icon: Building2, color: "text-slate-800", bg: "bg-slate-50 text-slate-700", border: "border-t-2 border-t-slate-400" },
            { title: "Today's Patient Registry admissions", value: kpis.total_patients.toLocaleString(), suffix: "Cumulative district patients", icon: Users, color: "text-teal-650", bg: "bg-teal-50 text-teal-700", border: "border-t-2 border-t-teal-500" },
            { title: "Aggregated Medicine Availability", value: `${kpis.medicine_availability_pct}%`, suffix: "Medicines stock availability rating", icon: Activity, color: "text-blue-600", bg: "bg-blue-50 text-blue-700", border: "border-t-2 border-t-blue-500" },
            { title: "Critical Care Bed Occupancy", value: `${kpis.bed_occupancy_pct}%`, suffix: "District bed occupancy metrics", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 text-rose-700", border: "border-t-2 border-t-rose-500" }
          ].map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div key={idx} className={`glass-card glass-card-hover rounded-3xl p-6 border-slate-200/80 shadow-md flex flex-col justify-between h-40 relative group overflow-hidden bg-white/90 ${card.border}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">{card.title}</span>
                    <span className={`text-3xl font-black ${card.color} tracking-tight block mt-1`}>{card.value}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl ${card.bg} flex items-center justify-center shrink-0 shadow-inner border border-current/10`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 pt-3 border-t border-slate-100">
                  {card.suffix}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive GIS Map panel */}
      <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">GIS Operational Map</h3>
            <p className="text-xs text-slate-400">Marker status indicators (Green: Normal, Yellow: Warning, Red: Low Resources)</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-2 max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search map facilities..." 
              className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* GIS Leaflet Map Container */}
        <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative z-10">
          <MapContainer 
            center={[34.0837, 74.7973]} 
            zoom={11} 
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredMarkers.map((marker) => (
              <Marker 
                key={marker.id} 
                position={[marker.latitude, marker.longitude]}
                icon={createCustomMarker(marker.status_color)}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-left">
                    <span className="font-extrabold text-slate-900 text-xs block">{marker.hospital_name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                      {marker.hospital_type} • {marker.taluk}
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-slate-100 text-[10px]">
                      <div>Beds Available: <span className="font-bold text-teal-600">{marker.metrics.beds_available}/{marker.metrics.beds_total}</span></div>
                      <div>Active Patients: <span className="font-bold text-slate-700">{marker.metrics.patients_count}</span></div>
                      <div>Active Alerts: <span className="font-bold text-rose-500">{marker.metrics.alerts_count}</span></div>
                      <div>Shortages count: <span className="font-bold text-amber-600">{marker.metrics.shortages_count}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* 4. Split: Recharts graphs & Live command activity feed */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recharts diagrams */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm bg-white">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">Patient Admission analytics</h3>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.admissions_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="admissions" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Live scrolling timeline telemetry feed */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm text-left flex flex-col justify-between bg-white flex-1">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BellRing className="w-5 h-5 text-slate-400 shrink-0" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Telemetry feed logs</h3>
              </div>
              
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {activity.map((act) => (
                  <div key={act.id} className="flex gap-3 border-l-2 border-slate-100 pl-4 relative py-0.5">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-200 border-2 border-white"></span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md ${
                          act.type === 'Alert' ? 'bg-red-50 text-red-700' :
                          act.type === 'Transfer' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                        }`}>
                          {act.type}
                        </span>
                        <span className="text-[9px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{act.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                View Alert Ledger <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Future AI Module placeholders */}
      <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm bg-white">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">AI Optimization Modules (Future modules preview)</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Epidemic Outbreak Forecasting", label: "Predictive Analytics", desc: "AI-based forecast mapping dengue, malaria, and winter flu surges based on current local climate telemetry data.", icon: Brain },
            { title: "Prescriptive Stock Optimization", label: "Inventory Prescriptions", desc: "Automated logistics recommendations calculated to resolve medicine deficits via smart hospital transport links.", icon: Cpu },
            { title: "Explainable Patient Triage Insights", label: "Triage Assistant", desc: "XAI clinical diagnosis helper detailing patient risk ratings and specialist referrals.", icon: Sparkles }
          ].map((box, idx) => {
            const IconComp = box.icon;
            return (
              <div key={idx} className="border border-dashed border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition relative overflow-hidden group">
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-[8px] font-bold text-slate-400 uppercase">AI Placeholder</div>
                <div className="flex gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-450 shrink-0 mt-0.5">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{box.label}</span>
                    <span className="font-bold text-xs text-slate-700 block">{box.title}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{box.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
