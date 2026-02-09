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
    setOpenMenus(prev => {
        const isOpen = prev[menu];
        return { [menu]: !isOpen };
    });
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18}/>, path: '/admin/dashboard' },
    { 
      name: 'Employees', 
      icon: <Users size={18}/>, 
      subItems: [
        { name: 'Employee Directory', path: '/admin/employee' },
        { name: 'Add/Edit Employee', path: '/admin/add-employee' },
        { name: 'Employee History', path: '/admin/employee-history' }
      ]
    },
    { 
      name: 'Organization', 
      icon: <Layers size={18}/>, 
      subItems: [
        { name: 'Department', path: '/admin/department' },
        { name: 'Job Position', path: '/admin/job-position' },
        { name: 'Structure', path: '/admin/structure' }
      ]
    },
    { 
      name: 'Leave', 
      icon: <CalendarDays size={18}/>, 
      subItems: [
        { name: 'Leave Type', path: '/admin/leave-type' },
        { name: 'Leave Balance', path: '/admin/leave-balance' },
        { name: 'Leave Request', path: '/admin/leave-request' },
        { name: 'Leave Calendar', path: '/admin/leave-calendar' }
      ]
    },
    { 
      name: 'Attendance', 
      icon: <ClipboardList size={18}/>, 
      subItems: [
        { name: 'Attendance Records', path: '/admin/attendance-record' },
        { name: 'Time Tracking', path: '/admin/time-tracking' }
      ]
    },
    { name: 'Documents', icon: <FileText size={18}/>, path: '/admin/documents' },
    { name: 'Salary', icon: <Banknote size={18}/>, path: '/admin/salary' },
    { name: 'Profile', icon: <UserCircle size={18}/>, path: '/admin/profile' },
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
    <aside className={`${isCollapsed ? 'w-20' : 'w-65'} transition-all duration-300 h-screen flex flex-col border-r overflow-hidden sticky top-0 left-0 z-50 ${styles.aside}`}>
      
      {/* Brand Logo Section */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3 font-bold text-xl text-[#7c3aed] whitespace-nowrap">
          <div className="w-8 h-8 min-w-8 bg-[#7c3aed] text-white rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Layers size={20} />
          </div>
          {!isCollapsed && <span className={`logo-text ${styles.logoText}`}>LyticalSMS</span>}
        </div>
        {!isCollapsed && (
          <span className="block mt-1 text-[10px] text-purple-500 font-bold tracking-widest uppercase">
            {user?.role || 'SYSTEM ADMIN'}
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
                  className={`w-full flex items-center p-3 rounded-xl transition-colors ${
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
                    {!isCollapsed && <span className="menu-text ml-3 text-sm font-medium whitespace-nowrap">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown 
                      size={10} 
                      className={`chevron transition-transform duration-300 ${openMenus[item.name] ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>
                
                {(!isCollapsed && openMenus[item.name]) && (
                  <div className="submenu pl-12 flex flex-col space-y-2 mt-2">
                    {item.subItems.map(sub => (
                      <Link 
                        key={sub.path} 
                        to={sub.path} 
                        className={`block py-2 px-3 text-[13px] transition-colors hover:text-[#7c3aed] ${
                          isActive(sub.path) ? styles.subLinkActive : styles.subLinkInactive
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
                className={`flex items-center p-3 rounded-xl transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive(item.path) ? styles.activeBtn : styles.hover
                }`}
              >
                <div className="w-6 flex items-center justify-center shrink-0">
                    {item.icon}
                </div>
                {!isCollapsed && <span className="menu-text ml-3 text-sm font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className={`p-5 border-t flex items-center gap-3 overflow-hidden shrink-0 ${styles.userSection}`}>
        <div className="w-10 h-10 min-w-10 rounded-xl overflow-hidden border border-purple-500/30 shrink-0 shadow-sm">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-[#7c3aed] to-[#9333ea] flex items-center justify-center font-bold text-white text-xs">
              {/* This logic ensures we get both initials if they exist */}
              {user?.firstName ? user.firstName[0].toUpperCase() : ''}
              {user?.lastName ? user.lastName[0].toUpperCase() : ''}
              {!user?.firstName && !user?.lastName && 'AD'}
            </div>
            
          )}
        </div>

        {!isCollapsed && (
          <div className="user-info truncate">
            <p className={`text-[13px] font-bold truncate leading-tight ${styles.logoText}`}>
              {/* Using a template literal to prevent "User" fallback */}
              {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin'}
            </p>
            <p className="text-[11px] text-[#94a3b8] font-medium truncate">
              {user?.jobPosition || user?.role || 'Staff'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;