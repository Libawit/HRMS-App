import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Search, ChevronDown, Edit, Trash2, ArrowRight,
  ChevronRight, FolderTree, LayoutList, User, ChevronLeft, Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Modals imported from your project structure
import AddDepartmentModal from '../../modals/admin/AddDepartment';
import EditDepartmentModal from '../../modals/admin/EditDepartment';

const Department = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParent, setFilterParent] = useState('All Parents');
  const [viewMode, setViewMode] = useState('table'); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-black/10 shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-slate-50',
    border: isDark ? 'border-white/10' : 'border-black/10',
    textMain: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    subText: `text-[11px] uppercase font-black tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`,
  };

  // --- API Functions ---
  const fetchDepartments = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await fetch('http://localhost:3000/api/auth/departments');
    
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    setDepartments(data);
  } catch (error) {
    // This block catches ERR_CONNECTION_REFUSED
    console.error("Connection failed:", error.message);
    setDepartments([]); // Prevent UI crashes
    
    // Optional: Set a local error state to show a "Server Offline" message to the user
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // --- Search & Filter Logic ---
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (dept.manager && dept.manager.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterParent === 'All Parents' || 
        (dept.parent && dept.parent.name === filterParent) ||
        (filterParent === 'No Parent' && !dept.parentId);

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterParent, departments]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(start, start + itemsPerPage);
  }, [filteredDepartments, currentPage]);

  const parentOptions = ['All Parents', 'No Parent', ...new Set(departments.map(d => d.name))];

  // --- Handlers ---
  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this department and all sub-units? This cannot be undone.")) {
      try {
        const response = await fetch(`http://localhost:3000/api/auth/departments/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchDepartments();
        } else {
          alert("Failed to delete. Ensure this department has no active employees.");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // --- Tree View Recursive Renderer ---
  const renderTreeBranch = (parentId = null, level = 0) => {
    const children = departments.filter(d => d.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className="flex flex-col">
        {children.map(dept => (
          <div key={dept.id} className="flex flex-col">
            <div 
              className={`flex items-center p-5 rounded-[20px] hover:bg-[#7c3aed]/5 border-b ${styles.border} transition-all group`}
              style={{ marginLeft: `${level * 40}px` }}
            >
              <div className="flex items-center gap-4 flex-1">
                {level > 0 ? (
                  <ChevronRight size={16} className="text-[#7c3aed]" />
                ) : (
                  <div className="p-2.5 bg-[#7c3aed]/10 rounded-xl">
                    <FolderTree size={18} className="text-[#7c3aed]" />
                  </div>
                )}
                <div>
                  <span className={`text-sm font-black tracking-tight ${styles.textMain}`}>{dept.name}</span>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${styles.textMuted}`}>
                    Head: {dept.manager || 'Unassigned'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <button onClick={() => handleEdit(dept)} className={`p-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white rounded-xl transition-all`}>
                  <Edit size={14}/>
                </button>
                <button onClick={() => handleDelete(dept.id)} className={`p-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all`}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
            {renderTreeBranch(dept.id, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 lg:p-10 ${styles.bgBody} transition-colors duration-300`}>
      <p className={styles.subText}>Organization &nbsp; • &nbsp; Structure &nbsp; • &nbsp; Departments</p>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>Departments</h1>
          <p className={`text-sm font-medium mt-1 ${styles.textMuted}`}>Define and visualize your organizational hierarchy</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex p-1.5 rounded-2xl ${styles.bgInput} border ${styles.border}`}>
             <button 
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-[#7c3aed] text-white shadow-lg' : styles.textMuted}`}
             ><LayoutList size={20} /></button>
             <button 
              onClick={() => setViewMode('tree')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'tree' ? 'bg-[#7c3aed] text-white shadow-lg' : styles.textMuted}`}
             ><FolderTree size={20} /></button>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-purple-500/25"
          >
            <Plus size={18} /> Add Department
          </button>
        </div>
      </div>

      <div className={`${styles.bgCard} border rounded-[2.5rem] overflow-hidden min-h-125`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <Loader2 size={40} className="text-[#7c3aed] animate-spin mb-4" />
             <p className={styles.subText}>Synchronizing Hierarchy...</p>
          </div>
        ) : (
          <>
            <div className={`p-6 md:p-8 border-b ${styles.border} flex flex-col md:flex-row gap-4 justify-between bg-white/5`}>
              <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-5 py-3 rounded-2xl gap-3 w-full max-w-md focus-within:border-[#7c3aed] transition-all`}>
                <Search size={18} className={styles.textMuted} />
                <input 
                  type="text" 
                  placeholder="Search departments or managers..." 
                  className={`bg-transparent border-none outline-none text-sm font-bold w-full ${isDark ? 'text-white' : 'text-slate-900'}`}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              
              <div className="relative">
                <select 
                  className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-xs font-black uppercase tracking-wider rounded-2xl px-6 py-3.5 outline-none cursor-pointer appearance-none pr-12`}
                  value={filterParent}
                  onChange={(e) => { setFilterParent(e.target.value); setCurrentPage(1); }}
                >
                  {parentOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${styles.textMuted}`} />
              </div>
            </div>

            {viewMode === 'table' ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`text-[10px] ${styles.textMuted} uppercase tracking-[0.2em] font-black border-b ${styles.border}`}>
                        <th className="p-6 w-20 text-center">ID</th>
                        <th className="p-6">Department Unit</th>
                        <th className="p-6">Reporting Line</th>
                        <th className="p-6">Department Head</th>
                        <th className="p-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${styles.border}`}>
                      {paginatedData.map((dept, index) => (
                        <tr key={dept.id} className="hover:bg-[#7c3aed]/5 transition-colors group">
                          <td className={`p-6 text-center text-xs font-black ${styles.textMuted}`}>
                            #{(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-[18px] ${styles.bgInput} border ${styles.border} flex items-center justify-center text-[#7c3aed]`}>
                                <FolderTree size={22} />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-sm font-black tracking-tight ${styles.textMain}`}>{dept.name}</span>
                                <span className={`text-[11px] font-medium ${styles.textMuted}`}>{dept.description}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              !dept.parentId ? 'bg-slate-500/10 text-slate-500' : 'bg-[#7c3aed]/10 text-[#7c3aed]'
                            }`}>
                              {dept.parentId && <ArrowRight size={10} />}
                              {dept.parent?.name || 'Top Level'}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2.5 text-[#7c3aed] font-black text-xs">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                                <User size={12} />
                              </div>
                              {dept.manager || 'Unassigned'}
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-3">
                              <button onClick={() => handleEdit(dept)} className={`p-2.5 rounded-xl border ${styles.border} hover:bg-[#7c3aed] hover:text-white transition-all`}><Edit size={16} /></button>
                              <button onClick={() => handleDelete(dept.id)} className={`p-2.5 rounded-xl border ${styles.border} hover:bg-red-500 hover:text-white transition-all text-red-500`}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredDepartments.length === 0 && (
                    <div className="py-32 text-center">
                      <p className={`text-xs font-black uppercase tracking-widest ${styles.textMuted}`}>No departments found</p>
                    </div>
                  )}
                </div>

                <div className={`p-6 border-t ${styles.border} flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5`}>
                    <div className={`text-[10px] font-black uppercase tracking-[0.15em] ${styles.textMuted}`}>
                        Showing {filteredDepartments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} Units
                    </div>
                    <div className="flex items-center gap-3">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`p-3 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20`}><ChevronLeft size={18} /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className={`p-3 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20`}><ChevronRight size={18} /></button>
                    </div>
                </div>
              </>
            ) : (
              <div className="p-10">
                <div className={`max-w-4xl mx-auto border-2 border-dashed ${isDark ? 'border-[#7c3aed]/20' : 'border-[#7c3aed]/30'} rounded-[2.5rem] p-8 bg-white/5`}>
                   {renderTreeBranch(null)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddDepartmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchDepartments}
        theme={theme}
        departments={departments} 
      />

      <EditDepartmentModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={fetchDepartments}
        theme={theme}
        data={selectedDept}
        departments={departments}
      />
    </main>
  );
};

export default Department;