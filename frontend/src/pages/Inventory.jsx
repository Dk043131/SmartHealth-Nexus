import React, { useState, useEffect } from 'react';
import { Plus, Package, ShieldAlert, Thermometer, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventory';
import { hospitalService } from '../services/hospital';
import { 
  StatCard, 
  StatusBadge, 
  DataTable, 
  SearchBar, 
  FilterPanel, 
  ErrorState 
} from '../components/common';

export default function Inventory() {
  const { user } = useAuth();
  
  // Data lists
  const [inventories, setInventories] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [hospitalId, setHospitalId] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [availableQty, setAvailableQty] = useState(0);
  const [reservedQty, setReservedQty] = useState(0);
  const [updateError, setUpdateError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Admin Modal: Create Global Drug Master
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [medCode, setMedCode] = useState('');
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState('');
  const [medUnit, setMedUnit] = useState('tablets');
  const [medMinStock, setMedMinStock] = useState(100);
  const [medDesc, setMedDesc] = useState('');
  const [addError, setAddError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  const limit = 10;

  // Fetch Hospitals list
  useEffect(() => {
    hospitalService.getAllHospitals({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) {
          setHospitals(res.data.items || []);
        }
      })
      .catch((err) => console.error("Error fetching hospitals", err));
  }, []);

  const fetchInventory = () => {
    setLoading(true);
    setError(null);
    
    // Default filter PHC_STAFF to their assigned hospital
    let activeHospitalId = hospitalId;
    if (user?.role === 'PHC_STAFF' && user?.hospital_id) {
      activeHospitalId = user.hospital_id;
    }

    const params = {
      skip: (page - 1) * limit,
      limit
    };
    if (activeHospitalId) params.hospital_id = activeHospitalId;
    
    // Note: dynamic name searches require catalog joins, which the generic multi query does.
    // If search is supplied, we will fetch inventory or catalog master.
    inventoryService.getInventory(params)
      .then((res) => {
        if (res.success && res.data) {
          setInventories(res.data.items || []);
          setTotal(res.data.total || 0);
        } else {
          setError(res.message || "Failed to load inventory.");
        }
      })
      .catch((err) => {
        setError("Error loading inventory database. Check connection.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, [page, hospitalId, user]);

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateLoading(true);

    inventoryService.updateInventory(selectedInventory.id, {
      available_quantity: availableQty,
      reserved_quantity: reservedQty
    })
      .then((res) => {
        if (res.success) {
          setIsUpdateModalOpen(false);
          fetchInventory();
        } else {
          setUpdateError(res.message || "Failed to modify counts.");
        }
      })
      .catch((err) => {
        setUpdateError("Failed to update inventory.");
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  const handleAddMedicineSubmit = (e) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    inventoryService.createMedicine({
      medicine_code: medCode,
      medicine_name: medName,
      category: medCategory,
      unit: medUnit,
      minimum_stock: medMinStock,
      description: medDesc
    })
      .then((res) => {
        if (res.success) {
          setIsAddModalOpen(false);
          // reset form
          setMedCode('');
          setMedName('');
          setMedCategory('');
          setMedUnit('tablets');
          setMedMinStock(100);
          setMedDesc('');
          fetchInventory();
        } else {
          setAddError(res.message || "Failed to add medicine.");
        }
      })
      .catch((err) => {
        setAddError("Duplicate medicine code or verification error.");
      })
      .finally(() => {
        setAddLoading(false);
      });
  };

  const openUpdateModal = (inv) => {
    setSelectedInventory(inv);
    setAvailableQty(inv.available_quantity);
    setReservedQty(inv.reserved_quantity);
    setIsUpdateModalOpen(true);
  };

  const headers = ["Medicine Code", "Medicine Name", "Category", "Unit", "Available Stock", "Reserved", "Stock State", "Actions"];

  const renderRow = (inv) => {
    const med = inv.medicine || { medicine_code: "-", medicine_name: "Generic Drug", category: "General", unit: "unit", minimum_stock: 100 };
    const isCritical = inv.available_quantity < med.minimum_stock;
    const statusText = isCritical ? "LOW STOCK" : "ACTIVE";

    // Enforce write access rules on edit buttons:
    // District Admin can edit anything. Staff can edit only their assigned hospital inventory.
    const canEdit = user?.role === 'DISTRICT_ADMIN' || (user?.role === 'PHC_STAFF' && user?.hospital_id === inv.hospital_id);

    return (
      <tr key={inv.id} className="hover:bg-slate-50/50 transition text-xs text-slate-600 font-medium">
        <td className="px-5 py-4 font-bold text-slate-700">{med.medicine_code}</td>
        <td className="px-5 py-4 font-bold text-slate-800">{med.medicine_name}</td>
        <td className="px-5 py-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-semibold">{med.category}</span></td>
        <td className="px-5 py-4 uppercase font-bold text-[10px] text-slate-400">{med.unit}</td>
        <td className="px-5 py-4 font-bold text-slate-800">{inv.available_quantity}</td>
        <td className="px-5 py-4">{inv.reserved_quantity}</td>
        <td className="px-5 py-4">
          <StatusBadge status={statusText} />
        </td>
        <td className="px-5 py-4">
          {canEdit ? (
            <button
              onClick={() => openUpdateModal(inv)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition cursor-pointer"
            >
              Update Qty
            </button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase">Read Only</span>
          )}
        </td>
      </tr>
    );
  };

  // Calculate stats
  const totalVolume = inventories.reduce((sum, inv) => sum + inv.available_quantity, 0);
  const uniqueItems = new Set(inventories.map(inv => inv.medicine_id)).size;
  const criticalShortages = inventories.filter(inv => inv.available_quantity < (inv.medicine?.minimum_stock || 100)).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Medicine Stock Logistics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Unified inventory telemetry for district pharmaceuticals</p>
        </div>
        {user?.role === 'DISTRICT_ADMIN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Drug Master
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard title="Total Available Stock Volume" value={totalVolume} subtext="Aggregated drug units" icon={Package} colorClass="from-teal-500 to-emerald-500" />
        <StatCard title="Unique Medicines In Catalog" value={uniqueItems} subtext="Tracked pharmaceutical codes" icon={RefreshCcw} colorClass="from-blue-500 to-indigo-500" />
        <StatCard title="Shortage Warning Nodes" value={`${criticalShortages} Alerts`} subtext="Under minimum stock threshold" icon={ShieldAlert} colorClass="from-amber-500 to-red-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <FilterPanel onClear={() => { setHospitalId(''); setSearch(''); }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search drugs..." />
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
            items={inventories}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            renderRow={renderRow}
            loading={loading}
          />
        )}
      </div>

      {/* Update Stock Modal */}
      {isUpdateModalOpen && selectedInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsUpdateModalOpen(false)} />
          
          <div className="relative glass-card w-full max-w-md rounded-2xl border-slate-200/80 shadow-2xl p-6 text-left animate-fade-in-up">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Update Stock Level</h3>
            <p className="text-xs text-slate-400 mt-1">
              Updating {selectedInventory.medicine?.medicine_name} for facility.
            </p>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
              {updateError && (
                <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-700">
                  {updateError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Available Quantity</label>
                <input
                  type="number"
                  value={availableQty}
                  onChange={(e) => setAvailableQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Reserved Quantity</label>
                <input
                  type="number"
                  value={reservedQty}
                  onChange={(e) => setReservedQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                  required
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Master Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          
          <div className="relative glass-card w-full max-w-lg rounded-2xl border-slate-200/80 shadow-2xl p-6 text-left animate-fade-in-up">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Add Global Medicine Definition</h3>

            <form onSubmit={handleAddMedicineSubmit} className="space-y-4 mt-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-700">
                  {addError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Medicine Code</label>
                  <input
                    type="text"
                    value={medCode}
                    onChange={(e) => setMedCode(e.target.value)}
                    placeholder="e.g. PARACETAMOL-500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Medicine Name</label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
                  <input
                    type="text"
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    placeholder="e.g. Analgesic, Antibiotics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Unit Type</label>
                  <input
                    type="text"
                    value={medUnit}
                    onChange={(e) => setMedUnit(e.target.value)}
                    placeholder="tablets, vials"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Minimum Stock Threshold</label>
                <input
                  type="number"
                  value={medMinStock}
                  onChange={(e) => setMedMinStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
                <textarea
                  value={medDesc}
                  onChange={(e) => setMedDesc(e.target.value)}
                  placeholder="Clinical usage instructions, chemical notes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:border-teal-500 h-20"
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
                  disabled={addLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {addLoading ? "Creating..." : "Create Drug"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
