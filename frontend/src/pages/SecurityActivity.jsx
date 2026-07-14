import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertTriangle,
  History,
  Activity,
  Layers,
  Database
} from 'lucide-react';
import { securityService } from '../services/security';

export default function SecurityActivity() {
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    securityService.audit()
      .then(res => {
        if (res?.success) setSecurityLogs(res.data);
      })
      .catch(err => console.error("Error loading security audits", err))
      .finally(() => setLoading(false));
  }, []);

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
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Security Hardening & Token Auditing</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" /> Security Activity Center
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Real-time audit log tracking user logins, failed attempts, token rotations, and suspicious access points.
          </p>
        </div>
      </div>

      {/* Security KPI row */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { title: "Active user sessions", value: "3 active", desc: "JWT refresh token rotation enabled", color: "text-slate-800" },
          { title: "Security Alerts flagged", value: "0 alerts", desc: "Anti-CSRF & XSS filters operational", color: "text-emerald-600" },
          { title: "Failed Login attempts", value: "0 attempts", desc: "IP rate limiting active", color: "text-slate-500" }
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36 bg-white">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
            <span className={`block text-3xl font-extrabold ${card.color} tracking-tight`}>{card.value}</span>
            <span className="text-[10px] text-slate-500">{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Audit Log ledger</span>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Security Event monitoring</h3>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-450 text-xs font-semibold">Loading security audit...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 text-left">Event Type</th>
                  <th className="pb-3 text-left">User</th>
                  <th className="pb-3 text-center">IP Address</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Details</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {securityLogs.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-600" /> {row.event_type}
                    </td>
                    <td className="py-3 font-medium text-slate-700">{row.username}</td>
                    <td className="py-3 text-center font-medium text-slate-650">{row.ip_address}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        row.status === 'SUCCESS' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500 font-medium max-w-xs truncate">{row.details}</td>
                    <td className="py-3 text-right font-medium text-slate-400">{row.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
}
