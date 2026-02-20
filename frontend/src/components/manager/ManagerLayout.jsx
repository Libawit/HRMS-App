import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import API from '../../utils/axiosConfig'; // ✅ Use your configured API instance
import SideBar from './SideBar';
import NavBar from '../NavBar';

const ManagerLayout = () => {
  const navigate = useNavigate();

  // 1. State for Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 2. State for Theme (Defaulting to dark)
  const [theme, setTheme] = useState('dark');

  // 3. Real User State - Fetching from backend logic
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 4. Fetch User Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login'); // Redirect if no token
          setLoading(false);
          return;
        }

        // ✅ Using your API instance handles the baseURL and the token interceptor
        const response = await API.get('/auth/me');

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching manager data:", error);
        // If token is invalid/expired (401), send to login
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

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Prevent UI flicker while loading user data
  if (loading) return null;

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'
    }`}>
      
      {/* SIDEBAR: Receives the real user object */}
      <SideBar 
        isCollapsed={isCollapsed} 
        theme={theme} 
        user={user} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* NAVBAR: Shared component, passing user for avatar/name */}
        <NavBar 
          toggleSidebar={toggleSidebar} 
          theme={theme} 
          setTheme={setTheme} 
          user={user}
        />

        {/* MAIN CONTENT AREA */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          <div className="max-w-400 mx-auto">
            {/* Passing 'theme', 'user', and 'managerDept' via Outlet Context.
                This allows child components to use: const { managerDept } = useOutletContext();
            */}
            <Outlet context={{ 
              theme, 
              user, 
              managerDept: user?.department || user?.departmentRel?.name || 'Department',
              managerDeptId: user?.departmentId
            }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;