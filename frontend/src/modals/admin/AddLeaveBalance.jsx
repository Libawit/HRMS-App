import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosConfig';


  const AddLeaveBalance = ({ isOpen, onClose, theme = 'dark', selectedYear }) => {
  const [formData, setFormData] = useState({
    userId: '',
    leaveTypeId: '',
    year: selectedYear || '2026', // Use the prop here
    allocated: 0,
    used: 0,
    carriedOver: 0
  });

  // Also update it if the prop changes
  useEffect(() => {
    if (selectedYear) {
      setFormData(prev => ({ ...prev, year: selectedYear.toString() }));
    }
  }, [selectedYear]);
  


  // --- Search & Data State ---
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState(0);
  
  const dropdownRef = useRef(null);

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-2000 flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    dropdown: isDark ? "bg-[#0f172a] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block"
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

  // --- Fetch Users and Leave Types ---
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Note: URLs match the new routes we added to authRoutes.js
          const [userRes, leaveRes] = await Promise.all([
            axios.get('http://localhost:5000/api/auth/users'),
            axios.get('http://localhost:5000/api/auth/leave-types')
          ]);
          setEmployees(Array.isArray(userRes.data) ? userRes.data : []);
          setLeaveTypes(Array.isArray(leaveRes.data) ? leaveRes.data : []);
        } catch (err) {
          console.error("Failed to fetch data", err);
          setEmployees([]);
          setLeaveTypes([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // --- Updated Filter Logic for FirstName/LastName or Name ---
  const filteredEmployees = Array.isArray(employees) 
    ? employees.filter(emp => {
        const fullName = emp.name || `${emp.firstName} ${emp.lastName}`;
        const search = searchQuery.toLowerCase();
        return (
          fullName.toLowerCase().includes(search) ||
          emp.email?.toLowerCase().includes(search) ||
          emp.employeeId?.toLowerCase().includes(search)
        );
      })
    : [];

  // --- Calculation Logic ---
  useEffect(() => {
    const total = Number(formData.allocated) + Number(formData.carriedOver) - Number(formData.used);
    setAvailableDays(total >= 0 ? total : 0);
  }, [formData.allocated, formData.used, formData.carriedOver]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.userId) return alert("Please select an employee");
  
  // Ensure we send numbers, not strings
  const payload = {
    ...formData,
    year: parseInt(formData.year),
    allocated: parseFloat(formData.allocated),
    used: parseFloat(formData.used),
    carriedOver: parseFloat(formData.carriedOver)
  };

  try {
    await axios.post('http://localhost:5000/api/auth/leave-balances', payload);
    onClose();
  } catch (error) {
    alert(error.response?.data?.error || "Error creating balance");
  }
};

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-lg rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div>
            <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Adjust Balance</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Create entitlement record</p>
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
                placeholder="Search name, email, or ID..."
                className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all ${styles.input}`}
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                    if (formData.userId) setFormData(prev => ({ ...prev, userId: '' }));
                }}
              />
            </div>

            {isDropdownOpen && (
              <div className={`absolute z-50 w-full mt-2 rounded-2xl border max-h-60 overflow-y-auto p-2 ${styles.dropdown} animate-in slide-in-from-top-2 duration-200`}>
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
                        <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-sm uppercase">
                          {displayName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-black">{displayName}</div>
                          <div className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">{emp.email}</div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">No employee found</div>
                    <div className="text-[9px] text-slate-400 mt-1 uppercase">Try searching by email or full name</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Leave Type & Year */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-1.5">
              <label className={styles.label}>Year</label>
              <div className="relative">
                <input 
                  type="text"
                  className={`w-full border rounded-2xl p-4 text-sm font-black outline-none cursor-not-allowed opacity-70 ${styles.input}`}
                  value={formData.year}
                  readOnly // Prevents typing
                  disabled // Grays it out slightly to show it's fixed
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-[10px] font-black text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-1 rounded-lg uppercase">
                    Fixed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={styles.label}>Allocated</label>
              <input 
                type="number" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`} 
                value={formData.allocated}
                onChange={(e) => setFormData({...formData, allocated: e.target.value})} 
              />
            </div>
            <div>
              <label className={styles.label}>Used</label>
              <input 
                type="number" 
                className={`w-full border rounded-2xl p-4 text-sm font-bold outline-none ${styles.input}`} 
                value={formData.used}
                onChange={(e) => setFormData({...formData, used: e.target.value})} 
              />
            </div>
            <div>
              <label className={styles.label}>Available</label>
              <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 p-4 rounded-2xl text-sm font-black text-[#7c3aed] text-center">
                {availableDays.toFixed(1)}
              </div>
            </div>
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
              className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveBalance;