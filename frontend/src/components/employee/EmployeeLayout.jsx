import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import NavBar from '../NavBar';

const EmployeeLayout = () => {
  // 1. State for Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 2. State for Theme (Defaulting to dark for a modern SaaS feel)
  const [theme, setTheme] = useState('dark');

  // 3. Theme Toggle Logic - Affects the root document for global Tailwind styles
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`flex h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#020617]' : 'bg-[#f8fafc]'
    }`}>
      
      {/* SIDEBAR: Specific to Employee Menu Items */}
      <SideBar isCollapsed={isCollapsed} theme={theme} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* NAVBAR: Handles Theme Toggling and User Profile Quick-view */}
        <NavBar 
          toggleSidebar={toggleSidebar} 
          theme={theme} 
          setTheme={setTheme} 
        />

        {/* MAIN CONTENT AREA */}
        {/* The custom-scrollbar class ensures a clean look for long data records */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300 ${
          theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
        }`}>
          {/* Centered container with responsive padding for employee data */}
          <div className="max-w-400 mx-auto min-h-full">
            <Outlet context={{ theme }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;