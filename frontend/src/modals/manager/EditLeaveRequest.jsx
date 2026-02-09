import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  MessageSquare,
  User,
  Info,
  Users,
  ShieldCheck
} from 'lucide-react';

const EditLeaveRequest = ({ isOpen, onClose, theme = 'dark', data }) => {
  const [formData, setFormData] = useState({
    status: '',
    managerNote: '',
    leaveType: '',
    startDate: '',
    endDate: ''
  });

  // --- Sync Data ---
  useEffect(() => {
    if (data) {
      setFormData({
        status: data.status || 'Pending',
        managerNote: '',
        leaveType: data.type || '',
        startDate: data.from || '',
        endDate: data.to || ''
      });
    }
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: theme === 'dark' 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: theme === 'dark'
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white"
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-2 block",
    readonlyBox: theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100",
  };

  const handleAction = (newStatus) => {
    // Logic for manager decision
    console.log(`Manager Decision - ${newStatus}:`, { 
      requestId: data.id, 
      ...formData, 
      status: newStatus,
      processedBy: "Dept Manager" 
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-2xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed]/10 text-[#7c3aed] rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Review Team Request</h3>
              <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2">
                Action Required <span className="w-1 h-1 rounded-full bg-[#7c3aed]"></span> {data.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Employee Profile Card */}
          <div className={`flex items-center justify-between p-5 rounded-2xl border ${styles.readonlyBox}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
                {data.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-black tracking-tight">{data.name}</div>
                <div className="text-[11px] font-bold text-[#94a3b8]">{data.email || 'team-member@company.com'}</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                data.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                data.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {data.status}
              </span>
            </div>
          </div>

          {/* Department Coverage Warning (Manager Specific) */}
          <div className="flex gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <Users size={20} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-1">Team Coverage Alert</p>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="font-black text-amber-500/90">2 other employees</span> from your department are already off during this period. Ensure project deadlines are not impacted.
              </p>
            </div>
          </div>

          {/* Request Adjustments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={styles.label}>Leave Type</label>
              <select 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.leaveType}
                onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
              >
                <option>Annual Leave</option>
                <option>Sick Leave</option>
                <option>Personal Leave</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Requested Duration</label>
              <div className={`w-full border rounded-2xl p-4 text-sm font-black ${styles.readonlyBox}`}>
                {data.days} Business Days
              </div>
            </div>
            <div>
              <label className={styles.label}>Start Date</label>
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className={styles.label}>End Date</label>
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* Decision Feedback */}
          <div>
            <label className={styles.label}>Manager's Decision Note</label>
            <textarea 
              rows="3"
              className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all resize-none ${styles.input}`}
              placeholder="e.g., 'Approved as project milestone is reached' or 'Rejected due to critical staffing shortage'..."
              value={formData.managerNote}
              onChange={(e) => setFormData({...formData, managerNote: e.target.value})}
            ></textarea>
          </div>

          {/* Balance Check */}
          <div className="flex items-center gap-3 px-5 py-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <Info size={18} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-500/80">Remaining Balance: <span className="font-black">14.5 Days</span></span>
          </div>
        </div>

        {/* Action Footer */}
        <div className={`p-8 border-t border-inherit flex flex-col md:flex-row justify-between gap-4 ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-[#94a3b8] hover:bg-white/5 transition-all"
          >
            Close Without Saving
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleAction('Rejected')}
              className="flex-1 md:flex-none bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <XCircle size={16} /> Decline
            </button>
            <button 
              onClick={() => handleAction('Approved')}
              className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Confirm Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveRequest;