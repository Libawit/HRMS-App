import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import API from '../../utils/axiosConfig'; 
import SideBar from './SideBar';
import NavBar from '../NavBar';

const EmployeeLayout = () => {
  const navigate = useNavigate();

  // 1. State for Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 2. State for Theme
  const [theme, setTheme] = useState('dark');

  // 3. Real User State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 4. Fetch User Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          setLoading(false);
          return;
        }

        // Using your API instance to get personal profile
        const response = await API.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // 5. Theme Toggle Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (loading) return null;

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

        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          <div className="max-w-400 mx-auto">
            <Outlet context={{ 
              theme, 
              user, 
              employeeDept: user?.department || user?.departmentRel?.name || 'Staff'
            }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;