import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Info,
  Loader2,
  Clock,
  MessageSquare
} from 'lucide-react';
import axios from '../../utils/axiosConfig';

const EditLeaveRequest = ({ isOpen, onClose, theme = 'dark', data, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    adminComment: '', // Keep key same as backend 'adminComment' or change to 'managerComment'
    leaveTypeId: '',
    startDate: '',
    endDate: ''
  });

  // --- Sync Data when modal opens ---
  useEffect(() => {
    if (data) {
      setFormData({
        status: data.status || 'PENDING',
        adminComment: data.adminComment || '',
        leaveTypeId: data.leaveTypeId || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : ''
      });
    }
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
    readonlyBox: isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100",
  };

  // --- Handle Status Update ---
  const handleUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const daysRequested = calculateDays(formData.startDate, formData.endDate);

      // We use the same status update endpoint used by admin
      await axios.patch(
        `http://localhost:5000/api/auth/leave-requests/${data.id}/status`, 
        { 
          status: newStatus,
          startDate: formData.startDate,
          endDate: formData.endDate,
          adminComment: formData.adminComment, // Sending manager's feedback
          daysRequested: daysRequested 
        }
      );
      
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Manager Update failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    // Check if original data was half-day to maintain consistency
    if (data.isHalfDay) return 0.5;
    const diff = new Date(end) - new Date(start);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const displayName = data.user ? `${data.user.firstName} ${data.user.lastName}` : (data.name || 'User');

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-2xl rounded-[2.5rem] border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#7c3aed]/10 text-[#7c3aed] rounded-2xl">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Team Review</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Departmental Request ID: #{data.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Employee Identity Card */}
          <div className={`flex items-center justify-between p-5 rounded-3xl border ${styles.readonlyBox}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white font-black text-lg uppercase">
                {displayName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-black">{displayName}</div>
                <div className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">
                  {data.user?.employeeId || 'Team Member'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border ${
                data.status?.toUpperCase() === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                data.status?.toUpperCase() === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {data.status}
              </span>
            </div>
          </div>

          {/* Timing Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={styles.label}>Requested Start Date</label>
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className={styles.label}>Requested End Date</label>
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                disabled={data.isHalfDay}
              />
            </div>
          </div>

          {/* Content Row */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={styles.label}>Employee's Reason</label>
              <div className={`p-5 rounded-2xl border italic text-sm ${styles.readonlyBox} text-slate-500 flex gap-3`}>
                <MessageSquare size={18} className="shrink-0 opacity-50" />
                "{data.reason || 'No reason provided.'}"
              </div>
            </div>

            <div>
              <label className={styles.label}>Manager Feedback / Remarks</label>
              <textarea 
                rows="3"
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all resize-none ${styles.input}`}
                placeholder="Add internal notes or feedback for the employee..."
                value={formData.adminComment}
                onChange={(e) => setFormData({...formData, adminComment: e.target.value})}
              />
            </div>
          </div>

          {/* Informational Footer */}
          <div className="flex gap-3 p-4 bg-[#7c3aed]/5 border border-[#7c3aed]/10 rounded-2xl">
            <Info size={18} className="text-[#7c3aed] shrink-0" />
            <p className="text-[10px] text-[#7c3aed]/80 font-bold uppercase tracking-tight leading-relaxed">
              Approving this will deduct <span className="text-[#7c3aed]">{calculateDays(formData.startDate, formData.endDate)} days</span> from their {data.leaveType?.name || 'Leave'} balance.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className={`p-8 border-t border-inherit flex justify-between items-center ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            type="button" 
            onClick={onClose}
            className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all"
          >
            Cancel Review
          </button>
          
          <div className="flex gap-3">
            <button 
              disabled={loading}
              onClick={() => handleUpdate('REJECTED')}
              className="bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <XCircle size={16} strokeWidth={3} /> Reject
            </button>
            <button 
              disabled={loading}
              onClick={() => handleUpdate('APPROVED')}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} strokeWidth={3} />}
              Approve Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveRequest;