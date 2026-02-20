import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Clock, Calendar, CheckCircle, Timer, MapPin, AlertTriangle } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const AddAttendanceRecord = ({ isOpen, onClose, theme = 'dark', onRefresh }) => {
  // --- Helper for Local Date (YYYY-MM-DD) ---
  const getLocalDate = () => new Date().toLocaleDateString('en-CA');

  // --- Form State ---
  const [formData, setFormData] = useState({
    userId: '',
    date: getLocalDate(), // FIXED: Now uses local date
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'On Time',
    location: 'Office',
    note: ''
  });

  // --- UI & Data State ---
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState('8.0');
  const dropdownRef = useRef(null);

  const isDark = theme === 'dark';

  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    dropdown: isDark ? "bg-[#0f172a] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
  };

  // Reset form when modal opens to ensure current date/time is fresh
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        date: getLocalDate(),
        userId: '',
        note: ''
      }));
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch employees when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const res = await axios.get('http://localhost:5000/api/auth/users');
          setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Failed to fetch employees", err);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [isOpen]);

  // --- Logic for Duration & Auto-Status ---
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && formData.status !== 'Absent') {
      const start = new Date(`2000-01-01T${formData.checkIn}`);
      const end = new Date(`2000-01-01T${formData.checkOut}`);
      let diff = (end - start) / (1000 * 60 * 60);
      if (diff < 0) diff += 24;
      setDuration(diff.toFixed(1));

      const [hours, minutes] = formData.checkIn.split(':').map(Number);
      const isLate = hours > 9 || (hours === 9 && minutes > 5);
      const isHalfDay = diff > 0 && diff <= 4;

      setFormData(prev => ({ 
        ...prev, 
        status: isLate ? 'Late' : (isHalfDay ? 'Half Day' : 'On Time') 
      }));
    }
  }, [formData.checkIn, formData.checkOut]);

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.name || `${emp.firstName} ${emp.lastName}`;
    const search = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(search) ||
      emp.employeeId?.toLowerCase().includes(search)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) return alert("Please select an employee");
    setLoading(true);

    const token = localStorage.getItem('token'); 
    const fullCheckIn = new Date(`${formData.date}T${formData.checkIn}:00`).toISOString();
    const fullCheckOut = new Date(`${formData.date}T${formData.checkOut}:00`).toISOString();
    const attendanceDate = new Date(formData.date).toISOString();

    const payload = {
      employeeId: String(formData.userId),
      date: attendanceDate,
      checkIn: formData.status === 'Absent' ? null : fullCheckIn,
      checkOut: formData.status === 'Absent' ? null : fullCheckOut,
      status: formData.status,
      note: formData.note || ""
    };

    try {
      await axios.post('http://localhost:5000/api/attendance/manual', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving record.");
    } finally {
      setLoading(false);
    }
  };

  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    const checkDuplicate = async () => {
      if (formData.userId && formData.date) {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/attendance`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { date: formData.date } 
          });
          const exists = res.data.records?.some(r => r.userId === formData.userId);
          setIsDuplicate(exists);
        } catch (err) {
          console.error("Check failed", err);
        }
      }
    };
    checkDuplicate();
  }, [formData.userId, formData.date]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div>
            <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Manual Attendance</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Log check-in/out times</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Employee Search */}
          <div className="relative" ref={dropdownRef}>
            <label className={styles.label}>Search Employee*</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text"
                placeholder="Search name or ID..."
                className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (formData.userId) setFormData(prev => ({ ...prev, userId: '' }));
                }}
                required
              />
            </div>

            {isDropdownOpen && searchQuery && (
              <div className={`absolute z-50 w-full mt-2 rounded-2xl border max-h-52 overflow-y-auto p-2 ${styles.dropdown}`}>
                {loading ? (
                  <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-[#7c3aed]" /></div>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => {
                    const displayName = emp.name || `${emp.firstName} ${emp.lastName}`;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                        onClick={() => {
                          setFormData({ ...formData, userId: emp.id });
                          setSearchQuery(displayName);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-sm">
                          {displayName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-black">{displayName}</div>
                          <div className="text-[10px] opacity-50 font-bold uppercase">ID: {emp.employeeId}</div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-[10px] font-bold text-slate-500 uppercase">No employee found</div>
                )}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className={styles.label}>Attendance Date*</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none ${styles.input}`}
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          {/* Time Fields */}
          <div className={`grid grid-cols-2 gap-4 ${formData.status === 'Absent' ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="space-y-1.5">
              <label className={styles.label}>Check In*</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="time" 
                  className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none ${styles.input}`}
                  required={formData.status !== 'Absent'}
                  value={formData.checkIn}
                  onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={styles.label}>Check Out*</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="time" 
                  className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none ${styles.input}`}
                  required={formData.status !== 'Absent'}
                  value={formData.checkOut}
                  onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Status & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={styles.label}>Status*</label>
              <select 
                className={`w-full border rounded-2xl p-4 text-sm font-black outline-none transition-all ${styles.input}`}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="On Time">On Time</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={styles.label}>Work Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select 
                  className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none ${styles.input}`}
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  disabled={formData.status === 'Absent'}
                >
                  <option value="Office">Office</option>
                  <option value="Remote">Remote</option>
                  <option value="Field">Field Work</option>
                </select>
              </div>
            </div>
          </div>

          {/* Note Field */}
          <div className="space-y-1.5">
            <label className={styles.label}>Internal Note</label>
            <textarea 
              rows="2"
              className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none resize-none transition-all ${styles.input}`}
              placeholder="Reason for manual entry..."
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          {/* Duplicate Warning */}
          {isDuplicate && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 mb-4">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Warning: A record already exists for this date!
              </span>
            </div>
          )}

          {/* Footer Actions */}
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
              disabled={loading || !formData.userId}
              className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttendanceRecord;