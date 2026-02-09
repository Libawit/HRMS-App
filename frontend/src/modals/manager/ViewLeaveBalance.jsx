import React from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  History, 
  ArrowDownRight, 
  ArrowUpRight,
  Briefcase,
  AlertCircle
} from 'lucide-react';

const ViewLeaveBalance = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: theme === 'dark' 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed] mb-4 flex items-center gap-2",
    infoBox: theme === 'dark' ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-bold text-[#94a3b8] uppercase mb-1",
    value: "text-sm font-bold",
  };

  // Mock history data relevant for manager review
  const adjustmentHistory = [
    { id: 1, date: '2026-01-10', type: 'Used', amount: -2.0, reason: 'Annual Vacation', by: 'Mgr. Sarah' },
    { id: 2, date: '2026-01-01', type: 'System', amount: 5.0, reason: 'Year End Rollover', by: 'Auto-System' },
  ];

  const utilizationPercentage = Math.min(((data.used / (data.alloc + data.carry)) * 100), 100);

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-3xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header Section */}
        <div className="p-8 border-b border-inherit bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 font-black text-xl">
                {data.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-2xl tracking-tight">{data.name}</h3>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#94a3b8]">
                    <Briefcase size={14} /> {data.department || 'Engineering'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#94a3b8]">
                    <User size={14} /> ID: {data.employeeId || 'EMP-9920'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10 max-h-[70vh] overflow-y-auto">
          
          {/* Left: Balance Breakdown */}
          <div className="md:col-span-7 space-y-8">
            <section>
              <div className={styles.sectionHeader}><Clock size={14} /> Entitlement Status</div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${styles.infoBox}`}>
                  <div className={styles.label}>Allocated</div>
                  <div className={styles.value}>{data.alloc.toFixed(1)}</div>
                </div>
                <div className={`p-4 rounded-2xl border ${styles.infoBox}`}>
                  <div className={styles.label}>Carried</div>
                  <div className={styles.value}>{data.carry.toFixed(1)}</div>
                </div>
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
                  <div className="text-[10px] font-bold text-red-400 uppercase mb-1">Used</div>
                  <div className="text-sm font-bold text-red-500">{data.used.toFixed(1)}</div>
                </div>
              </div>

              {/* Utilization Visual */}
              <div className={`p-6 rounded-2xl border ${styles.infoBox}`}>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-bold">Total Utilization</span>
                  <span className="text-xl font-black text-[#7c3aed]">{data.avail.toFixed(1)} <span className="text-[10px] text-[#94a3b8] uppercase">Days Left</span></span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-linear-to-r from-[#7c3aed] to-purple-400" 
                    style={{ width: `${100 - utilizationPercentage}%` }}
                  />
                </div>
                <p className="mt-3 text-[10px] text-[#94a3b8] font-medium italic">
                  * Employee has consumed {utilizationPercentage.toFixed(0)}% of their annual leave.
                </p>
              </div>
            </section>

            <section>
              <div className={styles.sectionHeader}><Calendar size={14} /> Configuration</div>
              <div className={`p-5 rounded-2xl border ${styles.infoBox} space-y-4`}>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94a3b8] font-bold">Leave Policy</span>
                  <span className="font-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: data.color }}></span>
                    {data.type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94a3b8] font-bold">Period</span>
                  <span className="font-black">Fiscal Year {data.year}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right: History & Context */}
          <div className="md:col-span-5 space-y-8">
            <section>
              <div className={styles.sectionHeader}><History size={14} /> Audit Trail</div>
              <div className="space-y-3">
                {adjustmentHistory.map((log) => (
                  <div key={log.id} className={`p-4 rounded-2xl border ${styles.infoBox} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {log.amount > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div className="text-xs font-black">{log.reason}</div>
                        <div className="text-[10px] text-[#94a3b8] font-bold">{log.date} • {log.by}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-black ${log.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {log.amount > 0 ? '+' : ''}{log.amount.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Manager Alert Box */}
            <section className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
               <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest mb-2">
                  <AlertCircle size={14} /> Manager Note
               </div>
               <p className="text-[11px] text-[#94a3b8] font-bold leading-relaxed">
                  This employee has <span className="text-white">1 pending request</span> for 3 days. If approved, available balance will drop to <span className="text-amber-500">{(data.avail - 3).toFixed(1)} days.</span>
               </p>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-8 border-t border-inherit flex justify-between items-center ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
             Ref: {data.id}/{data.year}
          </div>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
          >
            Finished Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveBalance;