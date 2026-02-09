import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Save, 
  AlertTriangle, 
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  History
} from 'lucide-react';

const EditLeaveCalendar = ({ isOpen, onClose, theme = 'dark', data }) => {
  // Manager Context
  const managerDept = "Engineering";

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: '',
    type: '',
    managerJustification: ''
  });

  // Sync state when data prop changes
  useEffect(() => {
    if (data && isOpen) {
      // Logic to format the date from the calendar day
      const year = 2026;
      const month = "01"; // Logic should match your calendar's current month
      const day = String(data.day).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setFormData({
        startDate: formattedDate,
        endDate: formattedDate,
        status: data.status || 'pending',
        type: data.type || 'Annual',
        managerJustification: ''
      });
    }
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" 
      : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark
      ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white"
      : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-2 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log(`Manager [${managerDept}] updated entry:`, { id: data.id, ...formData });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Managerial Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
              <History size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Review Leave Record</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#7c3aed]" /> {managerDept} Department Oversight
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-8 space-y-6">
            
            {/* Employee Focus Bar */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="w-12 h-12 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/20">
                {data.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-md font-black">{data.name}</div>
                <div className="flex gap-3 mt-0.5">
                   <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tighter flex items-center gap-1">
                     <Clock size={10}/> Pending: 2.0d
                   </span>
                   <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                     <CheckCircle2 size={10}/> Available: 14.5d
                   </span>
                </div>
              </div>
            </div>

            {/* Date Re-assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={styles.label}>Amended Start</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
              <div>
                <label className={styles.label}>Amended End</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                />
              </div>
            </div>

            {/* Decision Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={styles.label}>Policy Class</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all ${styles.input}`}
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Managerial Status</label>
                <div className="relative">
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className={`w-full border rounded-xl p-4 text-sm font-black outline-none transition-all ${styles.input} ${
                      formData.status === 'approved' ? 'text-emerald-500' : 
                      formData.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                    }`}
                  >
                    <option value="pending">🟡 Pending Review</option>
                    <option value="approved">🟢 Approved</option>
                    <option value="rejected">🔴 Rejected</option>
                    <option value="cancelled">⚪ Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Managerial Justification */}
            <div>
              <label className={styles.label}>Modification Justification*</label>
              <textarea 
                rows="3"
                required
                placeholder="Manager note required for manual schedule changes..."
                className={`w-full border rounded-xl p-4 text-sm font-medium outline-none transition-all resize-none ${styles.input}`}
                value={formData.managerJustification}
                onChange={(e) => setFormData({...formData, managerJustification: e.target.value})}
              ></textarea>
            </div>

            {/* Impact Warning */}
            <div className="flex gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#94a3b8] leading-relaxed font-medium">
                <span className="text-amber-500 font-black">SYSTEM NOTICE:</span> Saving these changes will immediately recalculate the employee's balance for the 2026 fiscal year and trigger a notification to HR.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`p-8 border-t border-inherit flex justify-end items-center gap-6 ${styles.footer}`}>
            <button 
              type="button" 
              onClick={onClose}
              className="text-xs font-black uppercase tracking-[0.2em] text-[#94a3b8] hover:text-red-500 transition-all"
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/40 active:scale-95 transition-all flex items-center gap-3"
            >
              <Save size={18} /> Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveCalendar;