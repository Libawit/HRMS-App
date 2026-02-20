import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Info,
  History
} from 'lucide-react';

const ViewLeaveCalendar = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-black uppercase tracking-[0.15em] text-[#94a3b8] mb-4 flex items-center gap-2",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1",
    value: "text-sm font-black",
  };

  // --- Helpers ---
  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={14}/> };
      case 'pending': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock size={14}/> };
      case 'rejected': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <AlertCircle size={14}/> };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <AlertCircle size={14}/> };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays === 1 ? '1 Full Day' : `${diffDays} Days Total`;
  };

  const status = getStatusConfig(data.status);
  const leaveTypeName = data.leaveType?.name || "General";
  const accentColor = data.leaveType?.color || '#7c3aed';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-md rounded-[2.5rem] border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Decorative Header */}
        <div 
          className="h-32 relative flex items-end p-8" 
          style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }}
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
          
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white mb-2`}>
              {status.icon} {data.status}
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Leave Details</h3>
          </div>
        </div>

        <div className="p-8 space-y-6">
          
          {/* Main Info Card */}
          <div className={`p-5 rounded-3xl border ${styles.infoBox} flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                <Tag size={24} />
              </div>
              <div>
                <div className={styles.label}>Category</div>
                <div className={styles.value}>{leaveTypeName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={styles.label}>Duration</div>
              <div className="text-sm font-black text-[#7c3aed]">
                {calculateDuration(data.startDate, data.endDate)}
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-3">
            <div className={styles.sectionHeader}><Calendar size={12} /> Leave Schedule</div>
            <div className="grid grid-cols-2 gap-px bg-slate-500/10 rounded-3xl overflow-hidden border border-white/5">
              <div className={`p-4 ${styles.infoBox} border-none`}>
                <div className={styles.label}>Start Date</div>
                <div className="text-xs font-bold">{formatDate(data.startDate)}</div>
              </div>
              <div className={`p-4 ${styles.infoBox} border-none`}>
                <div className={styles.label}>End Date</div>
                <div className="text-xs font-bold">{formatDate(data.endDate)}</div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="space-y-3">
            <div className={styles.sectionHeader}><FileText size={12} /> My Request Note</div>
            <div className={`p-5 rounded-3xl border border-dashed ${styles.border} ${isDark ? 'bg-white/2' : 'bg-slate-50'}`}>
              <p className="text-xs text-[#94a3b8] leading-relaxed italic">
                "{data.reason || `No specific comments provided for this ${leaveTypeName.toLowerCase()} leave request.`}"
              </p>
            </div>
          </div>

          {/* System Info */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <Info size={16} className="text-blue-500 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-[#94a3b8]">
              This record is officially <strong>{data.status.toLowerCase()}</strong>. Any changes to approved leaves must be handled via the HR helpdesk.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className={`p-8 pt-0 flex gap-3`}>
          <button 
            onClick={onClose}
            className="w-full text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all hover:brightness-110"
            style={{ backgroundColor: accentColor }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveCalendar;