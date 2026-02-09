import React, { useState, useEffect } from 'react';
import { X, UserPlus, Info, Calculator, ShieldCheck } from 'lucide-react';

const AddLeaveBalance = ({ isOpen, onClose, theme = 'dark' }) => {
  // --- Manager Context (Example) ---
  const managerDept = "Engineering";

  // --- State ---
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'Annual Leave',
    year: '2026',
    allocated: 0,
    used: 0,
    carriedOver: 0,
    note: ''
  });

  const [availableDays, setAvailableDays] = useState(0);

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: theme === 'dark' 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: theme === 'dark'
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white"
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-1.5 block",
    footer: theme === 'dark' ? "bg-[#020617]/50" : "bg-slate-50"
  };

  // --- Calculation Logic ---
  useEffect(() => {
    const total = Number(formData.allocated) + Number(formData.carriedOver) - Number(formData.used);
    setAvailableDays(total);
  }, [formData.allocated, formData.used, formData.carriedOver]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to save to your backend
    console.log(`Manager of ${managerDept} is updating balance:`, formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Assign Entitlement</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> {managerDept} Department
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            
            {/* Context Note */}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
              <Info size={18} className="text-blue-500 shrink-0" />
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                As a manager, you are setting the base leave entitlement for the fiscal year. These values will be visible to the employee.
              </p>
            </div>

            {/* Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={styles.label}>Team Member*</label>
                <select 
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`}
                  required
                >
                  <option value="">Select Employee</option>
                  <option value="1">John Smith (Eng)</option>
                  <option value="2">Sarah Johnson (Eng)</option>
                  <option value="3">Alex Thompson (Eng)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className={styles.label}>Leave Policy*</label>
                <select 
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`}
                  required
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                </select>
              </div>
            </div>

            {/* Numbers Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={styles.label}>Allocated</label>
                <input 
                  type="number" 
                  name="allocated"
                  value={formData.allocated}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
              <div>
                <label className={styles.label}>Carry Over</label>
                <input 
                  type="number" 
                  name="carriedOver"
                  value={formData.carriedOver}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
              <div>
                <label className={styles.label}>Manual Used</label>
                <input 
                  type="number" 
                  name="used"
                  value={formData.used}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
            </div>

            {/* Live Calculation Display */}
            <div className="p-6 rounded-3xl bg-linear-to-br from-[#7c3aed]/10 to-transparent border border-[#7c3aed]/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#7c3aed]">
                  <Calculator size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Net Available</span>
                </div>
                <div className={`text-2xl font-black ${availableDays < 0 ? 'text-red-500' : 'text-[#7c3aed]'}`}>
                  {availableDays.toFixed(1)} <span className="text-[10px] uppercase">Days</span>
                </div>
              </div>
            </div>

            {/* Manager Note */}
            <div className="space-y-1">
              <label className={styles.label}>Adjustment Reason (Internal)</label>
              <textarea 
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows="2"
                placeholder="E.g., Initial setup for 2026 fiscal year..."
                className={`w-full border rounded-xl p-3.5 text-sm outline-none transition-all resize-none ${styles.input}`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={`p-8 border-t border-inherit flex justify-end gap-4 ${styles.footer}`}>
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={availableDays < 0}
              className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Entitlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveBalance;