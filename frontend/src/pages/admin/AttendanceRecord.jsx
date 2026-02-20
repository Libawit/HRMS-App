import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Eye, Edit, Trash2, 
  Clock, AlertTriangle, FileDown,
  Calendar as CalendarIcon, UserCheck,
  ChevronLeft, ChevronRight, Loader2,
  Filter, ChevronDown, CheckCircle2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

// External Modals
import AddAttendanceRecordModal from '../../modals/admin/AddAttendanceRecord';
import EditAttendanceRecordModal from '../../modals/admin/EditAttendanceRecord';
import ViewAttendanceRecordModal from '../../modals/admin/ViewAttendanceRecord';

const API_BASE = "http://localhost:5000/api";

const AttendanceRecord = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark'; 
  const isDark = theme === 'dark';

  // --- State ---
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ presentToday: 0, lateEntries: 0, totalAbsent: 0, avgWorkDay: '0h' });
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false); // For cleanup button loading
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [departments, setDepartments] = useState([]); 
  const [currentDepartment, setCurrentDepartment] = useState('All');

  const getTodayStr = () => new Date().toLocaleDateString('en-CA');
  const [dateFilter, setDateFilter] = useState(getTodayStr()); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // --- Helpers ---
  const formatWorkHours = (hours) => {
    if (!hours || hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const shiftDate = (days) => {
    const current = new Date(dateFilter);
    current.setDate(current.getDate() + days);
    setDateFilter(current.toLocaleDateString('en-CA'));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const base = "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ";
    switch(status) {
      case 'On Time': return base + "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'Late': return base + "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'Half Day': return base + "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'Absent': return base + "bg-red-500/10 text-red-500 border-red-500/20";
      default: return base + "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error("Dept fetch error", err);
      }
    };
    fetchDepts();
  }, []);

  const fetchAttendance = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/attendance`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: { 
          date: dateFilter, 
          status: statusFilter === 'All Status' ? '' : statusFilter, 
          departmentId: currentDepartment === 'All' ? '' : currentDepartment,
          search: searchTerm 
        }
      });
      
      setRecords(response.data.records || []);
      setStats(response.data.stats || { presentToday: 0, lateEntries: 0, totalAbsent: 0, avgWorkDay: '0h' });
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record? It will be removed permanently from today's list.")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/attendance/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAttendance();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete record");
    }
  };

  // --- CLEANUP LOGIC ---
  const handleCleanup = async () => {
    if (!window.confirm("Run end-of-day cleanup? This will automatically mark all remaining employees as 'Absent' in the database.")) return;
    
    setCleaning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/attendance/cleanup`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(response.data.message);
      fetchAttendance();
    } catch (error) {
      console.error("Cleanup failed", error);
      alert(error.response?.data?.message || "Failed to run cleanup");
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, statusFilter, currentDepartment, searchTerm]);

  // --- Styles ---
  const styles = {
    input: `w-full p-4 rounded-2xl border transition-all appearance-none text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 ${
        isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`,
  };

  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardClass = `transition-all duration-300 border rounded-[3rem] ${isDark ? 'bg-[#0b1220] border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`;

  return (
    <main className={`flex-1 space-y-8 p-6 lg:p-10 transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f1f5f9]'}`}>
      
      {/* Header Area */}
      <div>
        <nav className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-purple-500' : 'text-indigo-600'}`}>
          Human Resources &nbsp; • &nbsp; Attendance
        </nav>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className={`text-[2rem] font-black tracking-tighter ${titleText}`}>Attendance</h1>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleCleanup}
              disabled={cleaning}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest ${
                isDark 
                ? 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10' 
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              } disabled:opacity-50`}
            >
              {cleaning ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              End Day Cleanup
            </button>
            <button className={`flex items-center gap-2 px-8 py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
              <FileDown size={18} /> Export
            </button>
            <button 
              onClick={() => { setSelectedRecord(null); setIsAddModalOpen(true); }}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> Add Record
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<UserCheck size={20} />} label="Present Today" value={stats.presentToday} sub="Live Data" color="emerald" isDark={isDark} />
        <StatCard icon={<AlertTriangle size={20} />} label="Late Entries" value={stats.lateEntries} sub="Action Required" color="amber" isDark={isDark} />
        <StatCard icon={<Clock size={20} />} label="Avg. Work Day" value={stats.avgWorkDay} sub="Last 30 Days" color="purple" isDark={isDark} />
        <StatCard icon={<CalendarIcon size={20} />} label="Total Absent" value={stats.totalAbsent} sub="Leave/Sick" color="red" isDark={isDark} />
      </div>

      <div className={cardClass}>
        {/* Toolbar */}
        <div className={`flex flex-col xl:flex-row gap-4 p-8 border-b transition-colors ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="relative flex-1 group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-[#7c3aed]' : 'text-slate-400'}`} size={20} />
            <input 
              type="text" 
              placeholder="Search employee..." 
              className={`${styles.input} pl-14 py-5 text-base`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center rounded-2xl p-1.5 border transition-all ${isDark ? 'bg-[#0f1623] border-white/10' : 'bg-white border-slate-200'}`}>
              <button onClick={() => shiftDate(-1)} className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all active:scale-90">
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <input 
                type="date"
                className={`bg-transparent px-4 text-xs font-black uppercase tracking-widest outline-none cursor-pointer ${titleText}`}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <button onClick={() => shiftDate(1)} className="p-2.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl transition-all active:scale-90">
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="relative w-full xl:w-64">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              value={currentDepartment}
              onChange={(e) => { setCurrentDepartment(e.target.value); setCurrentPage(1); }}
              className={`w-full ${styles.input} border text-sm font-bold rounded-2xl pl-14 pr-10 py-5 outline-none appearance-none cursor-pointer`}
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          </div>

          <div className="relative w-full xl:w-48">
            <select 
              className={`${styles.input} py-5 pr-10`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>On Time</option>
              <option>Late</option>
              <option>Half Day</option>
              <option>Absent</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Table */}
        <div className="p-8 lg:px-12 overflow-x-auto min-h-100 relative">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="w-10 h-10 animate-spin text-[#7c3aed]" />
               <p className={`text-xs font-black uppercase tracking-widest ${subText}`}>Syncing Records...</p>
             </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className={`text-[10px] uppercase tracking-[0.2em] font-black ${subText}`}>
                  <th className="pb-4 px-6">Employee Info</th>
                  <th className="pb-4 px-6">Check In</th>
                  <th className="pb-4 px-6">Check Out</th>
                  <th className="pb-4 px-6">Total Hours</th>
                  <th className="pb-4 px-6">Status</th>
                  <th className="pb-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? records.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((rec) => (
                  <tr key={rec.id} className="group transition-all">
                    <td className={`py-6 px-6 rounded-l-3xl border-y border-l transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                          {rec.name?.charAt(0)}
                        </div>
                        <div>
                          <div className={`text-sm font-black tracking-tight ${titleText}`}>{rec.name}</div>
                          <div className={`text-[10px] font-bold ${subText} uppercase`}>{rec.departmentName || 'General'}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-6 px-6 border-y transition-colors font-mono text-xs ${isDark ? 'border-white/5 bg-white/1 text-slate-300' : 'border-slate-100 bg-white text-slate-600'}`}>
                      {rec.checkIn || '--:--'}
                    </td>
                    <td className={`py-6 px-6 border-y transition-colors font-mono text-xs ${isDark ? 'border-white/5 bg-white/1 text-slate-300' : 'border-slate-100 bg-white text-slate-600'}`}>
                      {rec.checkOut || '--:--'}
                    </td>
                    <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${rec.workHours >= 8 ? 'bg-emerald-500' : rec.workHours >= 4 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-black ${titleText}`}>
                          {formatWorkHours(rec.workHours)}
                        </span>
                      </div>
                    </td>
                    <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <span className={getStatusBadge(rec.status)}>{rec.status}</span>
                    </td>
                    <td className={`py-6 px-6 rounded-r-3xl border-y border-r text-right transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedRecord(rec); setIsViewModalOpen(true); }} className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:bg-[#7c3aed] hover:text-white' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white'}`}>
                          <Eye size={18} strokeWidth={2.5} />
                        </button>
                        
                        <button 
                            onClick={() => {
                                setSelectedRecord(rec);
                                if (rec.isPlaceholder || String(rec.id).startsWith('temp-')) {
                                    setIsAddModalOpen(true);
                                } else {
                                    setIsEditModalOpen(true);
                                }
                            }} 
                            className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:bg-[#7c3aed] hover:text-white' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white'}`}
                        >
                          <Edit size={18} strokeWidth={2.5} />
                        </button>

                        {/* --- DELETE BUTTON ONLY FOR REAL DB RECORDS --- */}
                        {!rec.isPlaceholder && !String(rec.id).startsWith('temp-') && (
                          <button 
                            onClick={() => handleDelete(rec.id)} 
                            className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:bg-red-500 hover:text-white' : 'border-slate-100 text-slate-400 hover:bg-red-500 hover:text-white'}`}
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-xs font-black uppercase tracking-widest opacity-30">No Records Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddAttendanceRecordModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} theme={theme} onRefresh={fetchAttendance} prefillData={selectedRecord} />
      <EditAttendanceRecordModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} theme={theme} data={selectedRecord} currentFilterDate={dateFilter} onRefresh={fetchAttendance} />
      <ViewAttendanceRecordModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} theme={theme} data={selectedRecord} />
    </main>
  );
};

const StatCard = ({ icon, label, value, sub, color, isDark }) => {
  const colorMap = {
    emerald: isDark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200',
    purple: isDark ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200',
    red: isDark ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'
  };
  const titleText = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className={`p-6 rounded-[2.5rem] border transition-all duration-300 group hover:scale-[1.02] ${isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border transition-transform group-hover:rotate-12 ${colorMap[color]}`}>{icon}</div>
        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>{sub}</div>
      </div>
      <div className={`text-3xl font-black mb-1 ${titleText}`}>{value}</div>
      <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{label}</div>
    </div>
  );
};

export default AttendanceRecord;