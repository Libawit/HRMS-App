import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, DollarSign, Download, Edit, MoreVertical, Eye, Trash2, 
  Wallet, TrendingUp, Percent, RefreshCcw, Calendar, ChevronDown, Plus,
  ChevronLeft, ChevronRight, Filter, Loader2 
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-hot-toast';

// Import Modals
import AddSalary from '../../modals/admin/AddSalary';
import EditSalary from '../../modals/admin/EditSalary';
import ViewSalary from '../../modals/admin/ViewSalary';

// Change this to match your actual running backend port
const API_BASE = "http://localhost:5000/api"; 

const Salary = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const isDark = theme === 'dark';

  // --- States ---
  const [salaries, setSalaries] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState('All'); // Matches dropdown default
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeMenu, setActiveMenu] = useState(null); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const monthNum = currentDate.getMonth(); 
  const year = currentDate.getFullYear();
  const selectedMonthStr = `${monthName} ${year}`;

  // --- Fetch Departments ---
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/auth/departments`);
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // --- Fetch Salaries ---
  // --- Fetch Salaries ---
  const fetchSalaries = useCallback(async () => {
  try {
    setLoading(true);
    
    // Create a clean params object
    const params = {};
    
    // Always include month and year as they are required by your logic
    params.month = monthNum;
    params.year = year;

    // Only add departmentId if it's not 'All'
    if (currentDepartment !== 'All') {
      params.departmentId = currentDepartment;
    }

    // Only add search if it's not empty
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    const response = await axios.get(`${API_BASE}/salaries`, { params });
    setSalaries(response.data);
  } catch (error) {
    console.error("Fetch Error:", error);
    // Log the actual server error message for debugging
    const serverMessage = error.response?.data?.error || error.message;
    toast.error(`Error: ${serverMessage}`);
  } finally {
    setLoading(false);
  }
}, [monthNum, year, currentDepartment, searchTerm]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  // --- Handlers ---
  const changeMonth = (offset) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
    setCurrentPage(1); 
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently remove this salary record?")) return;
    try {
      await axios.delete(`${API_BASE}/salaries/${id}`);
      toast.success("Record deleted");
      fetchSalaries();
      setActiveMenu(null);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salaries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salaries.length / itemsPerPage);

  // Dynamic Styles
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-white/5' : 'border-slate-200';
  const cardClass = isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = isDark ? 'bg-[#0f1623] border-white/10' : 'bg-slate-50 border-slate-200';

  return (
    <main 
      className={`flex-1 overflow-y-auto p-6 md:p-10 transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f1f5f9]'}`} 
      onClick={() => setActiveMenu(null)}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <nav className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-purple-500' : 'text-indigo-600'}`}>
            Finance &nbsp; • &nbsp; Payroll
          </nav>
          <h1 className={`text-4xl font-black tracking-tighter ${textMain}`}>Payroll Management</h1>
          <p className={`${textMuted} text-sm font-medium mt-1`}>
            Financial distribution for <span className={`${isDark ? 'text-purple-400' : 'text-indigo-600'} font-bold`}>{selectedMonthStr}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`p-2 pl-6 pr-2 rounded-3xl border ${borderClass} ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'} flex items-center gap-6`}>
            <span className={`text-xs font-black uppercase tracking-widest ${textMain}`}>{monthName} {year}</span>
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronLeft size={20}/></button>
              <button onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronRight size={20}/></button>
            </div>
          </div>

          <button onClick={() => setIsAddOpen(true)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-purple-500/20 transition-all active:scale-95">
            <Plus size={18} /> Add Entry
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Disbursed" value={`$${salaries.reduce((acc, curr) => acc + (curr.netPay || 0), 0).toLocaleString()}`} icon={<Wallet size={20} className="text-emerald-500"/>} isDark={isDark} textMain={textMain} cardClass={cardClass} />
        <StatCard title="Bonus Payouts" value={`$${salaries.reduce((acc, curr) => acc + (curr.amountBonus || 0), 0).toLocaleString()}`} icon={<TrendingUp size={20} className="text-blue-500"/>} isDark={isDark} textMain={textMain} cardClass={cardClass} />
        <StatCard title="Tax Reserves" value={`$${salaries.reduce((acc, curr) => acc + (curr.deductions || 0), 0).toLocaleString()}`} icon={<Percent size={20} className="text-amber-500"/>} isDark={isDark} textMain={textMain} cardClass={cardClass} />
      </div>

      {/* Table Section */}
      <div className={`${cardClass} border rounded-[2.5rem] p-8`}>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search employee or ID..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full ${inputClass} border text-sm font-bold rounded-2xl pl-16 pr-6 py-5 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${textMain}`}
            />
          </div>

          <div className="relative w-full md:w-64">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              value={currentDepartment}
              onChange={(e) => { setCurrentDepartment(e.target.value); setCurrentPage(1); }}
              className={`w-full ${inputClass} border text-sm font-bold rounded-2xl pl-14 pr-10 py-5 outline-none appearance-none cursor-pointer ${textMain}`}
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
             <div className="py-24 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-purple-500" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Ledger...</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] uppercase tracking-[0.2em] border-b ${borderClass} ${textMuted} font-black`}>
                  <th className="pb-6 px-4">Employee Details</th>
                  <th className="pb-6 px-4">Base Salary</th>
                  <th className="pb-6 px-4">Net Payable</th>
                  <th className="pb-6 px-4">Status</th>
                  <th className="pb-6 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderClass}`}>
                {currentItems.map((salary) => (
                  <tr key={salary.id} className="group hover:bg-white/2 transition-colors">
                    {/* Find this section inside your currentItems.map((salary) => ( ... )) */}
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-purple-500/20">
                          {/* Access firstName instead of name */}
                          {salary.user?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className={`text-sm font-black tracking-tight ${textMain}`}>
                            {/* Combine first and last name */}
                            {salary.user?.firstName} {salary.user?.lastName}
                          </p>
                          <p className={`text-[10px] font-bold ${textMuted}`}>
                            {salary.user?.employeeId} • {salary.department?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-6 px-4 text-sm font-bold ${textMain}`}>${(salary.amountBasic || 0).toLocaleString()}</td>
                    <td className="py-6 px-4">
                      <span className="text-sm font-black text-[#7c3aed]">${(salary.netPay || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        salary.status === 'PAID' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                      }`}>
                        {salary.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right relative">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedSalary(salary); setIsViewOpen(true); }} className="p-3 rounded-xl transition-all text-slate-500 hover:text-white hover:bg-white/5"><Eye size={20} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === salary.id ? null : salary.id); }} className={`p-3 rounded-xl transition-all ${activeMenu === salary.id ? 'bg-purple-500 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}><MoreVertical size={20} /></button>
                      </div>

                      {activeMenu === salary.id && (
                        <div className={`absolute right-14 top-16 w-56 border rounded-2xl z-50 shadow-2xl overflow-hidden text-left ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}>
                          <button onClick={() => { setSelectedSalary(salary); setIsEditOpen(true); }} className="w-full p-4 hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                            <Edit size={16} className="text-blue-500" /> Edit Structure
                          </button>
                          <button onClick={() => handleDelete(salary.id)} className="w-full p-4 hover:bg-red-500/10 flex items-center gap-3 text-xs font-black uppercase tracking-tight text-red-500">
                            <Trash2 size={16} /> Delete Entry
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && salaries.length === 0 && (
            <div className="py-24 text-center">
              <RefreshCcw size={32} className="mx-auto mb-4 text-slate-500/20" />
              <p className={`text-xs font-black uppercase tracking-widest ${textMuted}`}>No records found for current filters.</p>
            </div>
          )}
        </div>

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className={`mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 border-t ${borderClass} pt-8`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, salaries.length)} of {salaries.length}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={`w-11 h-11 flex items-center justify-center rounded-xl border ${borderClass} ${textMain} disabled:opacity-20`}><ChevronLeft size={20} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className={`w-11 h-11 flex items-center justify-center rounded-xl border ${borderClass} ${textMain} disabled:opacity-20`}><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>

      <AddSalary isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={fetchSalaries} theme={theme} />
      <EditSalary isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} salaryData={selectedSalary} onSave={fetchSalaries} theme={theme} />
      <ViewSalary isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} salaryData={selectedSalary} theme={theme} />
    </main>
  );
};

const StatCard = ({ title, value, icon, isDark, textMain, cardClass }) => (
  <div className={`${cardClass} border p-8 rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.02]`}>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{title}</p>
      <h3 className={`text-3xl font-black tracking-tighter ${textMain}`}>{value}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
      {icon}
    </div>
  </div>
);

export default Salary;