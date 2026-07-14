import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  Download, 
  Settings, 
  Brain, 
  TrendingUp, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export default function ExportCenter() {
  const [format, setFormat] = useState('pdf');
  const [successMsg, setSuccessMsg] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleExportReport = (reportType) => {
    setGenerating(true);
    setSuccessMsg('');
    
    // Simulate generation delay
    setTimeout(() => {
      setGenerating(false);
      setSuccessMsg(`Successfully generated and downloaded "${reportType}" in ${format.toUpperCase()} format.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }, 1500);
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
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">District health reporting Hub</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-400" /> Export Center
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Compile and compile print-ready and export-ready PDFs, Excel sheets, and JSON schemas detailing AI predictions, optimization recommendations, and decision trails.
          </p>
        </div>
      </div>

      {/* Options Panel */}
      <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure Export parameters</span>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold">Format:</span>
          <div className="flex bg-slate-50 border border-slate-200/80 rounded-xl p-0.5">
            {['pdf', 'excel', 'json', 'csv'].map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1 rounded-lg font-bold uppercase transition ${
                  format === f 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "AI Forecast Report", desc: "Includes patient footfall time-series forecasts and dengue outbreak risk assessments.", icon: Brain, type: "AI Forecast Report" },
          { title: "Optimization Report", desc: "Detailing NetworkX minimum-cost flow stock transfers and staff allocations.", icon: TrendingUp, type: "Resource Optimization Report" },
          { title: "Decision Audit Trail", desc: "Audit logs compiling features snapshots, model versions, and IP logins history.", icon: Clock, type: "Decision Audit Report" },
          { title: "Citizen Portal Summary", desc: "District-wide clinical availability metrics compiled for public disclosure.", icon: ShieldCheck, type: "Citizen Portal Summary" }
        ].map((card, idx) => (
          <div key={idx} className="glass-card bg-white p-5 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between h-48 text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auditable report</span>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <card.icon className="w-4 h-4 text-teal-600" /> {card.title}
              </h3>
              <p className="text-[10px] text-slate-500 leading-relaxed">{card.desc}</p>
            </div>
            
            <button
              onClick={() => handleExportReport(card.type)}
              disabled={generating}
              className="py-2 bg-slate-900 disabled:bg-slate-350 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:opacity-95 transition mt-4"
            >
              <Download className="w-3.5 h-3.5" /> {generating ? 'Generating...' : 'Export Report'}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
