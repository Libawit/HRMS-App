import React, { useState } from 'react';
import { X, Calendar, ListPlus, Save, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const AddLeaveTypeModal = ({ isOpen, onClose, theme = 'dark' }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#7c3aed',
    requiresApproval: true,
    maxDays: '',
    accrual: 'Fixed',
    description: ''
  });

  if (!isOpen) return null;

  // --- Styles Object ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200",
    modalContent: `${isDark ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-xl rounded-2xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[11px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`,
    input: `w-full ${isDark ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed] transition-all`,
    textMain: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-500' : 'text-slate-400'
  };

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call to your backend
      await axios.post('http://localhost:5000/api/auth/leave-types', {
        ...formData,
        maxDays: parseInt(formData.maxDays) || 0
      });
      onClose(); // Close modal and refresh parent list via the callback in LeaveType.jsx
    } catch (error) {
      console.error("Error saving leave type:", error);
      alert(error.response?.data?.message || "Failed to save leave type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-xl flex items-center justify-center text-[#7c3aed]">
              <ListPlus size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.textMain}`}>Add Leave Type</h3>
              <p className="text-[11px] text-slate-500">Configure a new category of employee leave</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Form Body */}
        <form className="p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Leave Name */}
            <div className="md:col-span-2">
              <label className={styles.label}>Leave Name</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text" 
                className={styles.input} 
                placeholder="e.g. Sick Leave, Paternity Leave" 
                required 
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className={styles.label}>Visual Identification Color</label>
              <div className="flex items-center gap-3">
                <input 
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  type="color" 
                  className={`h-11 w-20 rounded-lg cursor-pointer bg-transparent border ${isDark ? 'border-white/10' : 'border-slate-200'}`} 
                />
                <span className={`text-xs ${styles.textMuted} font-mono uppercase tracking-widest font-bold`}>
                  {formData.color}
                </span>
              </div>
            </div>

            {/* Requires Approval */}
            <div>
              <label className={styles.label}>Requires Approval?</label>
              <div className="flex items-center gap-4 h-11">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    name="requiresApproval"
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.requiresApproval}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
                </label>
                <span className={`text-xs ${styles.textMain}`}>Manager approval required</span>
              </div>
            </div>

            {/* Max Days */}
            <div>
              <label className={styles.label}>
                <div className="flex items-center gap-2"><Calendar size={14} /> Max Days Per Year</div>
              </label>
              <input 
                name="maxDays"
                value={formData.maxDays}
                onChange={handleChange}
                type="number" 
                className={styles.input} 
                placeholder="e.g. 15" 
                min="0" 
              />
            </div>

            {/* Accrual Type */}
            <div>
              <label className={styles.label}>Accrual Frequency</label>
              <select 
                name="accrual"
                value={formData.accrual}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="Fixed">Fixed (Yearly)</option>
                <option value="Monthly">Monthly Accrual</option>
                <option value="One-time">One-time Grant</option>
                <option value="None">No Accrual</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={styles.label}>Description & Rules</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`${styles.input} min-h-20 resize-none`} 
                placeholder="Explain the eligibility and purpose of this leave type..."
              ></textarea>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-end gap-3 mt-8 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Leave Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveTypeModal;