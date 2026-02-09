import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Network, 
  SearchCode, 
  Download, 
  History as HistoryIcon, 
  CheckCircle, 
  TrendingUp, 
  CalendarDays,
  ShieldCheck
} from 'lucide-react';

const EmployeeHistory = () => {
  // Get Context from Parent
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const managerDept = context?.managerDept || 'Human Resources';

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Mock Data
  const employees = [
    { id: 'EMP001', name: 'John Smith', role: 'CEO', dept: 'Executive', hireDate: 'Jan 15, 2010' },
    { id: 'EMP002', name: 'Jennifer Martinez', role: 'HR Manager', dept: 'Human Resources', hireDate: 'March 10, 2018' },
    { id: 'EMP005', name: 'Sarah Wilson', role: 'Recruiter', dept: 'Human Resources', hireDate: 'June 22, 2021' },
    { id: 'EMP009', name: 'Mike Ross', role: 'Developer', dept: 'IT', hireDate: 'Feb 05, 2023' },
  ];

  // Logic: Search ALL employees by name or ID
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const historyLogs = [
    { date: 'April 19, 2025', title: 'Promotion', desc: 'Promoted to Senior Manager', icon: <TrendingUp size={14}/>, color: 'border-purple-500' },
    { date: 'April 18, 2025', title: 'Record Updated', desc: 'Information was updated by Super Admin', icon: <HistoryIcon size={14}/>, color: 'border-amber-500' },
    { date: 'Jan 15, 2010', title: 'Record Created', desc: 'New employee profile added to system', icon: <CheckCircle size={14}/>, color: 'border-emerald-500' },
  ];

  const styles = {
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    bgCard: theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white',
    bgInput: theme === 'dark' ? 'bg-[#0f1623]' : 'bg-slate-50',
    border: theme === 'dark' ? 'border-white/10' : 'border-slate-200',
    timelineLine: theme === 'dark' ? 'before:bg-white/10' : 'before:bg-slate-200',
    timelineBubble: theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white',
    heading: theme === 'dark' ? 'text-white' : 'text-slate-900',
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchTerm(emp.name);
    setShowResults(false);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className={`${styles.textMuted} text-[11px] mb-1 font-black uppercase tracking-widest`}>Manager Portal &gt; Staff History</p>
          <h1 className={`text-3xl font-black tracking-tighter ${styles.heading}`}>Departmental Records</h1>
        </div>
        {selectedEmployee && (
          <button className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20">
            <Download size={18} /> Export {selectedEmployee.name.split(' ')[0]}'s History
          </button>
        )}
      </div>

      <div className={`${styles.bgCard} border ${styles.border} p-6 md:p-10 rounded-[2.5rem] shadow-sm`}>
        
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
            <div className={`absolute w-full mt-2 ${styles.bgCard} border ${styles.border} rounded-2xl shadow-2xl z-50 overflow-hidden`}>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <div 
                    key={emp.id} 
                    onClick={() => handleSelectEmployee(emp)} 
                    className={`p-4 hover:bg-[#7c3aed]/10 cursor-pointer border-b last:border-0 ${styles.border} transition-colors flex justify-between items-center`}
                  >
                    <div>
                      <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{emp.name}</p>
                      <p className={`text-[11px] font-bold ${styles.textMuted} uppercase tracking-tight`}>{emp.role} • {emp.id}</p>
                    </div>
                    <ShieldCheck size={16} className="text-[#7c3aed] opacity-50" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                    No matching staff found
                </div>
              )}
            </div>
          )}
        </div>

        {selectedEmployee ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Timeline View */}
            <div className={`relative py-10 before:content-[''] before:absolute before:left-1/2 before:w-0.5 ${styles.timelineLine} before:h-full before:-translate-x-1/2`}>
              {historyLogs.map((log, index) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-center w-full mb-12 relative`}>
                  <div className={`w-[45%] ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <span className={`text-[10px] font-black ${styles.textMuted} mb-2 block uppercase tracking-widest`}>{log.date}</span>
                    <div className={`${styles.bgInput} border ${styles.border} p-6 rounded-4xl inline-block w-full hover:border-[#7c3aed]/50 transition-all group`}>
                      <div className={`flex items-center gap-3 mb-2 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[#7c3aed] bg-[#7c3aed]/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform">{log.icon}</span>
                        <strong className={`text-xs font-black uppercase tracking-widest ${styles.heading}`}>{log.title}</strong>
                      </div>
                      <p className={`text-[13px] leading-relaxed font-medium ${styles.textMuted}`}>{log.desc}</p>
                    </div>
                  </div>
                  <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 ${styles.timelineBubble} border-4 ${log.color} rounded-full z-10 shadow-lg`}></div>
                </div>
              ))}
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
            <p className={`text-sm font-medium ${styles.textMuted} max-w-xs mx-auto`}>Search for any employee by name or ID to view their career timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeHistory;