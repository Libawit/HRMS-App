import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, AlertTriangle, RefreshCcw, Search, UserCheck, UserPlus, ShieldAlert 
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

  const isDark = theme === 'dark';

  // --- INITIALIZE DATA ---
  useEffect(() => {
    if (data && isOpen) {
      const detectedDeptId = data.departmentId || data.employee?.departmentId || data.employee?.department?.id;
      const manager = data.manager || data.reportsTo;
      const employee = data.employee || data;

      // Safe Name Resolver
      const getSafeName = (u) => {
        if (!u) return null;
        return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
      };

      const sName = getSafeName(manager) || "Self-Reporting";
      const eName = getSafeName(employee) || "User";

      setFormData({
        id: data.id,
        employeeId: data.employeeId || employee.id,
        supervisorId: data.managerId || manager?.id || 'none',
        supervisorName: sName,
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

  // --- CLICK OUTSIDE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FILTERED SEARCH RESULTS ---
  const filteredUsers = useMemo(() => {
    if (!formData) return [];
    return allUsers.filter(user => {
      const isNotSelf = String(user.id) !== String(formData.employeeId);
      const fullName = (user.name || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      
      // Managers can usually only assign within the same department for structure integrity
      const uDeptId = user.departmentId || user.department?.id || user.departmentRel?.id;
      const isSameDept = String(uDeptId) === String(formData.deptId);
      
      return isNotSelf && matchesSearch && isSameDept;
    });
  }, [allUsers, searchQuery, formData]);

  if (!isOpen || !formData) return null;

  const styles = {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all`,
    resultItem: `flex items-center justify-between p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-white/5 border-b border-white/5 text-white' : 'hover:bg-slate-50 border-b border-slate-100 text-slate-900'} last:border-0`
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // POST to sync is often cleaner for updating relationships 
      // but sticking to PUT as per your backend route
      await axios.put(`${API_BASE}/structure/${formData.employeeId}`, {
        employeeId: formData.employeeId,
        managerId: formData.supervisorId === 'none' ? null : formData.supervisorId
      });
      onSave();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-purple-500/5 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <ShieldAlert size={14} className="text-[#7c3aed]" />
                <span className="text-[#7c3aed] font-black text-[10px] uppercase tracking-[0.2em]">Structure Management</span>
            </div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Reporting Line</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Employee Badge */}
          <div className={`flex items-center gap-4 p-4 rounded-3xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-lg">
              {formData.empName.charAt(0)}
            </div>
            <div>
              <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.empName}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{formData.pos} • {formData.dept}</p>
            </div>
          </div>

          {/* Supervisor Selection Logic */}
          <div className="space-y-3" ref={dropdownRef}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Supervisor Assignment</label>
            
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
              <div className="flex items-center gap-3">
                <UserCheck className="text-[#7c3aed]" size={18} />
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                  {formData.supervisorId === 'none' ? 'Self-Reporting (Independent)' : `Reporting to: ${formData.supervisorName}`}
                </span>
              </div>
              {formData.supervisorId !== 'none' && (
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, supervisorId: 'none', supervisorName: 'Self-Reporting'})} 
                  className="text-[10px] font-black text-[#7c3aed] uppercase hover:text-purple-400 transition-colors"
                >
                  Remove Manager
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search new supervisor..." 
                className={`${styles.input} pl-12`} 
                value={searchQuery} 
                onFocus={() => setShowResults(true)} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />

              {showResults && searchQuery && (
                <div className={`absolute w-full mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-[#0f1623] border-white/10' : 'bg-white border-slate-200'} max-h-48 overflow-y-auto`}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div key={user.id} className={styles.resultItem} onClick={() => {
                        setFormData({...formData, supervisorId: user.id, supervisorName: user.name || `${user.firstName} ${user.lastName}`});
                        setSearchQuery("");
                        setShowResults(false);
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] font-bold text-xs">
                            {(user.name || user.firstName).charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black">{user.name || `${user.firstName} ${user.lastName}`}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">{user.jobPosition?.title || 'Staff'}</p>
                          </div>
                        </div>
                        <UserPlus size={14} className="text-[#7c3aed]" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">No matching department members</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isDark ? 'text-slate-500 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-2 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? <RefreshCcw className="animate-spin" size={16} /> : <RefreshCcw size={16} />} 
              Commit Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStructure;