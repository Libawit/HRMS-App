import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import NavBar from '../NavBar';

const ManagerLayout = () => {
  // 1. State for Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 2. State for Theme (Defaulting to dark)
  const [theme, setTheme] = useState('dark');

  // 3. Manager Context - Identifying the department this manager controls
  const [managerInfo] = useState({
    name: "Michael Chen",
    role: "Department Manager",
    department: "ICT",
    avatar: "MC"
  });

  // 4. Theme Toggle Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'
    }`}>
      
      {/* SIDEBAR: Configured for Manager menu items */}
      <SideBar 
        isCollapsed={isCollapsed} 
        theme={theme} 
        managerInfo={managerInfo} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* NAVBAR: Handles sidebar toggle and theme switching */}
        <NavBar 
          toggleSidebar={toggleSidebar} 
          theme={theme} 
          setTheme={setTheme} 
        />

        {/* MAIN CONTENT AREA */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          <div className="max-w-400 mx-auto">
            {/* Passing 'theme' and 'managerDept' via Outlet Context 
               so child pages (Directory, Structure, etc.) can filter data automatically.
            */}
            <Outlet context={{ theme, managerDept: managerInfo.department }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;