import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, ClipboardList, 
  ArrowRight, Calendar, UserPlus, 
  Briefcase, FileText
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  // Accessing the theme from AdminLayout's Outlet context
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // Dynamic greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Mock data for the dashboard
  const stats = [
    { label: 'Total Employees', value: '1,284', icon: <Users size={20} className="text-blue-500" />, trend: '+12%', color: 'bg-blue-500/10' },
    { label: 'Total Departments', value: '12', icon: <Building2 size={20} className="text-purple-500" />, trend: 'Stable', color: 'bg-purple-500/10' },
    { label: 'Job Positions', value: '45', icon: <Briefcase size={20} className="text-orange-500" />, trend: '+3', color: 'bg-orange-500/10' },
    { label: 'Pending Leaves', value: '18', icon: <ClipboardList size={20} className="text-red-500" />, trend: '-5%', color: 'bg-red-500/10' },
  ];

  const pendingLeaves = [
    { id: 1, name: 'Sarah Johnson', type: 'Annual Leave', duration: '3 Days', status: 'Pending' },
    { id: 2, name: 'Michael Chen', type: 'Sick Leave', duration: '1 Day', status: 'Approved' },
    { id: 3, name: 'Jessica Taylor', type: 'Personal', duration: '2 Days', status: 'Pending' },
    { id: 4, name: 'David Wilson', type: 'Maternity', duration: '90 Days', status: 'Pending' },
    { id: 5, name: 'Emma Brown', type: 'Annual Leave', duration: '5 Days', status: 'Rejected' },
  ];

  // Dynamic Style Constants
  const cardClass = `transition-all duration-300 border rounded-2xl ${
    isDark ? 'bg-[#0b1220] border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-sm'
  }`;
  
  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <nav className={`text-[0.85rem] font-medium mb-2 ${subText}`}>Home &nbsp; &gt; &nbsp; Dashboard</nav>
      <h1 className={`text-[1.75rem] font-bold mb-6 ${titleText}`}>Dashboard</h1>
      
      {/* 1. Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl p-10 relative overflow-hidden text-white mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative z-10">
          <h3 className="text-[1.4rem] font-medium mb-1 opacity-90">{greeting},</h3>
          <h2 className="text-[3rem] font-extrabold mb-2 leading-tight">John Smith</h2>
          <p className="text-[0.95rem] font-semibold opacity-90 mb-6">CEO, Executive</p>
          <p className="text-sm opacity-80">Welcome to your Employee Management System dashboard.</p>
        </div>
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
          <Calendar size={18} />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <h3 className={`mb-4 text-lg font-semibold ${titleText}`}>Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: "/admin/add-employee", icon: <UserPlus size={20} />, label: "Add Employee", color: "text-green-500", bg: "bg-green-500/10" },
          { to: "/admin/department", icon: <Building2 size={20} />, label: "Departments", color: "text-blue-500", bg: "bg-blue-500/10" },
          { to: "/admin/employee", icon: <Users size={20} />, label: "Employees", color: "text-purple-500", bg: "bg-purple-500/10" },
          { to: "/admin/leave-request", icon: <FileText size={20} />, label: "Request Leaves", color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((action, idx) => (
          <Link key={idx} to={action.to} className={`${cardClass} flex items-center gap-3 p-8 group hover:scale-[1.02]`}>
            <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className={`text-sm font-semibold ${titleText} opacity-80`}>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* 3. Organization Overview */}
      <h3 className={`mb-4 text-lg font-semibold ${titleText}`}>Organization Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${cardClass} p-5 relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>
                {stat.trend}
              </span>
            </div>
            <p className={`${subText} text-sm mb-1`}>{stat.label}</p>
            <h3 className={`text-2xl font-bold ${titleText}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. Employee Status */}
        <div className={`${cardClass} p-6`}>
          <h3 className={`text-lg font-bold mb-6 ${titleText}`}>Employee Status</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 rounded-full border-12 border-emerald-500 border-t-purple-500 flex items-center justify-center mb-6 transition-transform hover:rotate-12 duration-500">
              <div className="text-center">
                <p className={`text-2xl font-bold ${titleText}`}>92%</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${subText}`}>Active</p>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className={subText}>Active</span></div>
                <span className={`${titleText} font-medium`}>1,180 (92%)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className={subText}>On Leave</span></div>
                <span className={`${titleText} font-medium`}>104 (8%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Attendance Progress */}
        <div className={`${cardClass} p-6`}>
          <h3 className={`text-lg font-bold mb-6 ${titleText}`}>Today's Attendance</h3>
          <div className="space-y-6">
            {[
              { label: 'Present', val: '85%', color: 'bg-emerald-500', text: 'text-emerald-500' },
              { label: 'Late', val: '10%', color: 'bg-orange-500', text: 'text-orange-500' },
              { label: 'Absent', val: '5%', color: 'bg-red-500', text: 'text-red-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={subText}>{item.label}</span>
                  <span className={`${item.text} font-bold`}>{item.val}</span>
                </div>
                <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: item.val }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Recent Leaves */}
        <div className={`${cardClass} p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-bold ${titleText}`}>Latest Leaves</h3>
            <Link to="/admin/leave-request" className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline ${isDark ? 'text-purple-400' : 'text-indigo-600'}`}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {pendingLeaves.slice(0, 3).map(leave => (
              <div key={leave.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    {leave.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${titleText}`}>{leave.name}</p>
                    <p className={`text-[11px] ${subText}`}>{leave.type} • {leave.duration}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  leave.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                  leave.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;