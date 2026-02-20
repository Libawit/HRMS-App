import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Users, GitMerge, Search, Filter, Loader2,
  Plus, Edit, Trash2, Eye, ShieldCheck, 
  RefreshCcw, ChevronRight, Share2,
  ChevronLeft, ChevronDown, X
} from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { useOutletContext } from 'react-router-dom';

// Import Modals
import EditStructure from '../../modals/admin/EditStructure';
import ViewStructure from '../../modals/admin/ViewStructure';

const API_BASE = "http://localhost:5000/api";

const Structure = () => {
  const { theme } = useOutletContext(); 
  const isDark = theme === 'dark';

  // --- State ---
  const [activeTab, setActiveTab] = useState('assignment');
  const [selectedDept, setSelectedDept] = useState('Executive');
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]); 
  const [currentDepartment, setCurrentDepartment] = useState('All');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Search & Data State ---
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [supSearchQuery, setSupSearchQuery] = useState('');
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const [isSupDropdownOpen, setIsSupDropdownOpen] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    employeeId: '',
    supervisorId: ''
  });

  // Refs for closing dropdowns when clicking outside
  const empDropdownRef = useRef(null);
  const supDropdownRef = useRef(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  // --- 1. Close dropdowns on outside click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (empDropdownRef.current && !empDropdownRef.current.contains(event.target)) {
        setIsEmpDropdownOpen(false);
      }
      if (supDropdownRef.current && !supDropdownRef.current.contains(event.target)) {
        setIsSupDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- API Fetching ---

const fetchAllData = useCallback(async () => {
  if (loading) return;
  setLoading(true);
  try {
    // 1. Grab the token
    const token = localStorage.getItem('token');
    
    // 2. Set up the configuration with the Authorization header
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // 3. Pass the config to every request
    const [structRes, userRes, deptRes] = await Promise.all([
      axios.get(`${API_BASE}/structure`, config),
      axios.get(`${API_BASE}/auth/users`, config),
      axios.get(`${API_BASE}/auth/departments`, config)
    ]);
    
    setAssignments(Array.isArray(structRes.data) ? structRes.data : []);
    setUsers(Array.isArray(userRes.data) ? userRes.data : []);
    setDepartments(deptRes.data);
    
    if (deptRes.data.length > 0) {
      setSelectedDept(deptRes.data[0].name);
    }
  } catch (err) {
    console.error("Fetch failed", err);
    // Optional: If err.response.status === 401, redirect to login
  } finally {
    setLoading(false);
  }
}, [loading]); // Added loading to dependency for safety

  useEffect(() => {
  fetchAllData();
}, []);

  const getDisplayName = (user) => {
    if (!user) return 'Unknown';
    if (user.name) return user.name;
    if (user.firstName || user.lastName) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email?.split('@')[0] || 'Unknown User';
  };

  // Helper to resolve Department Name across different data structures
  const resolveDeptName = (userOrItem) => {
    if (userOrItem?.department?.name) return userOrItem.department.name;
    if (userOrItem?.departmentRel?.name) return userOrItem.departmentRel.name;
    
    const deptId = userOrItem?.departmentId || userOrItem?.employee?.departmentId;
    if (deptId && departments.length > 0) {
        const found = departments.find(d => String(d.id) === String(deptId));
        if (found) return found.name;
    }

    if (userOrItem?.employee?.department?.name) return userOrItem.employee.department.name;
    if (userOrItem?.employee?.departmentRel?.name) return userOrItem.employee.departmentRel.name;

    return 'N/A';
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter(item => {
      const empDeptId = item.departmentId || item.employee?.departmentId || item.employee?.departmentRel?.id;
      const matchesDept = currentDepartment === 'All' || String(empDeptId) === String(currentDepartment);
      const name = getDisplayName(item.employee).toLowerCase();
      const search = searchTerm.toLowerCase();
      return matchesDept && name.includes(search);
    });
  }, [assignments, searchTerm, currentDepartment]);

  const deptMembers = useMemo(() => {
    return assignments.filter(item => {
      const deptName = resolveDeptName(item);
      return deptName === selectedDept;
    });
  }, [assignments, selectedDept, departments]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssignments.slice(start, start + itemsPerPage);
  }, [filteredAssignments, currentPage]);

  const handleUpdateHierarchy = async () => {
  if (!newAssignment.employeeId) return alert("Please select an employee");
  try {
    const token = localStorage.getItem('token');
    
    await axios.post(`${API_BASE}/structure/sync`, {
      employeeId: newAssignment.employeeId,
      managerId: newAssignment.supervisorId || 'none'
    }, {
      headers: { Authorization: `Bearer ${token}` } // Pass token here
    });

    setEmpSearchQuery('');
    setSupSearchQuery('');
    setNewAssignment({ employeeId: '', supervisorId: '' });
    fetchAllData(); 
  } catch (err) {
    alert(err.response?.data?.message || "Sync failed");
  }
};

  const handleDelete = async (id) => {
  if (window.confirm("Remove this reporting relationship?")) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/structure/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAllData();
    } catch (err) {
      console.error("Delete failed", err.response?.data);
      alert(err.response?.data?.message || "Delete failed");
    }
  }
};

  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-[2.5rem] overflow-hidden transition-all duration-500`,
    input: `w-full p-4 rounded-2xl border transition-all appearance-none text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 ${
        isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`,
    tabBtn: (active) => `py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 px-8 ${
      active ? 'text-[#7c3aed] border-[#7c3aed]' : `border-transparent ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`
    }`,
    dropdown: `absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl overflow-hidden max-h-60 overflow-y-auto ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-slate-200'}`
  };

  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <main className={`flex-1 p-6 md:p-10 min-h-screen ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'} overflow-y-auto`}>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-[0.3em] mb-3">Organization &nbsp; • &nbsp; Hierarchy</p>
          <h1 className={`text-4xl font-black tracking-tighter ${textMain}`}>Structure</h1>
        </div>
      </div>

      <div className={styles.card}>
        <div className={`flex gap-4 px-8 border-b transition-colors ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
          <button onClick={() => setActiveTab('assignment')} className={styles.tabBtn(activeTab === 'assignment')}>
            <div className="flex items-center gap-2"><Users size={16}/> Assignment</div>
          </button>
          <button onClick={() => setActiveTab('relationships')} className={styles.tabBtn(activeTab === 'relationships')}>
            <div className="flex items-center gap-2"><GitMerge size={16}/> Tree View</div>
          </button>
        </div>

        <div className="p-8 lg:p-10">
          {activeTab === 'assignment' ? (
            <div className="space-y-10">
              <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  
                  {/* Employee Dropdown */}
                  <div className="flex-1 space-y-2 relative" ref={empDropdownRef}>
                    <label className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest ml-1">Employee</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search employee..." 
                        className={styles.input + " pl-12"}
                        value={empSearchQuery}
                        onFocus={() => setIsEmpDropdownOpen(true)}
                        onChange={(e) => {setEmpSearchQuery(e.target.value); setIsEmpDropdownOpen(true);}}
                      />
                    </div>
                    {isEmpDropdownOpen && (
                      <div className={styles.dropdown}>
                        {users.filter(u => getDisplayName(u).toLowerCase().includes(empSearchQuery.toLowerCase())).map(user => (
                          <button 
                            key={user.id} 
                            onClick={() => {
                              setNewAssignment({...newAssignment, employeeId: user.id, supervisorId: ''}); 
                              setEmpSearchQuery(getDisplayName(user)); 
                              setSupSearchQuery(''); 
                              setIsEmpDropdownOpen(false);
                            }} 
                            className={`w-full text-left p-4 hover:bg-[#7c3aed] hover:text-white transition-colors border-b last:border-0 ${isDark ? 'text-slate-300 border-white/5' : 'text-slate-700 border-slate-50'}`}
                          >
                            <div className="text-xs font-black">{getDisplayName(user)}</div>
                            <div className={`text-[10px] font-bold opacity-70`}>
                              ID: {user.employeeId || user.id}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Supervisor Dropdown */}
                  <div className="flex-1 space-y-2 relative" ref={supDropdownRef}>
                    <label className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest ml-1">Reports To</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder={newAssignment.employeeId ? "Search manager..." : "Select employee first"} 
                            className={styles.input + " pl-12"}
                            value={supSearchQuery}
                            onFocus={() => setIsSupDropdownOpen(true)}
                            onChange={(e) => {setSupSearchQuery(e.target.value); setIsSupDropdownOpen(true);}}
                            disabled={!newAssignment.employeeId}
                        />
                    </div>
                    {isSupDropdownOpen && (
                      <div className={styles.dropdown}>
                        <button onClick={() => {setNewAssignment({...newAssignment, supervisorId: 'none'}); setSupSearchQuery('NONE'); setIsSupDropdownOpen(false);}} className="w-full text-left p-4 text-xs font-black text-red-400 hover:bg-red-500 hover:text-white border-b border-white/5">NONE (Independent)</button>
                        {users.filter(u => {
                            const nameMatch = getDisplayName(u).toLowerCase().includes(supSearchQuery.toLowerCase());
                            const selectedEmp = users.find(e => e.id === newAssignment.employeeId);
                            const deptMatch = selectedEmp ? String(u.departmentId) === String(selectedEmp.departmentId) : true;
                            const isNotSelf = u.id !== newAssignment.employeeId;
                            return nameMatch && deptMatch && isNotSelf;
                        }).map(user => (
                          <button 
                            key={user.id} 
                            onClick={() => {
                              setNewAssignment({...newAssignment, supervisorId: user.id}); 
                              setSupSearchQuery(getDisplayName(user)); 
                              setIsSupDropdownOpen(false);
                            }} 
                            className={`w-full text-left p-4 hover:bg-[#7c3aed] hover:text-white transition-colors border-b last:border-0 ${isDark ? 'text-slate-300 border-white/5' : 'text-slate-700 border-slate-50'}`}
                          >
                            <div className="text-xs font-black">{getDisplayName(user)}</div>
                            <div className={`text-[10px] font-bold opacity-70`}>
                              ID: {user.employeeId || user.id}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={handleUpdateHierarchy} className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl font-black text-[11px] hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-500/20 uppercase tracking-widest flex items-center gap-2">
                    <RefreshCcw size={16}/> Sync
                  </button>
                </div>
              </div>

              {/* TOOLBAR */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-[#7c3aed]' : 'text-slate-400'}`} size={20} />
                  <input 
                    type="text" 
                    placeholder="Search table data..." 
                    className={`${styles.input} pl-14 py-5 text-base`}
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  />
                </div>

                <div className="relative w-full md:w-64">
                  <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select
                    value={currentDepartment}
                    onChange={(e) => { setCurrentDepartment(e.target.value); setCurrentPage(1); }}
                    className={`w-full ${styles.input} border text-sm font-bold rounded-2xl pl-14 pr-10 py-5 outline-none appearance-none cursor-pointer`}
                  >
                    <option value="All">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto min-h-75">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#7c3aed]" size={40}/></div>
                ) : (
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className={`text-[10px] ${textMuted} uppercase tracking-[0.2em] font-black`}>
                      <th className="pb-4 px-6">Employee</th>
                      <th className="pb-4 px-6">Department</th>
                      <th className="pb-4 px-6">Manager</th>
                      <th className="pb-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData.map(item => (
                      <tr key={item.id} className="group transition-all">
                        <td className={`py-6 px-6 rounded-l-3xl border-y border-l transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-[10px]">
                              {getDisplayName(item.employee).split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={`text-sm font-black tracking-tight ${textMain}`}>{getDisplayName(item.employee)}</span>
                          </div>
                        </td>
                        <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                          <p className={`text-xs font-black uppercase tracking-widest text-[#7c3aed]`}>
                            {resolveDeptName(item)}
                          </p>
                          <p className={`text-[10px] font-bold ${textMuted}`}>
                            {item.jobPosition?.title || item.employee?.jobPositionRel?.title || 'Staff'}
                          </p>
                        </td>
                        <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                          {item.manager ? (
                            <div className="flex items-center gap-2 text-[#7c3aed] bg-[#7c3aed]/5 px-3 py-1.5 rounded-lg border border-[#7c3aed]/10 w-fit text-[11px] font-black">
                              <ShieldCheck size={14}/> {getDisplayName(item.manager)}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 italic">Self-Reporting</span>
                          )}
                        </td>
                        <td className={`py-6 px-6 rounded-r-3xl border-y border-r text-right transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                          <div className="flex justify-end gap-2">
                              <button onClick={() => { setSelectedRelationship(item); setIsViewOpen(true); }} className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white'}`}><Eye size={18}/></button>
                              <button onClick={() => { setSelectedRelationship(item); setIsEditOpen(true); }} className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white'}`}><Edit size={18}/></button>
                              <button onClick={() => handleDelete(item.id)} className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-red-500' : 'border-slate-100 text-slate-400 hover:bg-red-500 hover:text-white'}`}><Trash2 size={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center pt-6">
                <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Showing {currentTableData.length} of {filteredAssignments.length} Lines</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border transition-all disabled:opacity-30 ${isDark ? 'border-white/10 text-white' : 'border-slate-200'}`}><ChevronLeft size={18}/></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border transition-all disabled:opacity-30 ${isDark ? 'border-white/10 text-white' : 'border-slate-200'}`}><ChevronRight size={18}/></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-2 mb-4">Select Department</h4>
                {departments.map(dept => (
                  <button 
                    key={dept.id} 
                    onClick={() => setSelectedDept(dept.name)}
                    className={`w-full text-left p-5 rounded-3xl border transition-all flex justify-between items-center ${
                      selectedDept === dept.name 
                      ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-xl shadow-purple-500/20' 
                      : `${isDark ? 'border-white/5 text-[#94a3b8]' : 'border-slate-200 text-slate-500'} hover:bg-white/5`
                    }`}
                  >
                    <span className="text-sm font-black">{dept.name}</span>
                    <ChevronRight size={16} className={selectedDept === dept.name ? 'opacity-100' : 'opacity-20'}/>
                  </button>
                ))}
              </div>

              <div className={`lg:col-span-3 min-h-125 border rounded-[2.5rem] p-10 flex flex-col items-center ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-slate-50/30'}`}>
                <div className="mb-12 text-center">
                   <h3 className={`text-2xl font-black tracking-tighter ${textMain}`}>{selectedDept} Hierarchy</h3>
                </div>

                <div className="flex flex-col items-center gap-12 w-full">
                  {deptMembers.length > 0 ? deptMembers.map((member, idx) => (
                    <div key={member.id} className="relative flex flex-col items-center">
                      {idx !== 0 && <div className="absolute -top-12 w-0.5 h-12 bg-[#7c3aed]/30"></div>}
                      <div 
                        onClick={() => { setSelectedRelationship(member); setIsViewOpen(true); }}
                        className={`w-72 p-6 rounded-4xl border transition-all cursor-pointer group text-center ${
                          isDark ? 'bg-[#0f172a] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'
                        } hover:border-[#7c3aed] hover:scale-[1.02]`}
                      >
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-xl">
                          {getDisplayName(member.employee).charAt(0)}
                        </div>
                        <h4 className={`font-black text-sm ${textMain}`}>{getDisplayName(member.employee)}</h4>
                        <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mb-4">
                            {member.jobPosition?.title || member.employee?.jobPositionRel?.title || 'Staff Member'}
                        </p>
                        <div className={`pt-4 border-t flex items-center justify-center gap-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                           <ShieldCheck size={14} className="text-emerald-500"/>
                           <span className="text-[10px] font-black text-[#94a3b8] uppercase">
                             Reports to: {member.manager ? getDisplayName(member.manager) : 'Independent'}
                           </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center space-y-4">
                       <GitMerge size={40} className="mx-auto text-slate-700 opacity-20" />
                       <p className={textMuted + " text-sm font-bold"}>No hierarchy records found for this department.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isViewOpen && <ViewStructure isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} data={selectedRelationship} theme={theme} />}
      {isEditOpen && <EditStructure isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} data={selectedRelationship} onSave={fetchAllData} theme={theme} />}
    </main>
  );
};

export default Structure;