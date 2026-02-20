import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, DollarSign, Download, Eye, Wallet, TrendingUp, 
  Percent, Calendar, ChevronLeft, ChevronRight, Lock, Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig'; // Ensure this path is correct
import { toast } from 'react-hot-toast';

// Import View Modal
import ViewSalary from '../../modals/employee/ViewSalary';

const Salary = () => {
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const monthNum = currentDate.getMonth(); 
  const year = currentDate.getFullYear();
  const selectedMonthStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // --- Fetch Logic ---
  const fetchMySalaries = useCallback(async () => {
    try {
      setLoading(true);
      // We use the search param to filter for the specific logged-in user's ID 
      // OR your backend should ideally use the Auth Token to identify the user.
      // Based on your controller, we pass month and year.
      const params = {
        month: monthNum,
        year: year,
        search: user?.employeeId // Filtering by their own employee ID for safety
      };

      const response = await axios.get("/salaries", { params });
      
      // Safety check: Filter client-side as well to ensure the employee ONLY sees their records
      const myData = response.data.filter(s => s.userId === user?.id);
      setSalaries(myData);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Unable to load salary history.");
    } finally {
      setLoading(false);
    }
  }, [monthNum, year, user]);

  useEffect(() => {
    if (user?.id) {
      fetchMySalaries();
    }
  }, [fetchMySalaries, user?.id]);

  // --- Styles ---
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>My Salary History</h1>
          <p className={`${styles.textMuted} text-sm mt-1`}>
            Viewing statements for <span className="text-[#7c3aed] font-bold">{user?.firstName} {user?.lastName}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-black/20' : 'bg-white'} min-w-50 shadow-sm`}>
            <div className="flex items-center justify-between gap-4">
              <span className={`text-sm font-bold ${styles.textMain}`}>{selectedMonthStr}</span>
              <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${styles.textMuted}`}><ChevronLeft size={18}/></button>
                <button onClick={() => changeMonth(1)} className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${styles.textMuted}`}><ChevronRight size={18}/></button>
              </div>
            </div>
          </div>
          <div className={`hidden md:flex items-center gap-2 px-6 py-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
             <Lock size={16} className="text-amber-500" />
             <span className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Secure Employee Portal</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Net Received" 
          value={`$${salaries.reduce((acc, curr) => acc + (curr.netPay || 0), 0).toLocaleString()}`} 
          icon={<Wallet className="text-emerald-500"/>} 
          styles={styles} 
        />
        <StatCard 
          title="Total Bonuses" 
          value={`$${salaries.reduce((acc, curr) => acc + (curr.amountBonus || 0), 0).toLocaleString()}`} 
          icon={<TrendingUp className="text-blue-500"/>} 
          styles={styles} 
        />
        <StatCard 
          title="Deductions" 
          value={`$${salaries.reduce((acc, curr) => acc + (curr.deductions || 0), 0).toLocaleString()}`} 
          icon={<Percent className="text-red-500"/>} 
          styles={styles} 
        />
      </div>

      {/* Table Section */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8`}>
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Fetching Records...</p>
            </div>
          ) : (
            <>
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
                          <p className={`text-sm font-bold ${styles.textMain}`}>
                            {new Date(salary.year, salary.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className={`py-5 px-4 text-sm font-semibold ${styles.textMain}`}>
                        ${(salary.amountBasic || 0).toLocaleString()}
                      </td>
                      <td className="py-5 px-4 text-sm font-black text-[#7c3aed]">
                        ${(salary.netPay || 0).toLocaleString()}
                      </td>
                      <td className="py-5 px-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                          salary.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                        }`}>
                          {salary.status}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right relative">
                        <button 
                          onClick={() => { setSelectedSalary(salary); setIsViewOpen(true); }} 
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest ml-auto"
                        >
                          <Eye size={14} /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salaries.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-[#94a3b8] opacity-50">No statements found for this period</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
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
  <div className={`${styles.bgCard} border ${styles.border} p-8 rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.02]`}>
    <div>
      <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">{title}</p>
      <h3 className={`text-2xl font-black ${styles.textMain}`}>{value}</h3>
    </div>
    <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
  </div>
);

export default Salary;