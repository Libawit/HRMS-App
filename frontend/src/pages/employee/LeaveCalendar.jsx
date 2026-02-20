import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar as CalendarIcon,
  Layers,
  Info,
  Loader2,
  Search,
  UserCheck
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

// External Modals
import ViewLeaveCalendarModal from '../../modals/employee/ViewLeaveCalendar';

const LeaveCalendar = () => {
  // Pulling theme and the logged-in user from the global context
  const { theme, user } = useOutletContext(); 
  const isDark = theme === 'dark';

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [viewMode, setViewMode] = useState('Month');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // --- API Fetching (Employee Scoped) ---
  const fetchMyLeaves = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const res = await axios.get(`http://localhost:5000/api/auth/leave-requests/calendar`, {
        params: { 
          year, 
          month, 
          status: 'APPROVED', // Employees typically see their confirmed schedule
          userId: user.id      // Security: Strict personal scoping
        } 
      });

      setEvents(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, user?.id]);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  // --- Filtered Events (Local UI filtering) ---
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const typeName = e.leaveType?.name?.toLowerCase() || "";
      return typeName.includes(searchTerm.toLowerCase());
    });
  }, [events, searchTerm]);

  // --- Calendar Logic ---
  const calendarWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    
    const end = new Date(lastDay);
    end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const weeks = [];
    let currentWeek = [];
    let curr = new Date(start);

    while (curr <= end) {
      currentWeek.push(new Date(curr));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }
    return weeks;
  }, [currentDate]);

  const changeDate = (offset) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Month') newDate.setMonth(currentDate.getMonth() + offset);
    else newDate.setDate(currentDate.getDate() + (offset * 7));
    setCurrentDate(newDate);
  };

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    inputBg: isDark ? 'bg-white/5' : 'bg-slate-50',
  };

  return (
    <main className={`flex-1 flex flex-col overflow-hidden transition-colors duration-500 ${styles.bgBody}`}>
      
      {/* Employee Header */}
      <header className={`p-6 border-b ${styles.border} flex flex-col md:flex-row justify-between items-center gap-4 ${styles.bgCard}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 tracking-tighter">
              <UserCheck size={10} /> Personal Portal
            </span>
          </div>
          <h1 className={`text-2xl font-black tracking-tight ${styles.textMain}`}>
            {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-[#7c3aed]">{currentDate.getFullYear()}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center p-1 rounded-xl border ${styles.border} ${isDark ? 'bg-black/20' : 'bg-slate-100'}`}>
            {['Month', 'Week'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode ? 'bg-[#7c3aed] text-white shadow-lg' : styles.textMuted
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`w-72 border-r ${styles.border} p-6 hidden lg:block overflow-y-auto ${styles.bgCard}`}>
          <div className="space-y-8">
            {/* Mini Nav */}
            <div className={`p-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-black/10' : 'bg-slate-50'}`}>
               <div className="flex items-center justify-between">
                 <button onClick={() => changeDate(-1)} className={`p-1.5 rounded-lg hover:bg-black/5 ${styles.textMuted}`}><ChevronLeft size={16}/></button>
                 <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-black uppercase text-[#7c3aed] tracking-tighter">Today</button>
                 <button onClick={() => changeDate(1)} className={`p-1.5 rounded-lg hover:bg-black/5 ${styles.textMuted}`}><ChevronRight size={16}/></button>
               </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-3">
              <div className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted} flex items-center gap-2`}>
                <Search size={12} /> Filter Types
              </div>
              <input 
                type="text" 
                placeholder="Search leave type..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none transition-all focus:border-[#7c3aed] ${styles.inputBg} ${styles.border} ${styles.textMain}`}
              />
            </div>

            {/* Info Box */}
            <div className={`p-4 rounded-2xl border ${styles.border} bg-blue-500/5 space-y-2`}>
              <div className="flex items-center gap-2 text-blue-500">
                <Info size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">System Note</span>
              </div>
              <p className={`text-[11px] leading-relaxed font-medium ${styles.textMuted}`}>
                Only <strong className={styles.textMain}>Approved</strong> requests are displayed here. Visit History for pending items.
              </p>
            </div>

            {/* Legend */}
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted} mb-4 flex items-center gap-2`}>
                <Layers size={12} /> Status Key
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className={`text-[11px] font-bold ${styles.textMuted}`}>Confirmed Leave</span>
                </div>
              </div>
            </div>

            <button className={`w-full py-3.5 rounded-2xl border ${styles.border} ${styles.textMain} text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all mt-4`}>
              <Download size={14} /> Export My Schedule
            </button>
          </div>
        </aside>

        {/* Calendar Main Grid */}
        <div className="flex-1 overflow-y-auto relative p-4">
          {loading && (
            <div className="absolute inset-0 z-50 bg-[#020617]/10 backdrop-blur-[2px] flex items-center justify-center">
              <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
            </div>
          )}

          <div className="grid grid-cols-7 sticky top-0 z-30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${styles.textMuted}`}>
                {day}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-px">
            {calendarWeeks.map((week, weekIdx) => (
              <div key={weekIdx} className="relative min-h-35 grid grid-cols-7">
                {/* Day Squares */}
                {week.map((date, dayIdx) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={dayIdx} 
                      className={`border ${styles.border} p-2 ${isDark ? 'bg-[#0b1220]/30' : 'bg-white'} ${!isCurrentMonth && 'opacity-20'}`}
                    >
                      <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg ${
                        isToday ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/30' : styles.textMuted
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}

                {/* Event Visual Overlay */}
                <div className="absolute inset-0 pointer-events-none mt-10 px-1 flex flex-col gap-1 overflow-hidden">
                  {filteredEvents.map(event => {
                    const start = new Date(event.startDate); start.setHours(0,0,0,0);
                    const end = new Date(event.endDate); end.setHours(0,0,0,0);
                    const weekStart = week[0];
                    const weekEnd = week[6];

                    // Only render if event touches this specific week
                    if (end < weekStart || start > weekEnd) return null;

                    const startIdx = Math.max(0, Math.floor((start - weekStart) / 86400000));
                    const endIdx = Math.min(6, Math.floor((end - weekStart) / 86400000));
                    const span = endIdx - startIdx + 1;
                    const baseColor = '#10b981'; // Emerald for Approved

                    return (
                      <div
                        key={event.id}
                        onClick={() => { setSelectedLeave(event); setIsViewModalOpen(true); }}
                        style={{ 
                          marginLeft: `${(startIdx / 7) * 100}%`,
                          width: `${(span / 7) * 100}%`,
                          backgroundColor: `${baseColor}15`,
                          color: baseColor,
                          borderLeft: `3px solid ${baseColor}`
                        }}
                        className="pointer-events-auto h-7 flex items-center px-2 rounded-md text-[9px] font-black uppercase truncate cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all mb-0.5"
                      >
                         <div className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" style={{backgroundColor: baseColor}} />
                         {event.leaveType?.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Modal */}
      <ViewLeaveCalendarModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        theme={theme} 
        data={selectedLeave} 
      />
    </main>
  );
};

export default LeaveCalendar;