import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  MapPin,
  Briefcase,
  Info
} from 'lucide-react';

const ViewLeaveCalendar = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] mb-4 flex items-center gap-2",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] uppercase font-bold text-[#94a3b8] mb-1",
    value: "text-sm font-semibold",
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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-lg rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Background */}
        <div className="h-28 bg-linear-to-br from-[#7c3aed] to-[#4f46e5] relative flex items-end px-6 pb-4">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Info size={12} /> Leave Entry Ref: #LV-{data.day}2026
          </div>
        </div>

        {/* Profile/Status Summary */}
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-start -mt-8 mb-6">
            <div className="w-20 h-20 rounded-3xl bg-[#0b1220] p-1.5 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black italic">
                {data.name?.charAt(0)}
              </div>
            </div>
            <div className={`mt-10 flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-tighter ${status.bg} ${status.color} ${status.border}`}>
              {status.icon} {data.status}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-black tracking-tight">{data.name}</h3>
            <div className="flex items-center gap-4 mt-2 text-[#94a3b8]">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Briefcase size={14} className="text-[#7c3aed]" /> Senior Developer
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <MapPin size={14} className="text-[#7c3aed]" /> Engineering
              </div>
            </div>
          </div>

          {/* Read-Only Details Grid */}
          <div className="space-y-4">
            <div className={`p-5 rounded-3xl border ${styles.infoBox} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <div className={styles.label}>Category</div>
                  <div className="text-sm font-bold uppercase tracking-tight">{data.type} Leave</div>
                </div>
              </div>
              <div className="text-right">
                <div className={styles.label}>Impact</div>
                <div className="text-xs font-black text-emerald-500 uppercase italic">Full Day</div>
              </div>
            </div>

            <div className={`p-5 rounded-3xl border ${styles.infoBox}`}>
              <div className={styles.sectionHeader}><Calendar size={14} className="text-[#7c3aed]" /> Scheduled Dates</div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className={styles.label}>Start Date</div>
                  <div className="font-bold text-sm">Jan {data.day}, 2026</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <div className="w-4 h-px bg-[#94a3b8]/30"></div>
                </div>
                <div className="flex-1 text-right">
                  <div className={styles.label}>End Date</div>
                  <div className="font-bold text-sm">Jan {data.day}, 2026</div>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-3xl border ${styles.infoBox} bg-linear-to-br from-transparent to-white/5`}>
              <div className={styles.sectionHeader}><FileText size={14} className="text-[#7c3aed]" /> My Comments</div>
              <p className="text-sm text-[#94a3b8] leading-relaxed italic font-medium">
                "I have logged this {data.type.toLowerCase()} leave for my personal commitments. The request has been synchronized with the team's capacity planner."
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t border-inherit ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className="w-full bg-[#7c3aed] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all"
          >
            Back to My Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveCalendar;