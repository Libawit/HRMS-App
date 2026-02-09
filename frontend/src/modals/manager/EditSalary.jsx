import React, { useState, useEffect } from 'react';
import { 
  X, Save, DollarSign, AlertCircle, 
  TrendingUp, Calculator, ArrowUpCircle, ArrowDownCircle, 
  Calendar, Building2, MessageSquare, ShieldCheck
} from 'lucide-react';

const EditSalary = ({ isOpen, onClose, salaryData, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState(null);
  const managerDept = "Engineering"; // Context-driven

  // Sync state when salaryData is passed from the parent table
  useEffect(() => {
    if (salaryData) {
      setFormData({ 
        ...salaryData, 
        adjustmentReason: salaryData.adjustmentReason || '' 
      });
    }
  }, [salaryData]);

  // Recalculate Net Pay whenever components change
  useEffect(() => {
    if (formData) {
      const calculatedNet = (Number(formData.basic) + Number(formData.bonus)) - Number(formData.deductions);
      if (calculatedNet !== formData.net) {
        setFormData(prev => ({ ...prev, net: calculatedNet > 0 ? calculatedNet : 0 }));
      }
    }
  }, [formData?.basic, formData?.bonus, formData?.deductions]);

  if (!isOpen || !formData) return null;

  const isDark = theme === 'dark';

  const styles = {
    overlay: "fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all`,
    readOnly: `w-full ${isDark ? 'bg-white/5 border-white/5 text-[#94a3b8]' : 'bg-slate-100 border-slate-200 text-slate-500'} border p-4 rounded-2xl text-sm font-bold cursor-not-allowed`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-2 block ml-1"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['basic', 'bonus', 'deductions'];
    const updatedValue = numericFields.includes(name) ? (parseFloat(value) || 0) : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header - Managerial Adjustment Context */}
        <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-blue-600/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <AlertCircle size={28} />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Adjust Departmental Pay
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Building2 size={12} className="text-[#94a3b8]" />
                <span className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">
                  {managerDept} Unit • ID: {formData.idNo}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-[#94a3b8] transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Section 1: Locked Staff Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={styles.label}>Staff Member (Read Only)</label>
              <div className={styles.readOnly}>{formData.emp}</div>
            </div>
            <div>
              <label className={styles.label}>Pay Period</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input name="month" value={formData.month} onChange={handleChange} className={`${styles.input} pl-12`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings Component */}
            <div className={`p-6 rounded-4xl ${isDark ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-50 border border-emerald-100'}`}>
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ArrowUpCircle size={14}/> Income Revision
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Basic Salary ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={14} />
                    <input name="basic" type="number" value={formData.basic} onChange={handleChange} className={`${styles.input} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Bonus Allocation ($)</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={14} />
                    <input name="bonus" type="number" value={formData.bonus} onChange={handleChange} className={`${styles.input} pl-10`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions Component */}
            <div className={`p-6 rounded-4xl ${isDark ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100'}`}>
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ArrowDownCircle size={14}/> Applied Deductions
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Adjust Total Deductions ($)</label>
                  <input name="deductions" type="number" value={formData.deductions} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Adjustment Reason (Internal Note)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-blue-500" size={14} />
                    <textarea 
                      name="adjustmentReason" 
                      value={formData.adjustmentReason} 
                      onChange={handleChange} 
                      placeholder="e.g. Overtime or Tax adjustment..."
                      className={`${styles.input} pl-12 h-22 pt-3 resize-none font-medium text-xs`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Calculation Summary */}
          <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/10 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} flex flex-col md:flex-row justify-between items-center gap-6`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Calculator size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">New Calculated Net</p>
                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${formData.net.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] font-bold text-blue-500 uppercase bg-blue-500/10 px-3 py-1 rounded-full mb-1 flex items-center gap-1.5">
                <ShieldCheck size={12}/> Manager Authorized
              </p>
              <p className="text-[10px] text-[#94a3b8] font-medium block italic">Awaiting departmental sync</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#94a3b8] hover:text-white' : 'text-slate-500 hover:text-slate-800'} transition-colors`}>
              Discard Changes
            </button>
            <button type="submit" className="flex-2 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
              <Save size={18} /> Update Departmental Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalary;