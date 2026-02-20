import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, GitMerge, Search, Edit, Eye, ShieldCheck, 
  ChevronRight, Share2, ChevronLeft, Lock, Loader2, X, Trash2
} from 'lucide-react';
import axios from '../../utils/axiosConfig';

import EditStructure from '../../modals/manager/EditStructure';
import ViewStructure from '../../modals/manager/ViewStructure';

const API_BASE = "http://localhost:5000/api";

// --- Recursive Tree Node Component ---
const TreeNode = ({ node, isDark, getDisplayName }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-8 border-l-2 border-[#7c3aed]/20 pl-6 my-4 relative">
      {/* Connector Line Design */}
      <div className="absolute left-0 top-8 w-6 h-0.5 bg-[#7c3aed]/20" />
      
      <div className={`inline-flex items-center gap-4 p-4 rounded-2xl border ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
      } shadow-sm min-w-75`}>
        <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-xs">
          {getDisplayName(node.employee).charAt(0)}
        </div>
        
        <div className="flex-1">
          <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {getDisplayName(node.employee)}
          </p>
          <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider">
            {node.jobPosition?.title || node.employee?.jobPositionRel?.title || 'Team Member'}
          </p>
        </div>

        {hasChildren && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1.5 rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-all transform ${isOpen ? 'rotate-90' : ''}`}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} isDark={isDark} getDisplayName={getDisplayName} />
          ))}
        </div>
      )}
    </div>
  );
};

const Structure = () => {
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State Hooks ---
  const [activeTab, setActiveTab] = useState('assignment');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [empSearch, setEmpSearch] = useState('');
  const [supSearch, setSupSearch] = useState('');
  const [showEmpResults, setShowEmpResults] = useState(false);
  const [showSupResults, setShowSupResults] = useState(false);

  const empSearchRef = useRef(null);
  const supSearchRef = useRef(null);

  const [newAssignment, setNewAssignment] = useState({
    employeeId: '',
    employeeName: '',
    supervisorId: '',
    supervisorName: ''
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  // --- Helpers ---
  const getDisplayName = (emp) => {
    if (!emp) return '';
    const fullName = emp.name || emp.fullName || '';
    const firstLast = (emp.firstName || emp.first_name) ? `${emp.firstName || emp.first_name} ${emp.lastName || emp.last_name || ''}`.trim() : '';
    return fullName || firstLast || emp.email?.split('@')[0] || 'Unknown User';
  };

  const fetchData = useCallback(async () => {
    if (!user?.departmentId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [structureRes, userRes] = await Promise.all([
        axios.get(`${API_BASE}/structure?departmentId=${user.departmentId}`, config),
        axios.get(`${API_BASE}/auth/users`, config)
      ]);

      setAssignments(Array.isArray(structureRes.data) ? structureRes.data : []);
      const deptUsers = Array.isArray(userRes.data) 
        ? userRes.data.filter(u => String(u.departmentId) === String(user.departmentId))
        : [];
      setAllUsers(deptUsers);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [user?.departmentId]);

  // --- Effects ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (empSearchRef.current && !empSearchRef.current.contains(event.target)) setShowEmpResults(false);
      if (supSearchRef.current && !supSearchRef.current.contains(event.target)) setShowSupResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Tree Logic ---
  const treeData = useMemo(() => {
    if (!assignments.length) return [];
    
    const idMap = {};
    // First pass: create nodes
    assignments.forEach(item => {
      idMap[item.employeeId] = { ...item, children: [] };
    });

    const roots = [];
    // Second pass: link children to parents
    assignments.forEach(item => {
      const node = idMap[item.employeeId];
      if (item.managerId && idMap[item.managerId]) {
        idMap[item.managerId].children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [assignments]);

  // --- Memos ---
  const empSearchResults = useMemo(() => {
    const query = empSearch.toLowerCase().trim();
    if (!query || !allUsers.length) return [];
    return allUsers.filter(u => getDisplayName(u).toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query));
  }, [allUsers, empSearch]);

  const supSearchResults = useMemo(() => {
    const query = supSearch.toLowerCase().trim();
    if (!query) return [];
    const filtered = allUsers.filter(u => 
      String(u.id) !== String(newAssignment.employeeId) && 
      getDisplayName(u).toLowerCase().includes(query)
    );
    return [{ id: 'none', fullName: 'None (Self Reporting)' }, ...filtered];
  }, [allUsers, supSearch, newAssignment.employeeId]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(item => {
      const name = getDisplayName(item.employee).toLowerCase();
      const pos = (item.jobPosition?.title || item.employee?.jobPositionRel?.title || '').toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || pos.includes(searchTerm.toLowerCase());
    });
  }, [assignments, searchTerm]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const currentTableData = filteredAssignments.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage);

  // --- Handlers ---
  const handleUpdateHierarchy = async () => {
    if (!newAssignment.employeeId || !newAssignment.supervisorId) return;
    try {
      const token = localStorage.getItem('token');
      const managerIdValue = newAssignment.supervisorId === 'none' ? null : newAssignment.supervisorId;
      await axios.post(`${API_BASE}/structure/sync`, {
        employeeId: newAssignment.employeeId,
        managerId: managerIdValue
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setNewAssignment({ employeeId: '', employeeName: '', supervisorId: '', supervisorName: '' });
      setEmpSearch('');
      setSupSearch('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update reporting line");
    }
  };

  const handleDeleteRelationship = async (id) => {
    if (!window.confirm("Are you sure you want to remove this reporting line?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/structure/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete relationship");
    }
  };

  if (!user) {
    return (
      <div className={`flex-1 flex items-center justify-center min-h-screen ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}>
        <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
      </div>
    );
  }

  const managerDeptName = user?.departmentRel?.name || 'Department';

  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-[2.5rem] overflow-hidden`,
    tabBtn: (active) => `py-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 px-6 ${
      active ? 'text-[#7c3aed] border-[#7c3aed]' : `border-transparent ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`
    }`,
    input: `w-full p-4 rounded-2xl border ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} text-sm font-bold outline-none focus:border-[#7c3aed] transition-all`,
    dropdown: `absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl max-h-60 overflow-y-auto ${isDark ? 'bg-[#1e293b] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`
  };

  return (
    <main className={`flex-1 p-6 md:p-10 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'} overflow-y-auto min-h-screen`}>
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-[#7c3aed]" />
            <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-[0.3em]">{managerDeptName} Operations</p>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Department Structure</h1>
        </div>
        <button className="flex items-center gap-2 bg-[#7c3aed] px-6 py-4 rounded-2xl text-[11px] font-black text-white hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-500/20 uppercase tracking-widest">
          <Share2 size={16}/> Export Map
        </button>
      </div>

      <div className={styles.card}>
        {/* Tabs */}
        <div className={`flex gap-4 px-8 border-b ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
          <button onClick={() => setActiveTab('assignment')} className={styles.tabBtn(activeTab === 'assignment')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><Users size={16}/> Reporting Lines</div>
          </button>
          <button onClick={() => setActiveTab('relationships')} className={styles.tabBtn(activeTab === 'relationships')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><GitMerge size={16}/> Tree View</div>
          </button>
        </div>

        <div className="p-8 lg:p-10">
          {activeTab === 'assignment' ? (
            <div className="space-y-10">
              {/* Assignment Form */}
              <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 space-y-2 relative" ref={empSearchRef}>
                    <label className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest ml-1">Team Member</label>
                    <input 
                      type="text"
                      placeholder="Type name or email..."
                      className={styles.input}
                      value={empSearch}
                      onChange={(e) => {setEmpSearch(e.target.value); setShowEmpResults(true);}}
                      onFocus={() => setShowEmpResults(true)}
                    />
                    {showEmpResults && empSearch && (
                      <div className={styles.dropdown}>
                        {empSearchResults.length > 0 ? empSearchResults.map(emp => (
                          <div key={emp.id} className="p-4 text-xs font-black cursor-pointer hover:bg-[#7c3aed] hover:text-white transition-colors border-b last:border-0 border-white/5"
                            onClick={() => {
                              setNewAssignment(prev => ({...prev, employeeId: emp.id, employeeName: getDisplayName(emp)}));
                              setEmpSearch(getDisplayName(emp));
                              setShowEmpResults(false);
                            }}
                          >
                            {getDisplayName(emp)} <span className="opacity-50 font-bold ml-2">({emp.email})</span>
                          </div>
                        )) : <div className="p-4 text-xs text-slate-500 italic">No members found</div>}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 relative" ref={supSearchRef}>
                    <label className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest ml-1">Assign Supervisor</label>
                    <input 
                      type="text"
                      placeholder="Search supervisor..."
                      className={styles.input}
                      value={supSearch}
                      onChange={(e) => {setSupSearch(e.target.value); setShowSupResults(true);}}
                      onFocus={() => setShowSupResults(true)}
                    />
                    {showSupResults && supSearch && (
                      <div className={styles.dropdown}>
                        {supSearchResults.map(emp => (
                          <div key={emp.id} className="p-4 text-xs font-black cursor-pointer hover:bg-[#7c3aed] hover:text-white transition-colors border-b last:border-0 border-white/5"
                            onClick={() => {
                              setNewAssignment(prev => ({...prev, supervisorId: emp.id, supervisorName: getDisplayName(emp)}));
                              setSupSearch(getDisplayName(emp));
                              setShowSupResults(false);
                            }}
                          >
                            {getDisplayName(emp)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={handleUpdateHierarchy} disabled={!newAssignment.employeeId || !newAssignment.supervisorId}
                    className="bg-[#7c3aed] disabled:opacity-30 text-white px-10 py-4 rounded-2xl font-black text-[11px] hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-500/20 uppercase">
                    Sync Relationship
                  </button>
                </div>
              </div>

              {/* Table List */}
              <div className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed]" size={20} />
                  <input type="text" placeholder={`Search members...`} className={`${styles.input} pl-14 py-5`}
                    value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#7c3aed]" size={40}/></div>
                  ) : (
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black px-6">
                          <th className="pb-4 px-6">Member</th>
                          <th className="pb-4 px-6">Position</th>
                          <th className="pb-4 px-6">Direct Supervisor</th>
                          <th className="pb-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTableData.map(item => (
                          <tr key={item.id} className="group">
                            <td className={`py-6 px-6 rounded-l-3xl border-y border-l ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-[10px]">
                                  {getDisplayName(item.employee).charAt(0)}
                                </div>
                                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{getDisplayName(item.employee)}</span>
                              </div>
                            </td>
                            <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                              <span className="text-[10px] font-black uppercase text-[#7c3aed] bg-[#7c3aed]/10 px-3 py-1 rounded-lg">
                                {item.jobPosition?.title || item.employee?.jobPositionRel?.title || 'Staff'}
                              </span>
                            </td>
                            <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                              <div className="flex items-center gap-2 text-[11px] font-black">
                                {item.manager ? (
                                  <><ShieldCheck size={14} className="text-emerald-500"/> <span className="text-slate-500">{getDisplayName(item.manager)}</span></>
                                ) : <><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><span className="text-amber-600 uppercase italic">Self Reporting</span></>}
                              </div>
                            </td>
                            <td className={`py-6 px-6 rounded-r-3xl border-y border-r text-right ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { setSelectedRelationship(item); setIsViewOpen(true); }} className="p-2.5 rounded-xl hover:bg-slate-500/10 text-slate-500 transition-all"><Eye size={18}/></button>
                                <button onClick={() => { setSelectedRelationship(item); setIsEditOpen(true); }} className="p-2.5 rounded-xl hover:bg-blue-500/10 text-slate-500 hover:text-blue-500 transition-all"><Edit size={18}/></button>
                                <button onClick={() => handleDeleteRelationship(item.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Tree View Section */
            <div className="py-10 overflow-x-auto">
              {treeData.length > 0 ? (
                <div className="min-w-max p-4">
                  <div className="mb-8 flex items-center gap-3 bg-[#7c3aed]/10 w-fit px-4 py-2 rounded-full border border-[#7c3aed]/20">
                    <ShieldCheck size={14} className="text-[#7c3aed]" />
                    <span className="text-[10px] font-black uppercase text-[#7c3aed] tracking-widest">Department Hierarchy</span>
                  </div>
                  {treeData.map(root => (
                    <TreeNode key={root.id} node={root} isDark={isDark} getDisplayName={getDisplayName} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-20 opacity-30">
                  <GitMerge size={60} className="mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">No hierarchy data found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isViewOpen && <ViewStructure isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} data={selectedRelationship} theme={theme} />}
      {isEditOpen && <EditStructure isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} data={selectedRelationship} onSave={fetchData} theme={theme} />}
    </main>
  );
};

export default Structure;