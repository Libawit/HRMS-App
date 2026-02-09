import React, { useState } from 'react';
import { 
  Network, 
  Download, 
  History as HistoryIcon, 
  CheckCircle, 
  TrendingUp, 
  CalendarDays,
  UserCircle
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const EmployeeHistory = () => {
  // --- Theme Logic via useOutletContext ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Authenticated User Logic ---
  // Locked to the logged-in employee (James Wilson / EMP-012)
  const [currentUser] = useState({ 
    id: 'EMP-012', 
    name: 'James Wilson', 
    role: 'Senior Developer', 
    dept: 'Engineering', 
    hireDate: 'January 15, 2020',
    avatar: 'https://i.pravatar.cc/150?u=james'
  });

  // Career milestones specific to this individual
  const historyLogs = [
    { date: 'January 20, 2026', title: 'Salary Disbursement', desc: 'Monthly compensation for January cleared and disbursed.', icon: <CheckCircle size={14}/>, color: 'border-emerald-500' },
    { date: 'June 12, 2023', title: 'Promotion', desc: 'Promoted to Senior Developer - Engineering Operations Center', icon: <TrendingUp size={14}/>, color: 'border-purple-500' },
    { date: 'January 15, 2020', title: 'Joined LyticalSMS', desc: 'Onboarded as Junior Developer in the Engineering department.', icon: <UserCircle size={14}/>, color: 'border-amber-500' },
  ];

  // --- Dynamic Style Mapping ---
  const styles = {
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-slate-50',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    timelineLine: isDark ? 'before:bg-white/10' : 'before:bg-slate-200',
    timelineBubble: isDark ? 'bg-[#0b1220]' : 'bg-white',
    heading: isDark ? 'text-white' : 'text-slate-900',
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className={`${styles.textMuted} text-[11px] mb-2 font-black uppercase tracking-[0.2em]`}>
            Secure Portal &gt; Career History
          </nav>
          <div className="flex items-center gap-4">
            <img src={currentUser.avatar} className="w-14 h-14 rounded-2xl border-2 border-[#7c3aed]/20 shadow-xl" alt="Me" />
            <div>
                <h1 className={`text-3xl font-black tracking-tighter ${styles.heading}`}>Career Timeline</h1>
                <p className={`text-xs ${styles.textMuted}`}>Official professional milestones for {currentUser.name}</p>
            </div>
          </div>
        </div>
        
        <button className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
          isDark 
          ? "bg-white/5 hover:bg-[#7c3aed] text-white border-white/10" 
          : "bg-white hover:bg-indigo-600 hover:text-white border-slate-200 text-slate-700"
        }`}>
          <Download size={16} /> Export My Records
        </button>
      </div>

      <div className={`${styles.bgCard} border ${styles.border} p-6 md:p-12 rounded-[3rem] shadow-sm relative overflow-hidden`}>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

        <div className="space-y-16">
          {/* Timeline View */}
          <div className={`relative py-4 before:content-[''] before:absolute before:left-1/2 before:w-0.5 ${styles.timelineLine} before:h-full before:-translate-x-1/2`}>
            {historyLogs.map((log, index) => (
              <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-center w-full mb-12 relative`}>
                <div className={`w-[45%] ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <span className={`text-[10px] font-black ${styles.textMuted} mb-3 block uppercase tracking-widest`}>{log.date}</span>
                  <div className={`${styles.bgInput} border ${styles.border} p-6 rounded-[2.5rem] inline-block w-full hover:border-[#7c3aed]/50 transition-all group`}>
                    <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[#7c3aed] bg-[#7c3aed]/10 p-2.5 rounded-xl group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
                        {log.icon}
                      </span>
                      <strong className={`text-sm font-black uppercase tracking-tight ${styles.heading}`}>
                        {log.title}
                      </strong>
                    </div>
                    <p className={`text-[13px] leading-relaxed ${styles.textMuted}`}>{log.desc}</p>
                  </div>
                </div>
                
                {/* Center Bubble */}
                <div className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 ${styles.timelineBubble} border-4 ${log.color} rounded-full z-10 shadow-xl`}></div>
              </div>
            ))}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className={`${styles.bgInput} p-6 rounded-3xl border ${styles.border} border-l-4 border-l-purple-500`}>
              <div className={`flex items-center gap-2 text-[10px] ${styles.textMuted} mb-2 uppercase tracking-widest font-black`}>
                <CalendarDays size={14} className="text-[#7c3aed]"/> Hire Date
              </div>
              <div className={`text-xl font-black ${styles.heading}`}>{currentUser.hireDate}</div>
            </div>

            <div className={`${styles.bgInput} p-6 rounded-3xl border ${styles.border} border-l-4 border-l-emerald-500`}>
              <div className={`flex items-center gap-2 text-[10px] ${styles.textMuted} mb-2 uppercase tracking-widest font-black`}>
                <TrendingUp size={14} className="text-emerald-500"/> Current Role
              </div>
              <div className={`text-xl font-black ${styles.heading}`}>{currentUser.role}</div>
            </div>

            <div className={`${styles.bgInput} p-6 rounded-3xl border ${styles.border} border-l-4 border-l-amber-500`}>
              <div className={`flex items-center gap-2 text-[10px] ${styles.textMuted} mb-2 uppercase tracking-widest font-black`}>
                <Network size={14} className="text-amber-500"/> Assignment
              </div>
              <div className={`text-xl font-black ${styles.heading}`}>{currentUser.dept}</div>
            </div>
          </div>

          <div className="text-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <UserCircle size={14}/> Official Employment Record
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistory;