import React, { useState } from 'react';
import { X, Calendar, Upload, AlertCircle, FileText, User } from 'lucide-react';

const AddLeaveRequest = ({ isOpen, onClose, theme = 'dark' }) => {
  // --- User Identity (Locked for Privacy) ---
  const currentUser = { name: "John Smith", id: "1024" };

  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false
  });

  if (!isOpen) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white"
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    readOnlyInput: isDark
      ? "bg-[#0f172a] border-white/5 text-[#94a3b8]"
      : "bg-[#f8fafc] border-slate-100 text-[#64748b]",
    label: "text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
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
    // Logic: In a real app, send formData + currentUser details to your API
    console.log("Submitting Leave Request for:", currentUser.name, formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-2xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-6 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7c3aed]/10 text-[#7c3aed] rounded-lg">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-lg">New Leave Request</h3>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* Employee Information (Locked for Security) */}
            <div>
              <label className={styles.label}>Applicant Profile</label>
              <div className={`flex items-center gap-3 w-full border rounded-xl p-3 text-sm cursor-not-allowed ${styles.readOnlyInput}`}>
                <User size={16} className="text-[#7c3aed]" />
                <span className="font-bold">{currentUser.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#7c3aed]/10 text-[#7c3aed]">ID: {currentUser.id}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mt-1.5 ml-1 italic">You are applying for leave under your own account.</p>
            </div>

            {/* Leave Type & Half Day Toggle */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className={styles.label}>Leave Type*</label>
                <select 
                  name="leaveType"
                  required
                  className={`w-full border rounded-xl p-3 text-sm outline-none transition-all ${styles.input}`}
                  onChange={handleChange}
                  value={formData.leaveType}
                >
                  <option value="">Select Category</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                </select>
              </div>
              <div className="flex items-center gap-3 p-3 mb-1">
                <input 
                  type="checkbox" 
                  id="halfDay"
                  name="isHalfDay"
                  checked={formData.isHalfDay}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#7c3aed]"
                />
                <label htmlFor="halfDay" className="text-sm font-medium cursor-pointer">Half Day Request</label>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={styles.label}>Start Date*</label>
                <input 
                  type="date" 
                  name="startDate"
                  required
                  className={`w-full border rounded-xl p-3 text-sm outline-none transition-all ${styles.input}`}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={styles.label}>End Date*</label>
                <input 
                  type="date" 
                  name="endDate"
                  required
                  className={`w-full border rounded-xl p-3 text-sm outline-none transition-all ${styles.input}`}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className={styles.label}>Reason for Leave*</label>
              <textarea 
                name="reason"
                required
                rows="3"
                placeholder="Briefly describe the purpose of your leave..."
                className={`w-full border rounded-xl p-3 text-sm outline-none transition-all resize-none ${styles.input}`}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Attachment */}
            <div>
              <label className={styles.label}>Supporting Document (Optional)</label>
              <div className={`border-2 border-dashed ${isDark ? 'border-white/10 hover:border-[#7c3aed]/50' : 'border-slate-200 hover:border-[#7c3aed]'} rounded-xl p-6 text-center transition-colors cursor-pointer group`}>
                <Upload size={24} className="mx-auto mb-2 text-[#94a3b8] group-hover:text-[#7c3aed]" />
                <p className="text-xs text-[#94a3b8]">Drag & drop or <span className="text-[#7c3aed] font-bold">browse</span></p>
                <p className="text-[10px] text-[#94a3b8] mt-1">PDF, JPG, or PNG (Max 5MB)</p>
              </div>
            </div>

            {/* Notice */}
            <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <AlertCircle size={18} className="text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-500/80 leading-relaxed">
                Requests submitted are subject to manager approval. Please ensure you have sufficient leave balance before applying.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t border-inherit flex justify-end gap-3 ${styles.footer}`}>
            <button 
              type="button" 
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'} hover:bg-white/5 transition-all`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <FileText size={16} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveRequest;