import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronDown, 
  LayoutGrid,
  User,
  History,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  ShieldCheck
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// External Modals
import AddLeaveBalanceModal from '../../modals/manager/AddLeaveBalance';
import EditLeaveBalanceModal from '../../modals/manager/EditLeaveBalance';
import ViewLeaveBalanceModal from '../../modals/manager/ViewLeaveBalance';

const LeaveBalance = () => {
  // --- Theme Logic: Sync with the global layout theme ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Manager Context ---
  const managerDept = "Engineering"; // This would typically come from your Auth Context

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Employee');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);

  // --- Mock Data ---
  const [balances, setBalances] = useState([
    { id: 1, name: "John Smith", email: "john.smith@example.com", dept: "Engineering", type: "Annual Leave", year: 2026, month: 0, alloc: 30.0, used: 2.0, carry: 5.0, avail: 33.0, color: "#7c3aed" },
    { id: 2, name: "John Smith", email: "john.smith@example.com", dept: "Engineering", type: "Sick Leave", year: 2026, month: 0, alloc: 15.0, used: 1.0, carry: 0.0, avail: 14.0, color: "#3b82f6" },
    { id: 3, name: "Sarah Johnson", email: "sarah.johnson@example.com", dept: "Engineering", type: "Annual Leave", year: 2026, month: 0, alloc: 25.0, used: 0.0, carry: 2.0, avail: 27.0, color: "#7c3aed" },
    { id: 5, name: "Alex Thompson", email: "alex.t@example.com", dept: "Engineering", type: "Annual Leave", year: 2026, month: 0, alloc: 20.0, used: 5.0, carry: 0.0, avail: 15.0, color: "#7c3aed" },
    { id: 6, name: "Emma Wilson", email: "emma.w@example.com", dept: "Sales", type: "Annual Leave", year: 2026, month: 0, alloc: 20.0, used: 2.0, carry: 0.0, avail: 18.0, color: "#7c3aed" },
  ]);

  // --- Theme Styles Mapping ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // --- Filter & Sort Logic ---
  const filteredData = useMemo(() => {
    return balances.filter(item => {
      const isMyDept = item.dept === managerDept;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = item.year === currentYear && item.month === currentDate.getMonth();
      return isMyDept && matchesSearch && matchesDate;
    });
  }, [searchTerm, balances, currentDate, managerDept]);

  const sortedBalances = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortBy === 'Employee') return a.name.localeCompare(b.name);
      if (sortBy === 'Leave Type') return a.type.localeCompare(b.type);
      return b.year - a.year;
    });
  }, [filteredData, sortBy]);

  const paginatedData = sortedBalances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Handlers ---
  const handleDelete = (id) => {
    if (window.confirm("Delete this balance record? This will affect the employee's total entitlement.")) {
      setBalances(balances.filter(b => b.id !== id));
    }
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
            {managerDept} <span className="text-[#7c3aed]">Balances</span>
          </h1>
          <p className={`text-sm mt-1 font-bold ${styles.textMuted}`}>
            Managing <span className="text-[#7c3aed]">{filteredData.length}</span> active records for {currentMonthName} {currentYear}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} rounded-2xl p-1.5 shadow-sm`}>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className={`px-6 text-xs font-black uppercase tracking-widest ${styles.textMain} flex items-center gap-2`}>
              <Calendar size={16} /> {currentMonthName.slice(0, 3)} {currentYear}
            </div>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all">
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
              placeholder="Filter by name or leave type..." 
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
              <option value="Employee">Employee</option>
              <option value="Leave Type">Leave Type</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                    <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                      {item.avail.toFixed(1)} Days
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedBalance(item); setIsViewModalOpen(true); }} className="p-2.5 rounded-xl hover:bg-blue-500/10 text-blue-500 transition-all"><Eye size={18} /></button>
                      <button onClick={() => { setSelectedBalance(item); setIsEditModalOpen(true); }} className="p-2.5 rounded-xl hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-all"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedData.length === 0 && (
            <div className="py-24 text-center">
              <Users size={48} className="mx-auto mb-4 text-[#7c3aed]/20" />
              <p className={`text-sm font-bold ${styles.textMuted}`}>No department records found for this period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddLeaveBalanceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} theme={theme} />
      <EditLeaveBalanceModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} theme={theme} data={selectedBalance} />
      <ViewLeaveBalanceModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} theme={theme} data={selectedBalance} />
    </main>
  );
};

export default LeaveBalance;