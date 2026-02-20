import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  FileText, 
  Banknote, 
  UserCircle, 
  ChevronDown,
  ClipboardList,
  Layers
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SideBar = ({ isCollapsed, theme, user }) => {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (menu) => {
    if (isCollapsed) return; 
    setOpenMenus(prev => ({
        ...prev,
        [menu]: !prev[menu]
    }));
  };

  // Helper to get initials from real name
  const getInitials = () => {
    if (!user?.firstName && !user?.lastName) return "ST";
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  // Menu Items for the Employee role
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18}/>, path: '/employee/dashboard' },
    { 
      name: 'Employees', 
      icon: <Users size={18}/>, 
      subItems: [
        { name: 'Employee Directory', path: '/employee/employee' },
        { name: 'Employee History', path: '/employee/employee-history' }
      ]
    },
    { 
      name: 'Organization', 
      icon: <Layers size={18}/>, 
      subItems: [
        { name: 'Department', path: '/employee/department' },
        { name: 'Job Position', path: '/employee/job-position' },
        { name: 'Structure', path: '/employee/structure' }
      ]
    },
    { 
      name: 'Leave', 
      icon: <CalendarDays size={18}/>, 
      subItems: [
        { name: 'Leave Type', path: '/employee/leave-type' },
        { name: 'Leave Balance', path: '/employee/leave-balance' },
        { name: 'Leave Request', path: '/employee/leave-request' },
        { name: 'Leave Calendar', path: '/employee/leave-calendar' }
      ]
    },
    { 
      name: 'Attendance', 
      icon: <ClipboardList size={18}/>, 
      subItems: [
        { name: 'Attendance Records', path: '/employee/attendance-record' },
        { name: 'Time Tracking', path: '/employee/time-tracking' }
      ]
    },
    { name: 'Documents', icon: <FileText size={18}/>, path: '/employee/documents' },
    { name: 'Salary', icon: <Banknote size={18}/>, path: '/employee/salary' },
    { name: 'Profile', icon: <UserCircle size={18}/>, path: '/employee/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  const styles = {
    aside: theme === 'dark' 
      ? 'bg-[#0f172a] text-slate-300 border-white/5' 
      : 'bg-white text-slate-600 border-slate-200 shadow-xl',
    hover: 'hover:bg-[#7c3aed26]',
    activeBtn: 'text-white bg-[#7c3aed]', 
    subLinkActive: 'text-[#7c3aed] font-semibold bg-[#7c3aed1a] rounded-md',
    subLinkInactive: theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#64748b]',
    logoText: theme === 'dark' ? 'text-white' : 'text-slate-900',
    userSection: theme === 'dark' ? 'border-white/5' : 'border-slate-200'
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 h-screen flex flex-col border-r overflow-hidden sticky top-0 left-0 z-50 ${styles.aside}`}>
      
      {/* Brand Logo Section */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3 font-bold text-xl text-[#7c3aed] whitespace-nowrap">
          <div className="w-8 h-8 min-w-8 bg-[#7c3aed] text-white rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Layers size={20} />
          </div>
          {!isCollapsed && <span className={`logo-text tracking-tighter ${styles.logoText}`}>HRMS</span>}
        </div>
        {!isCollapsed && (
          <span className="block mt-1 text-[9px] text-[#94a3b8] font-black tracking-[0.2em] uppercase">
            Staff Member
          </span>
        )}
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto hide-scrollbar">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <div className={`has-dropdown ${openMenus[item.name] ? 'open' : ''}`}>
                <button 
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    !isCollapsed && item.subItems.some(sub => isActive(sub.path)) 
                    ? styles.activeBtn 
                    : styles.hover
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-6 flex items-center justify-center shrink-0">
                        {item.icon}
                    </div>
                    {!isCollapsed && <span className="menu-text ml-3 text-sm font-bold whitespace-nowrap">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown 
                      size={14} 
                      className={`chevron transition-transform duration-300 ${openMenus[item.name] ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>
                
                {(!isCollapsed && openMenus[item.name]) && (
                  <div className="submenu pl-10 flex flex-col space-y-1 mt-2 mb-2">
                    {item.subItems.map(sub => (
                      <Link 
                        key={sub.path} 
                        to={sub.path} 
                        className={`block py-2.5 px-4 text-[12.5px] rounded-lg transition-colors ${
                          isActive(sub.path) ? styles.subLinkActive : styles.subLinkInactive + ' hover:text-[#7c3aed]'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to={item.path} 
                className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive(item.path) ? styles.activeBtn : styles.hover
                }`}
              >
                <div className="w-6 flex items-center justify-center shrink-0">
                    {item.icon}
                </div>
                {!isCollapsed && <span className="menu-text ml-3 text-sm font-bold whitespace-nowrap">{item.name}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className={`p-4 border-t flex items-center gap-3 overflow-hidden shrink-0 ${styles.userSection}`}>
        <div className="w-10 h-10 min-w-10 rounded-2xl bg-[#7c3aed] overflow-hidden flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-purple-500/20">
          {user?.profileImage ? (
             <img 
               src={user.profileImage} 
               alt="Avatar" 
               className="w-full h-full object-cover"
             />
          ) : (
            getInitials()
          )}
        </div>
        
        {!isCollapsed && (
          <div className="user-info truncate">
            <p className={`text-[13px] font-black truncate tracking-tight ${styles.logoText}`}>
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </p>
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest truncate">
              {user?.jobPosition || 'Staff Member'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;