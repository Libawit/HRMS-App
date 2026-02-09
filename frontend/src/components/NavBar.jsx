import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { Search, Moon, Sun, Bell, Menu, LogOut } from 'lucide-react';

const NavBar = ({ toggleSidebar, theme, setTheme, user }) => {
  const navigate = useNavigate(); // 2. Initialize navigate

  // 3. Centralized Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/login', { replace: true });
    
    // Optional: Full refresh to ensure all states are wiped
    window.location.reload();
  };
  
  // Keyboard shortcut Ctrl + K logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getAvatarUrl = () => {
    if (user?.profileImage) return user.profileImage;
    const nameStr = `${user?.firstName || ''}+${user?.lastName || ''}`;
    return `https://ui-avatars.com/api/?name=${nameStr}&background=7c3aed&color=fff&bold=true`;
  };

  return (
    <header className={`
      h-16 border-b transition-colors duration-300 flex items-center justify-between px-6
      ${theme === 'dark' 
        ? 'bg-[#020617] border-white/5' 
        : 'bg-white border-slate-200 shadow-sm'}
    `}>
      {/* Left Section: Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar} 
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Menu size={20} />
        </button>
        
        <div className="relative max-w-md w-full group">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" 
            size={16} 
          />
          <input 
            id="global-search"
            type="text" 
            placeholder="Search anything... (Ctrl + K)"
            className={`
              w-full border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all
              ${theme === 'dark' 
                ? 'bg-[#0f172a] border-white/10 text-white placeholder:text-slate-500' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}
            `}
          />
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          className={`relative p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-inherit animate-pulse"></span>
        </button>

        {/* Updated Logout Button calling internal handleLogout */}
        <button 
          onClick={handleLogout}
          className={`p-2 rounded-lg transition-colors group ${
            theme === 'dark' ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-500' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
          }`}
          title="Logout"
        >
          <LogOut size={20} />
        </button>

        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-200 dark:border-white/10">
          <div className="hidden md:block text-right">
            <p className={`text-[11px] font-bold uppercase tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Staff User'}
            </p>
            <p className="text-[9px] text-purple-500 font-bold uppercase tracking-wider mt-1">
              {user?.role || 'Access'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl border-2 border-purple-500/30 overflow-hidden cursor-pointer hover:border-purple-500 transition-colors shadow-lg shadow-purple-500/10 bg-slate-100">
            <img 
              src={getAvatarUrl()} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user?.firstName || 'A'}&background=7c3aed&color=fff`;
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;