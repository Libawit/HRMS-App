import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, ClipboardList, Timer,
  Calendar, UserCheck, 
  Briefcase, FileText, Clock, Loader2
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 1. Move 'now' here so the whole component can see it
  const now = new Date(); 

  const [stats, setStats] = useState({
    leaveBalance: 0,
    attendanceRate: 0,
    totalHours: 0,
    presentDays: 0,
    absentDays: 0
  });
  // ... rest of your state
  const [recentLeaves, setRecentLeaves] = useState([]);
  
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Fetching from your existing individual endpoints
      const [attendanceRes, leavesRes] = await Promise.all([
        axios.get('/attendance/my-history'), // Uses getMyAttendance
        axios.get(`/auth/leave-requests?userId=${user.id}`) // Uses getLeaveRequests
      ]);

      const attendanceData = attendanceRes.data || [];
      const leaveData = leavesRes.data || [];

      // --- CALCULATE STATS ---
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Filter for current month
      const monthRecords = attendanceData.filter(r => new Date(r.date) >= startOfMonth);
      const present = monthRecords.filter(r => !['Absent'].includes(r.status)).length;
      const absent = monthRecords.filter(r => r.status === 'Absent').length;
      const hours = monthRecords.reduce((acc, curr) => acc + (curr.workHours || 0), 0);
      
      const rate = monthRecords.length > 0 
        ? ((present / monthRecords.length) * 100).toFixed(1) 
        : 0;

      setStats({
        presentDays: present,
        absentDays: absent,
        totalHours: hours.toFixed(1),
        attendanceRate: rate,
        // For leaveBalance, you could fetch from /auth/balances?userId=... 
        // Defaulting to 0 or a fixed value for now
        leaveBalance: 12 
      });

      setRecentLeaves(leaveData.slice(0, 4));
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    fetchDashboardData();
  }, [fetchDashboardData]);

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${styles.bgBody}`}>
      <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
    </div>
  );

  const statCards = [
    { label: 'Leave Balance', value: `${stats.leaveBalance} Days`, icon: <Calendar size={20} className="text-blue-500" />, trend: 'Available', color: 'bg-blue-500/10' },
    { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: <UserCheck size={20} className="text-emerald-500" />, trend: 'This Month', color: 'bg-emerald-500/10' },
    { label: 'Hours Worked', value: `${stats.totalHours}h`, icon: <Timer size={20} className="text-purple-500" />, trend: 'This Month', color: 'bg-purple-500/10' },
    { label: 'Pending Leaves', value: recentLeaves.filter(l => l.status === 'PENDING').length, icon: <ClipboardList size={20} className="text-orange-500" />, trend: 'Waitlist', color: 'bg-orange-500/10' },
  ];

  return (
    <div className={`min-h-full p-6 md:p-10 ${styles.bgBody} transition-colors no-scrollbar animate-in fade-in duration-700`}>
       {/* Breadcrumbs */}
      <nav className={`text-[0.7rem] ${styles.textMuted} font-black mb-2 uppercase tracking-[0.2em]`}>
        Portal &nbsp; • &nbsp; Personal Dashboard
      </nav>
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>My Overview</h1>
           <p className={`${styles.textMuted} text-sm font-medium`}>Real-time insights into your work profile.</p>
        </div>
        <div className={`hidden md:flex items-center gap-3 ${styles.bgCard} border ${styles.border} px-5 py-2.5 rounded-[1.2rem] shadow-sm`}>
          <Clock size={16} className="text-[#7c3aed]" />
          <span className={`text-xs font-black uppercase tracking-widest ${styles.textMain}`}>
            ID: {user?.employeeId || 'N/A'}
          </span>
        </div>
      </div>

      {/* 1. Identity Banner */}
      <div className="welcome-banner bg-linear-to-r from-[#7c3aed] to-[#4f46e5] rounded-[3.5rem] p-10 relative overflow-hidden text-white mb-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-purple-500/30">
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-lg font-bold opacity-80 mb-1">{greeting},</h3>
          <h2 className="text-5xl font-black mb-2 tracking-tighter">{user?.firstName} {user?.lastName}</h2>
          <p className="text-sm font-black opacity-90 mb-8 flex items-center gap-2 justify-center md:justify-start uppercase tracking-widest">
            <Briefcase size={16} /> {user?.designation || 'Team Member'}
          </p>
          <div className="flex gap-4">
             <Link to="/employee/attendance" className="bg-white text-[#7c3aed] px-8 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
               Manage Time
             </Link>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-3xl border border-white/20 shadow-2xl">
              <Calendar size={20} />
              <span className="text-base font-black uppercase tracking-tighter">
                {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
        </div>
      </div>

      {/* 2. Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className={`${styles.bgCard} p-7 rounded-[2.5rem] border ${styles.border} relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-5">
              <div className={`p-4 rounded-[1.2rem] ${stat.color}`}>{stat.icon}</div>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest bg-white/5 text-slate-400">
                {stat.trend}
              </span>
            </div>
            <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-[0.15em] mb-1`}>{stat.label}</p>
            <h3 className={`text-3xl font-black ${styles.textMain} tracking-tighter`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Leave History */}
        <div className={`${styles.bgCard} p-10 rounded-[3rem] border ${styles.border} lg:col-span-2 shadow-sm`}>
          <div className="flex justify-between items-center mb-10">
            <h3 className={`text-xl font-black ${styles.textMain} uppercase tracking-tight flex items-center gap-3`}>
               <ClipboardList className="text-[#7c3aed]" size={20} /> Recent Requests
            </h3>
            <Link to="/employee/leave-request" className={`text-[10px] ${isDark ? 'bg-white/5' : 'bg-slate-100'} hover:bg-[#7c3aed] hover:text-white px-6 py-3 rounded-2xl ${styles.textMain} transition-all font-black uppercase tracking-widest flex items-center gap-2`}>
              New Request <Plus size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentLeaves.length > 0 ? recentLeaves.map(leave => (
              <div key={leave.id} className={`flex items-center justify-between p-5 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} border ${styles.border}`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><FileText size={18} /></div>
                  <div>
                    <p className={`text-sm font-black ${styles.textMain}`}>{leave.leaveType?.name || 'Leave'}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      {new Date(leave.startDate).toLocaleDateString()} • {leave.daysRequested} Days
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                  leave.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' :
                  leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {leave.status}
                </span>
              </div>
            )) : (
              <p className={`text-center py-10 ${styles.textMuted} text-xs uppercase font-bold tracking-widest`}>No recent requests found</p>
            )}
          </div>
        </div>

        {/* 4. Mini Attendance Summary */}
        <div className={`${styles.bgCard} p-10 rounded-[3rem] border ${styles.border}`}>
          <h3 className={`text-xl font-black ${styles.textMain} mb-8 uppercase tracking-tight flex items-center gap-3`}>
            <Timer className="text-[#7c3aed]" size={20} /> This Month
          </h3>
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center">
              <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Present Days</p>
              <p className={`text-3xl font-black ${styles.textMain}`}>{stats.presentDays}</p>
            </div>
            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 text-center">
              <p className="text-[10px] font-black text-red-500 uppercase mb-1">Absent Days</p>
              <p className={`text-3xl font-black ${styles.textMain}`}>{stats.absentDays}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;