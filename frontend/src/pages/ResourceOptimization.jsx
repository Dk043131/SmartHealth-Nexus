import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Settings, 
  MapPin, 
  Truck, 
  Users, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  Play, 
  Sliders, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Route 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { optimizationService } from '../services/optimization';
import { hospitalService } from '../services/hospital';

export default function ResourceOptimization() {
  const [activeTab, setActiveTab] = useState('readiness');
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  
  // Data States
  const [readiness, setReadiness] = useState([]);
  const [medicinePlan, setMedicinePlan] = useState(null);
  const [staffPlan, setStaffPlan] = useState(null);
  const [ambulancePlan, setAmbulancePlan] = useState(null);
  
  // What-If Simulation States
  const [simScenario, setSimScenario] = useState('Outbreak');
  const [simSeverity, setSimSeverity] = useState(1.5);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      hospitalService.getAllHospitals(),
      optimizationService.getReadinessIndices(),
      optimizationService.getMedicineOptimization(),
      optimizationService.getDoctorOptimization()
    ])
      .then(([hospRes, readRes, medRes, staffRes]) => {
        const hospItems = hospRes.data?.items || [];
        setHospitals(hospItems);
        if (hospItems.length > 0) setSelectedHospital(hospItems[0].id);
        
        if (readRes?.success) setReadiness(readRes.data);
        if (medRes?.success) setMedicinePlan(medRes.data);
        if (staffRes?.success) setStaffPlan(staffRes.data);
      })
      .catch(err => console.error("Error loading optimization telemetry", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      optimizationService.getAmbulanceOptimization(selectedHospital)
        .then(res => {
          if (res?.success) setAmbulancePlan(res.data);
        })
        .catch(err => console.error("Error loading ambulance optimizer", err));
    }
  }, [selectedHospital]);

  const handleRunSimulation = () => {
    setSimulating(true);
    optimizationService.runSimulation(simScenario, simSeverity)
      .then(res => {
        if (res?.success) setSimResult(res.data);
      })
      .catch(err => console.error("Error running simulation run", err))
      .finally(() => setSimulating(false));
  };

  // Compile radar data for first hospital readiness breakdown
  const radarData = readiness.slice(0, 4).map(h => ({
    subject: h.hospital_name.substring(0, 10),
    Medicine: h.medicine_score,
    Doctor: h.doctor_score,
    Ambulance: h.ambulance_score,
    Overall: h.overall_score
  }));

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
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">AI-Powered Resource Reallocation</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-teal-400 animate-pulse" /> Resource Optimization & Decision Support
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Solves Minimum Cost Flow transport problems and Bipartite Matching models to redistribute medicines, bed allocations, and doctor shift schedules.
          </p>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto pb-1">
        {[
          { id: 'readiness', label: 'Readiness Score', icon: Activity },
          { id: 'medicine', label: 'Medicine Transfer', icon: Truck },
          { id: 'doctors', label: 'Doctor Shifts', icon: Users },
          { id: 'ambulances', label: 'Ambulance Router', icon: Route },
          { id: 'whatif', label: 'What-If Simulator', icon: Sliders }
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
            Calculating optimization matrices...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* Tab: Readiness score details */}
            {activeTab === 'readiness' && (
              <motion.div 
                key="readiness"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="grid lg:grid-cols-12 gap-8"
              >
                {/* Left side: Radar comparison chart */}
                <div className="lg:col-span-5 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Multi-Dimensional Index</span>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">Readiness Radar Matrix</h3>
                  </div>
                  
                  <div className="h-64 my-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                        <Radar name="Medicine Index" dataKey="Medicine" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                        <Radar name="Staff Index" dataKey="Doctor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        <Radar name="Overall score" dataKey="Overall" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right side: Hospital Readiness ranking table */}
                <div className="lg:col-span-7 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Readiness Indices by Node</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 text-left">Hospital</th>
                          <th className="pb-3 text-center">Medicine</th>
                          <th className="pb-3 text-center">Doctor</th>
                          <th className="pb-3 text-center">Ambulance</th>
                          <th className="pb-3 text-center">Readiness Index</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readiness.map((r, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-slate-800">{r.hospital_name}</td>
                            <td className="py-3 text-center font-medium text-teal-600">{r.medicine_score}%</td>
                            <td className="py-3 text-center font-medium text-blue-600">{r.doctor_score}%</td>
                            <td className="py-3 text-center font-medium text-amber-600">{r.ambulance_score}%</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                r.overall_score > 75 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {r.overall_score}/100
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

            {/* Tab: Medicine Redistribution */}
            {activeTab === 'medicine' && (
              <motion.div 
                key="medicine"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Network Minimum Cost Flow Solver</span>
                      <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">Recommended Stock Transfers ({medicinePlan?.medicine_name})</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Est. Savings: ${medicinePlan?.estimated_savings_usd || 0.0}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 text-left">Sender Node</th>
                          <th className="pb-3 text-left">Recipient Node</th>
                          <th className="pb-3 text-center">Transfer Quantity</th>
                          <th className="pb-3 text-center">Road Distance</th>
                          <th className="pb-3 text-center">Transport Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicinePlan?.optimization_result?.length > 0 ? (
                          medicinePlan.optimization_result.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="py-3 font-semibold text-slate-800 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-teal-500" /> {row.source_hospital_name}
                              </td>
                              <td className="py-3 font-semibold text-slate-800">{row.destination_hospital_name}</td>
                              <td className="py-3 text-center font-bold text-teal-600">{row.quantity} units</td>
                              <td className="py-3 text-center">{row.distance_km} km</td>
                              <td className="py-3 text-center font-medium">${row.estimated_transport_cost}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                              All nodes currently operate within safe safety boundaries. No transport redistribution required.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Doctor Reallocations */}
            {activeTab === 'doctors' && (
              <motion.div 
                key="doctors"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <div className="mb-6">
                    <span className="text-[10px] font-bold text-blue-600 uppercase block tracking-wider">Maximum Cardinality Bipartite Matching</span>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">Temporary Doctor Reallocation Slots</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 text-left">Practitioner</th>
                          <th className="pb-3 text-left">Specialization</th>
                          <th className="pb-3 text-left">Home Base</th>
                          <th className="pb-3 text-left">Assigned Surge Node</th>
                          <th className="pb-3 text-center">Commute Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffPlan?.optimization_result?.length > 0 ? (
                          staffPlan.optimization_result.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="py-3 font-semibold text-slate-800">Dr. {row.doctor_name}</td>
                              <td className="py-3 font-medium text-blue-600">{row.specialization}</td>
                              <td className="py-3">{row.source_hospital_name}</td>
                              <td className="py-3 font-semibold text-slate-800">{row.destination_hospital_name}</td>
                              <td className="py-3 text-center">{row.distance_km} km</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                              Clinician caseload levels remain balanced. No active reallocations needed.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Ambulance Dispatch */}
            {activeTab === 'ambulances' && (
              <motion.div 
                key="ambulances"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="grid lg:grid-cols-12 gap-8"
              >
                {/* Left Side: Hospital Selector */}
                <div className="lg:col-span-4 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Select Target emergency Site</h3>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.hospital_name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-3">
                    Calculates closest ambulances dynamically along local road intersections using Dijkstra.
                  </p>
                </div>

                {/* Right Side: Dispatch routes list */}
                <div className="lg:col-span-8 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Closest Available Ambulances</h3>
                  <div className="space-y-4">
                    {ambulancePlan?.optimization_result?.length > 0 ? (
                      ambulancePlan.optimization_result.map((row, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-4 border border-slate-100">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-800">{row.vehicle_number}</span>
                            <span className="block text-[10px] text-slate-400">Driver: {row.driver_name} | Base: {row.base_hospital_name}</span>
                            <span className="block text-[9px] text-teal-600 font-medium">Route: {row.path_route.join(' → ')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-800 block">{row.estimated_eta_minutes} mins ETA</span>
                            <span className="text-[10px] text-slate-400">{row.distance_km} km away</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No available vehicles found. All emergency vehicles currently dispatched.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: What-If Simulator */}
            {activeTab === 'whatif' && (
              <motion.div 
                key="whatif"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="grid lg:grid-cols-12 gap-8"
              >
                {/* Left side: Controls */}
                <div className="lg:col-span-5 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Predictive Stress Testing</span>
                      <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">What-If Parameters</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">Scenario Mode</label>
                      <select
                        value={simScenario}
                        onChange={(e) => setSimScenario(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="Outbreak">Disease Outbreak Surge</option>
                        <option value="Flood">Taluk Flooding</option>
                        <option value="Strike">Practitioners Strike</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-slate-400 font-bold uppercase">Severity factor</label>
                        <span className="font-semibold text-slate-700">{simSeverity}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.5"
                        value={simSeverity}
                        onChange={(e) => setSimSeverity(parseFloat(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRunSimulation}
                    disabled={simulating}
                    className="w-full py-2.5 bg-slate-900 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-95 mt-6 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {simulating ? 'Running Simulation...' : 'Evaluate Scenario'}
                  </button>
                </div>

                {/* Right side: Simulation Results */}
                <div className="lg:col-span-7 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Projected District Impacts</h3>
                  {simResult ? (
                    <div className="space-y-5">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Impact Summary</span>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{simResult.impact_summary}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-100 rounded-2xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Projected Readiness Index</span>
                          <span className="block text-2xl font-black text-teal-600 mt-1">{simResult.projected_readiness_score}/100</span>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-2xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Est. Response Delay</span>
                          <span className="block text-2xl font-black text-amber-600 mt-1">+{simResult.estimated_emergency_response_delay} mins</span>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-2xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Projected shortages</span>
                          <span className="block text-2xl font-black text-slate-800 mt-1">{simResult.projected_medicine_shortages} items</span>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-2xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Bed Occupancy Rate</span>
                          <span className="block text-2xl font-black text-blue-600 mt-1">{simResult.projected_bed_occupancy_pct}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl">
                      Select variables and click Evaluate to compile projected deficits.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

    </motion.div>
  );
}
