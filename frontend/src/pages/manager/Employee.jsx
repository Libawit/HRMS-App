import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import {  
  Search, Mail, Phone, MoreVertical,  
  ChevronLeft, ChevronRight, Download, Eye, ShieldAlert
} from 'lucide-react';

import PreviewEmployeeModal from '../../modals/manager/PreviewEmployee';

const EmployeeDirectory = () => {
  // --- Theme & Context Sync ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const managerDept = context?.managerDept || 'ICT';
  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // PAGINATION SETTINGS
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // Modal State
  const [modals, setModals] = useState({ preview: false });
  const [selectedEmp, setSelectedEmp] = useState(null);

  // --- Dynamic Style Constants ---
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-white/5' : 'border-slate-200';
  const cardClass = isDark ? 'bg-[#0b1220] border-white/5 shadow-2xl shadow-black/20' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = isDark ? 'bg-[#0b1220] border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  // Mock Data
  const [employees] = useState([
    {
      id: 'EMP006', name: 'Jennifer Martinez', role: 'Staff', position: 'Senior Developer',
      dept: 'ICT', email: 'jennifer.m@gmail.com', phone: '555-678-9012',
      status: 'Active', avatar: 'https://i.pravatar.cc/150?u=jennifer',
      bio: 'Senior full-stack developer specializing in cloud architecture.',
      deptCode: 'ICT'
    },
    {
      id: 'EMP009', name: 'Robert Wilson', role: 'Staff', position: 'UI Designer',
      dept: 'ICT', email: 'robert.w@gmail.com', phone: '555-123-4455',
      status: 'Active', avatar: 'https://i.pravatar.cc/150?u=robert',
      bio: 'Creative lead for departmental internal tools.',
      deptCode: 'ICT'
    },
    {
        id: 'EMP012', name: 'Sarah Johnson', role: 'Admin', position: 'HR Manager',
        dept: 'Human Resources', email: 'sarah.j@gmail.com', phone: '555-000-1111',
        status: 'Active', avatar: 'https://i.pravatar.cc/150?u=sarah',
        deptCode: 'HR'
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- MANAGER SCOPE LOGIC ---
  const departmentalStaff = employees.filter(emp => emp.deptCode === managerDept);

  const filteredEmployees = departmentalStaff.filter(emp => 
    emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    emp.id.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // PAGINATION MATH
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const toggleModal = (type, emp = null) => {
    if (emp) setSelectedEmp(emp);
    setModals({ preview: type === 'preview' });
    setActiveDropdown(null);
  };

  const handleDownload = (emp) => {
    const data = `Employee Record: ${emp.name}\nID: ${emp.id}\nDepartment: ${emp.dept}\nPosition: ${emp.position}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${emp.name}_Info.txt`;
    link.click();
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-500`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-6">
        <div>
          <p className="text-[#7c3aed] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            Manager Portal &nbsp; • &nbsp; {managerDept} Staff
          </p>
          <h1 className={`text-5xl font-black tracking-tighter ${textMain}`}>Employee Directory</h1>
        </div>
        
        <div className={`${cardClass} flex items-center gap-4 px-6 py-4 rounded-3xl border`}>
            <div className="text-right">
                <p className={`text-[9px] font-black ${textMuted} uppercase tracking-widest`}>Total Managing</p>
                <p className={`text-lg font-black ${textMain} tracking-tighter`}>{filteredEmployees.length} Personnel</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] shadow-inner">
                <Eye size={22} />
            </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-2xl group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#7c3aed] transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${managerDept} staff by name or ID...`} 
          className={`w-full ${inputClass} pl-16 pr-8 py-5 rounded-4XL outline-none border focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] text-sm font-bold transition-all placeholder:text-slate-500 placeholder:font-medium`}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentItems.map(emp => (
            <div key={emp.id} className={`${cardClass} border p-8 rounded-[3rem] hover:border-[#7c3aed]/40 transition-all duration-500 group relative overflow-hidden`}>
                {/* Subtle Gradient Hover Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#7c3aed] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                      <div className="relative">
                        <img src={emp.avatar} className="w-16 h-16 rounded-3XL object-cover grayscale group-hover:grayscale-0 transition-all duration-500 shadow-lg" alt="Avatar" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0b1220] rounded-full"></div>
                      </div>
                      <div>
                        <div className={`font-black ${textMain} text-xl tracking-tight`}>{emp.name}</div>
                        <div className="text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.2em] mt-0.5">{emp.position}</div>
                      </div>
                  </div>
                
                  <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === emp.id ? null : emp.id)} 
                        className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                      >
                          <MoreVertical size={20} />
                      </button>
                      {activeDropdown === emp.id && (
                        <div className={`absolute right-0 top-full mt-3 w-52 ${isDark ? 'bg-[#0f172a]' : 'bg-white'} border ${borderClass} rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200`}>
                            <button onClick={() => handleDownload(emp)} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] hover:text-white rounded-xl transition-all flex items-center gap-3">
                                <Download size={14}/> Download Info
                            </button>
                        </div>
                      )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 group/item">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-[#7c3aed]`}>
                          <Mail size={14} />
                        </div>
                        <span className={`text-xs font-bold ${textMuted} group-hover/item:text-[#7c3aed] transition-colors`}>{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-4 group/item">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-[#7c3aed]`}>
                          <Phone size={14} />
                        </div>
                        <span className={`text-xs font-bold ${textMuted} group-hover/item:text-[#7c3aed] transition-colors`}>{emp.phone}</span>
                    </div>
                </div>

                <div className={`pt-6 border-t ${borderClass} flex justify-between items-center`}>
                  <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                      {emp.status}
                  </span>
                  <button 
                      onClick={() => toggleModal('preview', emp)} 
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${
                        isDark 
                        ? 'bg-white/5 text-white hover:bg-[#7c3aed] border-white/5' 
                        : 'bg-slate-50 text-slate-700 hover:bg-[#7c3aed] hover:text-white border-slate-200'
                      }`}
                  >
                      View Profile
                  </button>
                </div>
            </div>
            ))}
        </div>
      ) : (
        <div className={`${cardClass} flex flex-col items-center justify-center py-24 rounded-[4rem] border border-dashed`}>
            <div className="p-6 bg-slate-500/5 rounded-full mb-6">
              <ShieldAlert size={50} className="text-slate-700" />
            </div>
            <p className={`font-black uppercase tracking-[0.3em] text-sm ${textMuted}`}>No personnel detected in {managerDept}</p>
            <button 
              onClick={() => setSearchTerm('')} 
              className="mt-6 text-[#7c3aed] text-xs font-black uppercase tracking-widest hover:underline"
            >
              Clear Search Filters
            </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-6">
            <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${
                  isDark 
                  ? 'bg-[#0b1220] border-white/10 text-slate-400 hover:border-[#7c3aed] disabled:opacity-10' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-[#7c3aed] disabled:opacity-30'
                }`}
            >
                <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Navigation</span>
              <span className={`text-sm font-black ${textMain}`}>Page {currentPage} of {totalPages}</span>
            </div>
            <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${
                  isDark 
                  ? 'bg-[#0b1220] border-white/10 text-slate-400 hover:border-[#7c3aed] disabled:opacity-10' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-[#7c3aed] disabled:opacity-30'
                }`}
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}

      <PreviewEmployeeModal 
        isOpen={modals.preview} 
        employee={selectedEmp} 
        onClose={() => setModals({ preview: false })} 
        onDownload={handleDownload}
        isReadOnly={true}
        theme={theme}
      />
    </div>
  );
};

export default EmployeeDirectory;