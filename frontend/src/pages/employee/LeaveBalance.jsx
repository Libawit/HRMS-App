import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  ChevronDown, 
  LayoutGrid,
  History,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Info,
  Wallet,
  Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

// Modal for details
import ViewLeaveBalanceModal from '../../modals/employee/ViewLeaveBalance';

const API_BASE = "http://localhost:5000/api";

const LeaveBalance = () => {
  // --- Theme & User Logic from Layout ---
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDetailsRow, setActiveDetailsRow] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);

  const currentYear = currentDate.getFullYear();

  // --- Fetch Data from Backend ---
  const fetchMyBalances = async () => {
    try {
      setLoading(true);
      // Fetch balances for the selected year
      const res = await axios.get(`${API_BASE}/auth/leave-balances?year=${currentYear}`);
      
      // Filter for ONLY the logged-in user on the frontend for security & privacy
      const myData = Array.isArray(res.data) 
        ? res.data.filter(b => b.email === user?.email) 
        : [];
        
      setBalances(myData);
    } catch (err) {
      console.error("Failed to fetch personal leave balances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchMyBalances();
    }
  }, [currentYear, user?.email]);

  // --- Search Filter ---
  const filteredBalances = useMemo(() => {
    return balances.filter(item => 
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, balances]);

  const totalAvailable = filteredBalances.reduce((acc, curr) => acc + curr.avail, 0);

  // --- Handlers ---
  const handleToggleDetails = (id) => setActiveDetailsRow(activeDetailsRow === id ? null : id);
  const handleOpenView = (balance) => {
    setSelectedBalance(balance);
    setIsViewModalOpen(true);
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
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} transition-colors duration-300`}>
      {/* Breadcrumb */}
      <div className={`text-[11px] font-bold uppercase tracking-widest ${styles.textMuted} mb-2`}>
        Personal Dashboard &gt; My Leave Balance
      </div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${styles.textMain}`}>My Balances</h1>
          <p className={`text-sm ${styles.textMuted}`}>
            Showing entitlements for <span className="text-[#7c3aed] font-bold">{user?.firstName} {user?.lastName}</span> in <b>{currentYear}</b>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} rounded-xl p-1`}>
            <button onClick={() => setCurrentDate(new Date(currentYear - 1, 0))} className="p-2 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-lg transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className={`px-4 text-xs font-black uppercase tracking-widest ${styles.textMain} flex items-center gap-2`}>
              <Calendar size={14} className="text-[#7c3aed]" />
              {currentYear}
            </div>
            <button onClick={() => setCurrentDate(new Date(currentYear + 1, 0))} className="p-2 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-lg transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${styles.bgCard} border ${styles.border} p-6 rounded-4xl flex items-center gap-5 shadow-xl shadow-black/5`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wallet size={28} />
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted}`}>Total Available Days</p>
                <h2 className={`text-3xl font-black ${styles.textMain}`}>
                  {loading ? "..." : totalAvailable.toFixed(1)}
                </h2>
            </div>
        </div>
        <div className={`md:col-span-2 flex items-center px-6 py-4 rounded-4xl gap-4 border ${isDark ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
            <Info className="text-blue-500 shrink-0" />
            <p className={`text-xs leading-relaxed ${styles.textMuted}`}>
                These balances are automatically updated based on your approved leave requests and monthly accruals. 
                Discrepancies? Please contact the <b>{user?.departmentRel?.name || 'HR'}</b> department.
            </p>
        </div>
      </div>

      <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5`}>
        {/* Search Bar */}
        <div className={`p-6 border-b ${styles.border}`}>
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-4 py-3 rounded-2xl gap-3 w-full max-w-md focus-within:border-[#7c3aed] transition-all`}>
            <Search size={18} className={styles.textMuted} />
            <input 
              type="text" 
              placeholder="Filter by leave type (e.g. Annual)..." 
              className="bg-transparent border-none outline-none text-sm w-full text-inherit placeholder:opacity-50 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
               <Loader2 size={40} className="animate-spin text-[#7c3aed] mb-4" />
               <p className={`text-xs font-black uppercase tracking-widest ${styles.textMuted}`}>Syncing your balances...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`text-[11px] ${styles.textMuted} uppercase tracking-widest font-black border-b ${styles.border}`}>
                  <th className="p-6">Leave Category</th>
                  <th className="p-6">Annual Allocation</th>
                  <th className="p-6">Used to Date</th>
                  <th className="p-6">Carry Forward</th>
                  <th className="p-6">Net Available</th>
                  <th className="p-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${styles.border}`}>
                {filteredBalances.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-[#7c3aed]/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }}></span>
                          <span className={`font-bold text-base ${styles.textMain}`}>{item.type}</span>
                        </div>
                      </td>
                      <td className={`p-6 font-bold ${styles.textMain}`}>{item.alloc.toFixed(1)} <span className="text-[10px] font-medium opacity-50 ml-1">Days</span></td>
                      <td className="p-6 text-red-500 font-bold">-{item.used.toFixed(1)}</td>
                      <td className="p-6 text-orange-500 font-bold">+{item.carry.toFixed(1)}</td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-4 py-1 rounded-xl text-sm font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {item.avail.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleToggleDetails(item.id)}
                            className={`p-2 rounded-xl border ${styles.border} hover:bg-slate-500/10 ${styles.textMuted} transition-all`}
                          >
                            <ChevronDown size={18} className={`transition-transform duration-300 ${activeDetailsRow === item.id ? 'rotate-180' : ''}`} />
                          </button>
                          <button 
                            onClick={() => handleOpenView(item)}
                            className="p-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-all"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expansion Row */}
                    {activeDetailsRow === item.id && (
                      <tr className={isDark ? "bg-white/2" : "bg-slate-50/50"}>
                        <td colSpan="6" className={`p-0 border-b ${styles.border}`}>
                          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className={`p-5 rounded-3xl border ${styles.border} ${isDark ? 'bg-black/20' : 'bg-white'}`}>
                              <div className={`text-[10px] font-black uppercase ${styles.textMuted} mb-4 flex items-center gap-2 tracking-widest`}>
                                <History size={14} className="text-[#7c3aed]" /> Transaction Breakdown
                              </div>
                              <div className="space-y-3">
                                  <div className="flex justify-between text-xs font-bold">
                                      <span className={styles.textMuted}>Standard Yearly Credit</span>
                                      <span className={styles.textMain}>{item.alloc} Days</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold">
                                      <span className={styles.textMuted}>Rollover from {currentYear - 1}</span>
                                      <span className="text-orange-500">{item.carry} Days</span>
                                  </div>
                                  <hr className={styles.border} />
                                  <div className="flex justify-between text-xs font-black">
                                      <span className={styles.textMain}>Gross Entitlement</span>
                                      <span className={styles.textMain}>{(item.alloc + item.carry).toFixed(1)} Days</span>
                                  </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col justify-center">
                               <h4 className={`text-sm font-bold ${styles.textMain} mb-2`}>About {item.type}</h4>
                               <p className={`text-xs leading-relaxed ${styles.textMuted}`}>
                                  Your {item.type} balance is calculated as per company policy for the {currentYear} fiscal year. 
                                  Unused days might be subject to the carry-forward cap specified in your employment contract.
                               </p>
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

          {!loading && filteredBalances.length === 0 && (
            <div className={`py-24 text-center ${styles.textMuted}`}>
              <LayoutGrid size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold text-lg">No records found for {currentYear}.</p>
              <p className="text-xs mt-1">Contact HR if you believe this is an error.</p>
            </div>
          )}
        </div>
      </div>

      <ViewLeaveBalanceModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        theme={theme} 
        data={selectedBalance} 
      />
    </main>
  );
};

export default LeaveBalance;