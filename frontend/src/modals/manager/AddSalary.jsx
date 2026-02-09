import React, { useState, useEffect } from 'react';
import { 
  X, Save, Briefcase, User, Calculator, 
  ArrowUpCircle, ArrowDownCircle, Building2, ShieldCheck 
} from 'lucide-react';

const AddSalary = ({ isOpen, onClose, onSave, theme = 'dark' }) => {
  // --- Manager Context ---
  const managerDept = "Engineering"; // This would come from your Auth/Context

  const [formData, setFormData] = useState({
    emp: '',
    idNo: '',
    dept: managerDept,
    basic: 0,
    bonus: 0,
    deductions: 0,
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    status: 'Pending',
    net: 0
  });

  // Calculate Net Pay whenever Basic, Bonus, or Deductions change
  useEffect(() => {
    const total = (Number(formData.basic) + Number(formData.bonus)) - Number(formData.deductions);
    setFormData(prev => ({ ...prev, net: total > 0 ? total : 0 }));
  }, [formData.basic, formData.bonus, formData.deductions]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const styles = {
    overlay: "fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-2 block ml-1"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: Date.now() });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header with Managerial Context */}
        <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#7c3aed]/5 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#7c3aed]/10 text-[#7c3aed] rounded-2xl flex items-center justify-center border border-[#7c3aed]/20">
                <Building2 size={28} />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Initiate Payroll</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-[#7c3aed] text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">{managerDept}</span>
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">• Unit Review Mode</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-[#94a3b8] transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Section 1: Staff Identification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={styles.label}>Select Staff Member</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <input 
                    name="emp" 
                    required 
                    value={formData.emp} 
                    onChange={handleChange} 
                    placeholder="Search name..." 
                    className={`${styles.input} pl-12`} 
                />
              </div>
            </div>
            <div>
              <label className={styles.label}>Staff Reference ID</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <input 
                    name="idNo" 
                    required 
                    value={formData.idNo} 
                    onChange={handleChange} 
                    placeholder="EMP-XXX" 
                    className={`${styles.input} pl-12`} 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 2: Departmental Earnings */}
            <div className={`p-6 rounded-4xl ${isDark ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-50 border border-emerald-100'}`}>
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ArrowUpCircle size={14}/> Approved Earnings
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Basic Base ($)</label>
                  <input name="basic" type="number" value={formData.basic} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Dept. Performance Bonus ($)</label>
                  <input name="bonus" type="number" value={formData.bonus} onChange={handleChange} className={styles.input} />
                </div>
              </div>
            </div>

            {/* Section 3: Deductions & Period */}
            <div className={`p-6 rounded-4xl ${isDark ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100'}`}>
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ArrowDownCircle size={14}/> Standard Deductions
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Total Adjustments ($)</label>
                  <input name="deductions" type="number" value={formData.deductions} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Reporting Cycle</label>
                  <input name="month" value={formData.month} onChange={handleChange} className={styles.input} />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Financial Summary */}
          <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/10 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} flex flex-col md:flex-row justify-between items-center gap-6`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7c3aed] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Calculator size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Net Payable Preview</p>
                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${formData.net.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 rounded-full mb-1 flex items-center gap-1.5">
                <ShieldCheck size={12}/> Manager Verified
              </p>
              <p className="text-[10px] text-[#94a3b8] font-medium block">Departmental funds allocated</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-[#94a3b8] hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="flex-2 py-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
              <Save size={18} /> Commit to Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalary;