import React from 'react';
import { X, Shield, Download, Trash2, Clock, Smartphone, Globe, CheckCircle2 } from 'lucide-react';

const ViewActivity = ({ isOpen, onClose, activity, theme = 'dark' }) => {
  if (!isOpen || !activity) return null;

  const isDark = theme === 'dark';
  const styles = {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10" : "bg-white border-slate-200",
    textMain: isDark ? "text-white" : "text-slate-900",
    item: isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`w-full max-w-md rounded-[2.5rem] border p-8 ${styles.card} animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7c3aed1a] text-[#7c3aed] rounded-lg"><Shield size={20}/></div>
            <h3 className={`text-xl font-bold ${styles.textMain}`}>Event Details</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl"><X size={20} className="text-[#94a3b8]"/></button>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border ${styles.item} flex items-center gap-4`}>
            <Clock size={18} className="text-[#7c3aed]" />
            <div>
              <p className="text-[10px] font-black text-[#94a3b8] uppercase">Timestamp</p>
              <p className={`text-sm font-bold ${styles.textMain}`}>{new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${styles.item} flex items-center gap-4`}>
            <Smartphone size={18} className="text-[#7c3aed]" />
            <div>
              <p className="text-[10px] font-black text-[#94a3b8] uppercase">Origin Device</p>
              <p className={`text-sm font-bold ${styles.textMain}`}>{activity.device}</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${styles.item} flex items-center gap-4`}>
            <Globe size={18} className="text-[#7c3aed]" />
            <div>
              <p className="text-[10px] font-black text-[#94a3b8] uppercase">IP Address</p>
              <p className={`text-sm font-bold ${styles.textMain}`}>192.168.1.104 (San Francisco, US)</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white transition-all">
            <Download size={16} /> Export PDF
          </button>
          <button className="flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all">
            <Trash2 size={16} /> Delete Entry
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <CheckCircle2 size={10} className="text-emerald-500" /> Secure System Audit Log
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewActivity;