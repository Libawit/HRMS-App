import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Building2, ClipboardList, 
  TrendingUp, ArrowRight, Calendar, UserPlus, 
  Briefcase, FileText, Clock, CheckCircle2 
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  // --- Theme & Context Sync ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const managerDept = context?.managerDept || 'ICT';
  const isDark = theme === 'dark';

  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // --- Dynamic Style Constants ---
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-white/5' : 'border-slate-200';
  const cardClass = isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const quickActionClass = isDark ? 'bg-[#0b1220] hover:bg-white/5 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm';

  // Department-Specific Stats
  const stats = [
    { label: `${managerDept} Employees`, value: '42', icon: <Users size={20} className="text-blue-500" />, trend: 'Active', color: 'bg-blue-500/10' },
    { label: 'Job Roles', value: '8', icon: <Briefcase size={20} className="text-purple-500" />, trend: 'Stable', color: 'bg-purple-500/10' },
    { label: 'Dept. Attendance', value: '94%', icon: <Clock size={20} className="text-emerald-500" />, trend: '+2%', color: 'bg-emerald-500/10' },
    { label: 'Pending Leaves', value: '5', icon: <ClipboardList size={20} className="text-orange-500" />, trend: 'Action Req.', color: 'bg-orange-500/10' },
  ];

  // Leave requests data
  const departmentalLeaves = [
    { id: 1, name: 'Robert Wilson', type: 'Annual Leave', duration: '3 Days', status: 'Pending' },
    { id: 2, name: 'Alice Wong', type: 'Sick Leave', duration: '1 Day', status: 'Pending' },
    { id: 3, name: 'David Gilmour', type: 'Personal', duration: '2 Days', status: 'Approved' },
    { id: 4, name: 'James Hetfield', type: 'Annual Leave', duration: '5 Days', status: 'Pending' },
  ];

  return (
    <div className={`space-y-8 animate-in fade-in duration-700`}>
      <nav className={`text-[10px] font-black uppercase tracking-[0.3em] ${textMuted}`}>
        Manager &nbsp; • &nbsp; Dashboard
      </nav>
      
      {/* 1. Manager Welcome Banner */}
      <div className="welcome-banner bg-linear-to-br from-[#4f46e5] to-[#7c3aed] rounded-[2.5rem] p-10 relative overflow-hidden text-white shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 backdrop-blur-md">
                Department Lead
               </span>
            </div>
            <h3 className="text-xl font-bold opacity-80 mb-1">{greeting},</h3>
            <h2 className="text-5xl font-black mb-4 tracking-tighter">Michael Chen</h2>
            <p className="text-sm font-medium opacity-90 max-w-md leading-relaxed">
              You are currently managing the <span className="underline decoration-2 underline-offset-4 font-black">{managerDept} Department</span>. 
              There are <span className="font-black text-orange-300">{stats[3].value} pending requests</span> requiring your attention today.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 flex flex-col items-center min-w-30 shadow-lg">
            <Calendar size={28} className="mb-3 text-indigo-200" />
            <span className="text-lg font-black uppercase tracking-tighter">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] opacity-70 uppercase font-black tracking-widest leading-none">
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute left-1/4 -top-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-[80px]"></div>
      </div>

      {/* 2. Manager Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionLink to="/manager/employee" label="View My" title="Team Directory" icon={<Users size={22} />} color="blue" styling={quickActionClass} isDark={isDark} />
        <QuickActionLink to="/manager/leave-request" label="Approve" title="Leave Requests" icon={<ClipboardList size={22} />} color="orange" styling={quickActionClass} isDark={isDark} />
        <QuickActionLink to="/manager/attendance-record" label="Daily" title="Attendance" icon={<CheckCircle2 size={22} />} color="emerald" styling={quickActionClass} isDark={isDark} />
        <QuickActionLink to="/manager/structure" label="Dept." title="Structure" icon={<TrendingUp size={22} />} color="purple" styling={quickActionClass} isDark={isDark} />
      </div>

      {/* 3. Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`${cardClass} p-8 rounded-4xl transition-all hover:scale-[1.02] duration-300 group border`}>
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

      {/* 4. Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Distribution */}
        <div className={`${cardClass} p-8 rounded-[2.5rem] border`}>
          <h3 className={`text-xl font-black tracking-tight ${textMain} mb-8`}>Team Availability</h3>
          <div className="space-y-8">
            <ProgressBar label="In Office" value="36 Members" percent={85} color="bg-emerald-500" textMuted={textMuted} />
            <ProgressBar label="Remote / Out" value="6 Members" percent={15} color="bg-orange-500" textMuted={textMuted} />
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className={`${cardClass} p-8 rounded-[2.5rem] border lg:col-span-2`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className={`text-xl font-black tracking-tight ${textMain}`}>Departmental Leave Requests</h3>
              <p className={`text-xs ${textMuted} font-bold mt-1 uppercase tracking-wider`}>Review pending actions</p>
            </div>
            <Link to="/manager/leave-request" className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-[#7c3aed] hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-[#7c3aed] hover:text-white'}`}>
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentalLeaves.map(leave => (
              <div key={leave.id} className={`flex items-center justify-between p-5 rounded-2xl transition-all border ${isDark ? 'bg-white/2 border-white/5 hover:bg-white/5' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-black text-white shadow-lg">
                    {leave.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className={`text-sm font-black tracking-tight ${textMain}`}>{leave.name}</p>
                    <p className={`text-[10px] ${textMuted} font-black uppercase tracking-widest mt-0.5`}>{leave.type} • {leave.duration}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-tighter ${
                  leave.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
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

// --- Helper Components ---

const QuickActionLink = ({ to, label, title, icon, color, styling, isDark }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    purple: 'text-purple-500 bg-purple-500/10'
  };

  return (
    <Link to={to} className={`flex items-center gap-4 p-6 rounded-[1.8rem] transition-all group border active:scale-95 ${styling}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${colorMap[color]} group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      </div>
    </Link>
  );
};

const ProgressBar = ({ label, value, percent, color, textMuted }) => (
  <div>
    <div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-[0.2em]">
      <span className={textMuted}>{label}</span>
      <span className={color.replace('bg-', 'text-')}>{value}</span>
    </div>
    <div className="h-4 w-full bg-slate-500/10 rounded-full overflow-hidden p-1">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

export default Dashboard;