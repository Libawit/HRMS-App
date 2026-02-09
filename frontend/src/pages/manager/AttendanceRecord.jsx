import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileDown,
  Calendar as CalendarIcon,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// External Modals
import AddAttendanceRecordModal from '../../modals/manager/AddAttendanceRecord';
import EditAttendanceRecordModal from '../../modals/manager/EditAttendanceRecord';
import ViewAttendanceRecordModal from '../../modals/manager/ViewAttendanceRecord';

const AttendanceRecord = () => {
  // --- Theme Logic: Sync with the global layout theme ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Manager Context ---
  const managerDept = "Engineering"; 

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState(getTodayStr()); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // --- Mock Data ---
  const [records, setRecords] = useState([
    { id: 1, name: "Jessica Taylor", dept: "Engineering", date: "2026-01-16", checkIn: "08:55 AM", checkOut: "05:05 PM", status: "On Time", workHours: "8h 10m" },
    { id: 2, name: "Michael Chen", dept: "Engineering", date: "2026-01-16", checkIn: "09:25 AM", checkOut: "05:15 PM", status: "Late", workHours: "7h 50m" },
    { id: 3, name: "Sarah Johnson", dept: "HR", date: "2026-01-16", checkIn: "-", checkOut: "-", status: "Absent", workHours: "0h" },
    { id: 4, name: "David Wilson", dept: "Engineering", date: "2026-01-15", checkIn: "08:45 AM", checkOut: "04:30 PM", status: "On Time", workHours: "7h 45m" }, 
    { id: 5, name: "Emma Brown", dept: "Marketing", date: "2026-01-16", checkIn: "09:05 AM", checkOut: "05:30 PM", status: "Late", workHours: "8h 25m" },
    { id: 6, name: "Chris Evans", dept: "Engineering", date: "2026-01-16", checkIn: "08:30 AM", checkOut: "05:00 PM", status: "On Time", workHours: "8h 30m" },
  ]);

  // --- Handlers ---
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this record? This action is permanent.")) {
        setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const shiftDate = (days) => {
    const current = new Date(dateFilter || getTodayStr());
    current.setDate(current.getDate() + days);
    setDateFilter(current.toISOString().split('T')[0]);
  };

  // --- Scoped Filtering Logic ---
  const filteredRecords = useMemo(() => {
    setCurrentPage(1);
    return records.filter(rec => {
      const isMyDept = rec.dept === managerDept;
      const matchesSearch = rec.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || rec.status === statusFilter;
      const matchesDate = !dateFilter || rec.date === dateFilter;
      return isMyDept && matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateFilter, records, managerDept]);

  // --- Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    tableRow: isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50',
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} transition-colors duration-500`}>
      {/* Managerial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#7c3aed]/10 text-[#7c3aed] text-[10px] font-black px-2 py-0.5 rounded-md border border-[#7c3aed]/20 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} /> Managerial Access
            </span>
            <span className={`${styles.textMuted} text-[10px] font-bold uppercase tracking-widest`}>
              &gt; {managerDept} Department
            </span>
          </div>
          <h1 className={`text-3xl font-black tracking-tight ${styles.textMain}`}>Team Attendance</h1>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border ${styles.border} ${styles.textMain} hover:bg-white/5 transition-all text-sm font-bold`}>
            <FileDown size={18} /> Export CSV
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 active:scale-95"
          >
            <Plus size={18} /> Log Entry
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<UserCheck />} label="Present in Engineering" value={filteredRecords.filter(r => r.status === 'On Time').length} sub="Real-time" color="emerald" isDark={isDark} />
        <StatCard icon={<AlertTriangle />} label="Late Today" value={filteredRecords.filter(r => r.status === 'Late').length} sub="Needs Review" color="amber" isDark={isDark} />
        <StatCard icon={<Clock />} label="Hours Logged" value="32.5h" sub="This Week" color="purple" isDark={isDark} />
        <StatCard icon={<CalendarIcon />} label="Absent" value={filteredRecords.filter(r => r.status === 'Absent').length} sub="Unplanned" color="red" isDark={isDark} />
      </div>

      {/* Main Table Card */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-2xl overflow-hidden shadow-sm flex flex-col`}>
        {/* Table Controls */}
        <div className={`p-5 border-b ${styles.border} flex flex-col xl:flex-row gap-4 justify-between items-center`}>
          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-4 py-2.5 rounded-xl gap-3 min-w-[320px] focus-within:border-[#7c3aed] transition-all`}>
              <Search size={18} className={styles.textMuted} />
              <input 
                type="text" 
                placeholder={`Search ${managerDept} staff...`} 
                className={`bg-transparent border-none outline-none text-sm w-full ${styles.textMain} placeholder:${styles.textMuted}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
               <div className={`flex items-center ${styles.bgInput} border ${styles.border} rounded-xl overflow-hidden`}>
                  <button onClick={() => shiftDate(-1)} className={`p-2.5 ${styles.textMuted} hover:text-[#7c3aed] border-r ${styles.border}`}>
                    <ChevronLeft size={18} />
                  </button>
                  <input 
                    type="date"
                    className={`bg-transparent ${styles.textMain} px-4 py-2.5 text-sm outline-none cursor-pointer focus:text-[#7c3aed]`}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <button onClick={() => shiftDate(1)} className={`p-2.5 ${styles.textMuted} hover:text-[#7c3aed] border-l ${styles.border}`}>
                    <ChevronRight size={18} />
                  </button>
               </div>
            </div>
          </div>
          
          <select 
            className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-[#7c3aed]`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>On Time</option>
            <option>Late</option>
            <option>Absent</option>
          </select>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`text-[10px] ${styles.textMuted} uppercase tracking-widest font-black border-b ${styles.border} ${isDark ? 'bg-black/20' : 'bg-slate-50'}`}>
                <th className="p-5">Team Member</th>
                <th className="p-5">Date</th>
                <th className="p-5">Check In</th>
                <th className="p-5">Check Out</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Review Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.border}`}>
              {currentItems.length > 0 ? currentItems.map((rec) => (
                <tr key={rec.id} className={`${styles.tableRow} transition-colors`}>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'} flex items-center justify-center text-[#7c3aed] font-black text-xs border ${styles.border}`}>
                        {rec.name.charAt(0)}
                      </div>
                      <div className={`font-bold ${styles.textMain}`}>{rec.name}</div>
                    </div>
                  </td>
                  <td className={`p-5 font-medium ${styles.textMain}`}>{rec.date}</td>
                  <td className={`p-5 font-mono text-xs ${styles.textMain}`}>{rec.checkIn}</td>
                  <td className={`p-5 font-mono text-xs ${styles.textMain}`}>{rec.checkOut}</td>
                  <td className="p-5">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => { setSelectedRecord(rec); setIsViewModalOpen(true); }} 
                        className="p-2 rounded-lg bg-[#7c3aed]/5 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-all"
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        onClick={() => { setSelectedRecord(rec); setIsEditModalOpen(true); }} 
                        className="p-2 rounded-lg bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <Edit size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rec.id)}
                        className="p-2 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className={`p-20 text-center ${styles.textMuted} italic`}>
                    No records found for the {managerDept} department on this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredRecords.length > 0 && (
          <div className={`p-5 border-t ${styles.border} flex items-center justify-between`}>
            <div className={`text-xs font-bold ${styles.textMuted}`}>
              Showing <span className={styles.textMain}>{indexOfFirstItem + 1}</span> to <span className={styles.textMain}>{Math.min(indexOfLastItem, filteredRecords.length)}</span> of {filteredRecords.length}
            </div>
            <div className="flex gap-2">
               <button 
                 disabled={currentPage === 1}
                 onClick={() => setCurrentPage(prev => prev - 1)}
                 className={`p-2 rounded-lg border ${styles.border} ${styles.textMain} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5`}
               >
                 <ChevronLeft size={16} />
               </button>
               <button 
                 disabled={currentPage === totalPages}
                 onClick={() => setCurrentPage(prev => prev + 1)}
                 className={`p-2 rounded-lg border ${styles.border} ${styles.textMain} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5`}
               >
                 <ChevronRight size={16} />
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAttendanceRecordModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} theme={theme} />
      <EditAttendanceRecordModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} theme={theme} data={selectedRecord} />
      <ViewAttendanceRecordModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} theme={theme} data={selectedRecord} />
    </main>
  );
};

// --- Sub-components ---
const StatusBadge = ({ status }) => {
  const base = "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border inline-block ";
  switch(status) {
    case 'On Time': return <span className={base + "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}>On Time</span>;
    case 'Late': return <span className={base + "bg-amber-500/10 text-amber-500 border-amber-500/20"}>Late</span>;
    case 'Absent': return <span className={base + "bg-red-500/10 text-red-500 border-red-500/20"}>Absent</span>;
    default: return <span className={base + "bg-slate-500/10 text-slate-500 border-slate-500/20"}>{status}</span>;
  }
};

const StatCard = ({ icon, label, value, sub, color, isDark }) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    purple: 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <div className={`${isDark ? 'bg-[#0b1220]' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-slate-200'} p-5 rounded-2xl transition-all duration-500`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
          {sub}
        </div>
      </div>
      <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>{label}</div>
    </div>
  );
};

export default AttendanceRecord;