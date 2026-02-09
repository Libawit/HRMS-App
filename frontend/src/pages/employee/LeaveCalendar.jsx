import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar as CalendarIcon,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Only keeping the View Modal (Add/Edit modals removed for read-only access)
import ViewLeaveCalendarModal from '../../modals/employee/ViewLeaveCalendar';

const LeaveCalendar = () => {
  // --- Theme Logic via useOutletContext ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Current User Identity ---
  const currentUser = { name: "John Doe", role: "Employee" };

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
  const [viewMode, setViewMode] = useState('Month');
  
  // Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // --- Mock Data ---
  const [allEvents] = useState([
    { id: 1, name: "Jessica Taylor", type: "Annual", status: "pending", day: 1 },
    { id: 2, name: "John Doe", type: "Annual", status: "approved", day: 5 }, // John's event
    { id: 3, name: "John Doe", type: "Sick", status: "pending", day: 12 },   // John's event
    { id: 4, name: "Sarah Johnson", type: "Personal", status: "rejected", day: 10 },
    { id: 5, name: "John Doe", type: "Personal", status: "approved", day: 22 }, // John's event
  ]);

  // --- Privacy Filter: Only John Doe sees John Doe ---
  const myEvents = useMemo(() => {
    return allEvents.filter(event => event.name === currentUser.name);
  }, [allEvents, currentUser.name]);

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  // --- Calendar Math ---
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true });
    }
    return days;
  }, [currentDate, year]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getEventStyle = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  return (
    <main className={`flex-1 flex flex-col overflow-hidden ${styles.bgBody} transition-colors duration-300`}>
      
      {/* Top Header Section */}
      <header className={`p-6 border-b ${styles.border} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${styles.bgCard}`}>
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-widest ${styles.textMuted} mb-1 flex items-center gap-2`}>
            <CalendarIcon size={12} /> Personal Portal
          </div>
          <h1 className={`text-2xl font-black tracking-tight ${styles.textMain}`}>My Leave Calendar</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} p-1 rounded-xl`}>
            {['Month', 'Week', 'Day'].map((mode) => (
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
        
        {/* Left Sidebar (Read-Only Info) */}
        <aside className={`w-72 border-r ${styles.border} p-6 hidden lg:block overflow-y-auto ${styles.bgCard}`}>
          <div className="space-y-8">
            {/* Month Nav */}
            <div className={`p-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-black/20' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${styles.textMain}`}>{monthName} {year}</span>
                <div className="flex gap-1">
                  <button onClick={() => changeMonth(-1)} className={`p-1 rounded-lg hover:bg-white/5 ${styles.textMuted}`}><ChevronLeft size={16}/></button>
                  <button onClick={() => changeMonth(1)} className={`p-1 rounded-lg hover:bg-white/5 ${styles.textMuted}`}><ChevronRight size={16}/></button>
                </div>
              </div>
            </div>

            {/* Leave Legend */}
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${styles.textMuted} mb-4 flex items-center gap-2`}>
                <Layers size={12} /> My Categories
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Annual Leave', color: 'bg-purple-500' },
                  { label: 'Sick Leave', color: 'bg-emerald-500' },
                  { label: 'Personal', color: 'bg-amber-500' }
                ].map(cat => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                    <span className={`text-xs ${styles.textMuted}`}>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className={`p-4 rounded-xl border ${styles.border} bg-blue-500/5`}>
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Info size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Note</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#94a3b8]">
                This is a view-only calendar of your personal leave requests. Contact HR to modify any entries.
              </p>
            </div>

            <button className={`w-full py-3 rounded-xl border ${styles.border} ${styles.textMain} text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all`}>
              <Download size={14} /> Download My Schedule
            </button>
          </div>
        </aside>

        {/* Main Calendar Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Weekday Labels */}
          <div className={`grid grid-cols-7 border-b ${styles.border} ${styles.bgCard} sticky top-0 z-10`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-4 text-center text-[11px] font-black uppercase tracking-widest ${styles.textMuted}`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, idx) => {
              // Now filtering only from myEvents
              const dayEvents = myEvents.filter(e => e.day === cell.day);
              const isToday = cell.day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

              return (
                <div 
                  key={idx} 
                  className={`min-h-35 border-r border-b ${styles.border} p-2 transition-colors relative group`}
                >
                  {cell.day && (
                    <>
                      <span className={`text-xs font-bold mb-2 block ${
                        isToday ? 'bg-[#7c3aed] text-white w-6 h-6 flex items-center justify-center rounded-lg' : styles.textMuted
                      }`}>
                        {cell.day}
                      </span>
                      
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            onClick={() => { setSelectedLeave(event); setIsViewModalOpen(true); }}
                            className={`text-[10px] px-2 py-1.5 rounded-lg border cursor-pointer truncate transition-all font-bold ${getEventStyle(event.status)}`}
                          >
                            {event.type} Leave
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {!cell.day && <div className={`absolute inset-0 ${isDark ? 'bg-black/5' : 'bg-slate-50/50'} opacity-50`}></div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Only Modal */}
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