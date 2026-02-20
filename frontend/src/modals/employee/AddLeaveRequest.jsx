import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, AlertCircle, FileText, User, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const AddLeaveRequest = ({ isOpen, onClose, theme = 'dark', currentUser, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false
  });

  const isDark = theme === 'dark';

  // --- Scoped Fetching for Leave Types ---
  useEffect(() => {
    if (isOpen) {
      const fetchLeaveTypes = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/leave-types');
          setLeaveTypes(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };
      fetchLeaveTypes();
    }
  }, [isOpen]);

  // --- Logic: Calculate Days Requested ---
  const daysRequested = useMemo(() => {
    if (!formData.startDate || (!formData.isHalfDay && !formData.endDate)) return 0;
    if (formData.isHalfDay) return 0.5;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  }, [formData.startDate, formData.endDate, formData.isHalfDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (daysRequested <= 0) return alert("Please select a valid date range");
    
    setLoading(true);
    const payload = {
      userId: currentUser?.id,
      leaveTypeId: formData.leaveTypeId,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.isHalfDay ? formData.startDate : formData.endDate).toISOString(),
      daysRequested: daysRequested,
      reason: formData.reason,
      status: 'PENDING'
    };

    try {
      await axios.post('http://localhost:5000/api/auth/leave-requests', payload);
      if (onRefresh) onRefresh();
      onClose();
      // Reset form
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '', isHalfDay: false });
    } catch (err) {
      alert(err.response?.data?.error || "Error creating request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    readOnlyInput: isDark ? "bg-[#0f172a] border-white/5 text-[#94a3b8]" : "bg-[#f8fafc] border-slate-100 text-[#64748b]",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header - Manager Style */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight text-[#7c3aed]">New Leave Request</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Self Application</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Locked Profile Section */}
          <div>
            <label className={styles.label}>Applicant Profile</label>
            <div className={`flex items-center gap-4 w-full border rounded-xl p-4 ${styles.readOnlyInput}`}>
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-xs">
                {currentUser?.firstName?.[0] || <User size={18} />}
              </div>
              <div>
                <div className="text-sm font-bold">{currentUser?.firstName} {currentUser?.lastName}</div>
                <div className="text-[10px] opacity-60 font-black uppercase tracking-tighter">ID: {currentUser?.employeeId || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Leave Type & Half Day */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className={styles.label}>Leave Type*</label>
              <select 
                className={`w-full border rounded-xl p-4 text-sm font-bold outline-none cursor-pointer ${styles.input}`}
                required
                value={formData.leaveTypeId}
                onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})}
              >
                <option value="">Select Category</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 p-4 mb-0.5 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/10">
              <input 
                type="checkbox" 
                id="halfDay"
                checked={formData.isHalfDay}
                onChange={(e) => setFormData({...formData, isHalfDay: e.target.checked})}
                className="w-4 h-4 accent-[#7c3aed] cursor-pointer"
              />
              <label htmlFor="halfDay" className="text-xs font-black uppercase tracking-tight cursor-pointer">Half Day</label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={styles.label}>Start Date*</label>
              <input 
                type="date" 
                required
                className={`w-full border rounded-xl p-4 text-sm font-bold outline-none ${styles.input}`}
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            {!formData.isHalfDay && (
              <div className="space-y-1.5">
                <label className={styles.label}>End Date*</label>
                <input 
                  type="date" 
                  required
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none ${styles.input}`}
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            )}
          </div>

          {/* Duration Badge */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7c3aed] bg-[#7c3aed]/10 px-4 py-2 rounded-lg border border-[#7c3aed]/20 w-fit">
            <FileText size={12} />
            Total Duration: {daysRequested} Days
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className={styles.label}>Reason for Leave*</label>
            <textarea 
              rows="3"
              required
              placeholder="Explain the reason for your absence..."
              className={`w-full border rounded-xl p-4 text-sm font-bold outline-none resize-none transition-all ${styles.input}`}
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || daysRequested <= 0}
              className="bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveRequest;