import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, ClipboardList, ArrowRight, 
  Calendar, Clock, CheckCircle2, 
  Wallet, AlertCircle
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const user = context?.user || { firstName: 'Manager', department: 'Department', id: '', departmentId: '' };
  const isDark = theme === 'dark';

  // --- State for Real Data ---
  const [greeting, setGreeting] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({
    presentToday: 0,
    lateEntries: 0,
    totalAbsent: 0
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [totalTeamCount, setTotalTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user.departmentId) return;
    
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // 1. Attendance Stats
      const attRes = await axios.get(`/api/attendance?date=${today}&departmentId=${user.departmentId}`);
      setAttendanceStats(attRes.data.stats || { presentToday: 0, lateEntries: 0, totalAbsent: 0 });
      setTotalTeamCount(attRes.data.records?.length || 0);

      // 2. Leave Requests - Check your backend route naming (singular vs plural)
      const leaveRes = await axios.get(`/api/auth/leave-requests?deptId=${user.departmentId}`);
      const pending = Array.isArray(leaveRes.data) ? leaveRes.data.filter(r => r.status === 'PENDING') : [];
      setPendingLeaves(pending);

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user.departmentId]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    if (user.id) fetchDashboardData();
  }, [user.id, fetchDashboardData]);

  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardClass = isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const quickActionClass = isDark ? 'bg-[#0b1220] hover:bg-white/10 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm';

  // --- REVISED STATS (Payroll Removed) ---
  const stats = [
    { label: `Team Present`, value: attendanceStats.presentToday, icon: <Users size={20} className="text-blue-500" />, trend: 'Live', color: 'bg-blue-500/10' },
    { label: 'Late Entries', value: attendanceStats.lateEntries, icon: <Clock size={20} className="text-amber-500" />, trend: 'Critical', color: 'bg-amber-500/10' },
    { label: 'Absent Today', value: attendanceStats.totalAbsent, icon: <AlertCircle size={20} className="text-rose-500" />, trend: 'Daily', color: 'bg-rose-500/10' },
    { label: 'Pending Leaves', value: pendingLeaves.length, icon: <ClipboardList size={20} className="text-orange-500" />, trend: 'Action', color: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <nav className={`text-[10px] font-black uppercase tracking-[0.3em] ${textMuted}`}>
        Management Core &nbsp; • &nbsp; {user.department || 'Department Overview'}
      </nav>
      
      {/* 1. Hero Banner */}
      <div className="bg-linear-to-br from-[#7c3aed] to-[#4f46e5] rounded-[3rem] p-10 relative overflow-hidden text-white shadow-2xl shadow-purple-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 backdrop-blur-md">
                 Manager Account
               </span>
            </div>
            <h3 className="text-xl font-bold opacity-80 mb-1">{greeting},</h3>
            <h2 className="text-5xl font-black mb-4 tracking-tighter capitalize">{user.firstName} {user.lastName}</h2>
            <p className="text-sm font-medium opacity-90 max-w-md leading-relaxed">
              Tracking <span className="underline decoration-2 underline-offset-4 font-black">{totalTeamCount} members</span> in {user.department}. 
              You have {pendingLeaves.length} leave requests awaiting your approval.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 flex flex-col items-center min-w-30 shadow-lg">
            <Calendar size={28} className="mb-3 text-purple-200" />
            <span className="text-lg font-black uppercase tracking-tighter">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] opacity-70 uppercase font-black tracking-widest">
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* 2. Primary Management Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionLink to="/manager/employee" label="Manage" title="Team Directory" icon={<Users size={22} />} color="blue" styling={quickActionClass} isDark={isDark} />
        <QuickActionLink to="/manager/leave-request" label="Review" title="Leave Portal" icon={<ClipboardList size={22} />} color="orange" styling={quickActionClass} isDark={isDark} />
        <QuickActionLink to="/manager/salary" label="Verify" title="Payroll Records" icon={<Wallet size={22} />} color="purple" styling={quickActionClass} isDark={isDark} />
        <QuickActionLink to="/manager/attendance-record" label="Track" title="Daily Attendance" icon={<CheckCircle2 size={22} />} color="emerald" styling={quickActionClass} isDark={isDark} />
      </div>

      {/* 3. Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`${cardClass} p-8 rounded-[2.5rem] transition-all hover:translate-y-1.25 duration-300 group border`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`p-4 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>{stat.icon}</div>
              <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className={`${textMuted} text-[10px] font-black uppercase tracking-[0.2em] mb-2`}>{stat.label}</p>
            <h3 className={`text-3xl font-black tracking-tighter ${textMain}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 4. Pending Requests (Now Full Width since Live Availability is gone) */}
      <div className="w-full">
        <div className={`${cardClass} p-8 rounded-[2.5rem] border`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className={`text-xl font-black tracking-tight ${textMain}`}>Pending Requests</h3>
              <p className={`text-[10px] ${textMuted} font-black mt-1 uppercase tracking-widest`}>Immediate Attention Required</p>
            </div>
            <Link to="/manager/leave-request" className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-[#7c3aed] hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-[#7c3aed] hover:text-white'}`}>
              <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLeaves.slice(0, 4).map((request) => (
                <div key={request.id} className={`flex items-center justify-between p-6 rounded-3xl border ${isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-sm font-black text-white shadow-lg shadow-purple-500/20">
                        {request.user?.firstName?.[0]}{request.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className={`text-base font-black ${textMain}`}>{request.user?.firstName} {request.user?.lastName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {request.leaveType?.name} • {request.daysRequested} Days
                      </p>
                    </div>
                  </div>
                  <Link to="/manager/leave-request" className="px-6 py-3 bg-[#7c3aed] text-white text-[10px] font-black rounded-2xl hover:bg-[#6d28d9] transition-all active:scale-95 shadow-md">
                    REVIEW
                  </Link>
                </div>
              ))}
              {pendingLeaves.length === 0 && (
                  <div className={`col-span-full py-16 text-center border-2 border-dashed rounded-[2.5rem] ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-xs font-black uppercase tracking-[0.3em] ${textMuted}`}>All caught up!</p>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Component ---
const QuickActionLink = ({ to, label, title, icon, color, styling, isDark }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    purple: 'text-[#7c3aed] bg-[#7c3aed]/10'
  };

  return (
    <Link to={to} className={`flex items-center gap-4 p-5 rounded-4xl transition-all group border active:scale-95 ${styling}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${colorMap[color]} group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      </div>
    </Link>
  );
};

export default Dashboard;