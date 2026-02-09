import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Calendar, CheckCircle2, Clock, 
  XCircle, Eye, Edit, Trash2, Download, AlertCircle, 
  ChevronDown, ChevronLeft, ChevronRight, Lock
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Manager-Specific Modals
import AddLeaveRequestModal from '../../modals/manager/AddLeaveRequest';
import EditLeaveRequestModal from '../../modals/manager/EditLeaveRequest';
import ViewLeaveRequestModal from '../../modals/manager/ViewLeaveRequest';

const LeaveRequest = () => {
  // --- Theme Logic: Sync with the global layout theme ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Manager Context ---
  const managerDept = "IT"; // Usually fetched from Auth Context

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [viewDate, setViewDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedRequests, setSelectedRequests] = useState([]);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- Mock Data ---
  const [requests, setRequests] = useState([
    { id: 1, name: "Kevin Hart", dept: "IT", type: "Annual Leave", from: "2026-01-10", to: "2026-01-15", days: 5, status: "Pending", appliedOn: "2026-01-12" },
    { id: 2, name: "Sarah Johnson", dept: "HR", type: "Sick Leave", from: "2026-01-20", to: "2026-01-21", days: 1, status: "Approved", appliedOn: "2026-01-18" },
    { id: 3, name: "Michael Chen", dept: "IT", type: "Personal Leave", from: "2026-01-25", to: "2026-01-25", days: 0.5, status: "Rejected", appliedOn: "2026-01-20" },
    { id: 4, name: "Robert Wilson", dept: "IT", type: "Annual Leave", from: "2026-01-14", to: "2026-01-16", days: 2, status: "Approved", appliedOn: "2026-01-05" },
  ]);

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const currentMonthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // --- Scoped Filter Logic ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const isMyDept = req.dept === managerDept;
      const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || req.status === statusFilter;
      
      const reqDate = new Date(req.from);
      const matchesMonth = reqDate.getMonth() === viewDate.getMonth() && 
                           reqDate.getFullYear() === viewDate.getFullYear();

      return isMyDept && matchesSearch && matchesStatus && matchesMonth;
    });
  }, [searchTerm, statusFilter, requests, viewDate, managerDept]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id) => {
    if (window.confirm("Remove this request from department records?")) {
      setRequests(requests.filter(r => r.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ";
    if (status === 'Approved') return base + "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (status === 'Pending') return base + "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return base + "bg-red-500/10 text-red-500 border-red-500/20";
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 transition-colors duration-500 ${styles.bgBody}`}>
      {/* Scoped Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock size={12} className="text-[#7c3aed]" />
            <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${styles.textMuted}`}>
              {managerDept} Department
            </p>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>Leave Management</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#7c3aed]/5 p-1.5 rounded-2xl border border-[#7c3aed]/10">
            <button onClick={handlePrevMonth} className={`p-2 rounded-xl ${styles.textMain} hover:bg-[#7c3aed]/10 transition-all`}><ChevronLeft size={18} /></button>
            <span className={`px-4 text-xs font-black uppercase tracking-widest ${styles.textMain}`}>{currentMonthLabel}</span>
            <button onClick={handleNextMonth} className={`p-2 rounded-xl ${styles.textMain} hover:bg-[#7c3aed]/10 transition-all`}><ChevronRight size={18} /></button>
          </div>
          
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-purple-500/20 active:scale-95">
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* Stats - Automatically scoped via filteredRequests */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Clock />} title="Our Pending" value={filteredRequests.filter(r => r.status === 'Pending').length} color="blue" theme={theme} />
        <StatCard icon={<CheckCircle2 />} title="Dept Approved" value={filteredRequests.filter(r => r.status === 'Approved').length} color="emerald" theme={theme} />
        <StatCard icon={<AlertCircle />} title="Rejected" value={filteredRequests.filter(r => r.status === 'Rejected').length} color="red" theme={theme} />
        <StatCard icon={<Calendar />} title="On Leave Now" value="3" color="purple" theme={theme} />
      </div>

      <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] overflow-hidden transition-all`}>
        {/* Table Toolbar */}
        <div className={`p-6 border-b ${styles.border} flex flex-col md:flex-row gap-4 justify-between items-center bg-linear-to-r from-transparent to-[#7c3aed]/5`}>
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-5 py-3.5 rounded-2xl gap-3 w-full max-w-md focus-within:border-[#7c3aed] transition-all`}>
            <Search size={18} className={styles.textMuted} />
            <input 
              type="text" 
              placeholder={`Search in ${managerDept}...`} 
              className={`bg-transparent border-none outline-none text-sm font-bold w-full ${isDark ? 'text-white' : 'text-slate-900'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-3.5 outline-none cursor-pointer focus:border-[#7c3aed] transition-all`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Scoped Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] ${styles.textMuted} uppercase tracking-[0.2em] font-black border-b ${styles.border}`}>
                <th className="p-6">Team Member</th>
                <th className="p-6">Type</th>
                <th className="p-6">Duration</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.border}`}>
              {paginatedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#7c3aed]/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] font-black text-xs border border-[#7c3aed]/20 shadow-lg shadow-[#7c3aed]/5">
                        {req.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className={`text-sm font-black tracking-tight ${styles.textMain}`}>{req.name}</div>
                        <div className={`text-[10px] font-bold ${styles.textMuted} uppercase`}>Ref: #LV-00{req.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`p-6 text-xs font-bold ${styles.textMain}`}>{req.type}</td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className={`text-xs font-black ${styles.textMain}`}>{req.from}</span>
                      <span className={`text-[10px] font-bold ${styles.textMuted} uppercase`}>{req.days} Total Days</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={getStatusBadge(req.status)}>{req.status}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedItem(req); setIsViewModalOpen(true); }} className="p-2.5 rounded-xl hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-all"><Eye size={18} /></button>
                      <button onClick={() => { setSelectedItem(req); setIsEditModalOpen(true); }} className="p-2.5 rounded-xl hover:bg-emerald-500/10 text-emerald-500 transition-all"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(req.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedRequests.length === 0 && (
            <div className="py-24 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-[#7c3aed]/20" />
              <p className={`text-sm font-bold ${styles.textMuted}`}>No department records found for this criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddLeaveRequestModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} theme={theme} defaultDept={managerDept} />
      <EditLeaveRequestModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} theme={theme} data={selectedItem} />
      <ViewLeaveRequestModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} theme={theme} data={selectedItem} />
    </main>
  );
};

const StatCard = ({ icon, title, value, color, theme }) => {
  const isDark = theme === 'dark';
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  return (
    <div className={`${isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm'} border ${isDark ? 'border-white/10' : 'border-slate-200'} p-6 rounded-4xl transition-all duration-500`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`text-3xl font-black mb-1 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</div>
    </div>
  );
};

export default LeaveRequest;