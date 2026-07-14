import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Cpu, 
  HelpCircle, 
  ListFilter, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Info,
  Server,
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { xaiService } from '../services/xai';
import { hospitalService } from '../services/hospital';

export default function AiTransparency() {
  const [activeTab, setActiveTab] = useState('narratives');
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  
  // Data States
  const [riskData, setRiskData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [globalImportance, setGlobalImportance] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      hospitalService.getAllHospitals(),
      xaiService.getRiskIntelligence(),
      xaiService.getAuditTrail(),
      xaiService.getFeatureImportance()
    ])
      .then(([hospRes, riskRes, auditRes, featRes]) => {
        const hospItems = hospRes.data?.items || [];
        setHospitals(hospItems);
        if (hospItems.length > 0) setSelectedHospital(hospItems[0].hospital_name);
        
        if (riskRes?.success) setRiskData(riskRes.data);
        if (auditRes?.success) setAuditTrail(auditRes.data);
        if (featRes?.success) setGlobalImportance(featRes.data);
      })
      .catch(err => console.error("Error loading XAI telemetry", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      xaiService.getExplanation({ hospital_name: selectedHospital })
        .then(res => {
          if (res?.success) setExplanation(res.data);
        })
        .catch(err => console.error("Error loading predictions explanations", err));
    }
  }, [selectedHospital]);

  // Construct attribution dataset for Recharts local waterfall chart
  const waterfallData = explanation?.feature_attributions?.map(attr => ({
    name: attr.feature,
    Attribution: attr.local_contribution,
    color: attr.local_contribution >= 0 ? '#ef4444' : '#0d9488'
  })) || [];

  // Construct global feature importance data
  const globalImportanceData = Object.entries(globalImportance).map(([key, val]) => ({
    name: key,
    Weight: val
  })).sort((a, b) => b.Weight - a.Weight);

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
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Explainable AI & Governance</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400 animate-pulse" /> AI Trust, Audit & Transparency
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Generates dynamic natural language narratives, local Shapley feature attributions, and immutable decision audit logs to guarantee regulatory compliance.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto pb-1">
        {[
          { id: 'narratives', label: 'AI Explanations', icon: Cpu },
          { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert },
          { id: 'audit', label: 'Decision Audit', icon: Clock },
          { id: 'importance', label: 'Feature Importance', icon: Layers }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 border-b-2 px-1 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-teal-500 text-teal-600 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content wrapper */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium text-xs">
            Compiling attributions and explanations...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* Tab: Narratives & Waterfall explanations */}
            {activeTab === 'narratives' && (
              <motion.div 
                key="narratives"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="grid lg:grid-cols-12 gap-8"
              >
                {/* Left Side: Hospital Selector & Narrative Text card */}
                <div className="lg:col-span-5 flex flex-col space-y-6">
                  <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Node</h3>
                    <select
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none mb-6"
                    >
                      {hospitals.map(h => (
                        <option key={h.id} value={h.hospital_name}>{h.hospital_name}</option>
                      ))}
                    </select>

                    <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Info className="w-4 h-4 text-teal-600" />
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Dynamic Explanation Narrative</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {explanation?.narrative_explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Waterfall Recharts Plot */}
                <div className="lg:col-span-7 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Local SHAP Attributions</span>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">Prediction Deviation Factors</h3>
                  </div>

                  <div className="h-64 my-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waterfallData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 9 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
                        <Tooltip />
                        <Bar dataKey="Attribution">
                          {waterfallData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Positive risk factor</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span> Inhibits risk factor</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Risk Intelligence */}
            {activeTab === 'risk' && (
              <motion.div 
                key="risk"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="grid lg:grid-cols-12 gap-8"
              >
                {/* Left side: District Summary card */}
                <div className="lg:col-span-4 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">District aggregate Risk</span>
                    <span className="block text-4xl font-black text-slate-900 tracking-tighter mt-2">
                      {riskData?.district_risk?.district_overall_risk}%
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Projected 30-Day Risk</span>
                    <span className="block text-xl font-bold text-amber-600 mt-1">
                      {riskData?.district_risk?.projected_district_risk}%
                    </span>
                  </div>
                </div>

                {/* Right side: Detailed Risks table */}
                <div className="lg:col-span-8 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Risk Indices by Node</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 text-left">Hospital</th>
                          <th className="pb-3 text-center">Medicine Risk</th>
                          <th className="pb-3 text-center">Doctor Risk</th>
                          <th className="pb-3 text-center">Ambulance Risk</th>
                          <th className="pb-3 text-center">Current Overall</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskData?.hospital_risks?.map((r, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-slate-800">{r.hospital_name}</td>
                            <td className="py-3 text-center font-medium text-teal-600">{r.medicine_risk}%</td>
                            <td className="py-3 text-center font-medium text-blue-600">{r.doctor_risk}%</td>
                            <td className="py-3 text-center font-medium text-amber-600">{r.ambulance_risk}%</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                r.current_overall_risk > 30 
                                  ? 'bg-red-50 text-red-700 border border-red-100' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {r.current_overall_risk}% Risk
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Decision Audit */}
            {activeTab === 'audit' && (
              <motion.div 
                key="audit"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Immutable Decision Audit Log</h3>
                  
                  <div className="relative border-l border-slate-200 ml-4 space-y-6 pl-6">
                    {auditTrail.map((log, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot marker */}
                        <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 bg-slate-900 border-2 border-white rounded-full"></div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-900 uppercase">{log.action_name}</span>
                            <span className="text-slate-400 font-semibold">{log.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium">{log.outcome_summary}</p>
                          <div className="flex items-center gap-4 text-[9px] text-slate-400 pt-2 border-t border-slate-100 mt-2">
                            <span>Features: {log.features_used.join(', ')}</span>
                            <span>Model: v{log.model_version}</span>
                            <span>Triggered: {log.triggered_by}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Feature Importance */}
            {activeTab === 'importance' && (
              <motion.div 
                key="importance"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Global model weights</span>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">Feature Importance Map</h3>
                  </div>

                  <div className="h-64 my-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={globalImportanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="Weight" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

    </motion.div>
  );
}
