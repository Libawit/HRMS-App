import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const EditLeaveBalance = ({ isOpen, onClose, theme = 'dark', data }) => {
  // --- State ---
  const [formData, setFormData] = useState({
    alloc: 0,
    used: 0,
    carry: 0
  });
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState(0);

  // --- Sync Data when modal opens ---
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
    setAvailableDays(total >= 0 ? total : 0);
  }, [formData.alloc, formData.used, formData.carry]);

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    disabledInput: isDark ? "bg-[#020617]/50 border-white/5 text-slate-500 cursor-not-allowed" : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block"
  };

  if (!isOpen || !data) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if we have the necessary IDs from the data prop
    if (!data.userId || !data.leaveTypeId) {
      console.error("Missing required IDs in data object:", data);
      alert("Error: Missing required identification data. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: data.userId, 
        leaveTypeId: data.leaveTypeId,
        year: parseInt(data.year),
        month: data.month, // Sending the original month back ensures we update the right record
        allocated: parseFloat(formData.alloc),
        used: parseFloat(formData.used),
        carriedOver: parseFloat(formData.carry)
      };

      await axios.post('http://localhost:5000/api/auth/leave-balances', payload);
      onClose(); 
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to update record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-lg rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div>
            <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Update Balance</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Modify existing entitlement</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Read-only Info Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={styles.label}>Employee</label>
              <input 
                type="text" 
                value={data.name} 
                disabled 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.disabledInput}`} 
              />
            </div>
            <div className="space-y-1.5">
              <label className={styles.label}>Fiscal Year</label>
              <input 
                type="text" 
                value={data.year} 
                disabled 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.disabledInput}`} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={styles.label}>Leave Type</label>
            <div className={`w-full border rounded-2xl p-4 text-sm font-black ${styles.disabledInput}`}>
               {data.type}
            </div>
          </div>

          {/* Adjustment Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={styles.label}>Allocated</label>
              <input 
                type="number" 
                step="0.5"
                name="alloc"
                value={formData.alloc}
                onChange={handleInputChange}
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`} 
              />
            </div>
            <div>
              <label className={styles.label}>Used</label>
              <input 
                type="number" 
                step="0.5"
                name="used"
                value={formData.used}
                onChange={handleInputChange}
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`} 
              />
            </div>
            <div>
              <label className={styles.label}>Available</label>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-sm font-black text-emerald-500 text-center">
                {availableDays.toFixed(1)}
              </div>
            </div>
          </div>

          <div>
             <label className={styles.label}>Carried Over</label>
             <input 
               type="number" 
               step="0.5"
               name="carry"
               value={formData.carry}
               onChange={handleInputChange}
               className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`} 
             />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveBalance;