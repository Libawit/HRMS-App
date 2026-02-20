import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axiosConfig';
import { X, UserPlus, FilePlus, CheckCircle, Loader2, Search, Calendar, ShieldCheck } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const AddLeaveCalendar = ({ isOpen, onClose, theme = 'dark', onRefresh }) => {
  // Get the logged-in manager's department info
  const { user: manager } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const [formData, setFormData] = useState({
    userId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    status: 'APPROVED', 
    reason: '',
    isHalfDay: false
  });

  const isDark = theme === 'dark';

  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    dropdown: isDark ? "bg-[#0f172a] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
    footer: isDark ? "bg-[#020617]/50" : "bg-slate-50"
  };

  // --- Fetch Metadata (Filtered by Manager Department) ---
  useEffect(() => {
    if (isOpen) {
      const fetchMetadata = async () => {
        setLoading(true);
        try {
          const [empRes, typeRes] = await Promise.all([
            // Pass the manager's department ID to the backend
            axios.get('http://localhost:5000/api/auth/users', {
              params: { departmentId: manager?.departmentId }
            }),
            axios.get('http://localhost:5000/api/auth/leave-types')
          ]);
          
          // Double-check filtering locally just in case backend endpoint returns all users
          const deptEmployees = Array.isArray(empRes.data) 
            ? empRes.data.filter(emp => emp.departmentId === manager?.departmentId)
            : [];
            
          setEmployees(deptEmployees);
          setLeaveTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
        } catch (err) {
          console.error("Metadata fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchMetadata();
    }
  }, [isOpen, manager?.departmentId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateDays = () => {
    if (formData.isHalfDay) return 0.5;
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.name || `${emp.firstName} ${emp.lastName}`;
    const search = searchTerm.toLowerCase();
    return fullName.toLowerCase().includes(search) || emp.employeeId?.toLowerCase().includes(search);
  });

  const selectedEmployee = employees.find(emp => emp.id === formData.userId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.leaveTypeId) {
      return alert("Please select both an employee and a leave type");
    }
    
    setLoading(true);

    const payload = {
      userId: String(formData.userId),
      leaveTypeId: String(formData.leaveTypeId),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.isHalfDay ? formData.startDate : formData.endDate).toISOString(),
      daysRequested: calculateDays(),
      reason: formData.reason,
      status: 'APPROVED'
    };

    try {
      await axios.post("http://localhost:5000/api/auth/leave-requests", payload);
      if (onRefresh) onRefresh();
      onClose();
      setFormData({ userId: '', leaveTypeId: '', startDate: '', endDate: '', status: 'APPROVED', reason: '', isHalfDay: false });
      setSearchTerm('');
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#7c3aed] text-white rounded-2xl shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Dept. Quick Log</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Log and Approve Absence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            
            {/* Searchable Employee Selector (Restricted to Dept) */}
            <div className="relative" ref={searchRef}>
              <label className={styles.label}>Team Member*</label>
              {!formData.userId ? (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text"
                    placeholder="Search departmental team..."
                    className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all ${styles.input}`}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                    required
                  />
                </div>
              ) : (
                <div className={`flex items-center justify-between p-4 border rounded-2xl ${styles.input}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-sm">
                      {(selectedEmployee?.firstName || selectedEmployee?.name || 'U')[0]}
                    </div>
                    <div>
                      <div className="text-sm font-black">{selectedEmployee?.name || `${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}</div>
                      <div className="text-[10px] opacity-50 font-bold uppercase">ID: {selectedEmployee?.employeeId}</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setFormData({...formData, userId: ''}); setSearchTerm(''); }}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              )}

              {isSearching && !formData.userId && (
                <div className={`absolute z-50 w-full mt-2 rounded-2xl border max-h-52 overflow-y-auto p-2 ${styles.dropdown}`}>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                        onClick={() => {
                          setFormData({...formData, userId: emp.id});
                          setIsSearching(false);
                          setSearchTerm(emp.name || `${emp.firstName} ${emp.lastName}`);
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center text-[10px] font-bold text-[#7c3aed]">
                          {(emp.firstName || emp.name || 'U')[0]}
                        </div>
                        <div>
                           <div className="text-sm font-black">{emp.name || `${emp.firstName} ${emp.lastName}`}</div>
                           <div className="text-[9px] opacity-50 uppercase font-bold tracking-tight">{emp.employeeId}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] font-bold text-slate-500 uppercase">No members in your department</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className={styles.label}>Leave Type*</label>
                <select 
                  required 
                  className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer ${styles.input}`}
                  onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})} 
                  value={formData.leaveTypeId}
                >
                  <option value="">Select Type</option>
                  {leaveTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 p-4 mb-0.5 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/10">
                <input 
                  type="checkbox" 
                  id="calHalfDay"
                  checked={formData.isHalfDay}
                  onChange={(e) => setFormData({...formData, isHalfDay: e.target.checked})}
                  className="w-4 h-4 accent-[#7c3aed]"
                />
                <label htmlFor="calHalfDay" className="text-xs font-black uppercase tracking-tight cursor-pointer">Half Day</label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={styles.label}>Start Date*</label>
                <input type="date" required className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})} value={formData.startDate} />
              </div>
              {!formData.isHalfDay && (
                <div className="space-y-1.5">
                  <label className={styles.label}>End Date*</label>
                  <input type="date" required className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} value={formData.endDate} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle size={12} strokeWidth={3} />
                  Auto-Approving: {calculateDays()} Days
                </div>
            </div>

            <div className="space-y-1.5">
              <label className={styles.label}>Departmental Notes*</label>
              <textarea 
                rows="3" 
                required
                placeholder="Reason for logging this absence..."
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none resize-none transition-all ${styles.input}`}
                onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                value={formData.reason}
              />
            </div>
          </div>

          <div className={`p-8 border-t border-inherit flex justify-end gap-3 ${styles.footer}`}>
            <button type="button" onClick={onClose} className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-all">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <FilePlus size={14} />}
              Log Absence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveCalendar;