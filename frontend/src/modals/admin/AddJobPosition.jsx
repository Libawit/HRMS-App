import React, { useState } from 'react';
import { X, Briefcase, Building2, DollarSign, AlignLeft, ChevronDown } from 'lucide-react';

import api from '../../utils/axiosConfig'; // Ensure this path is correct

const AddJobPositionModal = ({ isOpen, onClose, theme, departments, onSuccess }) => {
  const isDark = theme === 'dark';
  
  // 1. Initialize state with departmentId
  const [formData, setFormData] = useState({
    title: '',
    type: 'Full-time',
    salary: '',
    departmentId: '', // This is the UUID required by Prisma
    requirements: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.departmentId) {
    alert("Please select a department for this position.");
    return;
  }

  try {
    // USE API (AXIOS) INSTEAD OF FETCH
    // It automatically adds your Auth token and handles JSON
    const response = await api.post('/positions', formData);

    if (response.status === 201 || response.status === 200) {
      onSuccess(); 
      onClose();   
      setFormData({ 
        title: '', 
        type: 'Full-time', 
        salary: '', 
        departmentId: '', 
        requirements: '', 
        description: '' 
      });
    }
  } catch (error) {
    console.error("Submission error:", error);
    // Axios puts the error message in error.response.data
    const message = error.response?.data?.error || "Failed to create position";
    alert(`Error: ${message}`);
  }
};

  const inputClass = `w-full px-4 py-3 rounded-xl border ${
    isDark ? 'bg-[#0f172a] border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900'
  } focus:outline-none focus:border-[#7c3aed] transition-all text-sm font-medium`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`${isDark ? 'bg-[#0b1220]' : 'bg-white'} w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>New Position</h2>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Add to organization registry</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"><X size={20}/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Position Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <input required className={`${inputClass} pl-12`} placeholder="e.g. Senior Backend Developer" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
            </div>

            {/* Department Dropdown - CRITICAL PART */}
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Assign Department</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <select 
                  required 
                  className={`${inputClass} pl-12 appearance-none`}
                  value={formData.departmentId}
                  onChange={e => setFormData({...formData, departmentId: e.target.value})}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Work Type</label>
                <select className={inputClass} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              {/* Salary */}
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Monthly Salary</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
                  <input className={`${inputClass} pl-10`} placeholder="e.g. 5000" 
                    value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Requirements</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-[#7c3aed]" size={16} />
                <textarea rows="2" className={`${inputClass} pl-12 resize-none`} placeholder="Key skills needed..." 
                  value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black uppercase tracking-[0.2em] text-[11px] py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] mt-4">
              Create Position
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJobPositionModal;