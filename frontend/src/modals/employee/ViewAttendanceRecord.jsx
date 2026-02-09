import React from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  AlertCircle, 
  Timer,
  LogOut,
  LogIn,
  ShieldCheck,
  History,
  FileText,
  HelpCircle
} from 'lucide-react';

const ViewAttendanceRecord = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';
  
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-1.5 block",
    value: "text-sm font-bold font-mono"
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'On Time': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Late': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Absent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-3xl rounded-[2.5rem] border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit bg-linear-to-br from-[#7c3aed]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
                  <User size={32} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#0b1220] rounded-full flex items-center justify-center">
                   <ShieldCheck size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-2xl tracking-tight">Attendance Details</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(data.status)}`}>
                    {data.status}
                  </span>
                  <span className="text-xs font-bold text-[#94a3b8] flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#7c3aed]" /> {data.date}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          {/* Main Statistics */}
          <div className="lg:col-span-3 space-y-6">
            <div className={`p-6 rounded-3xl border ${styles.infoBox} relative overflow-hidden`}>
              <div className="flex items-center gap-2 text-[#7c3aed] mb-6 font-black text-[10px] uppercase tracking-[0.2em]">
                <Timer size={14} /> Shift Summary
              </div>
              
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><LogIn size={20}/></div>
                  <div>
                    <div className={styles.label}>My Clock In</div>
                    <div className="text-xl font-black">{data.checkIn}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><LogOut size={20}/></div>
                  <div>
                    <div className={styles.label}>My Clock Out</div>
                    <div className="text-xl font-black">{data.checkOut}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end">
                <div>
                    <div className={styles.label}>Calculated Work Hours</div>
                    <div className="text-3xl font-black text-[#7c3aed] tracking-tighter">{data.workHours}</div>
                </div>
                <div className="text-right">
                    <div className={styles.label}>Verification</div>
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest italic">Digital Signature Verified</div>
                </div>
              </div>
            </div>

            {/* System Log Info */}
            <div className={`p-6 rounded-3xl border ${styles.infoBox}`}>
              <div className="flex items-center gap-2 text-amber-500 mb-4 font-black text-[10px] uppercase tracking-[0.2em]">
                <History size={14} /> System Records
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                    <p className="text-[11px] leading-relaxed text-[#94a3b8] font-medium">
                        Log recorded via <b>Biometric Terminal 04</b>. Your shift data is synchronized with the central HR database.
                    </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${styles.infoBox} flex flex-col`}>
             <div className="flex items-center gap-2 text-[#7c3aed] mb-10 font-black text-[10px] uppercase tracking-[0.2em]">
                <Clock size={14} /> My Activity
              </div>

              <div className="flex-1 space-y-12 relative before:content-[''] before:absolute before:left-3.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-emerald-500 before:to-red-500">
                <div className="relative pl-12">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#0b1220] border-2 border-emerald-500 flex items-center justify-center z-10">
                    <LogIn size={12} className="text-emerald-500" />
                  </div>
                  <div className="text-sm font-black italic">Shift Started</div>
                  <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{data.checkIn}</div>
                </div>

                <div className="relative pl-12">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#0b1220] border-2 border-red-500 flex items-center justify-center z-10">
                    <LogOut size={12} className="text-red-500" />
                  </div>
                  <div className="text-sm font-black italic">Shift Ended</div>
                  <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{data.checkOut}</div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <MapPin size={16} className="text-[#94a3b8]" />
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Main Office Campus</span>
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-8 border-t border-inherit flex items-center justify-between ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-xs font-black uppercase tracking-widest group">
            <AlertCircle size={16} className="group-hover:animate-pulse" /> Dispute Entry
          </button>
          
          <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-[#94a3b8] hover:bg-white/5 transition-all"
              >
                Close
              </button>
              <button 
                className="bg-[#7c3aed] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <FileText size={16} /> Download Slip
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAttendanceRecord;