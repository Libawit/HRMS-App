import React, { useState, useEffect } from 'react';
import { X, Briefcase, DollarSign, ListChecks, FileText, Trash2, Save, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../utils/axiosConfig'; // ✅ 1. Import your secure axios instance

const EditJobPositionModal = ({ isOpen, onClose, theme = 'dark', data, onSuccess }) => {
  // --- State Management ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    salary: '',
    requirements: '',
    description: ''
  });

  // Sync state when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        salary: data.salary || '',
        requirements: data.requirements || '',
        description: data.description || ''
      });
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200",
    modalContent: `${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-2xl rounded-[2rem] shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-8 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`,
    input: `w-full ${theme === 'dark' ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 ring-[#7c3aed]/5 transition-all placeholder:text-slate-600`,
    readOnlyInput: `w-full ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'} border ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-2xl p-4 text-sm font-bold cursor-not-allowed`,
    textMain: theme === 'dark' ? 'text-white' : 'text-slate-900'
  };

  // ✅ 2. Secure Update Handler
  const handleUpdate = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // 1. Prepare the payload with EVERYTHING the backend expects
    const payload = {
      title: formData.title,
      salary: formData.salary,
      requirements: formData.requirements,
      description: formData.description,
      // ✅ Critical: Your backend MUST have this ID to 'connect' the department
      departmentId: data.departmentId || data.department?.id, 
      // ✅ Add type because it's in your backend destructuring
      type: data.type || 'Full-time' 
    };

    console.log("Sending Payload to Backend:", payload);

    const response = await api.put(`/positions/${data.id}`, payload);

    if (response.status === 200) {
      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    }
  } catch (error) {
    console.error("Update error:", error.response?.data);
    alert(`Update Failed: ${error.response?.data?.error || "Unknown Error"}`);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-2xl flex items-center justify-center text-[#7c3aed]">
              <Briefcase size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-black tracking-tight ${styles.textMain}`}>Edit Position</h3>
                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Authorized</span>
              </div>
              <p className="text-xs font-medium text-slate-500">Updating role details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className={styles.label}>Job Title</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <input 
                  type="text" 
                  className={`${styles.input} pl-12`} 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div>
              <label className={styles.label}>Department (Fixed)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <div className={`${styles.readOnlyInput} pl-12 flex items-center`}>
                   {data.department?.name || 'Department'}
                </div>
              </div>
            </div>

            <div>
              <label className={styles.label}>Salary Range</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <input 
                  type="text" 
                  className={`${styles.input} pl-12`} 
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={styles.label}>Core Requirements</label>
              <textarea 
                className={`${styles.input} min-h-20 resize-none`} 
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end mt-10 pt-8 border-t border-white/5 gap-4">
            <button type="button" onClick={onClose} className="px-8 py-3.5 text-xs font-black uppercase text-slate-400 hover:bg-white/5 rounded-2xl transition-all">
              Discard
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-3.5 rounded-2xl text-xs font-black uppercase shadow-xl transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobPositionModal;