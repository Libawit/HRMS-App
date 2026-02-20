import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Layers,
  Loader2,
  Filter,
  Users,
  Search
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

// Modals
import AddLeaveCalendarModal from '../../modals/admin/AddLeaveCalendar';
import ViewLeaveCalendarModal from '../../modals/admin/ViewLeaveCalendar';
import EditLeaveCalendarModal from '../../modals/admin/EditLeaveCalendar';

const LeaveCalendar = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const isDark = theme === 'dark';

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month'); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [depts, setDepts] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [filters, setFilters] = useState({ deptId: '', typeId: '', searchTerm: '' });

  // Modal Visibility States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // --- API Fetching ---
  // --- API Fetching ---
const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    const [leavesRes, deptsRes, typesRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/auth/leave-requests/calendar`, {
        // CHANGE THIS LINE: Set status to APPROVED
        params: { year, month, status: 'APPROVED' } 
      }),
      axios.get(`http://localhost:5000/api/auth/departments`),
      axios.get(`http://localhost:5000/api/auth/leave-types`)
    ]);

    setEvents(leavesRes.data);
    setDepts(deptsRes.data);
    setLeaveTypes(typesRes.data);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
}, [currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handleEditOpen = (event) => {
    setSelectedLeave(event);
    setIsViewModalOpen(false);
    // Timeout ensures clean UI transition between modals
    setTimeout(() => setIsEditModalOpen(true), 200);
  };

  // --- Filtered Events ---
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const fullName = `${e.user?.firstName} ${e.user?.lastName}`.toLowerCase();
      const matchSearch = fullName.includes(filters.searchTerm.toLowerCase());
      // Match department using the ID from the user object
      const matchDept = !filters.deptId || e.user?.departmentId === filters.deptId;
      const matchType = !filters.typeId || e.leaveTypeId === filters.typeId;
      return matchSearch && matchDept && matchType;
    });
  }, [events, filters]);

  // --- Calendar Math ---
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
    else if (viewMode === 'Week') newDate.setDate(currentDate.getDate() + (offset * 7));
    else newDate.setDate(currentDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const subText = isDark ? 'text-slate-400' : 'text-slate-500';
  const selectBg = isDark ? 'bg-[#1e293b]' : 'bg-white';

  return (
    <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      
      {/* Header */}
      <header className={`p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-100'}`}>
        <div>
          <nav className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 flex items-center gap-2 ${isDark ? 'text-purple-500' : 'text-indigo-600'}`}>
            <CalendarIcon size={12} strokeWidth={3} /> Team Schedule
          </nav>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-purple-500">{currentDate.getFullYear()}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-[#0f1623] border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            {['Month', 'Week', 'Day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  viewMode === mode 
                  ? 'bg-[#7c3aed] text-white shadow-xl shadow-purple-500/20' 
                  : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white p-4 rounded-2xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all">
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-80 border-r p-8 hidden lg:block overflow-y-auto ${isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="space-y-10">
            <div className={`p-6 rounded-4xl border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex gap-2">
                <button onClick={() => changeDate(-1)} className={`flex-1 py-2 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}><ChevronLeft size={16} className="mx-auto"/></button>
                <button onClick={() => setCurrentDate(new Date())} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-tighter rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}>Today</button>
                <button onClick={() => changeDate(1)} className={`flex-1 py-2 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}><ChevronRight size={16} className="mx-auto"/></button>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${subText}`}><Search size={12} /> Search Employee</div>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Employee name..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({...prev, searchTerm: e.target.value}))}
                  className={`w-full p-4 pl-12 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              </div>
            </div>

            <div className="space-y-4">
              <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${subText}`}><Users size={12} /> Department</div>
              <select 
                value={filters.deptId} 
                onChange={(e) => setFilters(prev => ({...prev, deptId: e.target.value}))} 
                className={`w-full p-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-[#0f172a] border-white/20 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'}`}
              >
                <option value="" className={selectBg}>All Departments</option>
                {depts.map(d => <option key={d.id} value={d.id} className={selectBg}>{d.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${subText}`}><Filter size={12} /> Leave Type</div>
              <select 
                value={filters.typeId} 
                onChange={(e) => setFilters(prev => ({...prev, typeId: e.target.value}))} 
                className={`w-full p-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-[#0f172a] border-white/20 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'}`}
              >
                <option value="" className={selectBg}>All Leave Types</option>
                {leaveTypes.map(t => <option key={t.id} value={t.id} className={selectBg}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${subText}`}><Layers size={12} strokeWidth={3} /> Color Key</div>
              <div className="space-y-4">
                {leaveTypes.map(type => (
                  <div key={type.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto relative p-4">
          {loading && <div className="absolute inset-0 z-50 bg-[#020617]/20 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={40} /></div>}

          <div className={`grid ${viewMode === 'Day' ? 'grid-cols-1' : 'grid-cols-7'} sticky top-0 z-30 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
            {viewMode !== 'Day' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-4 text-center text-[10px] font-black uppercase tracking-[0.3em] ${subText}`}>{day}</div>
            ))}
          </div>

          <div className="flex flex-col gap-px bg-transparent">
            {calendarWeeks.map((week, weekIdx) => (
              <div key={weekIdx} className={`relative min-h-35 grid ${viewMode === 'Day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
                {week.map((date, dayIdx) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  if (viewMode === 'Day' && date.toDateString() !== currentDate.toDateString()) return null;

                  return (
                    <div key={dayIdx} className={`border p-2 ${isDark ? 'border-white/5 bg-[#0b1220]/30' : 'border-slate-100 bg-white'} ${!isCurrentMonth && 'opacity-20'}`}>
                      <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? 'bg-purple-600 text-white shadow-lg' : subText}`}>
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}

                <div className="absolute inset-0 pointer-events-none mt-10 px-1 flex flex-col gap-1 overflow-hidden">
                  {filteredEvents.map(event => {
                    const start = new Date(event.startDate); start.setHours(0,0,0,0);
                    const end = new Date(event.endDate); end.setHours(0,0,0,0);
                    const weekStart = week[0];
                    const weekEnd = week[6];

                    if (end < weekStart || start > weekEnd) return null;

                    const startIdx = Math.max(0, Math.floor((start - weekStart) / 86400000));
                    const endIdx = Math.min(6, Math.floor((end - weekStart) / 86400000));
                    const span = endIdx - startIdx + 1;

                    const showName = (start >= weekStart && start <= weekEnd) || startIdx === 0;
                    const baseColor = event.leaveType?.color || '#64748b';

                    return (
                      <div
                        key={event.id}
                        onClick={() => { setSelectedLeave(event); setIsViewModalOpen(true); }}
                        style={{ 
                          marginLeft: `${(startIdx / 7) * 100}%`,
                          width: `${(span / 7) * 100}%`,
                          backgroundColor: `${baseColor}20`,
                          color: baseColor,
                          borderLeft: `4px solid ${baseColor}`
                        }}
                        className="pointer-events-auto h-8 flex items-center px-2 rounded-md text-[10px] font-black uppercase truncate cursor-pointer hover:brightness-125 transition-all mb-1"
                      >
                        {showName && (
                          <div className="flex items-center gap-1">
                             <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: baseColor}} />
                             {event.user?.firstName} {event.user?.lastName?.[0]}.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddLeaveCalendarModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); fetchData(); }} theme={theme} />
      <ViewLeaveCalendarModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} onEdit={() => handleEditOpen(selectedLeave)} theme={theme} data={selectedLeave} />
      <EditLeaveCalendarModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); fetchData(); }} theme={theme} data={selectedLeave} />
    </main>
  );
};

export default LeaveCalendar;