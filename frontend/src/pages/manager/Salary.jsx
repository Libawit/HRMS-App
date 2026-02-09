import React, { useState } from 'react';
import { 
  Search, Wallet, TrendingUp, Percent,
  ChevronLeft, ChevronRight, Eye, Building2, Printer
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Import Modals
import ViewSalary from '../../modals/manager/ViewSalary';

const Salary = () => {
  // --- Theme Logic ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Manager Context ---
  const managerDept = "Engineering"; 

  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal Visibility
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  // Core Data State
  const [salaries] = useState([
    { id: 1, emp: "Jessica Taylor", idNo: "EMP-001", dept: "Engineering", basic: 4500, bonus: 500, deductions: 200, net: 4800, status: "Paid", month: "June 2024" },
    { id: 2, emp: "Michael Chen", idNo: "EMP-005", dept: "Engineering", basic: 3800, bonus: 200, deductions: 150, net: 3850, status: "Pending", month: "June 2024" },
    { id: 3, emp: "James Wilson", idNo: "EMP-012", dept: "Engineering", basic: 5000, bonus: 400, deductions: 300, net: 5100, status: "Paid", month: "January 2026" },
    { id: 4, emp: "Emily Davis", idNo: "EMP-015", dept: "Engineering", basic: 3200, bonus: 100, deductions: 50, net: 3250, status: "Paid", month: "January 2026" },
  ]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const selectedMonthStr = `${monthName} ${year}`;

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

  const filteredSalaries = salaries.filter(s => {
    const isSameDept = s.dept === managerDept;
    const matchesSearch = s.emp.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.idNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = s.month === selectedMonthStr;
    return isSameDept && matchesSearch && matchesMonth;
  });

  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);
  const currentItems = filteredSalaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Print Handler ---
  const handlePrint = (salary) => {
    setSelectedSalary(salary);
    // Short delay to ensure modal/data is set before triggering print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 ${styles.bgBody} transition-colors duration-500`}>
      
      {/* Print-Only Styles Injection */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #salary-slip-modal, #salary-slip-modal * { visibility: visible; }
            #salary-slip-modal { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              height: auto;
              background: white !important;
              color: black !important;
            }
            @page { size: auto; margin: 0mm; }
          }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[#7c3aed]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed]">{managerDept} Department</span>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>Payroll Records</h1>
          <p className={`${styles.textMuted} text-sm mt-1`}>Reviewing <span className="font-bold text-[#7c3aed]">{selectedMonthStr}</span></p>
        </div>
        
        <div className={`p-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-black/20' : 'bg-white'} min-w-50`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${styles.textMain}`}>{selectedMonthStr}</span>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} className={`p-1 rounded-lg hover:bg-white/10 ${styles.textMuted}`}><ChevronLeft size={18}/></button>
              <button onClick={() => changeMonth(1)} className={`p-1 rounded-lg hover:bg-white/10 ${styles.textMuted}`}><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
        <StatCard title="Total Disbursed" value={`$${filteredSalaries.reduce((acc, curr) => acc + curr.net, 0).toLocaleString()}`} icon={<Wallet className="text-emerald-500"/>} styles={styles} />
        <StatCard title="Bonuses" value={`$${filteredSalaries.reduce((acc, curr) => acc + curr.bonus, 0).toLocaleString()}`} icon={<TrendingUp className="text-blue-500"/>} styles={styles} />
        <StatCard title="Deductions" value={`$${filteredSalaries.reduce((acc, curr) => acc + curr.deductions, 0).toLocaleString()}`} icon={<Percent className="text-amber-500"/>} styles={styles} />
      </div>

      {/* Table */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8 print:hidden`}>
        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
          <input 
            type="text" 
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full ${styles.inputBg} border ${styles.border} text-sm rounded-2xl pl-14 pr-6 py-5 outline-none focus:border-[#7c3aed] ${styles.textMain} transition-all`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[#94a3b8] uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-5 px-4">Staff Member</th>
                <th className="pb-5 px-4">Net Amount</th>
                <th className="pb-5 px-4">Status</th>
                <th className="pb-5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentItems.map((salary) => (
                <tr key={salary.id} className="group hover:bg-white/2 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center font-black text-xs">{salary.emp[0]}</div>
                      <div>
                        <p className={`text-sm font-bold ${styles.textMain}`}>{salary.emp}</p>
                        <p className="text-[10px] text-[#94a3b8] font-medium">{salary.idNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-sm font-black text-[#7c3aed]">${salary.net}</td>
                  <td className="py-5 px-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                      salary.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                    }`}>
                      {salary.status}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedSalary(salary); setIsViewOpen(true); }} 
                        className="p-3 bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        <Eye size={16} /> View & Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-8">
            <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">Records for {managerDept}</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`p-2 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20`}><ChevronLeft size={18} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`p-2 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20`}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL (Targeted for Printing) */}
      {isViewOpen && (
        <div id="salary-slip-modal">
          <ViewSalary 
            isOpen={isViewOpen} 
            onClose={() => setIsViewOpen(false)} 
            salaryData={selectedSalary} 
            theme={theme} 
          />
          {/* Internal Print Button inside Modal for Convenience */}
          <button 
             onClick={() => window.print()} 
             className="fixed bottom-10 right-10 p-4 bg-emerald-500 text-white rounded-full shadow-2xl print:hidden flex items-center gap-2 font-bold"
          >
            <Printer size={20} /> Print Now
          </button>
        </div>
      )}
    </main>
  );
};

const StatCard = ({ title, value, icon, styles }) => (
  <div className={`${styles.bgCard} border ${styles.border} p-8 rounded-[2.5rem] flex items-center justify-between transition-all duration-500`}>
    <div>
      <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">{title}</p>
      <h3 className={`text-2xl font-black ${styles.textMain}`}>{value}</h3>
    </div>
    <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
  </div>
);

export default Salary;