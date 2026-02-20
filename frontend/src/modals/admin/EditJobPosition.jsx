import React, { useState, useEffect } from 'react';
import { X, Briefcase, Layers, DollarSign, ListChecks, Save, Clock, Loader2, ChevronDown } from 'lucide-react';
import api from '../../utils/axiosConfig'; // Ensure this path is correct

const EditJobPositionModal = ({ isOpen, onClose, theme = 'dark', data, departments = [], onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    departmentId: '',
    type: 'Full-time',
    salary: '',
    requirements: '',
    description: ''
  });

  // Sync state when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        departmentId: data.departmentId || '', 
        type: data.type || 'Full-time',
        salary: data.salary || '',
        requirements: data.requirements || '',
        description: data.description || ''
      });
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200",
    modalContent: `${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-2xl rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[11px] font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`,
    input: `w-full ${theme === 'dark' ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed] transition-all`,
    textMain: theme === 'dark' ? 'text-white' : 'text-slate-900'
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      alert("A department must be selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ USE AXIOS (api) INSTEAD OF fetch
      // This automatically sends your Bearer Token
      const response = await api.put(`/positions/${data.id}`, formData);

      // Axios considers anything in the 200 range a success
      if (response.status === 200) {
        onSuccess(); 
        onClose();
      }
    } catch (error) {
      console.error("Update error:", error);
      // Access the backend error message properly via Axios
      const errorMsg = error.response?.data?.message || "An error occurred during update.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.textMain}`}>Edit Job Position</h3>
              <p className="text-[11px] text-slate-500 font-medium">Updating Role Registry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Position Title */}
            <div className="md:col-span-2">
              <label className={styles.label}>Position Title *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className={`${styles.input} pl-10 font-bold`} 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className={styles.label}>Department *</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  className={`${styles.input} pl-10 appearance-none cursor-pointer pr-10`}
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Work Type */}
            <div>
              <label className={styles.label}>Work Type *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <select 
                  className={`${styles.input} pl-10 appearance-none cursor-pointer pr-10`}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Contract">Contract</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Salary */}
            <div className="md:col-span-2">
              <label className={styles.label}>Salary Range</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className={`${styles.input} pl-10`} 
                  placeholder="e.g. $5,000 - $7,000"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label className={styles.label}>Requirements</label>
              <div className="relative">
                <ListChecks className="absolute left-3 top-4 text-slate-400" size={16} />
                <textarea 
                  className={`${styles.input} pl-10 min-h-24 resize-none`} 
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              ID: {data.id.split('-')[0]}...
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> 
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobPositionModal;