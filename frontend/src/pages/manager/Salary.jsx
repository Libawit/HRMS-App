import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Wallet, TrendingUp, Percent,
  ChevronLeft, ChevronRight, Eye, Building2, Printer, Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-hot-toast';

// Import Modals
import ViewSalary from '../../modals/manager/ViewSalary';

const Salary = () => {
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal Visibility
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const monthNum = currentDate.getMonth(); 
  const year = currentDate.getFullYear();
  const selectedMonthStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // --- Fetch Salaries from Backend ---
  const fetchSalaries = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        // Send as pure values; backend will handle parseInt
        month: monthNum,
        year: year,
        departmentId: user?.departmentId, 
        search: searchTerm.trim() || undefined
      };

      const response = await axios.get("/salaries", { params });
      setSalaries(response.data);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Could not load department payroll.");
    } finally {
      setLoading(false);
    }
  }, [monthNum, year, searchTerm, user?.departmentId]);

  useEffect(() => {
    if (user?.departmentId) {
      fetchSalaries();
    }
  }, [fetchSalaries, user?.departmentId]);

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

  const totalPages = Math.ceil(salaries.length / itemsPerPage);
  const currentItems = salaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 ${styles.bgBody} transition-colors duration-500`}>
      
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #salary-slip-modal, #salary-slip-modal * { visibility: visible; }
            #salary-slip-modal { 
              position: absolute; left: 0; top: 0; width: 100%; 
              background: white !important; color: black !important;
            }
            @page { size: auto; margin: 10mm; }
          }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[#7c3aed]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed]">
              {user?.departmentRel?.name || "Department"} Records
            </span>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>Payroll Oversight</h1>
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
        <StatCard title="Dept. Total" value={`$${salaries.reduce((acc, curr) => acc + (curr.netPay || 0), 0).toLocaleString()}`} icon={<Wallet className="text-emerald-500"/>} styles={styles} />
        <StatCard title="Total Bonuses" value={`$${salaries.reduce((acc, curr) => acc + (curr.amountBonus || 0), 0).toLocaleString()}`} icon={<TrendingUp className="text-blue-500"/>} styles={styles} />
        <StatCard title="Total Deductions" value={`$${salaries.reduce((acc, curr) => acc + (curr.deductions || 0), 0).toLocaleString()}`} icon={<Percent className="text-amber-500"/>} styles={styles} />
      </div>

      {/* Table Section */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8 print:hidden`}>
        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
          <input 
            type="text" 
            placeholder="Search team member..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full ${styles.inputBg} border ${styles.border} text-sm rounded-2xl pl-14 pr-6 py-5 outline-none focus:border-[#7c3aed] ${styles.textMain} transition-all`}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Syncing Department Ledger...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-[#94a3b8] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="pb-5 px-4">Staff Member</th>
                  <th className="pb-5 px-4">Gross Basic</th>
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
                        <div className="w-10 h-10 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center font-black text-xs shadow-lg shadow-purple-500/20">
                          {salary.user?.firstName?.[0]}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${styles.textMain}`}>{salary.user?.firstName} {salary.user?.lastName}</p>
                          <p className="text-[10px] text-[#94a3b8] font-medium">{salary.user?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-5 px-4 text-sm font-medium ${styles.textMain}`}>${(salary.amountBasic || 0).toLocaleString()}</td>
                    <td className="py-5 px-4 text-sm font-black text-[#7c3aed]">${(salary.netPay || 0).toLocaleString()}</td>
                    <td className="py-5 px-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                        salary.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
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
          )}
        </div>

        {!loading && salaries.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-[#94a3b8]">No records found for this period.</p>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-8">
            <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`p-2 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20 transition-all hover:bg-white/5`}><ChevronLeft size={18} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`p-2 rounded-xl border ${styles.border} ${styles.textMain} disabled:opacity-20 transition-all hover:bg-white/5`}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {isViewOpen && (
        <div id="salary-slip-modal">
          <ViewSalary 
            isOpen={isViewOpen} 
            onClose={() => setIsViewOpen(false)} 
            salaryData={selectedSalary} 
            theme={theme} 
          />
          <button 
             onClick={() => window.print()} 
             className="fixed bottom-10 right-10 p-4 bg-emerald-600 text-white rounded-full shadow-2xl print:hidden flex items-center gap-2 font-bold hover:scale-110 transition-transform"
          >
            <Printer size={20} /> Print Slip
          </button>
        </div>
      )}
    </main>
  );
};

const StatCard = ({ title, value, icon, styles }) => (
  <div className={`${styles.bgCard} border ${styles.border} p-8 rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.02] duration-300`}>
    <div>
      <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">{title}</p>
      <h3 className={`text-2xl font-black ${styles.textMain}`}>{value}</h3>
    </div>
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">{icon}</div>
  </div>
);

export default Salary;