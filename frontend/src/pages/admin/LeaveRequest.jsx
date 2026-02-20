import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Calendar, CheckCircle2, Clock, 
  XCircle, Eye, Edit, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

// External Modals
import AddLeaveRequestModal from '../../modals/admin/AddLeaveRequest';
import EditLeaveRequestModal from '../../modals/admin/EditLeaveRequest';
import ViewLeaveRequestModal from '../../modals/admin/ViewLeaveRequest';

const LeaveRequest = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDate, setViewDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // NEW: Department Filter States
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [departments, setDepartments] = useState([]);
  
  const itemsPerPage = 5;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- API Fetching ---
  
  // Fetch Departments (For the filter dropdown)
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchDepts();
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/leave-requests', {
        params: {
          month: viewDate.getMonth() + 1,
          year: viewDate.getFullYear()
        }
      });
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // --- Handlers ---
  const handlePrevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() - 1);
    setViewDate(newDate);
    setCurrentPage(1); 
  };

  const handleNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + 1);
    setViewDate(newDate);
    setCurrentPage(1); 
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this request? This cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/leave-requests/${id}`);
        fetchRequests();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  // --- Filter Logic ---
  const filteredRequests = useMemo(() => {
    return (requests || []).filter(req => {
      const empName = req.user?.firstName 
        ? `${req.user.firstName} ${req.user.lastName}` 
        : (req.name || 'Unknown');
      
      const typeName = req.leaveType?.name || req.type || '';
      const search = searchTerm.toLowerCase();

      // 1. Search Logic
      const matchesSearch = empName.toLowerCase().includes(search) || 
                            typeName.toLowerCase().includes(search);
      
      // 2. Status Logic
      const matchesStatus = statusFilter === 'All Status' || req.status === statusFilter;

      // 3. Department Logic (Matches your Salary example)
      const matchesDept = departmentFilter === 'All Departments' || 
                          req.user?.departmentId === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [searchTerm, statusFilter, departmentFilter, requests]);

  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // --- Helpers ---
  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-[3rem] overflow-hidden transition-all duration-500`,
    input: `w-full p-4 rounded-2xl border transition-all appearance-none text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 ${
        isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`,
  };

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ";
    const s = status?.toLowerCase();
    if (s === 'approved') return base + "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s === 'pending') return base + "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (s === 'rejected') return base + "bg-red-500/10 text-red-500 border-red-500/20";
    return base + "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  return (
    <main className={`flex-1 p-6 lg:p-10 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-[0.3em] mb-3 underline underline-offset-8 decoration-2">
            Management &nbsp; • &nbsp; Attendance
          </p>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Leave Requests</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Month Navigation Control */}
          <div className={`flex items-center rounded-2xl p-1.5 border transition-all ${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button 
              onClick={handlePrevMonth} 
              className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all active:scale-90"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <div className={`px-5 text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-3 min-w-45 justify-center`}>
              <Calendar size={16} className="text-[#7c3aed]" />
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              onClick={handleNextMonth} 
              className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all active:scale-90"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-purple-500/20 flex items-center gap-2 active:scale-95 transition-all">
            <Plus size={18} strokeWidth={3} /> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Clock />} title="Pending Reviews" value={requests.filter(r => r.status?.toUpperCase() === 'PENDING').length} color="blue" theme={theme} />
        <StatCard icon={<CheckCircle2 />} title="Approved" value={requests.filter(r => r.status?.toUpperCase() === 'APPROVED').length} color="emerald" theme={theme} />
        <StatCard icon={<XCircle />} title="Rejected" value={requests.filter(r => r.status?.toUpperCase() === 'REJECTED').length} color="red" theme={theme} />
        <StatCard icon={<Calendar />} title="Requests Month" value={requests.length} color="purple" theme={theme} />
      </div>

      <div className={styles.card}>
        {/* Toolbar */}
        <div className={`flex flex-col lg:flex-row gap-6 p-8 lg:px-12 border-b transition-colors ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Search employee..." className={`${styles.input} pl-14 py-5`}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* DEPARTMENT FILTER */}
            <select 
              className={`${styles.input} md:w-64 cursor-pointer`} 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All Departments">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>

            {/* STATUS FILTER */}
            <select className={`${styles.input} md:w-48 cursor-pointer`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="p-8 lg:p-12 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#7c3aed]" size={40} /></div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase font-black tracking-widest`}>
                  <th className="pb-4 px-6">Employee</th>
                  <th className="pb-4 px-6">Type</th>
                  <th className="pb-4 px-6 text-center">Duration</th>
                  <th className="pb-4 px-6">Status</th>
                  <th className="pb-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length > 0 ? paginatedRequests.map((req) => {
                  const empName = req.user ? `${req.user.firstName} ${req.user.lastName}` : (req.name || 'Unknown');
                  return (
                    <tr key={req.id} className="group">
                      <td className={`py-6 px-6 rounded-l-4xl border-y border-l ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] font-black text-xs uppercase">
                            {empName.charAt(0)}
                          </div>
                          <div>
                            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{empName}</div>
                            <div className="text-[10px] opacity-50 uppercase font-bold tracking-tighter">{req.user?.employeeId || 'ID-000'}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <span className="text-xs font-black uppercase tracking-wider">{req.leaveType?.name || req.type}</span>
                      </td>
                      <td className={`py-6 px-6 border-y text-center ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <div className="text-xs font-black">{req.daysRequested || req.days} Days</div>
                        <div className="text-[9px] opacity-40 font-bold uppercase">
                          {req.startDate ? new Date(req.startDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <span className={getStatusBadge(req.status)}>{req.status}</span>
                      </td>
                      <td className={`py-6 px-6 rounded-r-4xl border-y border-r text-right ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedItem(req); setIsViewModalOpen(true); }} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]'}`}><Eye size={18} strokeWidth={2.5} /></button>
                          <button onClick={() => { setSelectedItem(req); setIsEditModalOpen(true); }} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-emerald-500' : 'border-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'}`}><Edit size={18} strokeWidth={2.5} /></button>
                          <button onClick={() => handleDelete(req.id)} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-red-500' : 'border-slate-100 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500'}`}><Trash2 size={18} strokeWidth={2.5} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="5" className="py-20 text-center opacity-40 font-black uppercase text-xs tracking-[0.2em]">No requests found for this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
               <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={`p-3 rounded-xl border transition-all active:scale-90 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}><ChevronLeft size={16}/></button>
               <div className="flex items-center px-4 text-xs font-black uppercase tracking-widest">Page {currentPage} of {totalPages}</div>
               <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={`p-3 rounded-xl border transition-all active:scale-90 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddLeaveRequestModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} theme={theme} onRefresh={fetchRequests} />
      <EditLeaveRequestModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} theme={theme} data={selectedItem} onRefresh={fetchRequests} />
      <ViewLeaveRequestModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} theme={theme} data={selectedItem} />
    </main>
  );
};

const StatCard = ({ icon, title, value, color, theme }) => {
  const isDark = theme === 'dark';
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-[#0b1220] border-white/10 shadow-xl' : 'bg-white border-slate-200'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24, strokeWidth: 3 })}
      </div>
      <div className={`text-4xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{title}</div>
    </div>
  );
};

const Loader2 = ({ className, size }) => (
  <svg className={`${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default LeaveRequest;