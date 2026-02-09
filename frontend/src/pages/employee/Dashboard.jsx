import React, { useState, useEffect } from 'react';
import { 
  Plus, ClipboardList, Timer, Wallet,
  TrendingUp, ArrowRight, Calendar, UserCheck, 
  Briefcase, FileText, Clock
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  
  // --- Theme Logic: Sync with the global layout theme ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // --- Theme Styles Mapping ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    accent: '#7c3aed'
  };

  // Personalized stats for the specific employee
  const myStats = [
    { label: 'Leave Balance', value: '14 Days', icon: <Calendar size={20} className="text-blue-500" />, trend: 'Available', color: 'bg-blue-500/10' },
    { label: 'Attendance Rate', value: '98.2%', icon: <UserCheck size={20} className="text-emerald-500" />, trend: '+1.2%', color: 'bg-emerald-500/10' },
    { label: 'Hours This Month', value: '154h', icon: <Timer size={20} className="text-purple-500" />, trend: 'Target: 160h', color: 'bg-purple-500/10' },
    { label: 'Current Net Pay', value: '$4,250', icon: <Wallet size={20} className="text-orange-500" />, trend: 'Jan 2026', color: 'bg-orange-500/10' },
  ];

  // Employee's own personal leave requests
  const myRecentLeaves = [
    { id: 1, type: 'Annual Leave', duration: '3 Days', date: 'Oct 12, 2024', status: 'Pending' },
    { id: 2, type: 'Sick Leave', duration: '1 Day', date: 'Sept 05, 2024', status: 'Approved' },
    { id: 3, type: 'Personal', duration: '0.5 Day', date: 'Aug 20, 2024', status: 'Approved' },
    { id: 4, type: 'Annual Leave', duration: '5 Days', date: 'June 10, 2024', status: 'Approved' },
  ];

  return (
    <div className={`min-h-full p-6 md:p-10 ${styles.bgBody} transition-colors no-scrollbar animate-in fade-in duration-700`}>
      <nav className={`text-[0.7rem] ${styles.textMuted} font-black mb-2 uppercase tracking-[0.2em]`}>
        Portal &nbsp; • &nbsp; Personal Dashboard
      </nav>
      
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>My Overview</h1>
           <p className={`${styles.textMuted} text-sm font-medium`}>Welcome back to your secure workspace.</p>
        </div>
        <div className={`hidden md:flex items-center gap-3 ${styles.bgCard} border ${styles.border} px-5 py-2.5 rounded-[1.2rem] shadow-sm`}>
          <Clock size={16} className="text-[#7c3aed]" />
          <span className={`text-xs font-black uppercase tracking-widest ${styles.textMain}`}>Shift Started: 08:45 AM</span>
        </div>
      </div>

      {/* 1. Personal Identity Banner */}
      <div className="welcome-banner bg-linear-to-r from-[#7c3aed] to-[#4f46e5] rounded-[3.5rem] p-10 relative overflow-hidden text-white mb-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-purple-500/30">
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-lg font-bold opacity-80 mb-1">
            {greeting},
          </h3>
          <h2 className="text-5xl font-black mb-2 tracking-tighter">Alex Thompson</h2>
          <p className="text-sm font-black opacity-90 mb-8 flex items-center gap-2 justify-center md:justify-start uppercase tracking-widest">
            <Briefcase size={16} /> Senior Software Engineer • Engineering Dept
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
             <button className="bg-white text-[#7c3aed] px-8 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
               Clock Out
             </button>
             <Link to="/employee/profile" className="bg-black/20 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
               View Profile
             </Link>
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-3xl border border-white/20 shadow-2xl">
              <Calendar size={20} />
              <span className="text-base font-black uppercase tracking-tighter">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p className="text-[11px] font-black opacity-70 uppercase tracking-[0.3em] bg-black/20 px-4 py-1.5 rounded-full">Employee ID: MGR-99201</p>
        </div>
      </div>

      {/* 2. My Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {myStats.map((stat, i) => (
          <div key={i} className={`${styles.bgCard} p-7 rounded-[2.5rem] border ${styles.border} relative overflow-hidden group hover:border-[#7c3aed55] transition-all`}>
            <div className="flex justify-between items-start mb-5">
              <div className={`p-4 rounded-[1.2rem] ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${stat.trend.includes('+') || stat.trend === 'Available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-400'}`}>
                {stat.trend}
              </span>
            </div>
            <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-[0.15em] mb-1`}>{stat.label}</p>
            <h3 className={`text-3xl font-black ${styles.textMain} tracking-tighter`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Personal Attendance Trends */}
        <div className={`${styles.bgCard} p-10 rounded-[3rem] border ${styles.border} shadow-sm`}>
          <h3 className={`text-xl font-black ${styles.textMain} mb-8 uppercase tracking-tight flex items-center gap-3`}>
            <Timer className="text-[#7c3aed]" size={20} /> Time & Attendance
          </h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                <span className={styles.textMuted}>On-Time Arrival</span>
                <span className="text-emerald-500">92%</span>
              </div>
              <div className="h-3 w-full bg-slate-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                <span className={styles.textMuted}>Remote Working</span>
                <span className="text-purple-500">45%</span>
              </div>
              <div className="h-3 w-full bg-slate-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-1000" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className={`pt-6 border-t ${styles.border}`}>
                <p className={`text-[11px] ${styles.textMuted} font-bold leading-relaxed italic`}>
                    "You have maintained an excellent attendance record this month. Keep it up to stay eligible for the quarterly performance bonus!"
                </p>
            </div>
          </div>
        </div>

        {/* 4. My Leave History */}
        <div className={`${styles.bgCard} p-10 rounded-[3rem] border ${styles.border} lg:col-span-2 shadow-sm`}>
          <div className="flex justify-between items-center mb-10">
            <h3 className={`text-xl font-black ${styles.textMain} uppercase tracking-tight flex items-center gap-3`}>
               <ClipboardList className="text-[#7c3aed]" size={20} /> My Recent Leaves
            </h3>
            <Link to="/employee/leave-request" className={`text-[10px] ${isDark ? 'bg-white/5' : 'bg-slate-100'} hover:bg-[#7c3aed] hover:text-white px-6 py-3 rounded-2xl ${styles.textMain} transition-all flex items-center gap-2 font-black uppercase tracking-widest shadow-sm`}>
              Request Leave <Plus size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myRecentLeaves.map(leave => (
              <div key={leave.id} className={`flex items-center justify-between p-5 rounded-4xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} border ${styles.border} hover:border-[#7c3aed55] transition-all group/card`}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] group-hover/card:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${styles.textMain}`}>{leave.type}</p>
                    <p className={`text-[10px] font-black ${styles.textMuted} uppercase tracking-tighter`}>{leave.date}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className={`text-xs font-black ${styles.textMain} mb-1.5`}>{leave.duration}</p>
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm ${
                      leave.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                      leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {leave.status}
                    </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;