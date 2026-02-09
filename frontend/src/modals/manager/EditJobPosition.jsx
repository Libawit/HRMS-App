import React, { useState, useEffect } from 'react';
import { X, Briefcase, Layers, DollarSign, ListChecks, FileText, Trash2, Save, ShieldCheck } from 'lucide-react';

const EditJobPositionModal = ({ isOpen, onClose, theme = 'dark', data }) => {
  // --- Auth Simulation ---
  const managerDept = 'Engineering'; 

  const [formData, setFormData] = useState({
    title: '',
    dept: '',
    salary: '',
    requirements: '',
    description: ''
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || data.name || '',
        dept: data.dept || managerDept,
        salary: data.salary || '',
        requirements: data.requirements || '',
        description: data.description || ''
      });
    }
  }, [data, managerDept]);

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

  const handleUpdate = (e) => {
    e.preventDefault();
    // Managers can only update positions within their own dept scope
    const updatedData = { ...formData, dept: managerDept };
    console.log("Manager Updating Position:", updatedData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
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
              <p className="text-xs font-medium text-slate-500">Modify role details within {managerDept}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleUpdate} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Position Title */}
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

            {/* Department (Locked for Manager) */}
            <div>
              <label className={styles.label}>Department (Fixed)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <div className={`${styles.readOnlyInput} pl-12 flex items-center`}>
                  {managerDept}
                </div>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className={styles.label}>Salary Range</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. $5k - $8k"
                  className={`${styles.input} pl-12`} 
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label className={styles.label}>Core Requirements</label>
              <div className="relative group">
                <ListChecks className="absolute left-4 top-5 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <textarea 
                  className={`${styles.input} pl-12 min-h-25 resize-none leading-relaxed`} 
                  placeholder="List skills, experience, and tools..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                ></textarea>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={styles.label}>Role Description</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-5 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <textarea 
                  className={`${styles.input} pl-12 min-h-30 resize-none leading-relaxed`} 
                  placeholder="Detailed explanation of day-to-day tasks..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-10 pt-8 border-t border-white/5 gap-4">
            <button 
              type="button"
              className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 px-5 py-3 rounded-2xl transition-all w-full sm:w-auto justify-center"
              onClick={() => { if(window.confirm('Confirm deletion of this role?')) onClose(); }}
            >
              <Trash2 size={16} /> Delete Role
            </button>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                type="button" 
                onClick={onClose}
                className={`flex-1 sm:flex-none px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Discard
              </button>
              <button 
                type="submit"
                className="flex-1 sm:flex-none bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobPositionModal;