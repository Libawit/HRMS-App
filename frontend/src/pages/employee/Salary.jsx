import React, { useState } from 'react';
import { 
  Search, DollarSign, Download, Eye, Wallet, TrendingUp, 
  Percent, Calendar, ChevronLeft, ChevronRight, Lock
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Import only View Modal (Add and Edit are removed for employees)
import ViewSalary from '../../modals/employee/ViewSalary';

const Salary = () => {
  // --- Theme Logic via useOutletContext ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Current User Identity ---
  // In a real app, this would come from your Auth Context
  const currentUser = "John Doe"; 

  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  
  // Helper to format the current view
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const selectedMonthStr = `${monthName} ${year}`;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  // Sample Data (Contains multiple employees, but the UI will filter them)
  const [salaries] = useState([
    { id: 1, emp: "Jessica Taylor", idNo: "EMP-001", basic: 4500, bonus: 500, deductions: 200, net: 4800, status: "Paid", month: "June 2024" },
    { id: 2, emp: "John Doe", idNo: "EMP-005", basic: 3800, bonus: 200, deductions: 150, net: 3850, status: "Paid", month: "January 2026" },
    { id: 3, emp: "John Doe", idNo: "EMP-005", basic: 3800, bonus: 100, deductions: 150, net: 3750, status: "Paid", month: "December 2025" },
    { id: 4, emp: "James Wilson", idNo: "EMP-012", basic: 5000, bonus: 400, deductions: 300, net: 5100, status: "Paid", month: "January 2026" },
  ]);

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    inputBg: isDark ? 'bg-[#0f1623]' : 'bg-slate-100',
  };

  const changeMonth = (offset) => {
    setCurrentDate(prevDate => {
      const nextDate = new Date(prevDate);
      nextDate.setMonth(nextDate.getMonth() + offset);
      return nextDate;
    });
    setCurrentPage(1);
  };

  // --- STRICT FILTER LOGIC ---
  const filteredSalaries = salaries.filter(s => {
    // 1. Must be the current user's record (Privacy Guard)
    const isMyRecord = s.emp === currentUser;
    // 2. Must match the navigation month
    const matchesMonth = s.month === selectedMonthStr;
    // 3. Search filter
    const matchesSearch = s.idNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return isMyRecord && matchesMonth && matchesSearch;
  });

  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSalaries.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 ${styles.bgBody}`} onClick={() => setActiveMenu(null)}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>My Salary History</h1>
          <p className={`${styles.textMuted} text-sm mt-1`}>Reviewing statements for <span className="text-[#7c3aed] font-bold">{currentUser}</span></p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-black/20' : 'bg-white'} min-w-50 shadow-sm`}>
            <div className="flex items-center justify-between gap-4">
              <span className={`text-sm font-bold ${styles.textMain}`}>{monthName} {year}</span>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${styles.textMuted}`}><ChevronLeft size={18}/></button>
                <button onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${styles.textMuted}`}><ChevronRight size={18}/></button>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-6 py-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
             <Lock size={16} className="text-amber-500" />
             <span className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Employee View</span>
          </div>
        </div>
      </div>

      {/* Stats Section - Personalized for the Employee */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Net Amount" value={`$${filteredSalaries.reduce((acc, curr) => acc + curr.net, 0).toLocaleString()}`} icon={<Wallet className="text-emerald-500"/>} styles={styles} />
        <StatCard title="Total Bonuses" value={`$${filteredSalaries.reduce((acc, curr) => acc + curr.bonus, 0).toLocaleString()}`} icon={<TrendingUp className="text-blue-500"/>} styles={styles} />
        <StatCard title="Total Deductions" value={`$${filteredSalaries.reduce((acc, curr) => acc + curr.deductions, 0).toLocaleString()}`} icon={<Percent className="text-red-500"/>} styles={styles} />
      </div>

      {/* Table Section */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8`}>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[#94a3b8] uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-5 px-4">Pay Period</th>
                <th className="pb-5 px-4">Base Salary</th>
                <th className="pb-5 px-4">Net Payable</th>
                <th className="pb-5 px-4">Status</th>
                <th className="pb-5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentItems.map((salary) => (
                <tr key={salary.id} className="group hover:bg-white/2 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 rounded-lg text-[#94a3b8]"><Calendar size={16} /></div>
                      <p className={`text-sm font-bold ${styles.textMain}`}>{salary.month}</p>
                    </div>
                  </td>
                  <td className={`py-5 px-4 text-sm font-semibold ${styles.textMain}`}>${salary.basic}</td>
                  <td className="py-5 px-4 text-sm font-black text-[#7c3aed]">${salary.net}</td>
                  <td className="py-5 px-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                      salary.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                    }`}>
                      {salary.status}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right relative">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedSalary(salary); setIsViewOpen(true); }} 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Eye size={14} /> View Slip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSalaries.length === 0 && (
            <div className="py-20 text-center italic">
              <p className="text-sm font-medium text-[#94a3b8]">No records available for this period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Integration */}
      {selectedSalary && (
        <ViewSalary 
          isOpen={isViewOpen} 
          onClose={() => { setIsViewOpen(false); setSelectedSalary(null); }} 
          salaryData={selectedSalary} 
          theme={theme} 
        />
      )}
    </main>
  );
};

const StatCard = ({ title, value, icon, styles }) => (
  <div className={`${styles.bgCard} border ${styles.border} p-8 rounded-[2.5rem] flex items-center justify-between`}>
    <div>
      <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">{title}</p>
      <h3 className={`text-2xl font-black ${styles.textMain}`}>{value}</h3>
    </div>
    <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
  </div>
);

export default Salary;