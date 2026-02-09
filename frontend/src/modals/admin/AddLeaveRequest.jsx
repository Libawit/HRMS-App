import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Calendar, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';

const AddLeaveRequest = ({ isOpen, onClose, theme = 'dark', onRefresh }) => {
  // --- Form State ---
  const [formData, setFormData] = useState({
    userId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false
  });

  // --- UI & Data State ---
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const isDark = theme === 'dark';

  // --- Theme Styles (Matching AddLeaveBalance) ---
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    dropdown: isDark ? "bg-[#0f172a] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
  };

  // --- Click Outside Handler ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Fetch Data ---
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [userRes, leaveRes] = await Promise.all([
            axios.get('http://localhost:3000/api/auth/users'),
            axios.get('http://localhost:3000/api/auth/leave-types')
          ]);
          setEmployees(Array.isArray(userRes.data) ? userRes.data : []);
          setLeaveTypes(Array.isArray(leaveRes.data) ? leaveRes.data : []);
        } catch (err) {
          console.error("Failed to fetch data", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // --- Filter Logic ---
  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.name || `${emp.firstName} ${emp.lastName}`;
    const search = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(search) ||
      emp.employeeId?.toLowerCase().includes(search)
    );
  });

  // --- Duration Calculation ---
  const calculateDays = () => {
    if (formData.isHalfDay) return 0.5;
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.userId) return alert("Please select an employee");
  setLoading(true);

  const payload = {
    userId: formData.userId, // If your DB uses Int: parseInt(formData.userId)
    leaveTypeId: formData.leaveTypeId, // If your DB uses Int: parseInt(formData.leaveTypeId)
    startDate: new Date(formData.startDate).toISOString(),
    endDate: new Date(formData.isHalfDay ? formData.startDate : formData.endDate).toISOString(),
    daysRequested: calculateDays(),
    reason: formData.reason,
    status: 'PENDING'
  };

  try {
    await axios.post('http://localhost:3000/api/auth/leave-requests', payload);
    onRefresh();
    onClose();
  } catch (err) {
    // This will now show you EXACTLY what the backend didn't like
    console.error("Server Error:", err.response?.data);
    alert(err.response?.data?.error || "Error creating request");
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div>
            <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">New Leave Request</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Submit a new absence</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Searchable Employee Field */}
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

          {/* Leave Type & Half Day Toggle */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className={styles.label}>Leave Type*</label>
              <select 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer ${styles.input}`}
                required
                value={formData.leaveTypeId}
                onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})}
              >
                <option value="">Select Type</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 p-4 mb-0.5 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/10">
              <input 
                type="checkbox" 
                id="halfDay"
                checked={formData.isHalfDay}
                onChange={(e) => setFormData({...formData, isHalfDay: e.target.checked})}
                className="w-4 h-4 accent-[#7c3aed]"
              />
              <label htmlFor="halfDay" className="text-xs font-black uppercase tracking-tight cursor-pointer">Half Day Request</label>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={styles.label}>Start Date*</label>
              <input 
                type="date" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`}
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            {!formData.isHalfDay && (
              <div className="space-y-1.5">
                <label className={styles.label}>End Date*</label>
                <input 
                  type="date" 
                  className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`}
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            )}
          </div>

          {/* Duration Indicator */}
          <div className="flex items-center gap-2">
             <div className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] bg-[#7c3aed]/10 px-3 py-2 rounded-lg">
                Total Duration: {calculateDays()} Days
             </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className={styles.label}>Reason for Leave*</label>
            <textarea 
              rows="3"
              className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none resize-none transition-all ${styles.input}`}
              placeholder="Provide a brief explanation..."
              required
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

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
              disabled={loading}
              className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveRequest;