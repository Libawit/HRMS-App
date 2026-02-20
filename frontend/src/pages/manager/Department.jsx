import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/axiosConfig'; // Ensure this matches your axios instance
import { 
  ChevronRight,
  FolderTree,
  LayoutList,
  User,
  ChevronLeft,
  ShieldAlert,
  Network,
  Loader2
} from 'lucide-react';

const Department = () => {
  // --- Context Integration ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';

  // --- State ---
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Fetch Departments from Backend ---
  // Inside Department.jsx
useEffect(() => {
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      // Change this line to the new, unique route
      const res = await api.get('/auth/my-department'); 
      setDepartments(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchDepartments();
}, []);

  // --- Theme Styles ---
  const styles = {
    bgBody: theme === 'dark' ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: theme === 'dark' ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: theme === 'dark' ? 'border-white/10' : 'border-slate-200',
    textMain: theme === 'dark' ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#64748b]',
    badgeBg: theme === 'dark' ? 'bg-white/5' : 'bg-slate-100',
    badgeText: theme === 'dark' ? 'text-white' : 'text-slate-900',
    badgeBorder: theme === 'dark' ? 'border-white/5' : 'border-slate-200',
  };

  // --- Pagination Logic ---
  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return departments.slice(start, start + itemsPerPage);
  }, [departments, currentPage]);

  const renderTreeBranch = () => {
    if (departments.length === 0) return (
        <div className={`text-center py-10 ${styles.textMuted} font-black uppercase text-[10px] tracking-widest`}>
            No structural data mapping found
        </div>
    );
    return (
      <div className="flex flex-col gap-4">
        {departments.map(dept => (
          <div key={dept.id} className={`${styles.bgCard} border ${styles.border} p-6 rounded-3xl flex items-center justify-between group hover:border-[#7c3aed]/50 transition-all`}>
            <div className="flex items-center gap-5">
              <div className="p-3 bg-[#7c3aed]/10 rounded-xl text-[#7c3aed] group-hover:scale-110 transition-transform">
                <Network size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-xl tracking-tight ${styles.textMain}`}>{dept.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Authorized Unit</span>
                </div>
                <p className={`text-sm mt-1 font-medium ${styles.textMuted}`}>{dept.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] block font-black ${styles.textMuted} uppercase tracking-widest mb-1`}>Reports To</span>
              <span className={`text-xs font-bold ${styles.textMain} px-3 py-1 bg-white/5 rounded-lg border ${styles.border}`}>
                {dept.parent?.name || 'No Parent'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center ${styles.bgBody}`}>
        <Loader2 className="animate-spin text-[#7c3aed] mb-4" size={40} />
        <p className={`text-xs font-black uppercase tracking-[0.3em] ${styles.textMuted}`}>Syncing Structure...</p>
      </div>
    );
  }

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} min-h-screen`}>
      {/* Breadcrumb */}
      <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${styles.textMuted} mb-2`}>
        Management Console &gt; Departmental Scope
      </div>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${styles.textMain}`}>Department Overview</h1>
          <p className={`text-sm font-medium ${styles.textMuted}`}>Visualizing the hierarchy and details of your assigned departments</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex p-1 rounded-xl ${styles.bgInput} border ${styles.border}`}>
             <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#7c3aed] text-white shadow-lg' : styles.textMuted}`}
             ><LayoutList size={18} /></button>
             <button 
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'tree' ? 'bg-[#7c3aed] text-white shadow-lg' : styles.textMuted}`}
             ><FolderTree size={18} /></button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-500/10 border border-white/5 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldAlert size={14} className="text-amber-500" /> View Only
          </div>
        </div>
      </div>

      <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] overflow-hidden shadow-2xl`}>
        {/* Dynamic Content */}
        {viewMode === 'table' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`text-[10px] ${styles.textMuted} uppercase tracking-[0.25em] font-black border-b ${styles.border} bg-white/5`}>
                    <th className="p-6 w-20 text-center">Ref</th>
                    <th className="p-6">Department</th>
                    <th className="p-6">Parent Department</th>
                    <th className="p-6">Staff Count</th>
                    <th className="p-6">Manager In Charge</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${styles.border}`}>
                  {paginatedData.map((dept, index) => (
                    <tr key={dept.id} className="hover:bg-[#7c3aed]/5 transition-colors group">
                      <td className={`p-6 text-center font-mono font-bold ${styles.textMuted}`}>
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${styles.bgInput} border ${styles.border} flex items-center justify-center text-[#7c3aed] group-hover:rotate-12 transition-transform`}>
                            <FolderTree size={22} />
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black text-base tracking-tight ${styles.textMain}`}>{dept.name}</span>
                            <span className={`text-xs font-medium ${styles.textMuted} line-clamp-1`}>{dept.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`font-bold text-xs uppercase tracking-widest ${styles.textMain}`}>
                            {dept.parent?.name || 'No Parent'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className={`font-bold text-xs uppercase tracking-widest ${styles.textMain}`}>
                             {dept._count?.users || 0} Employees
                           </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={`flex items-center gap-3 ${styles.badgeText} font-black text-[11px] uppercase tracking-wider ${styles.badgeBg} w-fit px-4 py-2.5 rounded-xl border ${styles.badgeBorder}`}>
                          <User size={14} className="text-[#7c3aed]" /> {dept.manager}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {departments.length === 0 && (
                <div className={`py-32 text-center ${styles.textMuted}`}>
                  <Network size={56} className="mx-auto mb-4 opacity-10" />
                  <p className="font-black uppercase tracking-[0.2em] text-xs">No Department Data Found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {departments.length > itemsPerPage && (
              <div className={`p-6 border-t ${styles.border} flex items-center justify-between bg-white/5`}>
                <div className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted}`}>
                  Record {Math.min(currentPage * itemsPerPage, departments.length)} of {departments.length}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className={`p-2.5 rounded-xl border ${styles.border} ${styles.textMain} hover:bg-[#7c3aed] hover:text-white disabled:opacity-20 transition-all`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className={`p-2.5 rounded-xl border ${styles.border} ${styles.textMain} hover:bg-[#7c3aed] hover:text-white disabled:opacity-20 transition-all`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-10 space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className={`text-xl font-black mb-4 tracking-tighter ${styles.textMain}`}>Structural Mapping</h2>
              <p className={`text-xs ${styles.textMuted} font-bold uppercase tracking-widest`}>Assigned Departmental Units</p>
            </div>
            
            <div className="max-w-4xl mx-auto border-2 border-dashed border-[#7c3aed]/20 rounded-[3rem] p-8 bg-[#7c3aed]/5 backdrop-blur-sm">
               {renderTreeBranch()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Department;