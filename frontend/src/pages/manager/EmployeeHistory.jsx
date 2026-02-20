import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { 
  Network, 
  SearchCode, 
  Download, 
  History as HistoryIcon, 
  CheckCircle, 
  TrendingUp, 
  CalendarDays,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';

const EmployeeHistory = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const managerDept = context?.managerDept || 'Department';

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [employees, setEmployees] = useState([]); // Real staff from DB
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- Fetch Department Employees on Load ---
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // This endpoint uses the controller logic that filters by Manager Dept automatically
        const res = await api.get('/auth/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching departmental staff:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // --- Handlers ---
  const handleSelectEmployee = async (emp) => {
    setSearchTerm(`${emp.firstName} ${emp.lastName}`);
    setShowResults(false);
    setLoading(true);

    try {
      // Hits your getEmployeeHistory controller
      const res = await api.get(`/auth/employees/${emp.id}/history`);
      setSelectedEmployee(res.data.details);
      setHistoryLogs(res.data.logs);
    } catch (err) {
      console.error("History fetch error:", err);
      alert("Failed to load employee timeline.");
    } finally {
      setLoading(false);
    }
  };

  // Logic: Search staff within the fetched departmental list
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const id = (emp.employeeId || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || id.includes(search);
  });

  // --- UI Helpers ---
  const getLogIcon = (action) => {
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('hire')) return <CheckCircle size={14}/>;
    if (a.includes('promotion') || a.includes('update')) return <TrendingUp size={14}/>;
    return <HistoryIcon size={14}/>;
  };

  const getLogColor = (category) => {
    switch (category) {
      case 'SECURITY': return 'border-emerald-500';
      case 'CAREER': return 'border-purple-500';
      default: return 'border-amber-500';
    }
  };

  const styles = {
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    bgCard: theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white',
    bgInput: theme === 'dark' ? 'bg-[#0f1623]' : 'bg-slate-50',
    border: theme === 'dark' ? 'border-white/10' : 'border-slate-200',
    timelineLine: theme === 'dark' ? 'before:bg-white/10' : 'before:bg-slate-200',
    timelineBubble: theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white',
    heading: theme === 'dark' ? 'text-white' : 'text-slate-900',
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#7c3aed] mb-4" size={40} />
        <p className={`text-xs font-black uppercase tracking-widest ${styles.textMuted}`}>Loading Records...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className={`${styles.textMuted} text-[11px] mb-1 font-black uppercase tracking-widest`}>
            Manager Portal &gt; Staff History
          </p>
          <h1 className={`text-3xl font-black tracking-tighter ${styles.heading}`}>Departmental Records</h1>
        </div>
        {selectedEmployee && (
          <button className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-95">
            <Download size={18} /> Export {selectedEmployee.name.split(' ')[0]}'s History
          </button>
        )}
      </div>

      <div className={`${styles.bgCard} border ${styles.border} p-6 md:p-10 rounded-[2.5rem] shadow-sm relative`}>
        
        {/* Search Bar */}
        <div className="relative mb-12 max-w-2xl mx-auto">
          <span className={`absolute -top-2.5 left-6 ${styles.bgCard} px-2 text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.2em] z-10`}>
            {managerDept} Directory
          </span>
          <div className="relative">
            <SearchCode className={`absolute left-5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setShowResults(true)}}
              onFocus={() => setShowResults(true)}
              className={`w-full ${styles.bgInput} border ${styles.border} p-5 pl-14 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} 
              placeholder="Search staff by name or ID..."
            />
          </div>
          
          {showResults && (searchTerm.length > 0) && (
            <div className={`absolute w-full mt-2 ${styles.bgCard} border ${styles.border} rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto`}>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <div 
                    key={emp.id} 
                    onClick={() => handleSelectEmployee(emp)} 
                    className={`p-4 hover:bg-[#7c3aed]/10 cursor-pointer border-b last:border-0 ${styles.border} transition-colors flex justify-between items-center`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] font-black text-[10px]">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{emp.firstName} {emp.lastName}</p>
                        <p className={`text-[11px] font-bold ${styles.textMuted} uppercase tracking-tight`}>{emp.jobPositionRel?.title || 'Staff'} • {emp.employeeId}</p>
                      </div>
                    </div>
                    <ShieldCheck size={16} className="text-[#7c3aed] opacity-50" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                   <AlertCircle size={14}/> No matching staff found
                </div>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="animate-spin text-[#7c3aed] mx-auto mb-4" size={40} />
            <p className={`text-xs font-black uppercase tracking-widest ${styles.textMuted}`}>Fetching Timeline...</p>
          </div>
        ) : selectedEmployee ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Timeline View */}
            <div className={`relative py-10 before:content-[''] before:absolute before:left-1/2 before:w-0.5 ${styles.timelineLine} before:h-full before:-translate-x-1/2`}>
              {historyLogs.length > 0 ? historyLogs.map((log, index) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-center w-full mb-12 relative`}>
                  <div className={`w-[45%] ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <span className={`text-[10px] font-black ${styles.textMuted} mb-2 block uppercase tracking-widest`}>{log.date}</span>
                    <div className={`${styles.bgInput} border ${styles.border} p-6 rounded-4xl inline-block w-full hover:border-[#7c3aed]/50 transition-all group`}>
                      <div className={`flex items-center gap-3 mb-2 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[#7c3aed] bg-[#7c3aed]/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                          {getLogIcon(log.title)}
                        </span>
                        <strong className={`text-xs font-black uppercase tracking-widest ${styles.heading}`}>{log.title}</strong>
                      </div>
                      <p className={`text-[13px] leading-relaxed font-medium ${styles.textMuted}`}>{log.desc}</p>
                    </div>
                  </div>
                  <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 ${styles.timelineBubble} border-4 ${getLogColor(log.category)} rounded-full z-10 shadow-lg`}></div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-40 uppercase font-black text-[10px] tracking-widest">No history logs found</div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className={`${styles.bgInput} p-6 rounded-3xl border ${styles.border} border-l-4 border-l-purple-500`}>
                <div className={`flex items-center gap-2 text-[10px] ${styles.textMuted} mb-2 uppercase tracking-[0.2em] font-black`}>
                  <CalendarDays size={14} className="text-[#7c3aed]"/> Hire Date
                </div>
                <div className={`text-lg font-black tracking-tight ${styles.heading}`}>{selectedEmployee.hireDate}</div>
              </div>
              <div className={`${styles.bgInput} p-6 rounded-3xl border ${styles.border} border-l-4 border-l-emerald-500`}>
                <div className={`flex items-center gap-2 text-[10px] ${styles.textMuted} mb-2 uppercase tracking-[0.2em] font-black`}>
                  <TrendingUp size={14} className="text-emerald-500"/> Current Role
                </div>
                <div className={`text-lg font-black tracking-tight ${styles.heading}`}>{selectedEmployee.role}</div>
              </div>
              <div className={`${styles.bgInput} p-6 rounded-3xl border ${styles.border} border-l-4 border-l-amber-500`}>
                <div className={`flex items-center gap-2 text-[10px] ${styles.textMuted} mb-2 uppercase tracking-[0.2em] font-black`}>
                  <Network size={14} className="text-amber-500"/> Scope
                </div>
                <div className={`text-lg font-black tracking-tight ${styles.heading}`}>{selectedEmployee.dept}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className={`w-24 h-24 ${styles.bgInput} border ${styles.border} border-dashed rounded-4xl flex items-center justify-center mx-auto mb-6`}>
              <SearchCode size={40} className="text-[#7c3aed] opacity-20" />
            </div>
            <h3 className={`text-xl font-black mb-2 tracking-tight ${styles.heading}`}>Personnel Records</h3>
            <p className={`text-sm font-medium ${styles.textMuted} max-w-xs mx-auto`}>Search for any employee by name or ID within your department to view their career timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeHistory;