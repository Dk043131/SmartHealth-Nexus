import React, { useState, useEffect } from 'react';
import { Plus, Building2, MapPin, Activity, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hospitalService } from '../services/hospital';
import { 
  StatCard, 
  StatusBadge, 
  DataTable, 
  SearchBar, 
  FilterPanel, 
  ErrorState, 
  EmptyState 
} from '../components/common';

export default function Hospitals() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter & Search states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [district, setDistrict] = useState('');

  // Modal State for adding hospital
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [hospitalCode, setHospitalCode] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState('PHC');
  const [districtVal, setDistrictVal] = useState('');
  const [taluk, setTaluk] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [modalError, setModalError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const limit = 10;

  const fetchHospitals = () => {
    setLoading(true);
    setError(null);
    const params = {
      skip: (page - 1) * limit,
      limit,
      order_by: "created_at"
    };
    if (search) params.search = search;
    if (type) params.hospital_type = type;
    if (district) params.district = district;

    hospitalService.getAllHospitals(params)
      .then((res) => {
        if (res.success && res.data) {
          setHospitals(res.data.items || []);
          setTotal(res.data.total || 0);
        } else {
          setError(res.message || "Failed to load facilities.");
        }
      })
      .catch((err) => {
        setError("Error connecting to server. Please check database logs.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHospitals();
  }, [page, search, type, district]);

  const handleAddHospitalSubmit = (e) => {
    e.preventDefault();
    setModalError(null);
    setSubmitLoading(true);

    const payload = {
      hospital_code: hospitalCode,
      hospital_name: hospitalName,
      hospital_type: hospitalType,
      district: districtVal,
      taluk,
      address,
      phone,
      email
    };

    hospitalService.createHospital(payload)
      .then((res) => {
        if (res.success) {
          setIsAddModalOpen(false);
          // Reset forms
          setHospitalCode('');
          setHospitalName('');
          setHospitalType('PHC');
          setDistrictVal('');
          setTaluk('');
          setAddress('');
          setPhone('');
          setEmail('');
          fetchHospitals();
        } else {
          setModalError(res.message || "Conflict registering facility.");
        }
      })
      .catch((err) => {
        setModalError(err.response?.data?.message || "Duplicate code or database constraints error.");
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  const headers = ["Facility Code", "Facility Name", "Type", "Location", "Phone", "Status", "Registry Date"];

  const renderRow = (h) => (
    <tr key={h.id} className="hover:bg-slate-50/50 transition text-xs text-slate-600 font-medium">
      <td className="px-5 py-4 font-bold text-slate-700">{h.hospital_code}</td>
      <td className="px-5 py-4 font-bold text-slate-800">{h.hospital_name}</td>
      <td className="px-5 py-4"><StatusBadge status={h.hospital_type} /></td>
      <td className="px-5 py-4">
        <span className="block">{h.taluk}</span>
        <span className="block text-[10px] text-slate-400 font-semibold uppercase">{h.district}</span>
      </td>
      <td className="px-5 py-4">{h.phone || '-'}</td>
      <td className="px-5 py-4"><StatusBadge status={h.status} /></td>
      <td className="px-5 py-4">{new Date(h.created_at).toLocaleDateString()}</td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">District Care Facilities</h2>
          <p className="text-xs text-slate-400 mt-0.5">Register, monitor, and telemetrically track PHCs & CHCs</p>
        </div>
        {user?.role === 'DISTRICT_ADMIN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Facility Node
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard title="Total Connected Facilities" value={total} subtext="Registered in district registry" icon={Building2} colorClass="from-teal-500 to-emerald-500" />
        <StatCard title="Active PHC Nodes" value={hospitals.filter(h => h.hospital_type === 'PHC').length} subtext="Primary Health Centres" icon={MapPin} colorClass="from-blue-500 to-indigo-500" />
        <StatCard title="Active CHC Nodes" value={hospitals.filter(h => h.hospital_type === 'CHC').length} subtext="Community Health Centres" icon={Activity} colorClass="from-teal-500 to-blue-600" />
      </div>

      {/* Filters & search */}
      <div className="flex flex-col gap-4">
        <FilterPanel onClear={() => { setType(''); setDistrict(''); setSearch(''); }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or code..." />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
          >
            <option value="">All Types</option>
            <option value="PHC">PHC (Primary Care)</option>
            <option value="CHC">CHC (Community Care)</option>
          </select>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Filter district..."
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500 max-w-[130px]"
          />
        </FilterPanel>

        {error && <ErrorState message={error} />}

        {/* Data Table */}
        {!error && (
          <DataTable
            headers={headers}
            items={hospitals}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            renderRow={renderRow}
            loading={loading}
          />
        )}
      </div>

      {/* Register Hospital Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          
          <div className="relative glass-card w-full max-w-lg rounded-2xl border-slate-200/80 shadow-2xl p-6 text-left animate-fade-in-up">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Register New District Facility Node</h3>
            
            <form onSubmit={handleAddHospitalSubmit} className="space-y-4 mt-4">
              {modalError && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-700">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Facility Code</label>
                  <input
                    type="text"
                    value={hospitalCode}
                    onChange={(e) => setHospitalCode(e.target.value)}
                    placeholder="e.g. H-PHC-04"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Facility Name</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Srinagar PHC Centre"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Facility Type</label>
                  <select
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                  >
                    <option value="PHC">PHC (Primary Care)</option>
                    <option value="CHC">CHC (Community Care)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">District</label>
                  <input
                    type="text"
                    value={districtVal}
                    onChange={(e) => setDistrictVal(e.target.value)}
                    placeholder="e.g. Srinagar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Taluk</label>
                  <input
                    type="text"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    placeholder="e.g. West Srinagar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9998887770"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street details, landmarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@srinagar-phc.gov"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {submitLoading ? "Registering..." : "Add Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
