import React, { useState } from 'react';
import { X, Calendar, Upload, AlertCircle, FileText, Lock, User } from 'lucide-react';

const AddLeaveRequest = ({ isOpen, onClose, theme = 'dark', managerDept = "IT" }) => {
  const [formData, setFormData] = useState({
    employee: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    status: 'Approved' // Managers often enter pre-approved records
  });

  // Mock team members scoped to manager's department
  const teamMembers = [
    { id: "1024", name: "John Smith", role: "Developer" },
    { id: "1088", name: "Sarah Johnson", role: "Designer" },
    { id: "1105", name: "Kevin Hart", role: "DevOps" }
  ];

  if (!isOpen) return null;

  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: theme === 'dark' 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: theme === 'dark'
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white"
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-2 block",
    footer: theme === 'dark' ? "bg-[#020617]/50" : "bg-slate-50"
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Submitting Dept [${managerDept}] Leave:`, formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed]/10 text-[#7c3aed] rounded-2xl flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Add Team Record</h3>
              <div className="flex items-center gap-1.5 text-[#7c3aed]">
                <Lock size={10} />
                <span className="text-[10px] font-black uppercase tracking-widest">{managerDept} Department</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
            
            {/* Employee Selection Scoped to Dept */}
            <div>
              <label className={styles.label}>Team Member</label>
              <div className="relative">
                <select 
                  name="employee"
                  required
                  className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all appearance-none ${styles.input}`}
                  onChange={handleChange}
                  value={formData.employee}
                >
                  <option value="">Select from {managerDept} staff...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} (ID: {member.id}) — {member.role}
                    </option>
                  ))}
                </select>
                <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              </div>
            </div>

            {/* Leave Type & Half Day Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Leave Category</label>
                <select 
                  name="leaveType"
                  required
                  className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                  <option value="Maternity/Paternity">Parental Leave</option>
                </select>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#7c3aed]/5 rounded-2xl border border-[#7c3aed]/10 self-end">
                <input 
                  type="checkbox" 
                  id="halfDay"
                  name="isHalfDay"
                  checked={formData.isHalfDay}
                  onChange={handleChange}
                  className="w-5 h-5 accent-[#7c3aed] cursor-pointer"
                />
                <label htmlFor="halfDay" className="text-sm font-black cursor-pointer">Half Day Request</label>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Start Date</label>
                <input 
                  type="date" 
                  name="startDate"
                  required
                  className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={styles.label}>End Date</label>
                <input 
                  type="date" 
                  name="endDate"
                  required
                  className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className={styles.label}>Internal Note / Reason</label>
              <textarea 
                name="reason"
                required
                rows="3"
                placeholder="Details regarding this leave record..."
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all resize-none ${styles.input}`}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Manager Notice */}
            <div className="flex gap-4 p-5 bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-2xl">
              <AlertCircle size={20} className="text-[#7c3aed] shrink-0" />
              <div>
                <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-widest mb-1">Direct Entry Mode</p>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  As a manager, adding this record will bypass the standard request flow and log the leave directly into the {managerDept} department calendar.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-8 border-t border-inherit flex items-center justify-between ${styles.footer}`}>
             <div className="hidden md:block">
                <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Manager Authorization Required</span>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 md:flex-none px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 md:flex-none bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> Log Record
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveRequest;