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
  Edit3, // Changed Mail to Edit3
  Briefcase
} from 'lucide-react';

const ViewLeaveCalendar = ({ isOpen, onClose, onEdit, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] mb-4 flex items-center gap-2",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-xs text-[#94a3b8] mb-1",
    value: "text-sm font-semibold",
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays === 1 ? '1 Full Day' : `${diffDays} Days`;
  };

  const status = getStatusConfig(data.status);
  const fullName = `${data.user?.firstName} ${data.user?.lastName}`;
  const leaveTypeName = data.leaveType?.name || "General";
  const accentColor = data.leaveType?.color || '#7c3aed';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-lg rounded-3xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Background */}
        <div 
          className="h-24 relative" 
          style={{ background: `linear-gradient(to right, ${accentColor}, #a855f7)` }}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-10 mb-6">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl p-1 border-4 ${isDark ? 'bg-[#0b1220] border-[#0b1220]' : 'bg-white border-white'}`}>
                <div 
                  className="w-full h-full rounded-xl flex items-center justify-center text-white text-2xl font-black"
                  style={{ backgroundColor: accentColor }}
                >
                  {data.user?.firstName?.charAt(0)}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color} ${status.border}`}>
              {status.icon} {data.status}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold tracking-tight">{fullName}</h3>
            <div className="flex items-center gap-3 mt-1 text-[#94a3b8]">
              <div className="flex items-center gap-1 text-xs">
                <Briefcase size={12} /> {data.user?.designation || 'Staff Member'}
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-500/30"></div>
              <div className="flex items-center gap-1 text-xs">
                <MapPin size={12} /> {data.user?.department?.name || 'General Team'}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className={`p-4 rounded-2xl border ${styles.infoBox} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5" style={{ color: accentColor }}>
                  <Tag size={18} />
                </div>
                <div>
                  <div className={styles.label}>Leave Type</div>
                  <div className={styles.value}>{leaveTypeName} Leave</div>
                </div>
              </div>
              <div className="text-right">
                <div className={styles.label}>Duration</div>
                <div className="text-sm font-black" style={{ color: accentColor }}>
                  {calculateDuration(data.startDate, data.endDate)}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${styles.infoBox}`}>
              <div className={styles.sectionHeader}><Calendar size={12} /> Schedule</div>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1">From</div>
                  <div className="font-bold text-sm">{formatDate(data.startDate)}</div>
                </div>
                <div className="h-8 w-px bg-slate-500/20"></div>
                <div className="text-center flex-1">
                  <div className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1">To</div>
                  <div className="font-bold text-sm">{formatDate(data.endDate)}</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${styles.infoBox}`}>
              <div className={styles.sectionHeader}><FileText size={12} /> Reason / Comments</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed italic">
                {data.reason || `Employee is taking ${leaveTypeName.toLowerCase()} leave. Request logged and reflected in department capacity.`}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t border-inherit flex gap-3 ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            onClick={() => {
              if(onEdit) onEdit(data);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={14} /> Edit Leave
          </button>
          <button 
            onClick={onClose}
            className="flex-1 text-white py-3 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all"
            style={{ backgroundColor: accentColor }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveCalendar;