import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Paperclip,
  History,
  Briefcase,
  ExternalLink,
  Info
} from 'lucide-react';

const ViewLeaveRequest = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed] mb-4 flex items-center gap-2",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-bold text-[#94a3b8] uppercase mb-1",
    value: "text-sm font-bold",
  };

  // --- Helper: Format Dates Safely ---
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    switch(s) {
      case 'APPROVED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'REJECTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-4xl rounded-3xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-8 border-b border-inherit bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                <User size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-2xl tracking-tight">
                    {data.user?.firstName} {data.user?.lastName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs font-bold text-[#94a3b8]">
                  <span className="flex items-center gap-1.5"><Briefcase size={14}/> {data.leaveType?.name || 'Leave Request'}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14}/> ID: LR-{data.id?.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[65vh] overflow-y-auto">
          
          {/* Left: Operational Details */}
          <div className="md:col-span-7 space-y-8">
            
            {/* Timeline & Duration */}
            <section>
              <div className={styles.sectionHeader}><Calendar size={14}/> Leave Parameters</div>
              <div className={`grid grid-cols-3 gap-4 p-5 rounded-2xl border ${styles.infoBox}`}>
                <div>
                  <div className={styles.label}>Start Date</div>
                  <div className={styles.value}>{formatDate(data.startDate)}</div>
                </div>
                <div>
                  <div className={styles.label}>End Date</div>
                  <div className={styles.value}>{formatDate(data.endDate)}</div>
                </div>
                <div className="text-right">
                  <div className={styles.label}>Total Days</div>
                  <div className="text-xl font-black text-[#7c3aed]">{data.daysRequested}</div>
                </div>
              </div>
            </section>

            {/* Submission Reason */}
            <section>
              <div className={styles.sectionHeader}><FileText size={14}/> My Justification</div>
              <div className={`p-5 rounded-2xl border italic text-sm leading-relaxed ${styles.infoBox} text-[#94a3b8]`}>
                "{data.reason || 'No specific reason provided for this request.'}"
                {data.documentUrl && (
                  <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] text-[11px] font-black uppercase tracking-widest hover:bg-[#7c3aed]/20 transition-all">
                    <Paperclip size={14} /> View Attachment <ExternalLink size={12}/>
                  </button>
                )}
              </div>
            </section>

            {/* Note for Employee */}
            <section className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest mb-2">
                <Info size={14}/> Request Note
              </div>
              <p className="text-xs font-medium text-[#94a3b8] leading-relaxed">
                Once a request is <span className="text-emerald-500 font-bold">Approved</span> or <span className="text-red-500 font-bold">Rejected</span>, it cannot be modified. If you need to make changes to a pending request, please delete it and submit a new one.
              </p>
            </section>
          </div>

          {/* Right: Balance & Audit Trail */}
          <div className="md:col-span-5 space-y-8">
            
            {/* Audit Trail */}
            <section>
              <div className={styles.sectionHeader}><History size={14}/> Application Timeline</div>
              <div className="space-y-6 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                
                {/* Applied */}
                <div className="relative pl-9">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-xs font-black">Request Submitted</div>
                    <div className="text-[10px] text-[#94a3b8] font-bold mt-0.5">
                      {formatDate(data.appliedAt)}
                    </div>
                  </div>
                </div>

                {/* Manager Review */}
                <div className="relative pl-9">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border ${
                    data.status === 'Pending' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-emerald-500/20 border-emerald-500/30'
                  }`}>
                    {data.status === 'Pending' ? <Clock size={12} className="text-amber-500" /> : <CheckCircle2 size={12} className="text-emerald-500" />}
                  </div>
                  <div>
                    <div className="text-xs font-black">Department Review</div>
                    <div className="text-[10px] text-[#94a3b8] font-bold mt-0.5">
                      {data.status === 'Pending' ? 'Awaiting Manager Review' : `Processed on ${formatDate(new Date())}`}
                    </div>
                  </div>
                </div>

                {/* Final Status */}
                <div className="relative pl-9">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border ${
                    data.status === 'Pending' ? 'bg-white/5 border-white/10' : 
                    data.status === 'Approved' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${data.status === 'Pending' ? 'bg-white/30' : 'bg-current'}`}></div>
                  </div>
                  <div>
                    <div className={`text-xs font-black ${data.status === 'Pending' ? 'text-[#94a3b8]' : ''}`}>Payroll Integration</div>
                    <div className="text-[10px] text-[#94a3b8] font-bold mt-0.5">
                      {data.status === 'Approved' ? 'Synched with Attendance' : 'No Action Required'}
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-8 border-t border-inherit flex justify-between items-center ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-[#94a3b8]">
            <AlertCircle size={14}/>
            <span>Employee Record ID: {data.user?.employeeId || 'N/A'}</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveRequest;