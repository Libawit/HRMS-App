import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Paperclip,
  History,
  Users,
  Briefcase,
  ExternalLink
} from 'lucide-react';

const ViewLeaveRequest = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: theme === 'dark' 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed] mb-4 flex items-center gap-2",
    infoBox: theme === 'dark' ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-bold text-[#94a3b8] uppercase mb-1",
    value: "text-sm font-bold",
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-4xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Manager Header */}
        <div className="p-8 border-b border-inherit bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                <User size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-2xl tracking-tight">{data.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs font-bold text-[#94a3b8]">
                  <span className="flex items-center gap-1.5"><Briefcase size={14}/> {data.department || 'Engineering'}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14}/> Applied: {data.appliedOn}</span>
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
                  <div className={styles.value}>{data.from}</div>
                </div>
                <div>
                  <div className={styles.label}>End Date</div>
                  <div className={styles.value}>{data.to}</div>
                </div>
                <div className="text-right">
                  <div className={styles.label}>Net Absence</div>
                  <div className="text-xl font-black text-[#7c3aed]">{data.days} Days</div>
                </div>
              </div>
            </section>

            {/* Manager Context: Team Conflict Check */}
            <section className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                  <Users size={14}/> Team Availability Context
                </div>
                <span className="text-[10px] font-bold text-amber-600/70 underline cursor-pointer">View Calendar</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-[#94a3b8] font-medium">
                    <span className="text-white font-bold">Overlapping:</span> Marcus V. is also away (Jan 15 - Jan 20)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <p className="text-[#94a3b8] font-medium">
                    <span className="text-white font-bold">Capacity:</span> 85% of department remains active
                  </p>
                </div>
              </div>
            </section>

            {/* Submission Reason */}
            <section>
              <div className={styles.sectionHeader}><FileText size={14}/> Employee Justification</div>
              <div className={`p-5 rounded-2xl border italic text-sm leading-relaxed ${styles.infoBox} text-[#94a3b8]`}>
                "{data.reason || 'No specific reason provided for this request.'}"
                {data.type === 'Sick Leave' && (
                  <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] text-[11px] font-black uppercase tracking-widest hover:bg-[#7c3aed]/20 transition-all">
                    <Paperclip size={14} /> Medical_Proof.pdf <ExternalLink size={12}/>
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Right: Balance & Audit Trail */}
          <div className="md:col-span-5 space-y-8">
            
            {/* Leave Balance Card */}
            <section>
              <div className={styles.sectionHeader}><CheckCircle2 size={14}/> Entitlement Status</div>
              <div className={`p-6 rounded-2xl border ${styles.infoBox} space-y-4`}>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-[#94a3b8]">Annual Allowance</span>
                  <span className="text-sm font-black">25 Days</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7c3aed]" style={{ width: '60%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className={styles.label}>Used</div>
                    <div className="text-sm font-black text-white">15.0</div>
                  </div>
                  <div className="text-right">
                    <div className={styles.label}>Remaining</div>
                    <div className="text-sm font-black text-emerald-500">10.0</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Workflow Timeline */}
            <section>
              <div className={styles.sectionHeader}><History size={14}/> Audit Trail</div>
              <div className="space-y-6 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                
                <div className="relative pl-9">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-xs font-black">Request Submitted</div>
                    <div className="text-[10px] text-[#94a3b8] font-bold mt-0.5">{data.appliedOn} • IP: 192.168.1.45</div>
                  </div>
                </div>

                <div className="relative pl-9">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border ${
                    data.status === 'Pending' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-emerald-500/20 border-emerald-500/30'
                  }`}>
                    {data.status === 'Pending' ? <Clock size={12} className="text-amber-500" /> : <CheckCircle2 size={12} className="text-emerald-500" />}
                  </div>
                  <div>
                    <div className="text-xs font-black">Manager Validation</div>
                    <div className="text-[10px] text-[#94a3b8] font-bold mt-0.5">
                      {data.status === 'Pending' ? 'Pending Dept Review' : 'Verified by Manager Sarah'}
                    </div>
                  </div>
                </div>

                <div className="relative pl-9">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#94a3b8]">HR/Payroll Export</div>
                    <div className="text-[10px] text-[#94a3b8] font-bold mt-0.5">Awaiting Final Approval</div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-8 border-t border-inherit flex justify-between items-center ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-[#94a3b8]">
            <AlertCircle size={14}/>
            <span>Visible to Department Admin Only</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveRequest;