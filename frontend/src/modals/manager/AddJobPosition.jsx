import React, { useState } from 'react';
import { X, Briefcase, DollarSign, ListChecks, FileText, Info, ShieldCheck, PlusCircle, Loader2 } from 'lucide-react';
import api from '../../utils/axiosConfig'; // ✅ 1. Import your secure axios instance

const AddJobPositionModal = ({ isOpen, onClose, theme = 'dark', defaultDept = 'Engineering', deptId, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Track loading state
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Full-time', // Default type
    salary: '',
    requirements: '',
    description: '',
    departmentId: deptId // ✅ Link to the actual DB ID
  });

  if (!isOpen) return null;

  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200",
    modalContent: `${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-2xl rounded-[2rem] shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-8 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`,
    input: `w-full ${theme === 'dark' ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 ring-[#7c3aed]/5 transition-all placeholder:text-slate-600`,
    readOnlyBox: `w-full ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'} border ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-2xl p-4 text-sm font-black flex items-center gap-3`,
    textMain: theme === 'dark' ? 'text-white' : 'text-slate-900'
  };

  // ✅ 2. Async Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send departmentId (UUID) and form data to backend
      const response = await api.post('/positions', {
        ...formData,
        departmentId: deptId // Ensure ID is sent
      });

      if (response.status === 201 || response.status === 200) {
        onSuccess(); // Refresh the table
        onClose();   // Close modal
      }
    } catch (error) {
      console.error("Creation error:", error);
      alert(error.response?.data?.error || "Failed to create position");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <PlusCircle size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tight ${styles.textMain}`}>New Job Position</h3>
              <p className="text-xs font-medium text-slate-500">Add a role to <span className="text-[#7c3aed] font-bold">{defaultDept}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={styles.label}>Position Title *</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <input 
                  type="text" 
                  className={`${styles.input} pl-12`} 
                  placeholder="e.g. Senior Frontend Engineer" 
                  required 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className={styles.label}>Assigned Department</label>
              <div className={styles.readOnlyBox}>
                <ShieldCheck size={18} className="text-[#7c3aed]" />
                <span className="uppercase tracking-widest">{defaultDept}</span>
              </div>
            </div>

            <div>
              <label className={styles.label}>Compensation</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <input 
                  type="text" 
                  className={`${styles.input} pl-12`} 
                  placeholder="e.g. $5000" 
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={styles.label}>Requirements</label>
              <textarea 
                className={`${styles.input} min-h-20 resize-none`} 
                placeholder="Skills required..."
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase italic">* Manager Authorization Required</span>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 text-slate-400 font-black uppercase text-[10px]">Cancel</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Create Position'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobPositionModal;