import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Paperclip,
  History,
  Info
} from 'lucide-react';

const ViewLeaveRequest = ({ isOpen, onClose, theme = 'dark', data }) => {
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
    value: "text-sm font-black",
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'Approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-3xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header: Personalized for Employee */}
        <div className="p-8 border-b border-inherit bg-linear-to-r from-transparent to-[#7c3aed]/5 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <FileText size={28} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight uppercase italic">{data.type} Details</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusConfig(data.status)}`}>
                  {data.status}
                </span>
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> Ref: #LR-00{data.id}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10 max-h-[70vh] overflow-y-auto">
          
          {/* Left: Request Details */}
          <div className="md:col-span-7 space-y-8">
            <div>
              <div className={styles.sectionHeader}><Calendar size={14} className="text-[#7c3aed]"/> Time Period</div>
              <div className={`grid grid-cols-2 gap-6 p-6 rounded-2xl border ${styles.infoBox}`}>
                <div>
                  <div className={styles.label}>Start Date</div>
                  <div className={styles.value}>{data.from}</div>
                </div>
                <div>
                  <div className={styles.label}>End Date</div>
                  <div className={styles.value}>{data.to}</div>
                </div>
                <div className="col-span-2 pt-5 mt-2 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <div className={styles.label}>Chargeable Balance</div>
                    <div className="text-2xl font-black text-[#7c3aed] leading-none">{data.days} Days</div>
                  </div>
                  <div className="text-right">
                    <div className={styles.label}>Deduction Status</div>
                    <div className="text-[10px] font-bold text-emerald-500 uppercase">On Approval</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className={styles.sectionHeader}><Info size={14} className="text-[#7c3aed]"/> My Submission Notes</div>
              <div className={`p-6 rounded-2xl border ${styles.infoBox} bg-linear-to-b from-transparent to-white/5`}>
                <p className="text-sm leading-relaxed text-[#94a3b8] italic font-medium">
                  "{data.reason || 'No specific notes were provided for this request.'}"
                </p>
                {data.type.includes('Sick') && (
                  <div className="mt-5 flex items-center justify-between p-3 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/10">
                    <div className="flex items-center gap-2 text-[#7c3aed]">
                      <Paperclip size={14} />
                      <span className="text-[11px] font-black uppercase tracking-tighter">Medical_Proof.pdf</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Attached</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Approval Timeline (Read-Only Status) */}
          <div className="md:col-span-5 border-l border-inherit pl-8">
            <div className={styles.sectionHeader}><History size={14} className="text-[#7c3aed]"/> Live Progress</div>
            <div className="space-y-8 relative before:content-[''] before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#7c3aed]/10">
              
              {/* Step 1: Submission */}
              <div className="relative pl-9">
                <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase italic">Request Sent</div>
                  <div className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tight">{data.appliedOn}</div>
                </div>
              </div>

              {/* Step 2: Manager Review */}
              <div className="relative pl-9">
                <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  data.status === 'Pending' ? 'bg-[#0b1220] border-amber-500' : 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20'
                }`}>
                  {data.status === 'Pending' ? (
                    <Clock size={12} className="text-amber-500 animate-pulse" />
                  ) : (
                    <CheckCircle2 size={12} className="text-white" />
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase italic">Manager Approval</div>
                  <div className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tight">
                    {data.status === 'Pending' ? 'In Review Pipeline' : 'Verified by HR/Admin'}
                  </div>
                </div>
              </div>

              {/* Step 3: Final Status */}
              <div className="relative pl-9">
                <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  data.status === 'Rejected' ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20' : 
                  data.status === 'Approved' ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-[#0b1220] border-white/10'
                }`}>
                  {data.status === 'Rejected' ? <AlertCircle size={12} className="text-white" /> : 
                   data.status === 'Approved' ? <CheckCircle2 size={12} className="text-white" /> :
                   <div className="w-1 h-1 rounded-full bg-white/20"></div>}
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase italic text-inherit">System Finalization</div>
                  <div className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tight">
                    {data.status === 'Pending' ? 'Pending Completion' : `Status: ${data.status}`}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer: Simple Closure */}
        <div className={`p-8 border-t border-inherit flex justify-end items-center ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mr-auto">Read-only View</p>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveRequest;