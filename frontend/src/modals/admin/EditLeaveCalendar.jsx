import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, Calendar, Save, CheckCircle2, 
  Loader2, Trash2, MessageSquare, Info 
} from 'lucide-react';

const EditLeaveCalendar = ({ isOpen, onClose, theme = 'dark', data, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: 'APPROVED'
  });

  // Improved date formatting to prevent "one day off" timezone bugs
  const formatForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        startDate: formatForInput(data.startDate),
        endDate: formatForInput(data.endDate),
        status: 'APPROVED'
      });
    }
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    
    // Simple validation
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    setLoading(true);
    try {
      // API call sends new dates and recalculates daysRequested for the backend
      await axios.patch(`http://localhost:3000/api/auth/leave-requests/${data.id}/status`, {
        status: 'APPROVED',
        startDate: formData.startDate,
        endDate: formData.endDate,
        daysRequested: calculateDays(formData.startDate, formData.endDate)
      });
      
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to update leave entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this leave record permanently?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/auth/leave-requests/${data.id}`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
    readonlyBox: isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100",
  };

  const displayName = data.user ? `${data.user.firstName} ${data.user.lastName}` : 'User';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-2xl rounded-[2.5rem] border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#7c3aed]/10 text-[#7c3aed] rounded-2xl">
              <Calendar size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Edit Approved Leave</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Modify Dates for Request #{data.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all">
              <Trash2 size={20} strokeWidth={2.5} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Employee Card */}
          <div className={`flex items-center justify-between p-5 rounded-3xl border ${styles.readonlyBox}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white font-black text-lg">
                {displayName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-black">{displayName}</div>
                <div className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">
                  {data.leaveType?.name || 'Leave Request'}
                </div>
              </div>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={12} strokeWidth={3} /> Approved
            </div>
          </div>

          {/* Editable Timing Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={styles.label}>Start Date</label>
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className={styles.label}>End Date</label>
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* Reason Display */}
          <div>
            <label className={styles.label}>Original Reason</label>
            <div className={`p-5 rounded-2xl border italic text-sm ${styles.readonlyBox} text-slate-500 flex gap-3`}>
              <MessageSquare size={18} className="shrink-0 opacity-50" />
              "{data.reason || 'No reason provided.'}"
            </div>
          </div>

          {/* Info Footer */}
          <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <Info size={18} className="text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-tight leading-relaxed">
              Updating these dates will recalculate used balance. 
              New Total: <span className="text-amber-500">{calculateDays(formData.startDate, formData.endDate)} days</span>.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className={`p-8 border-t border-inherit flex justify-between items-center ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
          <button 
            type="button" 
            onClick={onClose}
            className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-all"
          >
            Cancel Changes
          </button>
          
          <button 
            disabled={loading}
            onClick={handleUpdate}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={3} />}
            Save Modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveCalendar;