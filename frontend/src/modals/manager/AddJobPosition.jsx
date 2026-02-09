import React, { useState } from 'react';
import { X, Briefcase, Layers, DollarSign, ListChecks, FileText, Info, ShieldCheck, PlusCircle } from 'lucide-react';

const AddJobPositionModal = ({ isOpen, onClose, theme = 'dark', defaultDept = 'Engineering' }) => {
  // --- Form State ---
  const [formData, setFormData] = useState({
    title: '',
    dept: defaultDept,
    salary: '',
    requirements: '',
    description: ''
  });

  if (!isOpen) return null;

  // --- Theme-Based Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200",
    modalContent: `${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-2xl rounded-[2rem] shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-8 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`,
    input: `w-full ${theme === 'dark' ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 ring-[#7c3aed]/5 transition-all placeholder:text-slate-600`,
    readOnlyBox: `w-full ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'} border ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-2xl p-4 text-sm font-black flex items-center gap-3`,
    textMain: theme === 'dark' ? 'text-white' : 'text-slate-900'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Manager Creating New Position:", formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <PlusCircle size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tight ${styles.textMain}`}>New Job Position</h3>
              <p className="text-xs font-medium text-slate-500">Add a new role to the <span className="text-[#7c3aed] font-bold">{defaultDept}</span> team</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Position Title */}
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

            {/* Department (Read-Only for Manager) */}
            <div>
              <label className={styles.label}>Assigned Department</label>
              <div className={styles.readOnlyBox}>
                <ShieldCheck size={18} className="text-[#7c3aed]" />
                <span className="uppercase tracking-widest">{defaultDept}</span>
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className={styles.label}>Compensation Range</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <input 
                  type="text" 
                  className={`${styles.input} pl-12`} 
                  placeholder="e.g. $90k - $120k" 
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            {/* Position Requirements */}
            <div className="md:col-span-2">
              <label className={styles.label}>Role Requirements</label>
              <div className="relative group">
                <ListChecks className="absolute left-4 top-5 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <textarea 
                  className={`${styles.input} pl-12 min-h-22.5 resize-none leading-relaxed`} 
                  placeholder="Technical skills, years of experience, certifications..."
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                ></textarea>
              </div>
            </div>

            {/* Job Description */}
            <div className="md:col-span-2">
              <label className={styles.label}>Job Description Summary</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-5 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={18} />
                <textarea 
                  className={`${styles.input} pl-12 min-h-27.5 resize-none leading-relaxed`} 
                  placeholder="Detailed overview of responsibilities and impact..."
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Role Placement Guidance */}
          <div className="mt-6 p-4 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/10 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-[#7c3aed]">
               <Info size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Structural Reference</span>
             </div></div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight italic">
              * Required for payroll approval
            </span>
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all active:scale-95"
              >
                Create Position
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobPositionModal;