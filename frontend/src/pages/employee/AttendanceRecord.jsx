import React, { useState, useMemo, useEffect } from 'react';
import { 
  Eye, 
  Clock, 
  AlertTriangle,
  FileDown,
  Calendar as CalendarIcon,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Lock,
  RotateCcw
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Only View Modal is imported for Employee access
import ViewAttendanceRecordModal from '../../modals/employee/ViewAttendanceRecord';

const AttendanceRecord = () => {
  // --- Theme Logic via useOutletContext ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  /**
   * Helper: Get YYYY-MM-DD string based on local time
   */
  const getTodayStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  // --- Current User Identity (Strict Privacy) ---
  const currentUser = { name: "Jessica Taylor" }; 

  // --- State ---
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState(getTodayStr()); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  /**
   * FORCE RESET ON LOAD
   */
  useEffect(() => {
    setDateFilter(getTodayStr());
  }, []);

  // --- Mock Data (Contains multiple employees to test privacy) ---
  const [records] = useState([
    { id: 10, name: "Jessica Taylor", date: "2026-01-21", checkIn: "08:45 AM", checkOut: "05:15 PM", status: "On Time", workHours: "8h 30m" },
    { id: 1, name: "Jessica Taylor", date: "2026-01-20", checkIn: "09:10 AM", checkOut: "05:05 PM", status: "Late", workHours: "7h 55m" },
    { id: 4, name: "Jessica Taylor", date: "2026-01-15", checkIn: "08:45 AM", checkOut: "04:30 PM", status: "On Time", workHours: "7h 45m" }, 
    // Data for other employees (Should be filtered out)
    { id: 99, name: "John Doe", date: "2026-01-21", checkIn: "09:00 AM", checkOut: "05:00 PM", status: "On Time", workHours: "8h 00m" },
  ]);

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

  // --- Date Navigation Logic ---
  const shiftDate = (days) => {
    const current = new Date(dateFilter);
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split('T')[0];
    setDateFilter(newDateStr);
  };

  // --- Filtering Logic: Only Jessica Taylor sees Jessica Taylor ---
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const isMe = rec.name === currentUser.name;
      const matchesStatus = statusFilter === 'All Status' || rec.status === statusFilter;
      const matchesDate = rec.date === dateFilter;
      return isMe && matchesStatus && matchesDate;
    });
  }, [statusFilter, dateFilter, records, currentUser.name]);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const getStatusBadge = (status) => {
    const base = "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ";
    switch(status) {
      case 'On Time': return base + "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'Late': return base + "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'Absent': return base + "bg-red-500/10 text-red-500 border-red-500/20";
      default: return base + "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} transition-all`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-widest ${styles.textMuted} mb-2`}>
            Employee Portal &gt; Attendance History
          </div>
          <h1 className={`text-3xl font-black tracking-tight ${styles.textMain}`}>
            {dateFilter === getTodayStr() ? "Today's Attendance" : "Attendance Record"}
          </h1>
        </div>
        <div className="flex gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${styles.border} ${styles.textMuted}`}>
            <Lock size={14} /> <span className="text-[10px] font-bold uppercase">View Only</span>
          </div>
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border ${styles.border} ${styles.textMain} hover:bg-white/5 transition-all text-sm font-bold`}>
            <FileDown size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<UserCheck />} label="Days Present" value="22" sub="This Month" color="emerald" theme={theme} />
        <StatCard icon={<AlertTriangle />} label="Late Entries" value="02" sub="Check Policy" color="amber" theme={theme} />
        <StatCard icon={<Clock />} label="Average In" value="08:52" sub="On Time" color="purple" theme={theme} />
        <StatCard icon={<CalendarIcon />} label="Leaves" value="14" sub="Remaining" color="red" theme={theme} />
      </div>

      {/* Main Table Card */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-2xl overflow-hidden shadow-sm`}>
        <div className={`p-5 border-b ${styles.border} flex flex-col xl:flex-row gap-4 justify-between items-center`}>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
               {/* Date Navigator */}
               <div className={`flex items-center ${styles.bgInput} border ${styles.border} rounded-xl overflow-hidden`}>
                  <button 
                    onClick={() => shiftDate(-1)} 
                    className={`p-2.5 ${styles.textMuted} hover:text-[#7c3aed] transition-colors border-r ${styles.border}`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <input 
                    type="date"
                    className={`bg-transparent ${styles.textMain} px-4 py-2 text-sm outline-none cursor-pointer font-bold`}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <button 
                    onClick={() => shiftDate(1)} 
                    className={`p-2.5 ${styles.textMuted} hover:text-[#7c3aed] transition-colors border-l ${styles.border}`}
                  >
                    <ChevronRight size={18} />
                  </button>
               </div>

               {/* Reset Button */}
               <button 
                onClick={() => setDateFilter(getTodayStr())}
                className={`p-2.5 rounded-xl border ${styles.border} ${styles.textMuted} hover:text-[#7c3aed] hover:border-[#7c3aed] transition-all`}
                title="Go to Today"
               >
                 <RotateCcw size={18} />
               </button>
            </div>
          </div>
          
          <select 
            className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-xs font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>On Time</option>
            <option>Late</option>
            <option>Absent</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`text-[10px] ${styles.textMuted} uppercase tracking-widest font-black border-b ${styles.border} bg-black/5`}>
                <th className="p-5">Date</th>
                <th className="p-5">Check In</th>
                <th className="p-5">Check Out</th>
                <th className="p-5">Work Hours</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.border}`}>
              {currentItems.length > 0 ? currentItems.map((rec) => (
                <tr key={rec.id} className={styles.tableRow}>
                  <td className={`p-5 font-bold ${styles.textMain}`}>{rec.date}</td>
                  <td className={`p-5 font-mono text-xs ${styles.textMain}`}>{rec.checkIn}</td>
                  <td className={`p-5 font-mono text-xs ${styles.textMain}`}>{rec.checkOut}</td>
                  <td className={`p-5 text-xs ${styles.textMuted}`}>{rec.workHours}</td>
                  <td className="p-5">
                    <span className={getStatusBadge(rec.status)}>{rec.status}</span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => { setSelectedRecord(rec); setIsViewModalOpen(true); }} 
                      className="p-2 rounded-lg bg-[#7c3aed]/5 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-all"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className={`p-20 text-center ${styles.textMuted} italic`}>
                    No logs found for {dateFilter === getTodayStr() ? "Today" : dateFilter}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ViewAttendanceRecordModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        theme={theme} 
        data={selectedRecord} 
      />
    </main>
  );
};

const StatCard = ({ icon, label, value, sub, color, theme }) => {
  const isDark = theme === 'dark';
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    purple: 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <div className={`${isDark ? 'bg-[#0b1220]' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-slate-200'} p-5 rounded-2xl`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>{icon}</div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>{sub}</div>
      </div>
      <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>{label}</div>
    </div>
  );
};

export default AttendanceRecord;