import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  History,
  Fingerprint
} from 'lucide-react';

const ViewLeaveRequest = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';

  // --- Logic to handle Prisma nested data ---
  const empName = data.user ? `${data.user.firstName} ${data.user.lastName}` : (data.name || 'Unknown');
  const leaveType = data.leaveType?.name || data.type || 'Standard Leave';
  const startDate = data.startDate ? new Date(data.startDate).toLocaleDateString() : (data.from || 'N/A');
  const endDate = data.endDate ? new Date(data.endDate).toLocaleDateString() : (data.to || 'N/A');

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    sectionHeader: "text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed] mb-4 flex items-center gap-2",
    infoBox: isDark ? "bg-[#020617] border-white/5" : "bg-slate-50 border-slate-100",
    label: "text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1",
    value: "text-sm font-bold",
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ";
    const s = status?.toUpperCase();
    if (s === 'APPROVED') return base + "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (s === 'PENDING') return base + "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (s === 'REJECTED') return base + "text-red-500 bg-red-500/10 border-red-500/20";
    return base + "text-slate-500 bg-slate-500/10 border-slate-500/20";
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-3xl rounded-[3rem] border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}>
        
        {/* Header Section */}
        <div className="p-8 border-b border-inherit bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                <User size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-2xl tracking-tighter">{empName}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={getStatusBadge(data.status)}>
                    {data.status}
                  </span>
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> {new Date(data.appliedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all active:scale-90">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          <div className="md:col-span-7 space-y-8">
            <div>
              <div className={styles.sectionHeader}><Calendar size={14} strokeWidth={3}/> Leave Duration</div>
              <div className={`grid grid-cols-2 gap-6 p-6 rounded-4xl border ${styles.infoBox}`}>
                <div>
                  <div className={styles.label}>Start Date</div>
                  <div className={styles.value}>{startDate}</div>
                </div>
                <div>
                  <div className={styles.label}>End Date</div>
                  <div className={styles.value}>{endDate}</div>
                </div>
                <div className="col-span-2 pt-5 mt-2 border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#94a3b8]">
                    <Fingerprint size={14} /> Leave Type: <span className="text-[#7c3aed]">{leaveType}</span>
                  </div>
                  <span className="text-xl font-black text-[#7c3aed]">{data.daysRequested || data.days} Days</span>
                </div>
              </div>
            </div>

            <div>
              <div className={styles.sectionHeader}><FileText size={14} strokeWidth={3}/> Employee Statement</div>
              <div className={`p-6 rounded-4xl border ${styles.infoBox}`}>
                <p className="text-sm leading-relaxed text-slate-400 italic">
                  "{data.reason || 'No specific reason provided for this request.'}"
                </p>
                {data.adminComment && (
                  <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <div className="text-[9px] font-black uppercase text-purple-500 mb-1">Admin Response</div>
                    <p className="text-xs text-slate-400">{data.adminComment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Approval Timeline */}
          <div className={`md:col-span-5 border-l ${isDark ? 'border-white/5' : 'border-slate-100'} pl-10`}>
            <div className={styles.sectionHeader}><History size={14} strokeWidth={3}/> Workflow Status</div>
            <div className="space-y-8 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#7c3aed]/10">
              
              <TimelineStep 
                icon={<CheckCircle2 size={14} />}
                title="Request Logged"
                subtitle={empName}
                date={new Date(data.appliedAt || Date.now()).toLocaleDateString()}
                status="completed"
                isDark={isDark} 
              />

              <TimelineStep 
                icon={data.status === 'PENDING' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                title="Admin Review"
                subtitle={data.status === 'PENDING' ? 'Awaiting Action' : 'Reviewed by Admin'}
                status={data.status === 'PENDING' ? 'active' : 'completed'}
                isDark={isDark}
              />

              <TimelineStep 
                icon={data.status === 'REJECTED' ? <AlertCircle size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                title="System Update"
                subtitle={data.status === 'APPROVED' ? 'Balance Deducted' : 'Workflow Finished'}
                status={data.status === 'PENDING' ? 'pending' : 'completed'}
                isLast
                isDark={isDark}
              />

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-8 border-t border-inherit flex justify-between items-center ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
            Internal Document • Reference #{data.id?.slice(0,8)}
          </div>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component (Internal)
const TimelineStep = ({ icon, title, subtitle, date, status, isLast, isDark }) => {
  const getColors = () => {
    if (status === 'completed') return 'bg-emerald-500 text-white border-emerald-500';
    if (status === 'active') return 'bg-amber-500 text-white border-amber-500 animate-pulse';
    return 'bg-slate-500/20 text-slate-500 border-transparent';
  };

  return (
    <div className="relative pl-10">
      <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-4 ${isDark ? 'border-[#0b1220]' : 'border-white'} ${getColors()} z-10 shadow-sm`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-black tracking-tight">{title}</div>
        <div className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tighter">{subtitle}</div>
        {date && <div className="text-[9px] text-[#7c3aed] font-black mt-1">{date}</div>}
      </div>
    </div>
  );
};

export default ViewLeaveRequest;