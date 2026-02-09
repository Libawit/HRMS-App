import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, Save, Calculator, ArrowUpCircle, 
  ArrowDownCircle, Calendar, Loader2, CheckCircle2, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditSalary = ({ isOpen, onClose, salaryData, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isDark = theme === 'dark';

  useEffect(() => {
    if (salaryData) {
      setFormData({
        ...salaryData,
        amountBasic: salaryData.amountBasic || 0,
        amountBonus: salaryData.amountBonus || 0,
        deductions: salaryData.deductions || 0,
        month: salaryData.month,
        year: salaryData.year,
        status: salaryData.status || 'PENDING'
      });
    }
  }, [salaryData]);

  const netPayPreview = formData 
    ? (Number(formData.amountBasic) + Number(formData.amountBonus)) - Number(formData.deductions)
    : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Numbers for specific fields, strings for others (like status)
    const val = (name === 'month' || name === 'year' || name === 'amountBasic' || name === 'amountBonus' || name === 'deductions') 
      ? parseFloat(value || 0) 
      : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.patch(`http://localhost:3000/api/salaries/${formData.id}`, {
        ...formData,
        netPay: netPayPreview
      });
      toast.success("Salary updated successfully");
      onSave(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !formData) return null;

  const styles = {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-2 block ml-1"
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header - Styled like AddSalary */}
        <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#7c3aed]/5 to-transparent">
          <div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Modify Payroll Record
            </h2>
            <p className="text-xs text-[#94a3b8] font-medium mt-1">
              Editing: {formData.user?.firstName} {formData.user?.lastName} ({formData.user?.employeeId})
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-[#94a3b8] transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Top Section: Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={styles.label}>Payment Status</label>
              <div className="relative">
                {formData.status === 'PAID' ? 
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} /> : 
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                }
                <select name="status" value={formData.status} onChange={handleChange} className={`${styles.input} pl-12 appearance-none cursor-pointer`}>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="VOID">VOID</option>
                </select>
              </div>
            </div>
            <div>
              <label className={styles.label}>Payroll Year</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <input name="year" type="number" value={formData.year} onChange={handleChange} className={`${styles.input} pl-12`} />
              </div>
            </div>
          </div>

          {/* Middle Section: Earnings and Deductions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings Component */}
            <div className={`p-6 rounded-4xl ${isDark ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-50 border border-emerald-100'}`}>
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ArrowUpCircle size={14}/> Earnings
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Basic Salary ($)</label>
                  <input name="amountBasic" type="number" step="0.01" value={formData.amountBasic} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Bonuses ($)</label>
                  <input name="amountBonus" type="number" step="0.01" value={formData.amountBonus} onChange={handleChange} className={styles.input} />
                </div>
              </div>
            </div>

            {/* Deductions Component */}
            <div className={`p-6 rounded-4xl ${isDark ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100'}`}>
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ArrowDownCircle size={14}/> Deductions
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Total Deductions ($)</label>
                  <input name="deductions" type="number" step="0.01" value={formData.deductions} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Salary Month</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={16} />
                    <select name="month" value={formData.month} onChange={handleChange} className={`${styles.input} pl-12 appearance-none`}>
                      {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Preview Card */}
          <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/10 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} flex flex-col md:flex-row justify-between items-center gap-6`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7c3aed] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Calculator size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Updated Net Pay</p>
                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${netPayPreview.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Live Adjustment</p>
              <p className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Previewing changes...</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-[#94a3b8] hover:text-red-500 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-2 py-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-3xl font-black text-sm shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Salary Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalary;