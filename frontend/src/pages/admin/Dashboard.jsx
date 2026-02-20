import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, ClipboardList, 
  ArrowRight, Calendar, UserPlus, 
  Briefcase, FileText, Loader2
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [latestLeaves, setLatestLeaves] = useState([]);
  const [attendanceData, setAttendanceData] = useState({ present: '0%', late: '0%', absent: '0%' });
  const [isLoading, setIsLoading] = useState(true);
  
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch User Profile
        const userRes = await fetch('http://localhost:5000/api/auth/me', { headers });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // 2. Fetch Dashboard Totals
        const statsRes = await fetch('http://localhost:5000/api/auth/dashboard-stats', { headers });
        const statsData = await statsRes.json();
        setStats(statsData);

        // 3. Fetch Attendance Stats inside Dashboard.jsx
const today = new Date().toISOString().split('T')[0];
const attendRes = await fetch(`http://localhost:5000/api/attendance?date=${today}`, { headers });
const attendJson = await attendRes.json();

if (attendJson.stats) {
    // Get the total staff count from your general stats
    const totalStaff = statsData?.totalEmployees || 0;
    
    // Match these exactly to your Backend Controller keys
    const presentCount = Number(attendJson.stats.presentToday) || 0;
    const lateCount = Number(attendJson.stats.lateEntries) || 0;
    const absentCount = Number(attendJson.stats.totalAbsent) || 0;

    if (totalStaff > 0) {
        setAttendanceData({
            // Percentage = (Specific Count / Total Staff) * 100
            present: `${Math.round((presentCount / totalStaff) * 100)}%`,
            late: `${Math.round((lateCount / totalStaff) * 100)}%`,
            absent: `${Math.round((absentCount / totalStaff) * 100)}%`,
        });
    }
}

        // 4. Fetch Latest Leaves
        const leavesRes = await fetch('http://localhost:5000/api/auth/leave-requests', { headers });
        const leavesJson = await leavesRes.json();
        setLatestLeaves(Array.isArray(leavesJson) ? leavesJson.slice(0, 3) : []);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  const cardStats = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: <Users size={20} className="text-blue-500" />, trend: 'Live', color: 'bg-blue-500/10' },
    { label: 'Total Departments', value: stats?.totalDepartments || 0, icon: <Building2 size={20} className="text-purple-500" />, trend: 'Stable', color: 'bg-purple-500/10' },
    { label: 'Job Positions', value: stats?.totalPositions || 0, icon: <Briefcase size={20} className="text-orange-500" />, trend: 'Active', color: 'bg-orange-500/10' },
    { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: <ClipboardList size={20} className="text-red-500" />, trend: (stats?.pendingLeaves > 0) ? 'Review' : 'Clear', color: 'bg-red-500/10' },
  ];

  const cardClass = `transition-all duration-300 border rounded-2xl ${isDark ? 'bg-[#0b1220] border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`;
  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <nav className={`text-[0.85rem] font-medium mb-2 ${subText}`}>Home &nbsp; &gt; &nbsp; Dashboard</nav>
      <h1 className={`text-[1.75rem] font-bold mb-6 ${titleText}`}>Dashboard Overview</h1>
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl p-10 relative overflow-hidden text-white mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-indigo-500/20">
        <div className="relative z-10">
          <h3 className="text-[1.4rem] font-medium mb-1 opacity-90">{greeting},</h3>
          <h2 className="text-[3rem] font-extrabold mb-2 leading-tight">
            {currentUser?.firstName} {currentUser?.lastName}
          </h2>
          <p className="text-[0.95rem] font-semibold opacity-90 mb-6">
            {currentUser?.jobPosition} • {currentUser?.departmentRel?.name || currentUser?.department}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm relative z-10">
          <Calendar size={18} />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <h3 className={`mb-4 text-lg font-semibold ${titleText}`}>Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: "/admin/add-employee", icon: <UserPlus size={20} />, label: "Add Employee", color: "text-green-500", bg: "bg-green-500/10" },
          { to: "/admin/department", icon: <Building2 size={20} />, label: "Departments", color: "text-blue-500", bg: "bg-blue-500/10" },
          { to: "/admin/employee", icon: <Users size={20} />, label: "Employees", color: "text-purple-500", bg: "bg-purple-500/10" },
          { to: "/admin/leave-request", icon: <FileText size={20} />, label: "Request Leaves", color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((action, idx) => (
          <Link key={idx} to={action.to} className={`${cardClass} flex items-center gap-3 p-6 group hover:scale-[1.02] active:scale-95`}>
            <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className={`text-sm font-semibold ${titleText} opacity-80`}>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Organization Overview */}
      <h3 className={`mt-8 mb-4 text-lg font-semibold ${titleText}`}>Organization Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardStats.map((stat, i) => (
          <div key={i} className={`${cardClass} p-5 relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-500/10 text-slate-400`}>
                {stat.trend}
              </span>
            </div>
            <p className={`${subText} text-sm mb-1`}>{stat.label}</p>
            <h3 className={`text-2xl font-bold ${titleText}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Active Employee Status */}
        <div className={`${cardClass} p-6`}>
          <h3 className={`text-lg font-bold mb-6 ${titleText}`}>System Status</h3>
          <div className="flex flex-col items-center">
            <div className={`relative w-40 h-40 rounded-full border-12 ${isDark ? 'border-white/5' : 'border-slate-100'} border-t-emerald-500 flex items-center justify-center mb-6`}>
              <div className="text-center">
                <p className={`text-2xl font-bold ${titleText}`}>{stats?.activePercentage}%</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${subText}`}>Active</p>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className={subText}>Active Employees</span>
                </div>
                <span className={`${titleText} font-medium`}>{stats?.activeEmployees}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Progress Bars */}
        <div className={`${cardClass} p-6`}>
          <h3 className={`text-lg font-bold mb-6 ${titleText}`}>Today's Attendance</h3>
          <div className="space-y-6">
            {[
              { label: 'Present', val: attendanceData.present, color: 'bg-emerald-500', text: 'text-emerald-500' },
              { label: 'Late', val: attendanceData.late, color: 'bg-orange-500', text: 'text-orange-500' },
              { label: 'Absent', val: attendanceData.absent, color: 'bg-red-500', text: 'text-red-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={subText}>{item.label}</span>
                  <span className={`${item.text} font-bold`}>{item.val}</span>
                </div>
                <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: item.val }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <p className={`text-[11px] mt-6 ${subText} italic`}>* Calculated against {stats?.totalEmployees || 0} total employees.</p>
        </div>

        {/* Recent Leaves */}
        <div className={`${cardClass} p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-bold ${titleText}`}>Latest Activity</h3>
            <Link to="/admin/leave-request" className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline ${isDark ? 'text-purple-400' : 'text-indigo-600'}`}>
              Review <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {latestLeaves.length > 0 ? latestLeaves.map((leave, idx) => (
              <div key={idx} className={`flex items-center justify-between text-sm border-b pb-3 last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex flex-col">
                  <span className={`font-semibold ${titleText}`}>{leave.user?.firstName} {leave.user?.lastName}</span>
                  <span className={`text-[11px] ${subText}`}>{leave.leaveType?.name || 'General Leave'}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                  leave.status === 'PENDING' ? 'text-orange-500 bg-orange-500/10' : 
                  leave.status === 'APPROVED' ? 'text-emerald-500 bg-emerald-500/10' : 
                  'text-red-500 bg-red-500/10'
                }`}>
                  {leave.status}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <FileText size={32} className="mb-2" />
                <p className="text-sm italic">No recent leave activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;