import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Search, ChevronDown, Edit, Trash2, Briefcase, 
  DollarSign, Clock, ChevronLeft, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

import AddJobPositionModal from '../../modals/admin/AddJobPosition';
import EditJobPositionModal from '../../modals/admin/EditJobPosition';

const JobPosition = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // --- API Fetching ---
  const fetchData = useCallback(async () => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem('token'); // 1. Get the token

    const headers = {
      'Authorization': `Bearer ${token}`, // 2. Create the header
      'Content-Type': 'application/json'
    };

    const [posRes, deptRes] = await Promise.all([
      fetch('http://localhost:5000/api/positions', { headers }),
      fetch('http://localhost:5000/api/auth/departments', { headers })
    ]);

    if (!posRes.ok || !deptRes.ok) throw new Error("Server communication failed");

    const posData = await posRes.json();
    const deptData = await deptRes.json();

    setPositions(posData);
    setDepartments(deptData);
  } catch (error) {
    console.error("Fetch error:", error);
    // If unauthorized, you might want to redirect the user to login here
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handleDelete = async (id) => {
  if (window.confirm("Permanent Action: Remove this position from records?")) {
    try {
      const token = localStorage.getItem('token'); // Get token
      const res = await fetch(`http://localhost:5000/api/positions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Add protection
        }
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Action unauthorized. Only Admins can delete positions.");
      }
    } catch (error) {
      alert("Delete failed. Check connection.");
    }
  }
};

  // --- Filtering & Search ---
  const filteredPositions = useMemo(() => {
    return positions.filter(pos => {
      const matchesSearch = pos.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Checking multiple possible relation names from Prisma
      const deptName = pos.department?.name || pos.departmentRel?.name || "Unassigned";
      
      const matchesDept = selectedDept === 'All Departments' || deptName === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [searchTerm, selectedDept, positions]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPositions.slice(start, start + itemsPerPage);
  }, [filteredPositions, currentPage]);

  return (
    <main className={`flex-1 overflow-y-auto p-6 lg:p-10 ${styles.bgBody} transition-colors duration-300`}>
      <p className={styles.subText}>Organization &nbsp; • &nbsp; Roles &nbsp; • &nbsp; Registry</p>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>Job Positions</h1>
          <p className={`text-sm font-medium mt-1 ${styles.textMuted}`}>Manage company roles and department linking</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-purple-500/25 active:scale-95"
        >
          <Plus size={18} /> New Position
        </button>
      </div>

      <div className={`${styles.bgCard} border rounded-[2.5rem] overflow-hidden`}>
        {/* Toolbar */}
        <div className={`p-6 md:p-8 border-b ${styles.border} flex flex-col md:flex-row gap-6 justify-between items-center bg-white/5`}>
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-5 py-3.5 rounded-2xl gap-3 w-full max-w-lg focus-within:border-[#7c3aed] transition-all`}>
            <Search size={18} className={styles.textMuted} />
            <input 
              type="text" 
              placeholder="Filter by title..." 
              className={`bg-transparent border-none outline-none text-sm font-bold w-full ${styles.textMain}`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="relative w-full md:w-72">
            <select 
              className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-xs font-black uppercase tracking-widest rounded-2xl px-6 py-4 outline-none cursor-pointer w-full appearance-none pr-12`}
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
            >
              <option value="All Departments">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              <option value="Unassigned">Unassigned Only</option>
            </select>
            <ChevronDown size={14} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${styles.textMuted}`} />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#7c3aed] mb-4" size={40} />
              <p className={styles.subText}>Syncing Database...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] ${styles.textMuted} uppercase tracking-[0.2em] font-black border-b ${styles.border}`}>
                  <th className="p-6 w-20 text-center">Rank</th>
                  <th className="p-6">Role Details</th>
                  <th className="p-6">Department</th>
                  <th className="p-6">Compensation</th>
                  <th className="p-6 text-right">Options</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${styles.border}`}>
                {paginatedData.map((pos, index) => {
                  // This is where the check happens safely inside the loop
                  const deptName = pos.department?.name || pos.departmentRel?.name || "Unassigned";
                  const isUnassigned = deptName === "Unassigned";

                  return (
                    <tr key={pos.id} className="hover:bg-[#7c3aed]/5 transition-colors group">
                      <td className={`p-6 text-center text-xs font-black ${styles.textMuted}`}>
                        #{(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-[18px] ${styles.bgInput} border ${styles.border} flex items-center justify-center text-[#7c3aed] shrink-0 group-hover:scale-110 transition-transform`}>
                            <Briefcase size={22} />
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-black tracking-tight ${styles.textMain}`}>{pos.title}</span>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${styles.textMuted}`}>
                                <Clock size={12} className="text-[#7c3aed]" /> {pos.type || "Full-time"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                          isUnassigned 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                          : 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20'
                        }`}>
                          {isUnassigned && <AlertCircle size={10} />}
                          {deptName}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-1.5 font-black text-xs text-emerald-500">
                          <DollarSign size={14} /> {pos.salary || '0'}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => { setCurrentJob(pos); setIsEditModalOpen(true); }} 
                            className={`p-3 rounded-xl border ${styles.border} hover:bg-[#7c3aed] hover:text-white transition-all`}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(pos.id)} 
                            className={`p-3 rounded-xl border ${styles.border} hover:bg-red-500 hover:text-white transition-all text-red-500`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredPositions.length === 0 && (
          <div className="py-40 text-center">
            <p className={styles.subText}>No matching positions found</p>
          </div>
        )}

        {/* Footer / Pagination */}
        <div className={`p-6 border-t ${styles.border} flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5`}>
          <p className={styles.subText}>
            Showing {filteredPositions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredPositions.length)} of {filteredPositions.length} roles
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className={`p-3 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20 transition-all hover:bg-[#7c3aed] hover:text-white`}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className={`p-3 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20 transition-all hover:bg-[#7c3aed] hover:text-white`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddJobPositionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        theme={theme}
        departments={departments} 
        onSuccess={fetchData}
      />

      {isEditModalOpen && (
        <EditJobPositionModal 
          isOpen={isEditModalOpen} 
          onClose={() => { setIsEditModalOpen(false); setCurrentJob(null); }} 
          theme={theme}
          data={currentJob}
          departments={departments}
          onSuccess={fetchData}
        />
      )}
    </main>
  );
};

export default JobPosition;