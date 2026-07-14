import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Sliders, 
  AlertTriangle, 
  CheckCheck, 
  Eye, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { dashboardService } from '../services/dashboard';
import { hospitalService } from '../services/hospital';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadAlerts = () => {
    setLoading(true);
    Promise.all([
      dashboardService.getAlerts({ limit: 100 }),
      hospitalService.getAllHospitals()
    ])
      .then(([alertRes, hospRes]) => {
        if (alertRes.success && alertRes.data) {
          setAlerts(alertRes.data.items || []);
        }
        if (hospRes.success && hospRes.data) {
          setHospitals(hospRes.data.items || []);
        }
      })
      .catch(err => console.error("Error loading alerts", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getHospitalName = (hospitalId) => {
    const hosp = hospitals.find(h => h.id === hospitalId);
    return hosp ? hosp.hospital_name : 'District Base HQ';
  };

  const handleAcknowledge = (id) => {
    // Call update API endpoint
    dashboardService.updateAlert(id, { status: 'RESOLVED' })
      .then(() => {
        // Reload list
        loadAlerts();
      })
      .catch(err => console.error("Error acknowledging alert", err));
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.message.toLowerCase().includes(search.toLowerCase()) ||
                          a.alert_type.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Calculate quick metrics
  const totalAlerts = filteredAlerts.length;
  const unresolvedAlerts = filteredAlerts.filter(a => a.status === 'UNRESOLVED').length;
  const criticalAlerts = filteredAlerts.filter(a => a.priority === 'CRITICAL').length;
  const warningAlerts = filteredAlerts.filter(a => a.priority === 'WARNING').length;

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
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">System Control Center</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-400 animate-pulse" /> Central Alert Management Hub
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Triage operational failures, critical drug deficits, ICU capacity saturation flags, and logistics anomalies across taluks.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadAlerts}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-750 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Reload Feed
          </button>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Alerts Tracked", value: totalAlerts, desc: "Aggregated telemetry flags", color: "text-slate-800" },
          { title: "Unresolved Warnings", value: unresolvedAlerts, desc: "Require operator validation", color: "text-red-600" },
          { title: "Critical Incidents", value: criticalAlerts, desc: "High-priority service overrides", color: "text-orange-500" },
          { title: "Standard Warnings", value: warningAlerts, desc: "Low-priority operational logs", color: "text-amber-500" }
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
            <span className={`block text-3xl font-extrabold ${card.color} tracking-tight`}>{card.value}</span>
            <span className="text-[10px] text-slate-500">{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Advanced Filters and Search */}
      <div className="glass-card rounded-3xl p-5 border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl px-4 py-2.5 max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search alerts by message or type..." 
            className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="UNRESOLVED">Unresolved</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Alert Logs list */}
      <div className="glass-card rounded-3xl p-6 border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">District Alert Ledger</h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No alerts match current search query filters.</div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.slice(0, 30).map((a) => (
              <div 
                key={a.id} 
                className="border border-slate-100/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    a.priority === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                    a.priority === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-xs">{a.alert_type}</span>
                      <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-full ${
                        a.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        a.priority === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs">{a.message}</p>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Location: {getHospitalName(a.hospital_id)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-end">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(a.created_at).toLocaleTimeString()}</span>
                  </div>

                  {a.status === 'UNRESOLVED' ? (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-95 transition shadow-lg shadow-teal-500/10"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Acknowledge
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 font-semibold text-xs flex items-center gap-1">
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
