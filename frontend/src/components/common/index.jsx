import React from 'react';
import { 
  Search, 
  Filter, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Database
} from 'lucide-react';

// ==========================================
// 1. StatCard
// ==========================================
export function StatCard({ title, value, subtext, icon: Icon, colorClass = "from-teal-500 to-blue-600" }) {
  return (
    <div className="glass-card rounded-2xl p-5 border-slate-200/80 shadow-sm flex flex-col justify-between h-36 relative group overflow-hidden transition duration-300 hover:-translate-y-0.5">
      <div className="flex justify-between items-start">
        <div className="text-left space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{title}</span>
          <span className="block text-2xl font-extrabold text-slate-800 tracking-tight">{value}</span>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${colorClass} text-white flex items-center justify-center shadow-md`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="text-left text-xs font-semibold text-slate-400 border-t border-slate-100/80 pt-3">
        {subtext}
      </div>
    </div>
  );
}

// ==========================================
// 2. StatusBadge
// ==========================================
export function StatusBadge({ status, type = "default" }) {
  const getStyles = () => {
    const s = String(status).toUpperCase();
    if (s === "ACTIVE" || s === "OPERATIONAL" || s === "AVAILABLE" || s === "PRESENT" || s === "COMPLETED" || s === "RESOLVED") {
      return "bg-emerald-50 border-emerald-200/60 text-emerald-700";
    }
    if (s === "WARNING" || s === "PENDING" || s === "INVESTIGATING" || s === "LOW STOCK") {
      return "bg-amber-50 border-amber-200/60 text-amber-700";
    }
    if (s === "OFFLINE" || s === "CRITICAL" || s === "DISPATCHED" || s === "REJECTED" || s === "CANCELLED" || s === "DELETED") {
      return "bg-red-50 border-red-200/60 text-red-700";
    }
    if (s === "DISTRICT_ADMIN" || s === "ADMIN") {
      return "bg-indigo-50 border-indigo-200/60 text-indigo-700";
    }
    if (s === "GOV_HEALTH_OFFICER" || s === "OFFICER") {
      return "bg-blue-50 border-blue-200/60 text-blue-700";
    }
    return "bg-slate-50 border-slate-200/60 text-slate-700";
  };

  return (
    <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStyles()}`}>
      {status ? status.replace("_", " ") : "Unknown"}
    </span>
  );
}

// ==========================================
// 3. LoadingSpinner
// ==========================================
export function LoadingSpinner({ message = "Synchronizing district data..." }) {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">{message}</span>
    </div>
  );
}

// ==========================================
// 4. SearchBar
// ==========================================
export function SearchBar({ value, onChange, placeholder = "Search registers..." }) {
  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
        <Search className="w-4 h-4" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 text-xs font-medium transition"
      />
    </div>
  );
}

// ==========================================
// 5. FilterPanel
// ==========================================
export function FilterPanel({ children, onClear }) {
  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filters
        </span>
        <div className="flex flex-wrap gap-3 items-center">
          {children}
        </div>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 transition"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ==========================================
// 6. DataTable
// ==========================================
export function DataTable({ headers, items, total, page, limit, onPageChange, renderRow, loading }) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!items || items.length === 0) {
    return <EmptyState />;
  }

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="glass-card rounded-2xl border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              {headers.map((h, idx) => (
                <th key={idx} className="px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => renderRow(item, idx))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-700">{startIdx}-{endIdx}</strong> of{" "}
            <strong className="text-slate-700">{total}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. EmptyState
// ==========================================
export function EmptyState({ title = "No records found", message = "No matching telemetry logs exist in this district node." }) {
  return (
    <div className="w-full py-16 px-4 glass-card rounded-2xl border-slate-200/80 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4 border border-teal-100/50">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h3>
      <p className="text-slate-400 text-xs max-w-sm mt-1 leading-normal">{message}</p>
    </div>
  );
}

// ==========================================
// 8. ErrorState
// ==========================================
export function ErrorState({ message = "Failed to communicate with district command center. Please verify server endpoints." }) {
  return (
    <div className="w-full p-6 bg-red-50/50 border border-red-100 rounded-2xl flex gap-3 text-left">
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">Sync Error</h4>
        <p className="text-xs text-red-700 leading-normal mt-0.5">{message}</p>
      </div>
    </div>
  );
}

// ==========================================
// 9. ConfirmationModal
// ==========================================
export function ConfirmationModal({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to perform this action? This operation cannot be undone." }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Box */}
      <div className="relative glass-card w-full max-w-md rounded-2xl border-slate-200/80 shadow-2xl p-6 text-left animate-fade-in-up">
        <div className="flex gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0 border border-red-100/50">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-normal">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/10"
          >
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}
