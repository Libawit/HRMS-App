import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Calculator, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const EditLeaveBalance = ({ isOpen, onClose, theme = 'dark', data, managerDeptName }) => {
  // --- State ---
  const [formData, setFormData] = useState({
    alloc: 0,
    used: 0,
    carry: 0
  });
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState(0);

  // --- Sync Data ---
  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        alloc: data.alloc || 0,
        used: data.used || 0,
        carry: data.carry || 0
      });
    }
  }, [data, isOpen]);

  // --- Calculation Logic ---
  useEffect(() => {
    const total = Number(formData.alloc) + Number(formData.carry) - Number(formData.used);
    setAvailableDays(total);
  }, [formData.alloc, formData.used, formData.carry]);

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark 
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" 
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    disabledInput: isDark 
      ? "bg-white/5 border-white/5 text-slate-500 cursor-not-allowed" 
      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
    label: "text-[10px] font-black uppercase tracking-[0.15em] text-[#94a3b8] mb-1.5 block"
  };

  if (!isOpen || !data) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.userId || !data.leaveTypeId) return;

    setLoading(true);
    try {
      const payload = {
        userId: data.userId, 
        leaveTypeId: data.leaveTypeId,
        year: parseInt(data.year),
        allocated: parseFloat(formData.alloc),
        used: parseFloat(formData.used),
        carriedOver: parseFloat(formData.carry)
      };

      await axios.post('http://localhost:5000/api/auth/leave-balances', payload);
      onClose(); 
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight text-[#7c3aed]">Adjust Entitlement</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-1">
                Editing Record for {managerDeptName || "Your Department"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            
            {/* Employee Banner */}
            <div className={`p-4 rounded-2xl flex items-center justify-between ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div>
                <p className={styles.label}>Employee Name</p>
                <p className="font-black text-sm">{data.name}</p>
              </div>
              <div className="text-right">
                <p className={styles.label}>Leave Type</p>
                <p className="font-black text-sm text-[#7c3aed]">{data.type}</p>
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className={styles.label}>Allocated</label>
                <input 
                  type="number" 
                  step="0.5"
                  name="alloc"
                  value={formData.alloc}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`} 
                />
              </div>
              <div className="space-y-1">
                <label className={styles.label}>Carry Over</label>
                <input 
                  type="number" 
                  step="0.5"
                  name="carry"
                  value={formData.carry}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`} 
                />
              </div>
              <div className="space-y-1">
                <label className={styles.label}>Used (Actual)</label>
                <input 
                  type="number" 
                  step="0.5"
                  name="used"
                  value={formData.used}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none transition-all ${styles.input}`} 
                />
              </div>
            </div>

            {/* Live Calculation Display */}
            <div className="p-6 rounded-3xl bg-linear-to-br from-[#7c3aed]/10 to-transparent border border-[#7c3aed]/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#7c3aed]">
                  <Calculator size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Calculated Balance</span>
                </div>
                <div className={`text-2xl font-black ${availableDays < 0 ? 'text-red-500' : 'text-[#7c3aed]'}`}>
                  {availableDays.toFixed(1)} <span className="text-[10px] uppercase">Days</span>
                </div>
              </div>
              {availableDays < 0 && (
                <div className="mt-3 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle size={14} /> Negative balance detected
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`p-8 border-t border-inherit flex justify-end gap-4 ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={loading || availableDays < 0}
              className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveBalance;