import React, { useState, useEffect } from 'react';
import { 
  X, Save, GitCommit, Shield, 
  Users, AlertTriangle, RefreshCcw, ChevronRight 
} from 'lucide-react';

const EditStructure = ({ isOpen, onClose, data, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState(null);

  // Synchronize internal state with the selected relationship data
  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  if (!isOpen || !formData) return null;

  const isDark = theme === 'dark';

  const styles = {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all appearance-none`,
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
        
        {/* Header - Matches the LyticalSMS design language */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-purple-500/5 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#7c3aed] font-black text-[10px] uppercase tracking-widest bg-[#7c3aed]/10 px-2 py-1 rounded-md">Hierarchy Adjustment</span>
            </div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Modify Reporting Line
            </h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-[#94a3b8] transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          {/* Employee Read-Only Info */}
          <div className={`flex items-center gap-4 p-5 rounded-4xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <img src={formData.img} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#7c3aed]/20" alt="" />
            <div>
              <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.emp}</p>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">{formData.pos} • {formData.dept}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Supervisor Selection */}
            <div>
              <label className={styles.label}>Designated Supervisor</label>
              <div className="relative">
                <select 
                  name="supervisor"
                  value={formData.supervisor} 
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="None">Unassigned (Independent)</option>
                  <option value="John Smith">John Smith (CEO)</option>
                  <option value="Sarah Johnson">Sarah Johnson (HR Director)</option>
                  <option value="Michael Chen">Michael Chen (Lead Dev)</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] rotate-90" size={16} />
              </div>
            </div>

            {/* Role/Access Level */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Access Role</label>
                <select 
                  name="role"
                  value={formData.role} 
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="Admin">Admin</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Department Branch</label>
                <input 
                  name="dept"
                  type="text" 
                  value={formData.dept} 
                  onChange={handleChange}
                  className={styles.input} 
                />
              </div>
            </div>
          </div>

          {/* Impact Warning */}
          <div className={`flex gap-4 p-6 rounded-2xl border ${isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-100'}`}>
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[11px] font-medium text-amber-500/80 leading-relaxed">
              Changing the supervisor will automatically update the <strong>Organizational Chart</strong> and re-route all leave approval requests for this employee to the newly assigned manager.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl font-bold text-sm ${isDark ? 'text-[#94a3b8] hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'} transition-all`}
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              className="flex-2 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCcw size={18} /> Update Reporting Line
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStructure;