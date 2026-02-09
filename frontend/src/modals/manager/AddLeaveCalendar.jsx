import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Hash,
  FilePlus,
  ShieldCheck,
  Users
} from 'lucide-react';

const AddLeaveCalendar = ({ isOpen, onClose, theme = 'dark' }) => {
  // Manager Context
  const managerDept = "Engineering";

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    status: 'approved',
    reason: '',
    isOverride: false
  });

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white placeholder:text-white/20"
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-2 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Manager of ${managerDept} logged leave:`, formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Direct Team Entry</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#7c3aed]" /> {managerDept} Department
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            
            {/* Employee Select (Filtered for Manager's Dept) */}
            <div>
              <label className={styles.label}>Team Member</label>
              <div className="relative">
                <select 
                  required
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none appearance-none transition-all ${styles.input}`}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                >
                  <option value="">Select an employee from {managerDept}...</option>
                  <option value="1">Jessica Taylor (Lead Engineer)</option>
                  <option value="2">Michael Chen (DevOps)</option>
                  <option value="4">Alex Thompson (Frontend)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94a3b8]">
                  <Users size={16} />
                </div>
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={styles.label}>Leave Start</label>
                <input 
                  type="date" 
                  required
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className={styles.label}>Leave End</label>
                <input 
                  type="date" 
                  required
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={styles.label}>Policy Type</label>
                <select 
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Day</option>
                  <option value="Training">Internal Training</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Initial Status</label>
                <select 
                  className={`w-full border rounded-xl p-4 text-sm font-black outline-none transition-all ${styles.input}`}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="approved">Instant Approve</option>
                  <option value="pending">Mark as Pending</option>
                </select>
              </div>
            </div>

            {/* Availability Warning (Manager Specific) */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Staffing Check</p>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed font-medium">
                  Sarah Johnson is already out on these dates. Proceeding will leave the <span className="text-amber-500/80 font-bold">Frontend team</span> at 50% capacity.
                </p>
              </div>
            </div>

            {/* Direct Entry Reason */}
            <div>
              <label className={styles.label}>Management Note (Visible to Admin)</label>
              <textarea 
                rows="2"
                placeholder="Brief reason for this manual calendar entry..."
                className={`w-full border rounded-xl p-4 text-sm font-medium outline-none transition-all resize-none ${styles.input}`}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-8 border-t border-inherit flex justify-end items-center gap-6 ${styles.footer}`}>
            <button 
              type="button" 
              onClick={onClose}
              className="text-xs font-black uppercase tracking-[0.2em] text-[#94a3b8] hover:text-red-500 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/40 active:scale-95 transition-all flex items-center gap-3"
            >
              <FilePlus size={18} /> Update Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveCalendar;