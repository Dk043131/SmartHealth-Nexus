import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Cpu, 
  HelpCircle, 
  CheckCircle2,
  Trash2,
  Lock,
  Eye,
  Languages,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function Administration() {
  const [maintenance, setMaintenance] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    ai_recommendations: true,
    auto_optimization: false,
    push_notifications: true
  });
  const [successMsg, setSuccessMsg] = useState('');

  const toggleFlag = (key) => {
    setFeatureFlags(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      setSuccessMsg(`Feature flag "${key}" updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      return updated;
    });
  };

  const toggleMaintenance = () => {
    setMaintenance(prev => {
      const val = !prev;
      setSuccessMsg(val ? "Maintenance Mode enabled. System access restricted." : "Maintenance Mode disabled.");
      setTimeout(() => setSuccessMsg(''), 4000);
      return val;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left"
    >
      {/* Alert banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">System settings & access Controls</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-400" /> Enterprise Administration Panel
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Toggle system-wide feature flags, restrict roles access, adjust AI confidence weight thresholds, or trigger maintenance modes.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: System Toggles & Feature flags */}
        <div className="lg:col-span-6 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">System Settings & Feature flags</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Adjust operational features instantly across the district node nodes.</p>
          </div>

          <div className="space-y-4">
            
            {/* Maintenance toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">Maintenance Mode</span>
                <span className="text-[10px] text-slate-400 block">Restrict platform access during updates</span>
              </div>
              <button onClick={toggleMaintenance} className="text-slate-800 focus:outline-none">
                {maintenance ? <ToggleRight className="w-9 h-9 text-teal-500" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
              </button>
            </div>

            {/* AI recommendation flag */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">Enable AI Recommendations</span>
                <span className="text-[10px] text-slate-400 block">Auto-generates redistribution narratives</span>
              </div>
              <button onClick={() => toggleFlag('ai_recommendations')} className="text-slate-800 focus:outline-none">
                {featureFlags.ai_recommendations ? <ToggleRight className="w-9 h-9 text-teal-500" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
              </button>
            </div>

            {/* Auto optimization flag */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">Enable Auto-Optimization</span>
                <span className="text-[10px] text-slate-400 block">Solves NetworkX min-cost flows automatically</span>
              </div>
              <button onClick={() => toggleFlag('auto_optimization')} className="text-slate-800 focus:outline-none">
                {featureFlags.auto_optimization ? <ToggleRight className="w-9 h-9 text-teal-500" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
              </button>
            </div>

            {/* Push notification flag */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">Enable Push Notifications</span>
                <span className="text-[10px] text-slate-400 block">Bridges alert notifications to registered workers</span>
              </div>
              <button onClick={() => toggleFlag('push_notifications')} className="text-slate-800 focus:outline-none">
                {featureFlags.push_notifications ? <ToggleRight className="w-9 h-9 text-teal-500" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Role privileges overview */}
        <div className="lg:col-span-6 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Role-Based Access Control (RBAC)</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Manage user privileges based on roles categories.</p>
          </div>

          <div className="space-y-4">
            {[
              { role: "District Administrator", priv: "Full permissions: optimization runs, user management, backups triggers" },
              { role: "PHC/CHC Chief Doctor", priv: "Operational updates: verify inventory shelf counts, resolve alerts" },
              { role: "Public Citizen", priv: "Read-only access: hospitals locator, availabilities grids, announcements alerts" }
            ].map((r, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> {r.role}
                </span>
                <span className="block text-[10px] text-slate-500">{r.priv}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
