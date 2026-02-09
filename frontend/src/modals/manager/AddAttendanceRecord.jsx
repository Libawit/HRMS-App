import React, { useState, useMemo } from 'react';
import { 
  X, 
  UserPlus, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Timer,
  ShieldCheck,
  Info
} from 'lucide-react';

const AddAttendanceRecord = ({ isOpen, onClose, theme = 'dark' }) => {
  // Mock department from Auth Context
  const managerDept = "Engineering";

  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'On Time',
    location: 'Office',
    note: '',
    isAuthorized: false
  });

  // Filtered list for manager's team
  const teamMembers = [
    { id: "1", name: "Jessica Taylor", code: "ENG-001" },
    { id: "2", name: "Michael Chen", code: "ENG-042" },
    { id: "4", name: "David Wilson", code: "ENG-009" },
  ];

  if (!isOpen) return null;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.isAuthorized) {
      alert("Please authorize this manual entry before saving.");
      return;
    }
    console.log("Manager Logged Attendance:", formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}>
        
        {/* Managerial Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-br from-[#7c3aed]/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Manual Department Log</h3>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">{managerDept} Team Only</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
            
            {/* Context Warning */}
            <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500/80">
                <Info size={18} className="shrink-0" />
                <p className="text-[11px] leading-relaxed font-medium italic">
                    Manual entries bypass automated clock-ins. Ensure notes justify this adjustment for future audits.
                </p>
            </div>

            {/* Employee Selection */}
            <div>
              <label className={styles.label}>Team Member</label>
              <select 
                required
                className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all appearance-none ${styles.input}`}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              >
                <option value="">Select from {managerDept}...</option>
                {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                <label className={styles.label}>Record Date</label>
                <div className="relative">
                    <input 
                    type="date" 
                    value={formData.date}
                    className={`w-full border rounded-xl p-4 text-sm font-mono outline-none transition-all ${styles.input}`}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" />
                </div>
                </div>

                {/* Status */}
                <div>
                <label className={styles.label}>Attendance Status</label>
                <select 
                    className={`w-full border rounded-xl p-4 text-sm font-black outline-none transition-all ${styles.input}`}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                    <option value="On Time">On Time</option>
                    <option value="Late">Late Arrival</option>
                    <option value="Overtime">Overtime</option>
                    <option value="Excused">Excused Absence</option>
                </select>
                </div>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Shift Start</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={formData.checkIn}
                    className={`w-full border rounded-xl p-4 text-sm font-mono outline-none transition-all ${styles.input}`}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                </div>
              </div>
              <div>
                <label className={styles.label}>Shift End</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={formData.checkOut}
                    className={`w-full border rounded-xl p-4 text-sm font-mono outline-none transition-all ${styles.input}`}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                </div>
              </div>
            </div>

            {/* Manager Notes */}
            <div>
              <label className={styles.label}>Authorization Note</label>
              <textarea 
                rows="3"
                required
                placeholder="e.g., Device failure at entrance, verified via CCTV or department meeting..."
                className={`w-full border rounded-xl p-4 text-sm font-medium outline-none transition-all resize-none ${styles.input}`}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              ></textarea>
            </div>

            {/* Authorization Check */}
            <label className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-[#7c3aed] text-[#7c3aed] focus:ring-0"
                    checked={formData.isAuthorized}
                    onChange={(e) => setFormData({...formData, isAuthorized: e.target.checked})}
                />
                <span className="text-xs font-bold text-[#94a3b8]">I authorize this manual time entry as the Department Manager</span>
            </label>
          </div>

          {/* Manager Footer */}
          <div className={`p-8 border-t border-inherit flex items-center justify-between ${styles.footer}`}>
            <div className="flex items-center gap-2">
                <Timer size={16} className="text-[#7c3aed]" />
                <span className="text-sm font-black text-[#7c3aed]">Preview: 8.0h</span>
            </div>
            <div className="flex gap-4">
                <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#94a3b8] hover:text-white transition-all"
                >
                Discard
                </button>
                <button 
                type="submit"
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                Confirm Log
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttendanceRecord;