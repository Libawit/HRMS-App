import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Eye, Edit, Trash2, ChevronDown, LayoutGrid,
  User, ChevronLeft, ChevronRight, Calendar, Hash, Loader2, Filter 
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// External Modals
import AddLeaveBalanceModal from '../../modals/admin/AddLeaveBalance';
import EditLeaveBalanceModal from '../../modals/admin/EditLeaveBalance';
import ViewLeaveBalanceModal from '../../modals/admin/ViewLeaveBalance';

const API_BASE = "http://localhost:3000/api";

const LeaveBalance = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [balances, setBalances] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [currentDepartment, setCurrentDepartment] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Employee');
  const [activeDetailsRow, setActiveDetailsRow] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal Visibility States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);

  // --- Fetch Departments (Using the same logic as Salary page) ---
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error("Dept fetch error", err);
      }
    };
    fetchDepts();
  }, []);

  // --- API Fetching ---
  const fetchBalances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/auth/leave-balances`, {
        params: { year: currentYear }
      });
      setBalances(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      setBalances([]); 
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // --- Filter & Sort Logic (Now matching Salary page example) ---
  const filteredAndSortedBalances = useMemo(() => {
    if (!Array.isArray(balances)) return [];

    let result = balances.filter(item => {
      // 1. Department Filtering - item.departmentId is now provided by the updated backend
      const matchesDept = currentDepartment === 'All' || item.departmentId === currentDepartment;
      
      // 2. Search Filtering
      const name = item.name?.toLowerCase() || '';
      const type = item.type?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      const matchesSearch = name.includes(search) || type.includes(search);
      
      return matchesDept && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === 'Employee') return (a.name || "").localeCompare(b.name || "");
      if (sortBy === 'Leave Type') return (a.type || "").localeCompare(b.type || "");
      if (sortBy === 'Year') return (b.year || 0) - (a.year || 0);
      return 0;
    });
  }, [searchTerm, sortBy, balances, currentDepartment]);

  // --- Pagination Logic ---
  const totalItems = filteredAndSortedBalances.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredAndSortedBalances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${API_BASE}/auth/leave-balances/${id}`);
      toast.success("Deleted successfully");
      fetchBalances();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  // --- Style Constants ---
  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-[3rem] overflow-hidden transition-all duration-500`,
    input: `w-full p-4 rounded-2xl border transition-all appearance-none text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 ${
        isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`,
    label: `text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`
  };

  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <main className={`flex-1 p-6 lg:p-10 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      
      {/* Header Area */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-[0.3em] mb-3">Management &nbsp; • &nbsp; Leave Records</p>
          <h1 className={`text-4xl font-black tracking-tighter ${textMain}`}>Leave Balances</h1>
          <p className={`text-sm font-bold mt-2 ${textMuted}`}>
            Annual entitlements for the year <span className="text-[#7c3aed]">{currentYear}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center rounded-2xl p-1.5 border transition-all ${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button onClick={() => { setCurrentYear(prev => prev - 1); setCurrentPage(1); }} className={`p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all active:scale-90`}>
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <div className={`px-6 text-[11px] font-black uppercase tracking-[0.2em] ${textMain} flex items-center gap-3`}>
              <Calendar size={16} className="text-[#7c3aed]" strokeWidth={2.5} />
              Year {currentYear}
            </div>
            <button onClick={() => { setCurrentYear(prev => prev + 1); setCurrentPage(1); }} className={`p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all active:scale-90`}>
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Adjust Balance
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {/* Toolbar - Matching Salary Filter Style */}
        <div className={`flex flex-col md:flex-row gap-4 p-8 lg:px-12 border-b transition-colors ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="relative flex-1 group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-[#7c3aed]' : 'text-slate-400'}`} size={20} />
            <input 
              type="text" 
              placeholder="Search employee or leave type..." 
              className={`${styles.input} pl-14 py-5 text-base`}
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
          </div>

          {/* EXACT SALARY STYLE DEPARTMENT FILTER */}
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

          <div className="relative min-w-50">
            <select 
              className={styles.input}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Employee</option>
              <option>Leave Type</option>
              <option>Year</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"/>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-8 lg:p-12 overflow-x-auto min-h-100 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-10">
              <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className={`text-[10px] ${textMuted} uppercase tracking-[0.2em] font-black`}>
                  <th className="pb-4 px-6 w-12 text-center">No.</th>
                  <th className="pb-4 px-6">Employee</th>
                  <th className="pb-4 px-6">Leave Type</th>
                  <th className="pb-4 px-6">Allocated</th>
                  <th className="pb-4 px-6">Used</th>
                  <th className="pb-4 px-6 text-right pr-12">Available</th>
                  <th className="pb-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <tr className="group transition-all">
                      <td className={`py-6 px-6 text-center rounded-l-4xl border-y border-l font-black text-[10px] transition-colors ${isDark ? 'border-white/5 bg-white/1 text-slate-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </td>
                      
                      <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                          {(item.name || "UN").split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className={`text-sm font-black tracking-tight ${textMain}`}>{item.name}</div>
                            <div className={`text-[10px] font-bold ${textMuted}`}>{item.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color || '#7c3aed' }} />
                          <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.type}</span>
                        </div>
                      </td>

                      <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.alloc?.toFixed(1) || "0.0"}</span>
                      </td>

                      <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <span className="text-sm font-black text-red-500">{item.used?.toFixed(1) || "0.0"}</span>
                      </td>

                      <td className={`py-6 px-6 border-y text-right pr-12 transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                          {item.avail?.toFixed(1) || "0.0"} Days
                        </span>
                      </td>

                      <td className={`py-6 px-6 rounded-r-4xl border-y border-r text-right transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setActiveDetailsRow(activeDetailsRow === item.id ? null : item.id)} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-[#7c3aed] hover:bg-[#7c3aed]/10' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                            <ChevronDown size={18} strokeWidth={2.5} className={`transition-transform duration-300 ${activeDetailsRow === item.id ? 'rotate-180 text-[#7c3aed]' : ''}`} />
                          </button>
                          <button onClick={() => { setSelectedBalance(item); setIsViewModalOpen(true); }} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]'}`}>
                            <Eye size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => { setSelectedBalance(item); setIsEditModalOpen(true); }} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]'}`}>
                            <Edit size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-red-500' : 'border-slate-100 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500'}`}>
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Collapsible Details Row */}
                    {activeDetailsRow === item.id && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className={`mx-6 mb-4 p-8 rounded-4xl border animate-in fade-in slide-in-from-top-4 duration-500 flex flex-wrap gap-8 items-center justify-between ${isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                            <div className="flex gap-12">
                              <div>
                                  <span className={styles.label}><User size={10} className="inline mr-1" /> Profile</span>
                                  <p className={`text-sm font-black ${textMain}`}>{item.name}</p>
                                  <p className={`text-xs font-bold ${textMuted}`}>{item.email}</p>
                              </div>
                              <div>
                                  <span className={styles.label}><LayoutGrid size={10} className="inline mr-1" /> Category</span>
                                  <p className={`text-sm font-black ${textMain}`}>{item.type}</p>
                                  <p className={`text-xs font-bold ${textMuted}`}>Period: {item.year}</p>
                              </div>
                              <div>
                                  <span className={styles.label}><Hash size={10} className="inline mr-1" /> Carry Over</span>
                                  <p className={`text-sm font-black text-orange-500`}>{item.carry?.toFixed(1) || "0.0"} Days</p>
                              </div>
                            </div>
                            <div className="px-6 py-3 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#7c3aed] block mb-1">Status</span>
                                <span className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Active Balance</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}

          {!loading && paginatedData.length === 0 && (
            <div className={`py-32 text-center rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-slate-50/50'}`}>
              <LayoutGrid size={48} className={`mx-auto mb-4 opacity-20 ${textMain}`} />
              <h3 className={`text-lg font-black ${textMain}`}>No Records Found</h3>
              <p className={`text-xs font-bold ${textMuted} uppercase tracking-[0.2em] mt-2`}>For selected filters in {currentYear}</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && totalItems > 0 && (
          <div className={`p-8 lg:px-12 border-t flex flex-col sm:flex-row justify-between items-center gap-6 ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/30'}`}>
            <div className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
              Displaying <span className={isDark ? 'text-white' : 'text-slate-900'}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span className={isDark ? 'text-white' : 'text-slate-900'}>{Math.min(currentPage * itemsPerPage, totalItems)}</span> of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border transition-all disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20' : `${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border transition-all disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddLeaveBalanceModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); fetchBalances(); }} 
        theme={theme} 
        selectedYear={currentYear} 
      />
      <EditLeaveBalanceModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); fetchBalances(); }} theme={theme} data={selectedBalance} />
      <ViewLeaveBalanceModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} theme={theme} data={selectedBalance} />
    </main>
  );
};

export default LeaveBalance;