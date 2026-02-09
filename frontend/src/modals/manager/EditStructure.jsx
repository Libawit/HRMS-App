import React, { useState, useEffect } from 'react';
import { 
  X, Shield, AlertTriangle, RefreshCcw, 
  ChevronRight, Lock, UserCheck 
} from 'lucide-react';

const EditStructure = ({ isOpen, onClose, data, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  if (!isOpen || !formData) return null;

  const isDark = theme === 'dark';

  const styles = {
    overlay: "fixed inset-0 bg-black/90 backdrop-blur-xl z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all appearance-none`,
    readOnlyInput: `w-full ${isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'} border p-4 rounded-2xl text-sm font-bold flex items-center justify-between cursor-not-allowed`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-2 block ml-1"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header - Manager Specific */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-purple-500/5 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck size={14} className="text-[#7c3aed]" />
              <span className="text-[#7c3aed] font-black text-[10px] uppercase tracking-widest">Team Management</span>
            </div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Edit Reporting Path
            </h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-[#94a3b8] transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          {/* Employee Identity Card */}
          <div className={`flex items-center gap-5 p-6 rounded-4xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <div className="relative">
              <img src={formData.img} className="w-20 h-20 rounded-3xl object-cover border-2 border-[#7c3aed]/20" alt="" />
              <div className="absolute -bottom-2 -right-2 bg-[#7c3aed] p-1.5 rounded-lg text-white shadow-lg">
                <Shield size={12} />
              </div>
            </div>
            <div>
              <p className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.emp}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black bg-[#7c3aed]/20 text-[#7c3aed] px-2 py-0.5 rounded uppercase">{formData.pos}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formData.dept} Branch</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Supervisor Selection - Flexible */}
            <div>
              <label className={styles.label}>Direct Supervisor</label>
              <div className="relative">
                <select 
                  name="supervisor"
                  value={formData.supervisor} 
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="None">Independent (No Direct Report)</option>
                  <option value="Michael Chen">Michael Chen (Lead Dev)</option>
                  <option value="John Smith">John Smith (CEO)</option>
                  {/* In production, map through departmental supervisors here */}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c3aed] rotate-90" size={16} />
              </div>
            </div>

            {/* Read-Only Fields for Managers */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Access Role</label>
                <div className={styles.readOnlyInput}>
                  {formData.role}
                  <Lock size={14} />
                </div>
              </div>
              <div>
                <label className={styles.label}>Department</label>
                <div className={styles.readOnlyInput}>
                  {formData.dept}
                  <Lock size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Warning */}
          <div className={`flex gap-4 p-6 rounded-3xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
            <AlertTriangle className="text-[#7c3aed] shrink-0" size={20} />
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
              Updating this reporting line will notify the new supervisor and update the <span className="text-[#7c3aed] font-bold">Team Tree View</span> immediately. Department transfers must be requested through HR.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest ${isDark ? 'text-[#94a3b8] hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'} transition-all`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-2 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCcw size={18} /> Update Reporting Path
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStructure;