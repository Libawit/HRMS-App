import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Save, 
  AlertCircle,
  MapPin,
  History,
  ShieldAlert,
  FileCheck,
  ChevronRight
} from 'lucide-react';

const EditAttendanceRecord = ({ isOpen, onClose, theme = 'dark', data }) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    status: '',
    location: '',
    adjustmentReason: '',
    hrReviewRequired: false
  });

  // Sync state when record is selected
  useEffect(() => {
    if (data) {
      setFormData({
        checkIn: data.checkIn !== '-' ? convertTo24Hour(data.checkIn) : '09:00',
        checkOut: data.checkOut !== '-' ? convertTo24Hour(data.checkOut) : '17:00',
        status: data.status || 'On Time',
        location: 'Main Office',
        adjustmentReason: '',
        hrReviewRequired: false
      });
    }
  }, [data, isOpen]);

  function convertTo24Hour(timeStr) {
    if (!timeStr || timeStr === '-') return '09:00';
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

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
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.1em] mb-2 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Manager Overwrite - Record ID:", data.id, formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}>
        
        {/* Managerial Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-br from-[#f59e0b]/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Override Attendance</h3>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Administrative Correction Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* Employee Summary Card */}
            <div className={`flex items-center justify-between p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-purple-500/20">
                  {data.name.charAt(0)}
                </div>
                <div>
                  <div className="font-black text-base">{data.name}</div>
                  <div className="text-xs font-bold text-[#94a3b8] flex items-center gap-2">
                    <Calendar size={12} className="text-[#7c3aed]"/> {data.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#94a3b8] uppercase font-black tracking-widest mb-1">Current Log</div>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black border border-amber-500/20">
                  {data.status}
                </div>
              </div>
            </div>

            {/* Time Adjustments */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={styles.label}>Corrected Check-In</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={formData.checkIn}
                    className={`w-full border rounded-xl p-4 text-sm font-mono outline-none transition-all ${styles.input}`}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className={styles.label}>Corrected Check-Out</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={formData.checkOut}
                    className={`w-full border rounded-xl p-4 text-sm font-mono outline-none transition-all ${styles.input}`}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" />
                </div>
              </div>
            </div>

            {/* Status & Location Override */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={styles.label}>Adjusted Status</label>
                <select 
                  className={`w-full border rounded-xl p-4 text-sm font-black outline-none transition-all ${styles.input}`}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="On Time">On Time</option>
                  <option value="Late">Late Arrival</option>
                  <option value="Overtime">Overtime</option>
                  <option value="Absent">Absent (Manual Entry)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={styles.label}>Reporting Location</label>
                <div className="relative">
                  <select 
                    className={`w-full border rounded-xl p-4 text-sm font-bold outline-none transition-all appearance-none ${styles.input}`}
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  >
                    <option value="Main Office">Main Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Client Site">Client Site</option>
                  </select>
                  <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                </div>
              </div>
            </div>

            {/* Managerial Justification */}
            <div className="space-y-2">
              <label className={styles.label}>Manager Justification (Required)</label>
              <textarea 
                required
                rows="3"
                placeholder="Describe why this correction is being made (e.g., Verified via security gate logs)..."
                className={`w-full border rounded-2xl p-4 text-sm font-medium outline-none transition-all resize-none ${styles.input}`}
                value={formData.adjustmentReason}
                onChange={(e) => setFormData({...formData, adjustmentReason: e.target.value})}
              ></textarea>
            </div>

            {/* HR Flag */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10 cursor-pointer group">
                <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-500" />
                    <span className="text-xs font-bold text-red-500/80">Flag for HR/Payroll reconciliation</span>
                </div>
                <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-red-500 text-red-500 focus:ring-0"
                    checked={formData.hrReviewRequired}
                    onChange={(e) => setFormData({...formData, hrReviewRequired: e.target.checked})}
                />
            </label>
          </div>

          {/* Footer */}
          <div className={`p-8 border-t border-inherit flex items-center justify-between ${styles.footer}`}>
            <div className="flex items-center gap-2 text-[#94a3b8]">
              <History size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Logs will be archived</span>
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
                  className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <FileCheck size={16} /> Finalize Changes
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAttendanceRecord;