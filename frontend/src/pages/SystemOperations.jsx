import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Database, 
  Cpu, 
  Activity, 
  RefreshCw, 
  Clock, 
  Play,
  CheckCircle2,
  Terminal,
  Settings
} from 'lucide-react';
import { healthService } from '../services/health';
import { jobsService } from '../services/jobs';

export default function SystemOperations() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [triggerSuccess, setTriggerSuccess] = useState(false);
  const [activeJobName, setActiveJobName] = useState('');

  useEffect(() => {
    fetchSystemTelemetry();
  }, []);

  const fetchSystemTelemetry = () => {
    setLoading(true);
    Promise.all([
      healthService.details(),
      jobsService.active()
    ])
      .then(([healthRes, jobsRes]) => {
        if (healthRes?.success) setStats(healthRes.data);
        if (jobsRes?.success) setJobs(jobsRes.data);
      })
      .catch(err => console.error("Error loading operations telemetry", err))
      .finally(() => setLoading(false));
  };

  const handleTriggerJob = (jobId, jobName) => {
    setActiveJobName(jobName);
    setTriggerSuccess(false);
    
    jobsService.trigger(jobId)
      .then(res => {
        if (res?.success) {
          setTriggerSuccess(true);
          fetchSystemTelemetry();
          setTimeout(() => setTriggerSuccess(false), 5000);
        }
      })
      .catch(err => console.error("Error manual triggering job", err));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left"
    >
      {/* Alert trigger banner */}
      <AnimatePresence>
        {triggerSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Task "{activeJobName}" successfully executed in the background.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Executive operations Control Center</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-teal-400" /> Infrastructure Observability & System Status
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Live hardware resource tracing, DB pool connections, background workers, and active model assemblies.
          </p>
        </div>
        <button 
          onClick={fetchSystemTelemetry}
          className="px-4 py-2.5 bg-slate-800 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-400 text-xs font-semibold">Resolving system metrics...</div>
      ) : (
        <div className="space-y-8">
          
          {/* Hardware & Database stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36 bg-white">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CPU Utilization</span>
              <span className="block text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats?.resources?.cpu_usage_pct}%
              </span>
              <span className="text-[10px] text-slate-500">Multicore host processing</span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36 bg-white">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Memory Usage</span>
              <span className="block text-3xl font-extrabold text-blue-600 tracking-tight">
                {stats?.resources?.ram_used_gb} / {stats?.resources?.ram_total_gb} GB
              </span>
              <span className="text-[10px] text-slate-500">Virtual memory utilization</span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36 bg-white">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Database Status</span>
              <span className="block text-3xl font-extrabold text-emerald-600 tracking-tight">
                {stats?.database_connected ? 'CONNECTED' : 'OFFLINE'}
              </span>
              <span className="text-[10px] text-slate-500">PostgreSQL Connection Pool</span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36 bg-white">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active WebSockets</span>
              <span className="block text-3xl font-extrabold text-amber-600 tracking-tight">
                {stats?.websocket_connections_active} connections
              </span>
              <span className="text-[10px] text-slate-500">District telemetry broadcast</span>
            </div>

          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Background Workers scheduler list */}
            <div className="lg:col-span-7 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Scheduled System Workers</h3>
                <Settings className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="space-y-4">
                {jobs.map((job, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800">{job.name}</span>
                      <span className="block text-[10px] text-slate-400">Schedule: {job.interval} | Last run: {job.last_run}</span>
                    </div>
                    <button
                      onClick={() => handleTriggerJob(job.id, job.name)}
                      className="p-2 bg-slate-900 text-white rounded-lg hover:opacity-95 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model Loaded Registry details */}
            <div className="lg:col-span-5 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">AI Estimators Registry</h3>
              <div className="space-y-3 text-xs">
                {stats?.ai_models_loaded && Object.entries(stats.ai_models_loaded).map(([name, loaded], idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="font-semibold text-slate-700">{name}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                      loaded 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {loaded ? 'LOADED' : 'UNLOADED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* System logs console */}
          <div className="glass-card bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider">System logs Output</span>
            </div>
            <pre className="font-mono text-[10px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap h-32">
              2026-07-06 23:10:00 [INFO] System Health checks completed. Liveness: UP. Database: UP.
              2026-07-06 23:11:00 [INFO] Loaded AI Model weights for 6 registered estimators successfully.
              2026-07-06 23:12:00 [INFO] Reconnection Sync queue uploaded 5 pending write transactions from local IndexedDB cache.
            </pre>
          </div>

        </div>
      )}
    </motion.div>
  );
}
