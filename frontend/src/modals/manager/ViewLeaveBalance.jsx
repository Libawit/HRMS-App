import React from 'react';
import { X, Calendar, User, Clock, History, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';

const ViewLeaveBalance = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]" 
      : "bg-white border-slate-200 text-[#1e293b] shadow-xl",
    sectionHeader: "text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed] mb-5 flex items-center gap-2",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: `text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`,
    value: "text-sm font-black",
  };

  // Logic: Get initials for avatar
  const initials = data.name ? data.name.split(' ').map(n => n[0]).join('') : '?';

  // Mock history data (In a real app, this would come from props or a fetch)
  const adjustmentHistory = [
    { id: 1, date: '2026-01-10', type: 'Used', amount: -2.0, reason: 'Annual Vacation', by: 'Admin' },
    { id: 2, date: '2026-01-01', type: 'Carried Over', amount: 5.0, reason: 'Year End Rollover', by: 'System' },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-2xl rounded-[2.5rem] border ${styles.card} overflow-hidden animate-in fade-in zoom-in duration-300`}>
        
        {/* Header: Profile Focus */}
        <div className={`p-8 border-b border-inherit flex items-center justify-between ${isDark ? 'bg-linear-to-r from-transparent to-white/2' : 'bg-linear-to-r from-transparent to-slate-50'}`}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-purple-500/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-2xl tracking-tighter">{data.name}</h3>
                <ShieldCheck size={18} className="text-[#7c3aed]" />
              </div>
              <p className="text-xs font-bold opacity-50 tracking-wide uppercase">{data.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-3 rounded-2xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-10">
          
          {/* Summary Cards: Bento Box Style */}
          <div>
            <div className={styles.sectionHeader}>
              <Clock size={14} strokeWidth={3} /> Core Entitlements ({data.year})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-5 rounded-4xl border ${styles.infoBox}`}>
                <div className={styles.label}>Allocated</div>
                <div className={styles.value}>{data.alloc.toFixed(1)} <span className="text-[10px] opacity-40">DAYS</span></div>
              </div>
              <div className={`p-5 rounded-4xl border ${styles.infoBox}`}>
                <div className={styles.label}>Used</div>
                <div className="text-sm font-black text-red-500">{data.used.toFixed(1)} <span className="text-[10px] opacity-40 text-red-500/50">DAYS</span></div>
              </div>
              <div className={`p-5 rounded-4xl border ${styles.infoBox}`}>
                <div className={styles.label}>Carry Over</div>
                <div className="text-sm font-black text-orange-500">{data.carry.toFixed(1)} <span className="text-[10px] opacity-40 text-orange-500/50">DAYS</span></div>
              </div>
              <div className="p-5 rounded-4xl border border-[#7c3aed]/30 bg-[#7c3aed]/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform">
                    <History size={40} />
                </div>
                <div className="text-[10px] text-[#7c3aed] mb-1 font-black uppercase tracking-widest relative z-10">Available</div>
                <div className="text-2xl font-black text-[#7c3aed] relative z-10">{data.avail.toFixed(1)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Configuration Column */}
            <div>
              <div className={styles.sectionHeader}>Record Context</div>
              <div className="space-y-4">
                <div className={`flex justify-between items-center p-4 rounded-2xl border ${styles.infoBox}`}>
                  <span className="text-xs font-bold opacity-50 uppercase">Leave Category</span>
                  <span className="text-xs font-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px] shadow-inherit" style={{ background: data.color, boxShadow: `0 0 10px ${data.color}80` }}></span>
                    {data.type}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-2xl border ${styles.infoBox}`}>
                  <span className="text-xs font-bold opacity-50 uppercase">Fiscal Period</span>
                  <span className="text-xs font-black uppercase tracking-widest">{data.year} - {parseInt(data.year) + 1}</span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-2xl border ${styles.infoBox}`}>
                  <span className="text-xs font-bold opacity-50 uppercase">Sync Status</span>
                  <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-tighter">Live Data</span>
                </div>
              </div>
            </div>

            {/* History Column */}
            <div>
              <div className={styles.sectionHeader}>
                <History size={14} strokeWidth={3} /> Timeline
              </div>
              <div className="space-y-3">
                {adjustmentHistory.map((log) => (
                  <div key={log.id} className={`p-4 rounded-2xl border ${styles.infoBox} flex items-center justify-between transition-all hover:scale-[1.02]`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${log.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {log.amount > 0 ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-xs font-black tracking-tight">{log.reason}</div>
                        <div className="text-[9px] font-bold opacity-40 uppercase tracking-wider">{log.date} • {log.by}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-black ${log.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {log.amount > 0 ? '+' : ''}{log.amount.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-8 border-t border-inherit flex justify-end ${isDark ? 'bg-white/2' : 'bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
          >
            Dismiss View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveBalance;