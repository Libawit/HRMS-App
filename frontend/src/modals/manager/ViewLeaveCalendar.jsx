import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  MapPin,
  Mail,
  Briefcase,
  ShieldCheck,
  Edit3,
  TrendingDown
} from 'lucide-react';

const ViewLeaveCalendar = ({ isOpen, onClose, theme = 'dark', data, onEdit }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-black uppercase tracking-[0.15em] text-[#94a3b8] mb-4 flex items-center gap-2",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-tighter mb-1",
    value: "text-sm font-bold",
  };

  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={14}/> };
      case 'pending': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock size={14}/> };
      case 'rejected': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <AlertCircle size={14}/> };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <AlertCircle size={14}/> };
    }
  };

  const status = getStatusConfig(data.status);

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-[2.5rem] border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}>
        
        {/* Banner with Manager Badge */}
        <div className="h-32 bg-linear-to-br from-[#7c3aed] to-[#4f46e5] relative p-6">
          <div className="flex justify-between items-start">
             <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                <ShieldCheck size={12} className="text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Managerial View</span>
             </div>
             <button 
               onClick={onClose} 
               className="p-2 rounded-full bg-black/20 text-white hover:bg-red-500 transition-all active:scale-90"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Profile Card Overlay */}
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-8">
            <div className="relative">
              <div className={`w-24 h-24 rounded-3xl ${isDark ? 'bg-[#0b1220]' : 'bg-white'} p-1.5 border-[6px] ${isDark ? 'border-[#0b1220]' : 'border-white'} shadow-xl`}>
                <div className="w-full h-full rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white text-3xl font-black shadow-inner">
                  {data.name?.charAt(0)}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest shadow-sm ${status.bg} ${status.color} ${status.border}`}>
              {status.icon} {data.status}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-black tracking-tight leading-none mb-2">{data.name}</h3>
            <div className="flex items-center gap-4 text-[#94a3b8]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                <Briefcase size={14} className="text-[#7c3aed]" /> Senior Dev
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                <MapPin size={14} className="text-[#7c3aed]" /> Engineering
              </div>
            </div>
          </div>

          {/* Managerial Insights Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className={`p-5 rounded-3xl border ${styles.infoBox} flex items-center justify-between shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <div className={styles.label}>Policy Entitlement</div>
                  <div className="text-md font-black">{data.type} Leave</div>
                </div>
              </div>
              <div className="text-right">
                <div className={styles.label}>Calculated Cost</div>
                <div className="text-sm font-black text-[#7c3aed]">1.0 Leave Day</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-5 rounded-3xl border ${styles.infoBox}`}>
                <div className={styles.sectionHeader}><Calendar size={12} /> Date range</div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black uppercase tracking-tighter opacity-50">Effective</span>
                  <span className="text-sm font-black">Jan {data.day}, 2026</span>
                </div>
              </div>
              <div className={`p-5 rounded-3xl border border-amber-500/10 bg-amber-500/5`}>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-500/70 mb-4 flex items-center gap-2">
                   <TrendingDown size={12} /> Team Capacity
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black uppercase tracking-tighter text-amber-500/50">Post-Absence</span>
                  <span className="text-sm font-black text-amber-600">84% Staffed</span>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-3xl border ${styles.infoBox}`}>
              <div className={styles.sectionHeader}><FileText size={12} /> Managerial Notes</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed font-medium">
                The leave record for {data.name} is synchronized with the Engineering deployment schedule. No conflicts with Sprint 4 milestones were detected at the time of entry.
              </p>
            </div>
          </div>
        </div>

        {/* Manager Actions Footer */}
        <div className={`p-8 border-t border-inherit flex gap-4 ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            className={`flex-1 py-4 rounded-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'} text-xs font-black uppercase tracking-[0.15em] hover:bg-white/5 transition-all flex items-center justify-center gap-2`}
          >
            <Mail size={16} /> Contact Dev
          </button>
          <button 
            onClick={() => { onClose(); if(onEdit) onEdit(data); }}
            className="flex-1 bg-[#7c3aed] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:bg-[#6d28d9] shadow-xl shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={16} /> Modify Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveCalendar;