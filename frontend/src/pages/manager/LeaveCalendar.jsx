import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Download, 
  Calendar as CalendarIcon,
  Users,
  Layers,
  Trash2,
  Edit3,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// External Modals
import AddLeaveCalendarModal from '../../modals/manager/AddLeaveCalendar';
import EditLeaveCalendarModal from '../../modals/manager/EditLeaveCalendar';
import ViewLeaveCalendarModal from '../../modals/manager/ViewLeaveCalendar';

const LeaveCalendar = () => {
  // --- Theme Logic: Sync with the global layout theme ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Manager Context ---
  const managerDept = "Engineering"; 

  // --- State ---
  // Defaulting to the current date (January 26, 2026 based on your current context)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 26)); 
  const [viewMode, setViewMode] = useState('Month');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // --- Mock Data ---
  const [events, setEvents] = useState([
    { id: 1, name: "Jessica Taylor", type: "Annual", status: "pending", day: 26, month: 0, year: 2026, dept: "Engineering" },
    { id: 2, name: "Michael Chen", type: "Sick", status: "approved", day: 28, month: 0, year: 2026, dept: "Engineering" },
    { id: 3, name: "Sarah Johnson", type: "Personal", status: "rejected", day: 10, month: 0, year: 2026, dept: "Engineering" },
    { id: 5, name: "Emma Brown", type: "Annual", status: "approved", day: 20, month: 0, year: 2026, dept: "Engineering" },
  ]);

  // --- Theme Styles Mapping ---
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

  // Logic for Month View Grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push({ day: null, month: null, year: null });
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month: currentDate.getMonth(), year: year });
    }
    return days;
  }, [currentDate, year]);

  // Logic for Week View Grid
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return { 
        day: day.getDate(), 
        month: day.getMonth(), 
        year: day.getFullYear() 
      };
    });
  }, [currentDate]);

  const displayDays = viewMode === 'Month' ? calendarDays : weekDays;

  // --- Handlers ---
  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this leave record?")) {
      setEvents(events.filter(ev => ev.id !== id));
    }
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
    <main className={`flex-1 flex flex-col overflow-hidden transition-colors duration-500 ${styles.bgBody}`}>
      
      {/* Manager Header */}
      <header className={`p-6 border-b ${styles.border} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${styles.bgCard}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#7c3aed]/20 text-[#7c3aed] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
              <ShieldCheck size={10} /> Manager View
            </span>
            <span className={`text-[11px] font-bold uppercase tracking-widest ${styles.textMuted}`}>
              {managerDept} Department
            </span>
          </div>
          <h1 className={`text-2xl font-black tracking-tight ${styles.textMain}`}>
            {viewMode === 'Month' ? 'Team Availability' : `Week of ${weekDays[0].day} ${monthName}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} p-1 rounded-xl`}>
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
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20 active:scale-95"
          >
            <Plus size={16} /> Add Leave
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Manager Insights */}
        <aside className={`w-72 border-r ${styles.border} p-6 hidden lg:block overflow-y-auto ${styles.bgCard}`}>
          <div className="space-y-8">
            
            {/* Calendar Nav */}
            <div className={`p-4 rounded-2xl border ${styles.border} ${isDark ? 'bg-black/10' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-black ${styles.textMain}`}>
                    {viewMode === 'Month' ? `${monthName} ${year}` : 'Navigation'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleNavigate(-1)} className={`p-1.5 rounded-lg hover:bg-black/5 ${styles.textMuted}`}><ChevronLeft size={16}/></button>
                  <button onClick={() => handleNavigate(1)} className={`p-1.5 rounded-lg hover:bg-black/5 ${styles.textMuted}`}><ChevronRight size={16}/></button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/10">
               <div className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest mb-3 flex items-center gap-2">
                 <AlertCircle size={12} /> Today's Overview
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isDark ? 'opacity-70' : 'text-slate-500'}`}>Out of Office</span>
                    <span className={`text-sm font-black ${styles.textMain}`}>2 Members</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isDark ? 'opacity-70' : 'text-slate-500'}`}>Pending Requests</span>
                    <span className="text-sm font-black text-amber-500">1</span>
                  </div>
               </div>
            </div>

            {/* Scoped Team List */}
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted} mb-4 flex items-center gap-2`}>
                <Users size={12} /> {managerDept} Team
              </div>
              <div className="space-y-1">
                {["Jessica Taylor", "Michael Chen", "Sarah Johnson", "Emma Brown"].map(name => (
                  <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-default group transition-all">
                    <div className="w-6 h-6 rounded-md bg-[#7c3aed]/10 flex items-center justify-center text-[10px] font-bold text-[#7c3aed] border border-[#7c3aed]/10">{name.charAt(0)}</div>
                    <span className={`text-xs font-bold ${styles.textMuted} group-hover:text-[#7c3aed] transition-colors`}>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${styles.textMuted} mb-4 flex items-center gap-2`}>
                <Layers size={12} /> Categories
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Annual', color: 'bg-purple-500' },
                  { label: 'Sick', color: 'bg-emerald-500' },
                  { label: 'Personal', color: 'bg-amber-500' }
                ].map(cat => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${cat.color}`}></div>
                    <span className={`text-[11px] font-bold ${styles.textMuted}`}>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className={`w-full py-3.5 rounded-2xl border ${styles.border} ${styles.textMain} text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all mt-4`}>
              <Download size={14} /> Export Dept Report
            </button>
          </div>
        </aside>

        {/* Main Calendar Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`grid grid-cols-7 border-b ${styles.border} ${styles.bgCard} sticky top-0 z-10`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${styles.textMuted}`}>
                {day}
              </div>
            ))}
          </div>
          
          <div className={`grid grid-cols-7 ${viewMode === 'Week' ? 'h-full' : 'min-h-full'}`}>
            {displayDays.map((cell, idx) => {
              const dayEvents = events.filter(e => 
                e.day === cell.day && 
                e.month === cell.month && 
                e.year === cell.year
              );

              const isToday = cell.day === new Date().getDate() && 
                              cell.month === new Date().getMonth() &&
                              cell.year === new Date().getFullYear();

              return (
                <div 
                  key={idx} 
                  className={`min-h-37.5 border-r border-b ${styles.border} p-3 transition-colors hover:bg-white/2 relative group`}
                >
                  {cell.day && (
                    <>
                      <span className={`text-xs font-black mb-3 block ${
                        isToday ? 'bg-[#7c3aed] text-white w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-purple-500/30' : styles.textMuted
                      }`}>
                        {cell.day}
                      </span>
                      
                      <div className="space-y-1.5">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            onClick={() => { setSelectedLeave(event); setIsViewModalOpen(true); }}
                            className={`group/item text-[10px] px-2.5 py-2 rounded-xl border cursor-pointer relative transition-all hover:translate-y-0.5 font-bold ${getEventStyle(event.status)}`}
                          >
                            <div className="flex justify-between items-center pr-1">
                               <span className="truncate max-w-[80%]">{event.name}</span>
                               <div className="hidden group-hover/item:flex items-center gap-1 ml-1">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedLeave(event); setIsEditModalOpen(true); }} className="hover:text-current opacity-70 hover:opacity-100 transition-all">
                                    <Edit3 size={12}/>
                                  </button>
                                  <button onClick={(e) => handleDelete(event.id, e)} className="hover:text-red-500 transition-colors">
                                    <Trash2 size={12}/>
                                  </button>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {!cell.day && <div className={`absolute inset-0 ${isDark ? 'bg-black/5' : 'bg-slate-50/50'}`}></div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddLeaveCalendarModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} theme={theme} />
      <EditLeaveCalendarModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} theme={theme} data={selectedLeave} />
      <ViewLeaveCalendarModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} theme={theme} data={selectedLeave} />
    </main>
  );
};

export default LeaveCalendar;