import React from 'react';
import { 
  X, Clock, Calendar, MapPin, User, 
  CheckCircle2, Timer, LogOut, LogIn, 
  ArrowRight, MessageSquare // Added icon for notes
} from 'lucide-react';

const ViewAttendanceRecord = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';
  
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1 block",
    value: "text-sm font-bold",
    // Note specific style
    noteBox: isDark ? "bg-purple-500/5 border-purple-500/10" : "bg-purple-50 border-purple-100"
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'On Time': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Late': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Absent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-2xl rounded-3xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-6 border-b border-inherit bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] border border-[#7c3aed]/20">
                <User size={28} />
              </div>
              <div>
                <h3 className="font-bold text-xl">{data.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                  <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                    <Calendar size={12} /> {data.date}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          
          {/* Left Side: Shift Summary & Notes */}
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${styles.infoBox}`}>
              <div className="flex items-center gap-2 text-[#7c3aed] mb-4 font-bold text-xs uppercase tracking-tighter">
                <Timer size={14} /> Shift Breakdown
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><LogIn size={16}/></div>
                    <div>
                      <div className={styles.label}>Check In</div>
                      <div className={styles.value}>{data.checkIn || '--:--'}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#94a3b8]" />
                  <div className="text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <div>
                        <div className={styles.label}>Check Out</div>
                        <div className={styles.value}>{data.checkOut || '--:--'}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><LogOut size={16}/></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-[#94a3b8]">Effective Hours:</span>
                  <span className="text-lg font-black text-[#7c3aed]">
                    {data.workHours ? `${data.workHours}h` : '0h'}
                  </span>
                </div>
              </div>
            </div>

            {/* --- NEW INTERNAL NOTE SECTION --- */}
            <div className={`p-4 rounded-2xl border ${styles.noteBox}`}>
              <div className="flex items-center gap-2 text-purple-500 mb-2 font-bold text-[10px] uppercase tracking-widest">
                <MessageSquare size={12} /> Internal Note / Reason
              </div>
              <p className={`text-sm italic leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {data.note || "No additional notes provided for this record."}
              </p>
            </div>
            {/* --------------------------------- */}

            <div className={`p-4 rounded-2xl border ${styles.infoBox}`}>
              <div className={styles.label}>Log Metadata</div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin size={14} className="text-[#94a3b8]" />
                  <span>Main Office (HQ)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Verified Log</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Timeline Visualization */}
          <div className={`p-4 rounded-2xl border ${styles.infoBox} flex flex-col`}>
             <div className="flex items-center gap-2 text-[#7c3aed] mb-6 font-bold text-xs uppercase tracking-tighter">
                <Clock size={14} /> Day Timeline
              </div>

              <div className="flex-1 space-y-8 relative before:content-[''] before:absolute before:left-3.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                <div className="relative pl-10">
                  <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center z-10">
                    <LogIn size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Punch In</div>
                    <div className="text-[10px] text-[#94a3b8]">Entry recorded at {data.checkIn || '--:--'}</div>
                  </div>
                </div>

                <div className="relative pl-10">
                  <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center z-10">
                    <LogOut size={14} className="text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Punch Out</div>
                    <div className="text-[10px] text-[#94a3b8]">Exit recorded at {data.checkOut || '--:--'}</div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t border-inherit flex justify-end gap-3 ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] text-white px-10 py-2.5 rounded-xl text-sm font-bold hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAttendanceRecord;