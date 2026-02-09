import React, { useState, useEffect } from 'react';
import { X, Palette, Calendar, ListPlus, Save, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

const EditLeaveTypeModal = ({ isOpen, onClose, theme = 'dark', data }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#7c3aed',
    requiresApproval: true,
    maxDays: '',
    accrual: 'fixed',
    description: ''
  });

  // Sync state when modal opens with specific leave type data
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        color: data.color || '#7c3aed',
        requiresApproval: data.requiresApproval ?? true,
        maxDays: data.maxDays || '',
        accrual: data.accrual || 'Fixed',
        description: data.description || ''
      });
    }
  }, [data]);

  if (!isOpen || !data) return null;

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

  
const handleUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    // Change "admin" to "auth" here if that's your route prefix
    await axios.put(`http://localhost:3000/api/auth/leave-types/${data.id}`, {
      ...formData,
      maxDays: parseInt(formData.maxDays) || 0
    });
    onClose();
  } catch (error) {
    console.error("Update Error:", error);
    alert(error.response?.data?.message || "Failed to update leave type");
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will delete the leave category permanently.')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3000/api/admin/leave-types/${data.id}`);
        onClose();
      } catch (error) {
        alert("Failed to delete. This type might be assigned to employees.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Palette size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.textMain}`}>Edit Leave Type</h3>
              <p className="text-[11px] text-slate-500">Modify rules for {formData.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpdate} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="md:col-span-2">
              <label className={styles.label}>Leave Name</label>
              <input 
                type="text" 
                className={styles.input} 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>

            <div>
              <label className={styles.label}>Visual Indicator Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  className={`h-11 w-20 rounded-lg cursor-pointer bg-transparent border ${isDark ? 'border-white/10' : 'border-slate-200'}`} 
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
                <span className={`text-xs ${styles.textMuted} font-mono uppercase tracking-wider font-bold`}>{formData.color}</span>
              </div>
            </div>

            <div>
              <label className={styles.label}>Approval Workflow</label>
              <div className="flex items-center gap-4 h-11">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData({...formData, requiresApproval: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
                </label>
                <span className={`text-[12px] ${styles.textMain}`}>Requires Approval</span>
              </div>
            </div>

            <div>
              <label className={styles.label}>
                <div className="flex items-center gap-2"><Calendar size={14} /> Annual Max Days</div>
              </label>
              <input 
                type="number" 
                className={styles.input} 
                value={formData.maxDays}
                onChange={(e) => setFormData({...formData, maxDays: e.target.value})}
              />
            </div>

            <div>
              <label className={styles.label}>Accrual Policy</label>
              <select 
                className={styles.input}
                value={formData.accrual}
                onChange={(e) => setFormData({...formData, accrual: e.target.value})}
              >
                <option value="Fixed">Fixed (Yearly)</option>
                <option value="Monthly">Monthly Accrual</option>
                <option value="One-time">One-time Grant</option>
                <option value="None">No Accrual</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={styles.label}>Description & Policy Details</label>
              <textarea 
                className={`${styles.input} min-h-20 resize-none`} 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-between mt-8 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <button 
              type="button"
              disabled={loading}
              className="flex items-center gap-2 text-red-500 text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              onClick={handleDelete}
            >
              <Trash2 size={16} /> Delete Category
            </button>
            
            <div className="flex gap-3">
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
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Updating...' : 'Update Type'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveTypeModal;