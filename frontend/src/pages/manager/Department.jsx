import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ChevronRight,
  FolderTree,
  LayoutList,
  User,
  ChevronLeft,
  ShieldAlert,
  Network
} from 'lucide-react';

const Department = () => {
  // --- Context Integration ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const loggedInManagerId = context?.managerId || 'EMP002'; 

  // --- State ---
  const [viewMode, setViewMode] = useState('table'); 
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Mock Data ---
  const [departments] = useState([
    { id: 1, name: 'Executive', description: 'Company leadership & Strategy', parent: 'No Parent', manager: 'John Smith', managerId: 'EMP001' },
    { id: 2, name: 'Finance', description: 'Accounts and financial planning', parent: 'No Parent', manager: 'Sarah Jenkins', managerId: 'EMP005' },
    { id: 3, name: 'Marketing', description: 'Brand, Social, and Growth', parent: 'Executive', manager: 'Jennifer Martinez', managerId: 'EMP002' },
    { id: 4, name: 'Engineering', description: 'Product and Infrastructure', parent: 'Executive', manager: 'Michael Chen', managerId: 'EMP003' },
    { id: 5, name: 'Frontend Team', description: 'React and UI Development', parent: 'Engineering', manager: 'Alex Rivera', managerId: 'EMP009' },
    { id: 6, name: 'Backend Team', description: 'Node.js and Database', parent: 'Engineering', manager: 'David Vales', managerId: 'EMP012' },
  ]);

  // --- Theme Styles ---
  const styles = {
    bgBody: theme === 'dark' ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: theme === 'dark' ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: theme === 'dark' ? 'border-white/10' : 'border-slate-200',
    textMain: theme === 'dark' ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#64748b]',
    // Improved visibility for the Manager badge in light mode
    badgeBg: theme === 'dark' ? 'bg-white/5' : 'bg-slate-100',
    badgeText: theme === 'dark' ? 'text-white' : 'text-slate-900',
    badgeBorder: theme === 'dark' ? 'border-white/5' : 'border-slate-200',
  };

  // --- Manager Filtering Logic ---
  const myDepartments = useMemo(() => {
    return departments.filter(dept => 
      dept.managerId.toLowerCase() === loggedInManagerId.toLowerCase()
    );
  }, [departments, loggedInManagerId]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(myDepartments.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return myDepartments.slice(start, start + itemsPerPage);
  }, [myDepartments, currentPage]);

  const renderTreeBranch = () => {
    if (myDepartments.length === 0) return null;
    return (
      <div className="flex flex-col">
        {myDepartments.map(dept => (
          <div key={dept.id} className="flex flex-col">
            <div className={`flex items-center p-6 rounded-2xl hover:bg-[#7c3aed]/5 border-b ${styles.border} transition-all`}>
              <div className="flex items-center gap-5 flex-1">
                <div className="p-3 bg-[#7c3aed]/10 rounded-xl text-[#7c3aed]">
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
                <span className={`text-xs font-bold ${styles.textMain} px-3 py-1 bg-white/5 rounded-lg border ${styles.border}`}>{dept.parent}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody}`}>
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
              title="List View"
             ><LayoutList size={18} /></button>
             <button 
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'tree' ? 'bg-[#7c3aed] text-white shadow-lg' : styles.textMuted}`}
              title="Tree View"
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
                          <div className={`w-12 h-12 rounded-2xl ${styles.bgInput} border ${styles.border} flex items-center justify-center text-[#7c3aed] group-hover:scale-110 transition-transform`}>
                            <FolderTree size={22} />
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black text-base tracking-tight ${styles.textMain}`}>{dept.name}</span>
                            <span className={`text-xs font-medium ${styles.textMuted} line-clamp-1`}>{dept.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse"></div>
                           <span className={`font-bold text-xs uppercase tracking-widest ${styles.textMain}`}>
                             {dept.parent}
                           </span>
                        </div>
                      </td>
                      <td className="p-6">
                        {/* UPDATED: Manager Badge with light mode visibility */}
                        <div className={`flex items-center gap-3 ${styles.badgeText} font-black text-[11px] uppercase tracking-wider ${styles.badgeBg} w-fit px-4 py-2.5 rounded-xl border ${styles.badgeBorder}`}>
                          <User size={14} className="text-[#7c3aed]" /> {dept.manager}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myDepartments.length === 0 && (
                <div className={`py-32 text-center ${styles.textMuted}`}>
                  <Network size={56} className="mx-auto mb-4 opacity-10" />
                  <p className="font-black uppercase tracking-[0.2em] text-xs">No Department Data Available</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {myDepartments.length > itemsPerPage && (
              <div className={`p-6 border-t ${styles.border} flex items-center justify-between bg-white/5`}>
                <div className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted}`}>
                  Record {Math.min(currentPage * itemsPerPage, myDepartments.length)} of {myDepartments.length}
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
              <h2 className={`text-xl font-black mb-4 tracking-tighter ${styles.textMain}`}>Structural Mapping</h2></div>
            
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