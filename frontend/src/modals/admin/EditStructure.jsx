import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, AlertTriangle, RefreshCcw, Search, UserCheck, UserPlus
} from 'lucide-react';
import axios from '../../utils/axiosConfig';

const API_BASE = "http://localhost:5000/api";

const EditStructure = ({ isOpen, onClose, data, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);

  // --- INITIALIZE DATA ---
  useEffect(() => {
    if (data && isOpen) {
      // 1. Resolve Department ID
      const detectedDeptId = data.departmentId || data.employee?.departmentId || data.employee?.department?.id;
      
      // 2. Resolve Manager/Supervisor Name Safely
const manager = data.manager || data.reportsTo;
// Change default from "Unassigned" to "Self-Reporting"
let sName = "Self-Reporting"; 

if (manager) {
  if (manager.name) {
    sName = manager.name;
  } else if (manager.firstName || manager.lastName) {
    sName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim();
  }
}

// Safety check for empty results or bad strings
if (!sName || sName === "undefined undefined" || sName === "") {
  sName = "Self-Reporting";
}



      // 3. Resolve Employee Name Safely
      const employee = data.employee || data;
      const eName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "User";

      setFormData({
        id: data.id,
        employeeId: data.employeeId || employee.id,
        supervisorId: data.managerId || manager?.id || 'none',
        supervisorName: (sName && sName !== "undefined undefined") ? sName : "Unassigned",
        empName: eName,
        pos: data.jobPosition?.title || employee.jobPositionRel?.title || 'Staff',
        dept: data.department?.name || employee.departmentRel?.name || 'Unassigned',
        deptId: String(detectedDeptId || "")
      });
      fetchUsers();
    }
  }, [data, isOpen]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/users`);
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  // --- OUTSIDE CLICK HANDLER ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FILTER LOGIC ---
  const filteredUsers = useMemo(() => {
    if (!formData) return [];
    return allUsers.filter(user => {
      const isNotSelf = String(user.id) !== String(formData.employeeId);
      
      // Search by combined name
      const fullName = (user.name || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());

      // Dept Match
      const uDeptId = user.departmentId || user.department?.id || user.departmentRel?.id;
      const isSameDept = !uDeptId || String(uDeptId) === String(formData.deptId);
      
      return isNotSelf && matchesSearch && isSameDept;
    });
  }, [allUsers, searchQuery, formData]);

  if (!isOpen || !formData) return null;
  const isDark = theme === 'dark';

  const styles = {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed]`,
    resultItem: `flex items-center justify-between p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-white/5 border-b border-white/5 text-white' : 'hover:bg-slate-50 border-b border-slate-100 text-slate-900'} last:border-0`
  };

  // --- ACTIONS ---
  const selectSupervisor = (user) => {
    // FIX: Using the combined 'name' from backend to avoid undefined undefined
    const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    setFormData({ 
      ...formData, 
      supervisorId: user.id, 
      supervisorName: displayName 
    });
    setSearchQuery("");
    setShowResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`${API_BASE}/structure/${formData.employeeId}`, {
        employeeId: formData.employeeId,
        managerId: formData.supervisorId === 'none' ? null : formData.supervisorId
      });
      onSave();
      onClose();
    } catch (err) {
      alert("Update failed");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-purple-500/5 to-transparent">
          <div>
            <span className="text-[#7c3aed] font-black text-[10px] uppercase tracking-widest bg-[#7c3aed]/10 px-2 py-1 rounded-md mb-2 inline-block">Hierarchy Adjustment</span>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Modify Reporting Line</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-[#94a3b8] transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Targeted Employee Profile */}
          <div className={`flex items-center gap-4 p-5 rounded-4xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <div className="w-14 h-14 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
              {formData.empName.charAt(0)}
            </div>
            <div>
              <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.empName}</p>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">{formData.pos} • {formData.dept}</p>
            </div>
          </div>

          <div className="space-y-4" ref={dropdownRef}>
            <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-2 block ml-1">Search Supervisor (Required: {formData.dept} Dept)</label>
            
            {/* Current Selection Status */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border mb-2 ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
              <div className="flex items-center gap-3">
                <UserCheck className="text-[#7c3aed]" size={18} />
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                  Current: {formData.supervisorName}
                </span>
              </div>
              {formData.supervisorId !== 'none' && (
                <button 
    type="button" 
    // Change 'Unassigned' to 'Self-Reporting' here:
    onClick={() => setFormData({...formData, supervisorId: 'none', supervisorName: 'Self-Reporting'})} 
    className="text-[10px] font-black text-[#7c3aed] uppercase hover:underline"
  >
    Set Independent
  </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"><Search size={18} /></div>
              <input 
                type="text" 
                placeholder={`Type name to search in ${formData.dept}...`} 
                className={`${styles.input} pl-12 transition-all`} 
                value={searchQuery} 
                onFocus={() => setShowResults(true)} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />

              {showResults && searchQuery && (
                <div className={`absolute w-full mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-[#0f1623] border-white/10' : 'bg-white border-slate-200'} max-h-60 overflow-y-auto`}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div key={user.id} className={styles.resultItem} onClick={() => selectSupervisor(user)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed] font-bold text-[10px]">
                            {user.name ? user.name.charAt(0) : (user.firstName ? user.firstName.charAt(0) : '?')}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.name || `${user.firstName} ${user.lastName}`}</p>
                            <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-tighter">
                              {user.jobPosition?.title || 'Staff Member'}
                            </p>
                          </div>
                        </div>
                        <UserPlus size={16} className="text-[#7c3aed] opacity-50" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[#94a3b8] font-bold">No matching members found in this department</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-colors ${isDark ? 'text-[#94a3b8] hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-2 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? <RefreshCcw className="animate-spin" size={18} /> : <RefreshCcw size={18} />} 
              Update Reporting Line
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStructure;