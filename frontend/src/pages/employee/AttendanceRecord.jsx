import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Eye, Clock, AlertTriangle, FileDown,
  Calendar as CalendarIcon, UserCheck,
  ChevronLeft, ChevronRight, Lock, RotateCcw, Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-hot-toast';

// Only View Modal is imported for Employee access
import ViewAttendanceRecordModal from '../../modals/employee/ViewAttendanceRecord';

const AttendanceRecord = () => {
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // --- State ---
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState(getTodayStr()); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // --- Fetch Data from Backend ---
  const fetchMyHistory = useCallback(async () => {
    try {
      setLoading(true);
      // Calls your GET /api/attendance/my-history endpoint
      const response = await axios.get("/attendance/my-history");
      
      // Transform Prisma dates for the table
      const formatted = response.data.map(rec => ({
        ...rec,
        // Format ISO date to YYYY-MM-DD for the filter comparison
        dateStr: new Date(rec.date).toISOString().split('T')[0],
        displayDate: new Date(rec.date).toLocaleDateString('en-GB', { 
          day: '2-digit', month: 'short', year: 'numeric' 
        }),
        checkInTime: rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        checkOutTime: rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      }));

      setRecords(formatted);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load attendance history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyHistory();
  }, [fetchMyHistory]);

  // --- Filtering Logic ---
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesStatus = statusFilter === 'All Status' || rec.status === statusFilter;
      const matchesDate = rec.dateStr === dateFilter;
      return matchesStatus && matchesDate;
    });
  }, [statusFilter, dateFilter, records]);

  // --- Stats Calculation (Based on all fetched records, not just filtered ones) ---
  const stats = useMemo(() => {
    const thisMonth = new Date().getMonth();
    const monthlyRecords = records.filter(r => new Date(r.date).getMonth() === thisMonth);
    
    return {
      present: monthlyRecords.filter(r => ['On Time', 'Late', 'Half Day'].includes(r.status)).length,
      late: monthlyRecords.filter(r => r.status === 'Late').length,
      leaves: 14 - monthlyRecords.filter(r => r.status === 'Absent').length // Example logic
    };
  }, [records]);

  // --- Navigation ---
  const shiftDate = (days) => {
    const current = new Date(dateFilter);
    current.setDate(current.getDate() + days);
    setDateFilter(current.toISOString().split('T')[0]);
  };

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    tableRow: isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50',
  };

  const getStatusBadge = (status) => {
    const base = "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ";
    switch(status) {
      case 'On Time': return base + "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'Late': return base + "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'Absent': return base + "bg-red-500/10 text-red-500 border-red-500/20";
      case 'Half Day': return base + "bg-blue-500/10 text-blue-500 border-blue-500/20";
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
          <p className={`${styles.textMuted} text-xs mt-1`}>Signed in as <span className="text-[#7c3aed] font-bold">{user?.firstName} {user?.lastName}</span></p>
        </div>
        <div className="flex gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${styles.border} ${styles.textMuted}`}>
            <Lock size={14} /> <span className="text-[10px] font-bold uppercase tracking-tighter">Secure View</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<UserCheck />} label="Days Present" value={stats.present} sub="This Month" color="emerald" theme={theme} />
        <StatCard icon={<AlertTriangle />} label="Late Entries" value={stats.late} sub="Check Policy" color="amber" theme={theme} />
        <StatCard icon={<Clock />} label="Hours Logged" value={records.length > 0 ? records[0].workHours : '0'} sub="Last Session" color="purple" theme={theme} />
        <StatCard icon={<CalendarIcon />} label="Leaves" value={stats.leaves} sub="Remaining" color="red" theme={theme} />
      </div>

      {/* Main Table Card */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-2xl overflow-hidden shadow-sm`}>
        <div className={`p-5 border-b ${styles.border} flex flex-col xl:flex-row gap-4 justify-between items-center`}>
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className={`flex items-center ${styles.bgInput} border ${styles.border} rounded-xl overflow-hidden`}>
                <button onClick={() => shiftDate(-1)} className={`p-2.5 ${styles.textMuted} hover:text-[#7c3aed] transition-colors border-r ${styles.border}`}><ChevronLeft size={18} /></button>
                <input type="date" className={`bg-transparent ${styles.textMain} px-4 py-2 text-sm outline-none cursor-pointer font-bold`} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                <button onClick={() => shiftDate(1)} className={`p-2.5 ${styles.textMuted} hover:text-[#7c3aed] transition-colors border-l ${styles.border}`}><ChevronRight size={18} /></button>
             </div>
             <button onClick={() => setDateFilter(getTodayStr())} className={`p-2.5 rounded-xl border ${styles.border} ${styles.textMuted} hover:text-[#7c3aed] transition-all`} title="Go to Today"><RotateCcw size={18} /></button>
          </div>
          
          <select className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-xs font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>On Time</option>
            <option>Late</option>
            <option>Absent</option>
            <option>Half Day</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-[#7c3aed]" size={32} />
              <p className={`text-xs font-bold uppercase tracking-widest ${styles.textMuted}`}>Synchronizing Logs...</p>
            </div>
          ) : (
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
                {filteredRecords.length > 0 ? filteredRecords.map((rec) => (
                  <tr key={rec.id} className={styles.tableRow}>
                    <td className={`p-5 font-bold ${styles.textMain}`}>{rec.displayDate}</td>
                    <td className={`p-5 font-mono text-xs ${styles.textMain}`}>{rec.checkInTime}</td>
                    <td className={`p-5 font-mono text-xs ${styles.textMain}`}>{rec.checkOutTime}</td>
                    <td className={`p-5 text-xs ${styles.textMuted}`}>{rec.workHours}h</td>
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
          )}
        </div>
      </div>

      {selectedRecord && (
        <ViewAttendanceRecordModal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
          theme={theme} 
          data={selectedRecord} 
        />
      )}
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