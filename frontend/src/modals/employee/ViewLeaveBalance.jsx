import React from 'react';
import { X, Calendar, PieChart, Clock, History, ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';

const ViewLeaveBalance = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: theme === 'dark' 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[11px] font-black uppercase tracking-[0.15em] text-[#94a3b8] mb-5 flex items-center gap-2",
    infoBox: theme === 'dark' ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-200/60",
    label: "text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1",
    value: "text-base font-black",
  };

  // Mock usage history specifically for this employee
  const adjustmentHistory = [
    { id: 1, date: 'Jan 10, 2026', type: 'Deduction', amount: -2.0, reason: 'Approved Leave Request #LV-902', status: 'Completed' },
    { id: 2, date: 'Jan 01, 2026', type: 'Credit', amount: 5.0, reason: 'Annual Rollover from 2025', status: 'System' },
    { id: 3, date: 'Jan 01, 2026', type: 'Credit', amount: 30.0, reason: 'Yearly Allocation Grant', status: 'System' },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-2xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-5">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: data.color }}
            >
              <PieChart size={28} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight uppercase italic">{data.type}</h3>
              <p className="text-xs font-bold text-[#94a3b8] flex items-center gap-2">
                <Calendar size={12} className="text-[#7c3aed]" /> FISCAL YEAR {data.year}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-10 overflow-y-auto max-h-[75vh]">
          
          {/* Real-time Balance Grid */}
          <div>
            <div className={styles.sectionHeader}>
              <Clock size={14} className="text-[#7c3aed]" /> My Current Balance
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border ${styles.infoBox}`}>
                <div className={styles.label}>Allocation</div>
                <div className={styles.value}>{data.alloc.toFixed(1)}</div>
              </div>
              <div className={`p-5 rounded-2xl border ${styles.infoBox}`}>
                <div className={styles.label}>Carry Over</div>
                <div className="text-base font-black text-orange-400">+{data.carry.toFixed(1)}</div>
              </div>
              <div className={`p-5 rounded-2xl border ${styles.infoBox}`}>
                <div className={styles.label}>Used</div>
                <div className="text-base font-black text-red-400">-{data.used.toFixed(1)}</div>
              </div>
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Available</div>
                <div className="text-2xl font-black text-emerald-500 leading-none">{data.avail.toFixed(1)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Policy Context */}
            <div>
              <div className={styles.sectionHeader}>Policy Details</div>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${styles.infoBox} flex items-start gap-3`}>
                    <Info size={16} className="text-[#7c3aed] mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-[#94a3b8]">
                        This balance is valid from <strong>January 1st</strong> to <strong>December 31st, {data.year}</strong>. 
                        A maximum of 5 days can be carried over to the next year.
                    </p>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-[#94a3b8]">Accrual Type</span>
                  <span className="text-xs font-black uppercase">Annual Grant</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-[#94a3b8]">Status</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black uppercase">Active</span>
                </div>
              </div>
            </div>

            {/* History Section */}
            <div>
              <div className={styles.sectionHeader}>
                <History size={14} className="text-[#7c3aed]" /> Activity Log
              </div>
              <div className="space-y-3">
                {adjustmentHistory.map((log) => (
                  <div key={log.id} className={`p-4 rounded-2xl border ${styles.infoBox} flex items-center justify-between group hover:border-[#7c3aed]/30 transition-all`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {log.amount > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div className="text-xs font-black leading-tight mb-1">{log.reason}</div>
                        <div className="text-[10px] font-bold text-[#94a3b8] uppercase">{log.date}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-black ${log.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {log.amount > 0 ? '+' : ''}{log.amount.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-8 border-t border-inherit flex justify-end ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className="w-full md:w-auto bg-[#7c3aed] text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveBalance;