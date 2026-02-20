import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import axios from 'axios';
import {  
  Search, Mail, Phone, MoreVertical,  
  ChevronLeft, ChevronRight, Download, Eye, ShieldAlert
} from 'lucide-react';

import PreviewEmployeeModal from '../../modals/manager/PreviewEmployee';

const EmployeeDirectory = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const managerDept = context?.managerDept || 'Department';
  const isDark = theme === 'dark';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const [modals, setModals] = useState({ preview: false });
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Dynamic Styles
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardClass = isDark ? 'bg-[#0b1220] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = isDark ? 'bg-[#0b1220] border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  // 1. Fetch Real Data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Logic: The backend already filters by department for managers, 
  // but we keep a local filter for the search bar.
  const filteredEmployees = employees.filter(emp => 
    emp.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    emp.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentItems = filteredEmployees.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  if (loading) return <div className="p-10 text-center animate-pulse text-[#7c3aed]">Loading Department Records...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-6">
        <div>
          <p className="text-[#7c3aed] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            Manager Portal &nbsp; • &nbsp; {managerDept}
          </p>
          <h1 className={`text-5xl font-black tracking-tighter ${textMain}`}>Employee Directory</h1>
        </div>
        
        <div className={`${cardClass} flex items-center gap-4 px-6 py-4 rounded-3xl border`}>
            <div className="text-right">
                <p className={`text-[9px] font-black ${textMuted} uppercase tracking-widest`}>Total in {managerDept}</p>
                <p className={`text-lg font-black ${textMain} tracking-tighter`}>{employees.length} Personnel</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
                <Eye size={22} />
            </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${managerDept} staff...`} 
          className={`w-full ${inputClass} pl-16 pr-8 py-5 rounded-3xl outline-none border focus:border-[#7c3aed] text-sm font-bold transition-all`}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentItems.map(emp => (
            <div key={emp.id} className={`${cardClass} border p-8 rounded-[3rem] hover:border-[#7c3aed]/40 transition-all duration-500 group relative`}>
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <img 
                      src={emp.profileImage || `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=7c3aed&color=fff`} 
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg" 
                      alt="Avatar" 
                    />
                    <div>
                      <div className={`font-black ${textMain} text-xl tracking-tight`}>{emp.firstName} {emp.lastName}</div>
                      <div className="text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.2em]">{emp.jobPositionRel?.title || 'Staff'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                        <Mail size={14} className="text-[#7c3aed]" />
                        <span className={`text-xs font-bold ${textMuted}`}>{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone size={14} className="text-[#7c3aed]" />
                        <span className={`text-xs font-bold ${textMuted}`}>{emp.workPhone || 'No Phone'}</span>
                    </div>
                </div>

                <div className={`pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} flex justify-between items-center`}>
                  <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    onClick={() => { setSelectedEmp(emp); setModals({ preview: true }); }}
                    className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-all"
                  >
                    View Profile
                  </button>
                </div>
            </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-[3rem] border-slate-700">
           <ShieldAlert size={40} className="mx-auto mb-4 text-slate-500" />
           <p className={textMuted}>No employees found in the {managerDept} department.</p>
        </div>
      )}

      {/* Pagination component logic same as yours... */}
      
      <PreviewEmployeeModal 
        isOpen={modals.preview} 
        employee={selectedEmp} 
        onClose={() => setModals({ preview: false })} 
        theme={theme}
      />
    </div>
  );
};

export default EmployeeDirectory;