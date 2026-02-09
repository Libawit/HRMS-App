import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import NavBar from '../NavBar';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'
    }`}>
      <SideBar 
        isCollapsed={isCollapsed} 
        theme={theme} 
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <NavBar 
          toggleSidebar={toggleSidebar} 
          theme={theme} 
          setTheme={setTheme} 
          user={user}
        />

        <main className={`flex-1 overflow-y-auto p-6 custom-scrollbar transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          <div className="max-w-400 mx-auto">
            <Outlet context={{ theme, user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;