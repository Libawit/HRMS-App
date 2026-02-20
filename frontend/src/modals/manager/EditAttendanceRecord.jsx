import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Save, 
  AlertCircle,
  History,
  Loader2
} from 'lucide-react';
import axios from '../../utils/axiosConfig';

const EditAttendanceRecord = ({ isOpen, onClose, theme = 'dark', data, onRefresh }) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    status: '',
    adjustmentReason: ''
  });
  const [loading, setLoading] = useState(false);

  const displayName = data?.employeeName || data?.name || data?.employee?.name || "Employee";

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        checkIn: (data.checkIn && data.checkIn !== '--:--') ? convertTo24Hour(data.checkIn) : '09:00',
        checkOut: (data.checkOut && data.checkOut !== '--:--') ? convertTo24Hour(data.checkOut) : '17:00',
        status: data.status || 'On Time',
        adjustmentReason: data.notes || ''
      });
    }
  }, [data, isOpen]);

  function convertTo24Hour(timeStr) {
    if (!timeStr || ['--:--', '-', 'Invalid Date'].includes(timeStr)) return '09:00';
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    
    // Handle ISO strings
    if (timeStr.includes('T')) {
      const parts = timeStr.split('T')[1].split(':');
      return `${parts[0]}:${parts[1]}`;
    }

    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    } catch (e) {
      return '09:00';
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const rawDate = data.date || new Date().toISOString();
      const baseDate = rawDate.split('T')[0];
      
      const payload = {
        status: formData.status,
        notes: formData.adjustmentReason,
        // If Absent, we send null for times
        checkIn: formData.status === 'Absent' ? null : new Date(`${baseDate}T${formData.checkIn}:00`).toISOString(),
        checkOut: formData.status === 'Absent' ? null : new Date(`${baseDate}T${formData.checkOut}:00`).toISOString()
      };

      await axios.put(`http://localhost:5000/api/attendance/${data.id || data._id}`, payload);

      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update record";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    label: "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1.5 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-lg rounded-2xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        <div className="p-6 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <History size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Edit Attendance Log</h3>
              <p className="text-xs text-[#94a3b8]">Adjusting record for {displayName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="p-6 space-y-5">
            <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white font-black">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold">{displayName}</div>
                  <div className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                    <Calendar size={10}/> {new Date(data.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#94a3b8] uppercase font-bold">Current Status</div>
                <div className={`text-xs font-bold ${data.status === 'Absent' ? 'text-red-500' : 'text-amber-500'}`}>
                  {data.status || 'N/A'}
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 transition-opacity ${formData.status === 'Absent' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div>
                <label className={styles.label}>Adjust Check In</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={14} />
                  <input 
                    type="time" 
                    value={formData.checkIn}
                    className={`w-full border rounded-xl p-3 pl-10 text-sm outline-none transition-all ${styles.input}`}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    required={formData.status !== 'Absent'}
                  />
                </div>
              </div>
              <div>
                <label className={styles.label}>Adjust Check Out</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={14} />
                  <input 
                    type="time" 
                    value={formData.checkOut}
                    className={`w-full border rounded-xl p-3 pl-10 text-sm outline-none transition-all ${styles.input}`}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    required={formData.status !== 'Absent'}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={styles.label}>Override Status</label>
              <select 
                className={`w-full border rounded-xl p-3 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="On Time">On Time</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div>
              <label className={styles.label}>Correction Note (Required)</label>
              <textarea 
                required
                rows="3"
                placeholder="Reason for manual adjustment..."
                className={`w-full border rounded-xl p-3 text-sm outline-none transition-all resize-none ${styles.input}`}
                value={formData.adjustmentReason}
                onChange={(e) => setFormData({...formData, adjustmentReason: e.target.value})}
              ></textarea>
            </div>

            <div className="flex gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-500/80 leading-relaxed">
                Manual adjustments are logged for audit purposes. This will recalculate work duration.
              </p>
            </div>
          </div>

          <div className={`p-6 border-t border-inherit flex justify-end gap-3 ${styles.footer}`}>
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#94a3b8] hover:bg-white/5 transition-all">
              Discard
            </button>
            <button 
              type="submit"
              disabled={loading || !formData.adjustmentReason.trim()}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : 'Update Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAttendanceRecord;