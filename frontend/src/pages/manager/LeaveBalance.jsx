import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Users, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig'; // Adjust based on your path

// External Modals
import AddLeaveBalanceModal from '../../modals/manager/AddLeaveBalance';
import EditLeaveBalanceModal from '../../modals/manager/EditLeaveBalance';
import ViewLeaveBalanceModal from '../../modals/manager/ViewLeaveBalance';

const API_BASE = "http://localhost:5000/api";

const LeaveBalance = () => {
  // --- Theme & Context Logic ---
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  // Extract Manager Department Info from user context
  const managerDeptId = user?.departmentId;
  const managerDeptName = user?.departmentRel?.name || "Department";

  // --- State ---
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Employee');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // --- Fetch Data from Backend ---
  const fetchBalances = async () => {
    try {
      setLoading(true);
      // Fetching all balances - we filter for the manager's department on the frontend

const res = await axios.get(`${API_BASE}/auth/leave-balances?year=${currentYear}`);
      setBalances(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch leave balances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [currentYear]);

  // --- Filter & Sort Logic ---
  const filteredData = useMemo(() => {
    return balances.filter(item => {
      // 1. Strict Department Filter: Only show employees in manager's department
      const isMyDept = item.departmentId === managerDeptId;
      
      // 2. Search Filter
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 3. Year Filter (Month is optional depending on how you track balances)
      const matchesDate = item.year === currentYear;
      
      return isMyDept && matchesSearch && matchesDate;
    });
  }, [searchTerm, balances, currentYear, managerDeptId]);

  const sortedBalances = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortBy === 'Employee') return a.name.localeCompare(b.name);
      if (sortBy === 'Leave Type') return a.type.localeCompare(b.type);
      return 0;
    });
  }, [filteredData, sortBy]);

  const totalPages = Math.ceil(sortedBalances.length / itemsPerPage);
  const paginatedData = sortedBalances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Delete Balance Function ---
const handleDelete = async (id) => {
  // 1. Ask for confirmation
  if (!window.confirm("Are you sure you want to delete this leave entitlement? This action cannot be undone.")) {
    return;
  }

  try {
    // 2. Call the API
    // Ensure your URL matches your backend route structure
    await axios.delete(`http://localhost:5000/api/auth/leave-balances/${id}`);

    // 3. Update the UI locally (assuming your list state is called 'balances')
    setBalances((prevBalances) => prevBalances.filter((item) => item.id !== id));

    // 4. Show success (Optional: Replace with a toast notification)
    alert("Record deleted successfully.");
    
  } catch (error) {
    console.error("Delete failed:", error);
    const errorMsg = error.response?.data?.error || "Failed to delete the record. Please try again.";
    alert(errorMsg);
  }
};

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  return (
    <main className={`flex-1 overflow-y-auto p-8 transition-colors duration-500 ${styles.bgBody}`}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={14} className="text-[#7c3aed]" />
        <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.textMuted}`}>
          Department Portal &gt; Leave Entitlements
        </div>
      </div>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${styles.textMain}`}>
            {managerDeptName} <span className="text-[#7c3aed]">Balances</span>
          </h1>
          <p className={`text-sm mt-1 font-bold ${styles.textMuted}`}>
            Managing <span className="text-[#7c3aed]">{filteredData.length}</span> records for {currentYear}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} rounded-2xl p-1.5 shadow-sm`}>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, 0))} className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className={`px-6 text-xs font-black uppercase tracking-widest ${styles.textMain} flex items-center gap-2`}>
              <Calendar size={16} /> {currentYear}
            </div>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, 0))} className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all">
              <ChevronRight size={20} />
            </button>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-purple-500/20 active:scale-95"
          >
            <Plus size={18} /> Add Balance
          </button>
        </div>
      </div>

      <div className={`${styles.bgCard} border ${styles.border} rounded-4xl overflow-hidden shadow-2xl shadow-black/5`}>
        {/* Toolbar */}
        <div className={`p-6 border-b ${styles.border} flex flex-col md:flex-row gap-6 justify-between items-center bg-linear-to-r from-transparent to-[#7c3aed]/5`}>
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-5 py-3 rounded-2xl gap-3 w-full max-w-xl focus-within:ring-2 ring-[#7c3aed]/20 transition-all`}>
            <Search size={20} className={styles.textMuted} />
            <input 
              type="text" 
              placeholder="Search employee or leave type..." 
              className={`bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-[#94a3b8]/50 ${isDark ? 'text-white' : 'text-slate-900'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted}`}>Sort By</span>
            <select 
              className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-xs font-bold rounded-xl px-5 py-3 outline-none cursor-pointer focus:border-[#7c3aed]`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Employee">Employee Name</option>
              <option value="Leave Type">Leave Type</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
               <Loader2 size={40} className="animate-spin text-[#7c3aed] mb-4" />
               <p className={`text-xs font-black uppercase tracking-widest ${styles.textMuted}`}>Loading department data...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className={`text-[10px] ${styles.textMuted} uppercase tracking-[0.2em] font-black border-b ${styles.border}`}>
                    <th className="p-6">Employee Info</th>
                    <th className="p-6">Leave Configuration</th>
                    <th className="p-6">Allocated</th>
                    <th className="p-6">Used</th>
                    <th className="p-6">Available</th>
                    <th className="p-6 text-right">Management</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${styles.border}`}>
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-[#7c3aed]/5 transition-all group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/10 border border-white/10">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-black text-sm tracking-tight ${styles.textMain}`}>{item.name}</div>
                            <div className={`text-[11px] font-bold ${styles.textMuted}`}>{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                          <span className="w-2 h-2 rounded-full" style={{ background: item.color }}></span>
                          <span className={`text-xs font-black uppercase tracking-widest ${styles.textMain}`}>{item.type}</span>
                        </div>
                      </td>
                      <td className={`p-6 text-sm font-black ${styles.textMain}`}>{item.alloc.toFixed(1)}</td>
                      <td className="p-6 text-sm font-black text-red-500">-{item.used.toFixed(1)}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black border shadow-sm ${
                          item.avail > 5 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {item.avail.toFixed(1)} Days
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedBalance(item); setIsViewModalOpen(true); }} className="p-2.5 rounded-xl hover:bg-blue-500/10 text-blue-500 transition-all"><Eye size={18} /></button>
                          <button onClick={() => { setSelectedBalance(item); setIsEditModalOpen(true); }} className="p-2.5 rounded-xl hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-all"><Edit size={18} /></button>
                          <button 
  onClick={() => handleDelete(item.id)}
  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
  title="Delete Entitlement"
>
  <Trash2 size={18} />
</button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginatedData.length === 0 && (
                <div className="py-24 text-center">
                  <Users size={48} className="mx-auto mb-4 text-[#7c3aed]/20" />
                  <p className={`text-sm font-bold ${styles.textMuted}`}>No records found for your department in {currentYear}.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={`p-6 border-t ${styles.border} flex justify-between items-center`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted}`}>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-30 transition-all`}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-30 transition-all`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddLeaveBalanceModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); fetchBalances(); }} 
        theme={theme} 
        managerDeptId={managerDeptId} 
      />
      
      {isEditModalOpen && (
        <EditLeaveBalanceModal 
          isOpen={isEditModalOpen} 
          onClose={() => { setIsEditModalOpen(false); fetchBalances(); }} 
          theme={theme} 
          data={selectedBalance} 
        />
      )}

      {isViewModalOpen && (
        <ViewLeaveBalanceModal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
          theme={theme} 
          data={selectedBalance} 
        />
      )}
    </main>
  );
};

export default LeaveBalance;