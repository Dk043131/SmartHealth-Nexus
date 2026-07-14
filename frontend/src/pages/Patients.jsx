import React, { useState, useEffect } from 'react';
import { Plus, Users, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patient';
import { hospitalService } from '../services/hospital';
import { 
  StatCard, 
  StatusBadge, 
  DataTable, 
  SearchBar, 
  FilterPanel, 
  ErrorState 
} from '../components/common';

export default function Patients() {
  const { user } = useAuth();
  
  // Data lists
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [hospitalId, setHospitalId] = useState('');
  const [search, setSearch] = useState('');

  // Admit Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [patId, setPatId] = useState('');
  const [patAge, setPatAge] = useState('');
  const [patGender, setPatGender] = useState('Male');
  const [patDisease, setPatDisease] = useState('');
  const [patVisitDate, setPatVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [patStatus, setPatStatus] = useState('Admitted');
  const [patHospitalId, setPatHospitalId] = useState('');
  const [admitError, setAdmitError] = useState(null);
  const [admitLoading, setAddLoading] = useState(false);

  const limit = 10;

  // Fetch Hospitals list
  useEffect(() => {
    hospitalService.getAllHospitals({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) {
          const list = res.data.items || [];
          setHospitals(list);
          if (list.length > 0) {
            setPatHospitalId(list[0].id);
          }
        }
      })
      .catch((err) => console.error("Error fetching hospitals", err));
  }, []);

  const fetchPatients = () => {
    setLoading(true);
    setError(null);
    
    // Default filter PHC_STAFF to their assigned hospital
    let activeHospitalId = hospitalId;
    if (user?.role === 'PHC_STAFF' && user?.hospital_id) {
      activeHospitalId = user.hospital_id;
    }

    const params = {
      skip: (page - 1) * limit,
      limit,
      order_by: "created_at"
    };
    if (activeHospitalId) params.hospital_id = activeHospitalId;
    if (search) params.search = search;

    patientService.getAllPatients(params)
      .then((res) => {
        if (res.success && res.data) {
          setPatients(res.data.items || []);
          setTotal(res.data.total || 0);
        } else {
          setError(res.message || "Failed to load patient records.");
        }
      })
      .catch((err) => {
        setError("Error connecting to patient logs. Check logs.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, [page, hospitalId, search, user]);

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    setAdmitError(null);
    setAddLoading(true);

    const activeHospitalId = user?.role === 'PHC_STAFF' ? user.hospital_id : patHospitalId;

    if (!activeHospitalId) {
      setAdmitError("Please select a target facility.");
      setAddLoading(false);
      return;
    }

    const payload = {
      hospital_id: activeHospitalId,
      patient_identifier: patId,
      age: parseInt(patAge) || 0,
      gender: patGender,
      disease: patDisease,
      visit_date: patVisitDate,
      status: patStatus
    };

    patientService.createPatient(payload)
      .then((res) => {
        if (res.success) {
          setIsAdmitModalOpen(false);
          // reset form
          setPatId('');
          setPatAge('');
          setPatGender('Male');
          setPatDisease('');
          setPatStatus('Admitted');
          fetchPatients();
        } else {
          setAdmitError(res.message || "Failed to admit patient.");
        }
      })
      .catch((err) => {
        setAdmitError("Error registering patient. Verify ID is unique.");
      })
      .finally(() => {
        setAddLoading(false);
      });
  };

  const headers = ["Patient ID", "Age", "Gender", "Clinical Diagnosis", "Admit Date", "Status", "Actions"];

  const renderRow = (p) => {
    const canEdit = user?.role === 'DISTRICT_ADMIN' || (user?.role === 'PHC_STAFF' && user?.hospital_id === p.hospital_id);

    return (
      <tr key={p.id} className="hover:bg-slate-50/50 transition text-xs text-slate-600 font-medium">
        <td className="px-5 py-4 font-bold text-slate-700">{p.patient_identifier}</td>
        <td className="px-5 py-4">{p.age} yrs</td>
        <td className="px-5 py-4">{p.gender}</td>
        <td className="px-5 py-4 font-bold text-slate-800">{p.disease}</td>
        <td className="px-5 py-4">{new Date(p.visit_date).toLocaleDateString()}</td>
        <td className="px-5 py-4">
          <StatusBadge status={p.status} />
        </td>
        <td className="px-5 py-4">
          {canEdit ? (
            <span className="text-[10px] font-bold text-teal-600 uppercase">Manage</span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase">Read Only</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Patient Logs & Telemetry</h2>
          <p className="text-xs text-slate-400 mt-0.5">District-wide patient registries and diagnostic records</p>
        </div>
        {user?.role !== 'GOV_HEALTH_OFFICER' && (
          <button
            onClick={() => setIsAdmitModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Admit Patient
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard title="Active Case Records" value={total} subtext="Admitted across district" icon={Users} colorClass="from-teal-500 to-emerald-500" />
        <StatCard title="Critical Diagnoses" value={patients.filter(p => p.status === 'Admitted').length} subtext="Requires bed allocations" icon={ShieldAlert} colorClass="from-amber-500 to-red-500" />
        <StatCard title="Average Clinic Volume" value="1.4K" subtext="District weekly log rates" icon={Heart} colorClass="from-teal-500 to-blue-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <FilterPanel onClear={() => { setHospitalId(''); setSearch(''); }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search patient ID or disease..." />
          {user?.role !== 'PHC_STAFF' && (
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500 max-w-sm"
            >
              <option value="">All District Facilities</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.hospital_name} ({h.hospital_type})</option>
              ))}
            </select>
          )}
          {user?.role === 'PHC_STAFF' && (
            <span className="text-[10px] uppercase font-bold text-slate-400 pl-3">
              Facility Filter Locked: Assigned Node Only
            </span>
          )}
        </FilterPanel>

        {error && <ErrorState message={error} />}

        {!error && (
          <DataTable
            headers={headers}
            items={patients}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            renderRow={renderRow}
            loading={loading}
          />
        )}
      </div>

      {/* Admit Patient Modal */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsAdmitModalOpen(false)} />
          
          <div className="relative glass-card w-full max-w-lg rounded-2xl border-slate-200/80 shadow-2xl p-6 text-left animate-fade-in-up">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Admit New Patient</h3>

            <form onSubmit={handleAdmitSubmit} className="space-y-4 mt-4">
              {admitError && (
                <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-700">
                  {admitError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Patient ID / Case Reference</label>
                  <input
                    type="text"
                    value={patId}
                    onChange={(e) => setPatId(e.target.value)}
                    placeholder="e.g. PAT-4491-X"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Clinical Diagnosis</label>
                  <input
                    type="text"
                    value={patDisease}
                    onChange={(e) => setPatDisease(e.target.value)}
                    placeholder="e.g. Malaria, Flu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Age</label>
                  <input
                    type="number"
                    value={patAge}
                    onChange={(e) => setPatAge(e.target.value)}
                    placeholder="e.g. 34"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Gender</label>
                  <select
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Admit Date</label>
                  <input
                    type="date"
                    value={patVisitDate}
                    onChange={(e) => setPatVisitDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Admission Status</label>
                  <select
                    value={patStatus}
                    onChange={(e) => setPatStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                  >
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              {/* Only show target facility selector for District Admin registers */}
              {user?.role !== 'PHC_STAFF' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Facility</label>
                  <select
                    value={patHospitalId}
                    onChange={(e) => setPatHospitalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>{h.hospital_name} ({h.hospital_type})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={admitLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {admitLoading ? "Registering..." : "Admit Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
