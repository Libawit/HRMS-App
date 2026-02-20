import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react'; // Import Lucide icons

const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);
  
  // --- State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');



  // --- Logic ---
  // --- Logic ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Get the Base URL from Vite's environment variables
      // This defaults to localhost if the variable isn't set (like during local dev)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const role = data.user.role;
        if (role === 'Admin') navigate('/admin/dashboard');
        else if (role === 'Manager') navigate('/manager/dashboard');
        else if (role === 'Employee') navigate('/employee/dashboard');
      } else {
        setErrorMsg(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg('Connection failed. Please check your internet or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => setPasswordVisible(!passwordVisible);

  return (
    <div className="bg-slate-300 min-h-screen">
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <div className="relative z-10 flex flex-col md:flex-row w-full max-w-220 min-h-130 md:h-auto bg-[#1b1b1b] rounded-2xl overflow-hidden shadow-2xl">

          {/* Left side - Branding */}
          <div className="hidden md:flex w-full md:w-[45%] bg-linear-to-br from-[#6d5dfc] via-[#c850c0] to-[#ff5858] p-6 md:p-10 flex-col items-center justify-center text-white text-center relative">
            <p className="text-xs tracking-widest opacity-80 uppercase mb-8 font-semibold">Welcome To</p>
            <div className="w-20 h-20 bg-black/20 flex items-center justify-center rounded-2xl text-3xl font-bold mb-6">
              HR
            </div>
            <h2 className="text-sm font-medium mb-1">Employee Management - System</h2>
            <p className="text-xs opacity-70">Ethiopia</p>
          </div>

          {/* Right side - Login form */}
          <div className="w-full md:w-[55%] p-6 md:p-8 lg:p-12 flex flex-col justify-center bg-[#1b1b1b]">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-9 h-9 bg-[#6d5dfc] rounded-lg flex items-center justify-center text-white font-bold">
                HR
              </div>
              <span className="text-xl font-medium text-white">HRMS</span>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center animate-pulse">
                {errorMsg}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="relative group">
                <User 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6d5dfc] transition-colors" 
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-[#6d5dfc] text-sm"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <Lock 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6d5dfc] transition-colors" 
                />
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl py-3.5 pl-12 pr-12 text-white outline-none focus:border-[#6d5dfc] text-sm"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  onClick={togglePassword}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl bg-linear-to-r from-[#6d5dfc] to-[#c850c0] text-white font-bold hover:opacity-90 transition-all mt-4 text-sm shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;