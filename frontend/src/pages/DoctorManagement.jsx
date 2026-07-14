import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { doctorService } from '../services/doctor';
import { hospitalService } from '../services/hospital';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      doctorService.getAllDoctors({ limit: 100 }),
      hospitalService.getAllHospitals()
    ])
      .then(([docRes, hospRes]) => {
        if (docRes.success && docRes.data) {
          setDoctors(docRes.data.items || []);
        }
        if (hospRes.success && hospRes.data) {
          setHospitals(hospRes.data.items || []);
        }
      })
      .catch(err => console.error("Error loading doctor registry", err))
      .finally(() => setLoading(false));
  }, []);

  const getHospitalName = (hospitalId) => {
    const hosp = hospitals.find(h => h.id === hospitalId);
    return hosp ? hosp.hospital_name : 'District General HQ';
  };

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
                          d.qualification.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specializationFilter === 'ALL' || d.specialization === specializationFilter;
    const matchesAttendance = attendanceFilter === 'ALL' || d.attendance_status === attendanceFilter;
    return matchesSearch && matchesSpecialty && matchesAttendance;
  });

  // Calculate doctor attendance and availability rates
  const totalDocsCount = filteredDoctors.length;
  const presentDocsCount = filteredDoctors.filter(d => d.attendance_status === 'Present').length;
  const availableDocsCount = filteredDoctors.filter(d => d.availability_status === 'Available').length;
  const busyDocsCount = filteredDoctors.filter(d => d.availability_status === 'Busy').length;
  const attendanceRate = totalDocsCount > 0 ? Math.round((presentDocsCount / totalDocsCount) * 100) : 0;

  // Extract unique specializations for filter dropdown
  const specializations = ['ALL', ...new Set(doctors.map(d => d.specialization))];

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
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Operational Telemetry</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-400 animate-pulse" /> Doctor Registry & Duty Roster
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Monitor real-time practitioner attendance, clinic availability, schedules, and active consultation volumes across all taluks.
          </p>
        </div>
      </div>

      {/* Stats Counter Rows */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Registered Practitioners", value: totalDocsCount, desc: "District medical officers", color: "text-slate-800" },
          { title: "Active Attendance Rate", value: `${attendanceRate}%`, desc: "Duty check-in sync percentage", color: "text-blue-600" },
          { title: "Practitioners Available Now", value: availableDocsCount, desc: "On-duty and ready for consultations", color: "text-teal-600" },
          { title: "Practitioners Currently Busy", value: busyDocsCount, desc: "In-consultation or emergency surgeries", color: "text-amber-600" }
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
            <span className={`block text-3xl font-extrabold ${card.color} tracking-tight`}>{card.value}</span>
            <span className="text-[10px] text-slate-500">{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Advanced Filters and Global Search */}
      <div className="glass-card rounded-3xl p-5 border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl px-4 py-2.5 max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search practitioner name or qualification..." 
            className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Specialization:</span>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              {specializations.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Specialties' : s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Attendance:</span>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-44 w-full bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 border-slate-200/80 shadow-sm text-center text-slate-400 text-xs">
          No registered medical practitioners match the query filter criteria.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.slice(0, 30).map((d) => (
            <div 
              key={d.id} 
              className="glass-card rounded-3xl p-5 border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between h-48 text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 text-sm tracking-tight">{d.doctor_name}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                    d.attendance_status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {d.attendance_status}
                  </span>
                </div>
                <span className="block text-[11px] font-bold text-teal-600 uppercase tracking-wider">{d.specialization}</span>
                <span className="block text-[10px] text-slate-400 mt-1">{d.qualification}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px]">
                <div className="space-y-0.5">
                  <span className="block text-slate-400 uppercase text-[8px]">Assigned Facility</span>
                  <span className="font-semibold text-slate-700 truncate block max-w-[150px]" title={getHospitalName(d.hospital_id)}>
                    {getHospitalName(d.hospital_id)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400 uppercase text-[8px]">Availability</span>
                  <span className={`font-extrabold ${
                    d.availability_status === 'Available' ? 'text-emerald-600' :
                    d.availability_status === 'Busy' ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {d.availability_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
