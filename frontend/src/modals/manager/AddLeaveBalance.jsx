import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Info, Calculator, ShieldCheck, Search, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const AddLeaveBalanceModal = ({ isOpen, onClose, theme = 'dark', selectedYear = '2026', managerDeptId }) => {
  
  const [formData, setFormData] = useState({
    userId: '',
    leaveTypeId: '',
    year: selectedYear,
    allocated: 0,
    used: 0,
    carriedOver: 0,
    note: ''
  });

  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState(0);
  
  const dropdownRef = useRef(null);
  const isDark = theme === 'dark';

  // --- Fetch Data ---
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [userRes, leaveRes] = await Promise.all([
            axios.get('http://localhost:5000/api/auth/users'),
            axios.get('http://localhost:5000/api/auth/leave-types')
          ]);
          setEmployees(Array.isArray(userRes.data) ? userRes.data : []);
          setLeaveTypes(Array.isArray(leaveRes.data) ? leaveRes.data : []);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // --- Calculation Logic ---
  useEffect(() => {
    const total = Number(formData.allocated) + Number(formData.carriedOver) - Number(formData.used);
    setAvailableDays(total);
  }, [formData.allocated, formData.used, formData.carriedOver]);

  // --- CRITICAL FILTERING LOGIC ---
  
  // 1. Filter by Department ID 
  // We check 'dept_id' or 'departmentId' or 'department_id' to be safe.
  const deptEmployees = employees.filter(emp => {
    if (!managerDeptId) return true; // Show all if ID isn't provided yet
    
    // Compare as strings to avoid type mismatch (e.g., "1" vs 1)
    const empDeptId = emp.dept_id || emp.departmentId || emp.department_id;
    return String(empDeptId) === String(managerDeptId);
  });

  // 2. Search Logic within that department
  const searchResults = deptEmployees.filter(emp => {
    const fullName = (emp.name || `${emp.firstName} ${emp.lastName}`).toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) return alert("Please select a team member");

    try {
      await axios.post('http://localhost:5000/api/auth/leave-balances', {
        ...formData,
        year: parseInt(formData.year),
        allocated: parseFloat(formData.allocated),
        used: parseFloat(formData.used),
        carriedOver: parseFloat(formData.carriedOver)
      });
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || "Error saving balance");
    }
  };

  if (!isOpen) return null;

  const styles = {
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    dropdown: isDark ? "bg-[#0f172a] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] mb-1.5 block"
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-[#7c3aed]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight text-[#7c3aed]">Assign Entitlement</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> ID: {managerDeptId || "Global"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            
            {/* Search Input */}
            <div className="relative" ref={dropdownRef}>
              <label className={styles.label}>Team Member Selection*</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text"
                  autoComplete="off"
                  placeholder="Type name to search department..."
                  className={`w-full border rounded-xl p-4 pl-12 text-sm font-bold outline-none ${styles.input}`}
                  value={searchQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                    // Reset userId if user clears or changes the search text
                    if (formData.userId) setFormData(prev => ({ ...prev, userId: '' }));
                  }}
                />
              </div>

              {/* Dropdown Menu - UPDATED CONDITION HERE */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className={`absolute z-50 w-full mt-2 rounded-2xl border max-h-56 overflow-y-auto p-2 ${styles.dropdown}`}>
                  {loading ? (
                    <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-[#7c3aed]" /></div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(emp => (
                      <button
                        key={emp.id || emp._id}
                        type="button"
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                        onClick={() => {
                          setFormData({ ...formData, userId: emp.id || emp._id });
                          setSearchQuery(emp.name || `${emp.firstName} ${emp.lastName}`);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-xs">
                          {(emp.name || emp.firstName || "U")[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{emp.name || `${emp.firstName} ${emp.lastName}`}</div>
                          <div className="text-[10px] opacity-50 uppercase font-bold">{emp.email}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>  

            {/* Rest of the form fields... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={styles.label}>Leave Policy*</label>
                <select 
                  name="leaveTypeId" 
                  value={formData.leaveTypeId} 
                  onChange={handleInputChange} 
                  className={`w-full border rounded-xl p-3.5 text-sm font-bold outline-none ${styles.input}`} 
                  required
                >
                  <option value="">Select Type</option>
                  {leaveTypes.map(type => <option key={type.id || type._id} value={type.id || type._id}>{type.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={styles.label}>Fiscal Year</label>
                <input type="text" value={formData.year} readOnly className={`w-full border rounded-xl p-3.5 text-sm font-black cursor-not-allowed opacity-60 ${styles.input}`} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={styles.label}>Allocated</label>
                <input type="number" name="allocated" value={formData.allocated} onChange={handleInputChange} className={`w-full border rounded-xl p-3.5 text-sm font-bold ${styles.input}`} />
              </div>
              <div>
                <label className={styles.label}>Carry Over</label>
                <input type="number" name="carriedOver" value={formData.carriedOver} onChange={handleInputChange} className={`w-full border rounded-xl p-3.5 text-sm font-bold ${styles.input}`} />
              </div>
              <div>
                <label className={styles.label}>Used</label>
                <input type="number" name="used" value={formData.used} onChange={handleInputChange} className={`w-full border rounded-xl p-3.5 text-sm font-bold ${styles.input}`} />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-linear-to-br from-[#7c3aed]/10 to-transparent border border-[#7c3aed]/20 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#7c3aed]">
                <Calculator size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Net Available</span>
              </div>
              <div className={`text-2xl font-black ${availableDays < 0 ? 'text-red-500' : 'text-[#7c3aed]'}`}>
                {availableDays.toFixed(1)} <span className="text-[10px] uppercase">Days</span>
              </div>
            </div>
          </div>

          <div className={`p-8 border-t border-inherit flex justify-end gap-4 ${isDark ? 'bg-[#020617]/50' : 'bg-slate-50'}`}>
            <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-black uppercase text-red-500 hover:bg-red-500/10 rounded-xl transition-all">Cancel</button>
            <button 
              type="submit" 
              disabled={!formData.userId || !formData.leaveTypeId || availableDays < 0}
              className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6d28d9] disabled:opacity-50 transition-all shadow-xl shadow-purple-500/20"
            >
              Confirm Entitlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveBalanceModal;