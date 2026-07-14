import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Layers,
  Send,
  Plus
} from 'lucide-react';
import { syncService } from '../services/sync';
import { inventoryService } from '../services/inventory';

export default function SyncCenter() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Client-side offline request queue
  const [offlineQueue, setOfflineQueue] = useState([
    { id: "tx-901", table: "MedicineInventory", action: "UPDATE", details: "Increase ORS stock by 50 units", timestamp: "2026-07-06 22:30:00" }
  ]);

  // Form states for creating new offline transactions
  const [targetTable, setTargetTable] = useState('MedicineInventory');
  const [txDetails, setTxDetails] = useState('');

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchSyncHistory();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchSyncHistory = () => {
    setLoading(true);
    syncService.status()
      .then(res => {
        if (res?.success) setSyncHistory(res.data);
      })
      .catch(err => console.error("Error loading sync history logs", err))
      .finally(() => setLoading(false));
  };

  const handleAddOfflineTransaction = () => {
    if (!txDetails.trim()) return;

    const newTx = {
      id: 'tx-' + Date.now(),
      table: targetTable,
      action: "UPDATE",
      details: txDetails,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setOfflineQueue(prev => [...prev, newTx]);
    setTxDetails('');
  };

  const handleClearQueue = () => {
    setOfflineQueue([]);
  };

  const handleSyncNow = () => {
    if (!online || offlineQueue.length === 0) return;

    setSyncing(true);
    setSyncSuccess(false);

    // Map offline queue items to schema uploads
    const payload = offlineQueue.map(item => ({
      id: item.id,
      table: item.table,
      action: item.action,
      details: item.details,
      timestamp: item.timestamp
    }));

    syncService.upload(payload)
      .then(res => {
        if (res?.success) {
          setSyncSuccess(true);
          setOfflineQueue([]);
          fetchSyncHistory();
          setTimeout(() => setSyncSuccess(false), 5000);
        }
      })
      .catch(err => console.error("Error during upload synchronization run", err))
      .finally(() => setSyncing(false));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left"
    >
      {/* Sync Success Alert */}
      <AnimatePresence>
        {syncSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Synchronization complete. Changes reconciled and database caches updated.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Offline-First Engine</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-teal-400" /> Synchronization Center
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Safely queues data changes made during low connectivity, resolving conflicts chronologically on reconnection.
          </p>
        </div>
        <div className="flex gap-2">
          {online ? (
            <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
              <Wifi className="w-4 h-4" /> Live Connection
            </span>
          ) : (
            <span className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/10">
              <WifiOff className="w-4 h-4 animate-bounce" /> Offline Mode
            </span>
          )}
        </div>
      </div>

      {/* Sync split layout */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Pending Offline Queue Operations */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between flex-1">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Local Queue</span>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">Pending Sync queue</h3>
                </div>
                {offlineQueue.length > 0 && (
                  <button 
                    onClick={handleClearQueue}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase"
                  >
                    Clear Queue
                  </button>
                )}
              </div>

              {/* Transactions list */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                {offlineQueue.length > 0 ? (
                  offlineQueue.map((tx, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs gap-3">
                      <div>
                        <span className="font-bold text-slate-800 uppercase block text-[9px]">{tx.table} ({tx.action})</span>
                        <span className="text-slate-600 font-medium block mt-0.5">{tx.details}</span>
                        <span className="text-[9px] text-slate-400 block mt-1">{tx.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-2xl">
                    No pending mutations. All offline records synced.
                  </div>
                )}
              </div>

              {/* Mock logging a new offline change */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Log Offline Record (Mock)</span>
                <div className="flex gap-2">
                  <select
                    value={targetTable}
                    onChange={(e) => setTargetTable(e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="MedicineInventory">Medicine Inventory</option>
                    <option value="Patient">Patient File</option>
                    <option value="Doctor">Doctor Roster</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Log detail (e.g. Increase Paracetamol by 10)"
                    value={txDetails}
                    onChange={(e) => setTxDetails(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                  />
                  <button
                    onClick={handleAddOfflineTransaction}
                    className="p-2 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:opacity-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={syncing || !online || offlineQueue.length === 0}
              className="w-full py-2.5 bg-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95 transition mt-6 flex items-center justify-center gap-1.5 disabled:bg-slate-350"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Reconciling changes...' : 'Synchronize Queue'}
            </button>
          </div>
        </div>

        {/* Right Side: Reconnection Sync logs history */}
        <div className="lg:col-span-7 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audit Trail</span>
            <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1 mb-4">Synchronization History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 text-left">Sync ID</th>
                  <th className="pb-3 text-center">Direction</th>
                  <th className="pb-3 text-center">Records processed</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {syncHistory.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800">{row.sync_id}</td>
                    <td className="py-3 text-center font-medium text-blue-600">{row.direction}</td>
                    <td className="py-3 text-center font-semibold">{row.records_processed} items</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        row.status === 'SUCCESS' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-slate-400">{row.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
