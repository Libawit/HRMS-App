import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; 
import { 
  Plus, Search, MoreVertical, 
  ChevronLeft, ChevronRight, Edit, Trash2, Download,
  Loader2, Filter
} from 'lucide-react';

import PreviewEmployeeModal from '../../modals/admin/PreviewEmployee';
import EditEmployeeModal from '../../modals/admin/EditEmployee';
import DeleteEmployeeModal from '../../modals/admin/DeleteEmployee';

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';
  
  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All'); 
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // Modal States
  const [modals, setModals] = useState({ preview: false, edit: false, delete: false });
  const [selectedEmp, setSelectedEmp] = useState(null);

  // --- STYLES ---
  const cardBg = isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const inputBg = isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200';
  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-slate-400' : 'text-slate-500';

  // --- FETCH DATA ---
  const fetchData = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token'); // Get the token you saved at login

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // This matches your middleware's split(' ')[1]
      }
    };

    // Use these options for both calls
    const empRes = await fetch('http://localhost:5000/api/auth/employees', requestOptions);
    const deptRes = await fetch('http://localhost:5000/api/auth/departments', requestOptions);

    const empData = await empRes.json();
    const deptData = await deptRes.json();

    // Safety: Only map if empData is an array (prevents the .map error)
    if (Array.isArray(empData)) {
      const mappedEmployees = empData.map(emp => ({
        ...emp,
        department: emp.departmentRel?.name || emp.department || "Not Specified",
        jobPosition: emp.jobPositionRel?.title || emp.jobPosition || "Not Specified"
      }));
      setEmployees(mappedEmployees);
    }
    
    if (Array.isArray(deptData)) {
      setDepartments(deptData);
    }

  } catch (err) {
    console.error("Fetch Error:", err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  // --- SEARCH & FILTER LOGIC ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const search = debouncedSearch.toLowerCase();
    const matchesSearch = fullName.includes(search) || (emp.employeeId && emp.employeeId.toLowerCase().includes(search));
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentItems = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const toggleModal = (type, emp = null) => {
    if (emp) setSelectedEmp(emp);
    setModals(prev => ({ preview: false, edit: false, delete: false, [type]: !prev[type] }));
    setActiveDropdown(null);
  };

  const handleDownload = (emp) => {
    const data = `Employee Report\nName: ${emp.firstName} ${emp.lastName}\nID: ${emp.employeeId}\nDept: ${emp.department}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${emp.lastName || 'Employee'}_Record.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <nav className={`text-[0.85rem] font-medium mb-1 ${subText}`}>Home &nbsp; &gt; &nbsp; Directory</nav>
          <h1 className={`text-3xl font-black tracking-tighter ${titleText}`}>Employee Directory</h1>
        </div>
        <button 
          onClick={() => navigate('/admin/add-employee')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className={`w-full ${inputBg} pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${titleText} text-sm`}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex-1 min-w-50 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
            className={`w-full ${inputBg} pl-11 pr-10 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${titleText} text-sm appearance-none cursor-pointer`}
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
          <p className={subText}>Loading employee database...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentItems.map(emp => (
              <div key={emp.id} className={`${cardBg} p-7 rounded-[2.5rem] border group relative transition-all duration-300 hover:scale-[1.01]`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-5">
                    
                    {/* PROFILE IMAGE CONTAINER */}
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xl border border-indigo-500/20 overflow-hidden">
                      {emp.profileImage ? (
                        <img 
                          src={emp.profileImage} 
                          alt={emp.firstName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=6366f1&color=fff`;
                          }}
                        />
                      ) : (
                        <span className="uppercase">{emp.firstName?.[0]}{emp.lastName?.[0]}</span>
                      )}
                    </div>

                    <div>
                      <div className={`font-black text-lg tracking-tight ${titleText}`}>
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                        {emp.jobPosition || 'Employee'}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === emp.id ? null : emp.id)} 
                      className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeDropdown === emp.id && (
                      <div className={`absolute right-0 top-full mt-2 w-48 border rounded-2xl shadow-2xl z-50 p-1.5 overflow-hidden ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}>
                        <button onClick={() => toggleModal('edit', emp)} className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3"><Edit size={14}/> Edit</button>
                        <button onClick={() => handleDownload(emp)} className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3"><Download size={14}/> Download</button>
                        <button onClick={() => toggleModal('delete', emp)} className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-3"><Trash2 size={14}/> Delete</button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className={subText}>Employee ID:</span>
                      <span className={titleText}>{emp.employeeId}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className={subText}>Department:</span>
                      <span className={titleText}>{emp.department}</span>
                   </div>
                </div>
                
                <div className={`pt-6 border-t flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    emp.isActive !== false ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {emp.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    onClick={() => toggleModal('preview', emp)} 
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDark ? 'bg-white/5 text-white border-white/5 hover:bg-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'}`}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-[#0b1220] border-white/10 text-slate-400 hover:border-indigo-500' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500'} disabled:opacity-20`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-[#0b1220] border-white/10 text-slate-400 hover:border-indigo-500' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500'} disabled:opacity-20`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {modals.preview && 
<PreviewEmployeeModal 
  isOpen={modals.preview} 
  employee={selectedEmp} 
  theme={theme} 
  onClose={() => setModals(p => ({...p, preview: false}))}
  // ADD THESE THREE LINES:
  onEdit={(emp) => toggleModal('edit', emp)}
  onDelete={(id) => toggleModal('delete', selectedEmp)}
  onDownload={(emp) => handleDownload(emp)}
/>}
      {modals.edit && <EditEmployeeModal isOpen={modals.edit} theme={theme} employee={selectedEmp} onClose={() => setModals(p => ({...p, edit: false}))} onUpdateSuccess={fetchData} />}
      {modals.delete && <DeleteEmployeeModal isOpen={modals.delete} employee={selectedEmp} onClose={() => setModals(p => ({...p, delete: false}))} onConfirm={fetchData} />}
    </div>
  );
};

export default EmployeeDirectory;