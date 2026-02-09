import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Info, Calculator, FileText } from 'lucide-react';

const EditLeaveBalance = ({ isOpen, onClose, theme = 'dark', data }) => {
  // --- State ---
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    year: '',
    alloc: 0,
    used: 0,
    carry: 0,
    reason: ''
  });

  const [availableDays, setAvailableDays] = useState(0);
  const [diff, setDiff] = useState(0);

  // --- Sync Data ---
  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        name: data.name || '',
        type: data.type || '',
        year: data.year || '',
        alloc: data.alloc || 0,
        used: data.used || 0,
        carry: data.carry || 0,
        reason: ''
      });
    }
  }, [data, isOpen]);

  // --- Calculation Logic ---
  useEffect(() => {
    const total = Number(formData.alloc) + Number(formData.carry) - Number(formData.used);
    setAvailableDays(total);
    
    if (data) {
      setDiff(total - data.avail);
    }
  }, [formData.alloc, formData.used, formData.carry, data]);

  // --- Theme Styles ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: theme === 'dark' 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: theme === 'dark'
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white"
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    readOnly: theme === 'dark'
      ? "bg-white/5 border-white/5 text-[#94a3b8] opacity-70"
      : "bg-slate-50 border-slate-100 text-slate-500",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-1.5 block",
    footer: theme === 'dark' ? "bg-[#020617]/50" : "bg-slate-50"
  };

  if (!isOpen || !data) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Manager Update Logged:", { ...formData, updatedAt: new Date() });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Manual Adjustment</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest italic">Reviewing: {formData.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
            
            {/* Context Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={styles.label}>Policy Type</label>
                <div className={`p-3.5 rounded-xl border text-sm font-bold ${styles.readOnly}`}>
                  {formData.type}
                </div>
              </div>
              <div>
                <label className={styles.label}>Fiscal Year</label>
                <div className={`p-3.5 rounded-xl border text-sm font-bold ${styles.readOnly}`}>
                  {formData.year}
                </div>
              </div>
            </div>

            {/* Editing Grid */}
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <label className={styles.label}>Allocated</label>
                <input 
                  type="number" 
                  name="alloc"
                  value={formData.alloc}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
              <div>
                <label className={styles.label}>Carry Over</label>
                <input 
                  type="number" 
                  name="carry"
                  value={formData.carry}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
              <div>
                <label className={styles.label}>Used</label>
                <input 
                  type="number" 
                  name="used"
                  value={formData.used}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl p-3 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
            </div>

            {/* Calculation Result */}
            <div className={`p-6 rounded-2xl border transition-all ${availableDays < 0 ? 'bg-red-500/10 border-red-500/50' : 'bg-[#7c3aed]/10 border-[#7c3aed]/30'}`}>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                    <Calculator size={14} /> New Total Balance
                  </div>
                  <div className={`text-3xl font-black ${availableDays < 0 ? 'text-red-500' : 'text-[#7c3aed]'}`}>
                    {availableDays.toFixed(1)} <span className="text-xs uppercase">Days</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold text-[#94a3b8] uppercase">Net Change</div>
                   <div className={`text-sm font-black ${diff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                     {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                   </div>
                </div>
              </div>
              {availableDays < 0 && (
                <div className="mt-4 flex gap-2 text-red-500 items-start">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold leading-tight uppercase tracking-tighter">Warning: This adjustment results in a negative balance for the employee.</p>
                </div>
              )}
            </div>

            {/* Mandatory Reason */}
            <div className="space-y-1.5">
              <label className={styles.label}>Adjustment Reason*</label>
              <textarea 
                name="reason"
                required
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Explain why this manual edit is being made..."
                className={`w-full border rounded-xl p-3.5 text-sm outline-none transition-all h-24 resize-none ${styles.input}`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={`p-8 border-t border-inherit flex justify-end gap-4 ${styles.footer}`}>
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={availableDays < 0 || !formData.reason}
              className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveBalance;