import React, { useState, useEffect } from 'react';
import { 
  Network, SearchCode, Download, 
  History as HistoryIcon, CheckCircle, 
  TrendingUp, CalendarDays, User, Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const EmployeeHistory = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // --- STYLES ---
  const styles = {
    container: `min-h-screen p-6 lg:p-10 transition-colors duration-300`,
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    bgCard: isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-black/10 shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-slate-50',
    border: isDark ? 'border-white/10' : 'border-black/10',
    timelineLine: isDark ? 'before:bg-white/5' : 'before:bg-slate-200',
    timelineBubble: isDark ? 'bg-[#0b1220]' : 'bg-white',
    heading: isDark ? 'text-white' : 'text-slate-900',
    subText: `text-[11px] uppercase font-black tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`,
  };

  // --- FETCH DIRECTORY ---
  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token'); // 1. Get Token

      const res = await fetch('http://localhost:5000/api/auth/employees', {
        headers: {
          'Authorization': `Bearer ${token}` // 2. Add Header
        }
      });

      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      // 3. Add safety check
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (err) {
      console.error("Directory Load Error:", err);
    }
  };
  fetchEmployees();
}, []);

  // --- DEBOUNCE SEARCH (Your Logic) ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- FILTERED LIST ---
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const search = debouncedSearch.toLowerCase();
    return fullName.includes(search) || (emp.employeeId && emp.employeeId.toLowerCase().includes(search));
  });

  // --- FETCH INDIVIDUAL HISTORY ---
const handleSelectEmployee = async (emp) => {
  setSelectedEmployee(null);
  setSearchTerm(`${emp.firstName} ${emp.lastName}`);
  setShowResults(false);
  setIsLoadingLogs(true);

  try {
    const token = localStorage.getItem('token'); // 1. Get Token

    const res = await fetch(`http://localhost:5000/api/auth/employees/${emp.id}/history`, {
      headers: {
        'Authorization': `Bearer ${token}` // 2. Add Header
      }
    });

    if (!res.ok) throw new Error('History not found');
    const data = await res.json();
    
    setSelectedEmployee(data.details);
    setHistoryLogs(data.logs);
  } catch (err) {
    console.error("Log Fetch Error:", err);
  } finally {
    setIsLoadingLogs(false);
  }
};

  return (
    <div className={styles.container}>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className={styles.subText}>Directory &nbsp; • &nbsp; Audit Trails &nbsp; • &nbsp; History</p>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.heading}`}>Employee History</h1>
        </div>
        {selectedEmployee && (
          <button className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/25">
            <Download size={18} /> Export Records
          </button>
        )}
      </div>

      <div className={`${styles.bgCard} border p-8 md:p-12 rounded-[2.5rem]`}>
        {/* Search Bar */}
        <div className="relative mb-16 max-w-2xl mx-auto">
          <span className={`absolute -top-3 left-6 ${isDark ? 'bg-[#0b1220]' : 'bg-white'} px-3 text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.25em] z-10`}>
            Search Directory
          </span>
          <div className="relative">
            <SearchCode className={`absolute left-5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} size={22} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setShowResults(true)}}
              onFocus={() => setShowResults(true)}
              className={`w-full ${styles.bgInput} border ${styles.border} p-5 pl-14 rounded-[20px] text-sm font-bold outline-none focus:border-[#7c3aed] transition-all ${isDark ? 'text-white' : 'text-slate-900'}`} 
              placeholder="Search by name or ID..."
            />
          </div>
          
          {showResults && debouncedSearch.length > 0 && (
            <div className={`absolute w-full mt-3 ${styles.bgCard} border ${styles.border} rounded-[20px] shadow-2xl z-50 overflow-hidden`}>
              {filteredEmployees.slice(0, 5).map(emp => (
                <div 
                  key={emp.id} 
                  onClick={() => handleSelectEmployee(emp)} 
                  className={`p-5 hover:bg-[#7c3aed]/10 cursor-pointer border-b last:border-0 ${styles.border} flex items-center gap-4`}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center overflow-hidden">
                    {emp.profileImage ? <img src={emp.profileImage} className="w-full h-full object-cover" /> : <User size={18} />}
                  </div>
                  <div>
                    <p className={`text-sm font-black ${styles.heading}`}>{emp.firstName} {emp.lastName}</p>
                    <p className={`text-[10px] ${styles.textMuted} uppercase`}>{emp.employeeId} • {emp.department}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoadingLogs ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#7c3aed] mb-4" size={32} />
            <p className={styles.subText}>Generating professional timeline...</p>
          </div>
        ) : selectedEmployee ? (
          <div className="space-y-16 animate-in fade-in duration-500">
            {/* Timeline */}
            <div className={`relative py-4 before:content-[''] before:absolute before:left-1/2 before:w-px ${styles.timelineLine} before:h-full before:-translate-x-1/2`}>
              {historyLogs.length > 0 ? historyLogs.map((log, index) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-center w-full mb-16 relative`}>
                  <div className={`w-[45%] ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <span className={`text-[10px] font-black ${styles.textMuted} mb-3 block uppercase tracking-[0.2em]`}>{log.date}</span>
                    <div className={`${styles.bgInput} border ${styles.border} p-8 rounded-4xl inline-block w-full hover:border-[#7c3aed] transition-all`}>
                      <strong className={`text-xs font-black uppercase tracking-widest ${styles.heading}`}>{log.title}</strong>
                      <p className={`text-[13px] mt-2 leading-relaxed font-medium ${styles.textMuted}`}>{log.desc}</p>
                    </div>
                  </div>
                  <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 ${styles.timelineBubble} border-[3px] border-purple-500 rounded-full z-10`}></div>
                </div>
              )) : (
                <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-500">No history records found for this employee.</p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <StatCard icon={<CalendarDays size={14}/>} label="Hire Date" value={selectedEmployee.hireDate} color="purple" styles={styles} />
               <StatCard icon={<TrendingUp size={14}/>} label="Position" value={selectedEmployee.role} color="emerald" styles={styles} />
               <StatCard icon={<Network size={14}/>} label="Dept" value={selectedEmployee.dept} color="amber" styles={styles} />
            </div>
          </div>
        ) : (
          <div className="py-32 text-center opacity-40">
            <SearchCode size={48} className="mx-auto mb-4" />
            <p className="text-[11px] font-black uppercase tracking-widest">Select an employee to view their audit trail</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for clean code
const StatCard = ({ icon, label, value, color, styles }) => (
  <div className={`${styles.bgInput} p-7 rounded-4xl border ${styles.border} border-l-[6px] border-l-${color}-500`}>
    <div className={`flex items-center gap-2 text-[10px] ${styles.textMuted} mb-2 uppercase font-black`}>
      {icon} {label}
    </div>
    <div className={`text-xl font-black tracking-tight ${styles.heading}`}>{value}</div>
  </div>
);

export default EmployeeHistory;