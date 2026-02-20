import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

// Modals
import ViewLeaveRequestModal from '../../modals/employee/ViewLeaveRequests';
import ApplyLeaveModal from '../../modals/employee/AddLeaveRequest';

const LeaveRequest = () => {
  // --- Theme & User Context ---
  const { theme, user } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [viewDate, setViewDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // --- Modal States ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- API Logic: Fetch ONLY current user's requests ---
  const fetchMyRequests = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/leave-requests', {
        params: {
          month: viewDate.getMonth() + 1,
          year: viewDate.getFullYear(),
          userId: user.id // This ensures the backend filters for only this employee
        }
      });
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching personal leave history:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [viewDate, user?.id]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  // --- Logic: Delete Request ---
  const handleDeleteRequest = async (id) => {
    if (window.confirm("Are you sure you want to delete this pending request?")) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/leave-requests/${id}`);
        fetchMyRequests(); // Refresh list after delete
      } catch (err) {
        alert("Failed to delete request. It may have already been processed.");
      }
    }
  };

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  // --- Filtering & Stats ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const typeName = req.leaveType?.name || req.type || "";
      const matchesSearch = typeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || req.status.toUpperCase() === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, requests]);

  const stats = useMemo(() => {
    return {
      pending: requests.filter(r => r.status.toUpperCase() === 'PENDING').length,
      approved: requests.filter(r => r.status.toUpperCase() === 'APPROVED').length,
      rejected: requests.filter(r => r.status.toUpperCase() === 'REJECTED').length
    };
  }, [requests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ";
    const s = status?.toUpperCase();
    if (s === 'APPROVED') return base + "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s === 'PENDING') return base + "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (s === 'REJECTED') return base + "bg-red-500/10 text-red-500 border-red-500/20";
    return base + "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} transition-colors duration-300`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-widest ${styles.textMuted} mb-2`}>
            Personal Portal &gt; My Requests
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${styles.textMain}`}>My Leave History</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#7c3aed]/20"
          >
            <Plus size={18} /> Apply for Leave
          </button>

          <div className="flex items-center gap-2 bg-[#7c3aed]/5 p-1 rounded-xl border border-[#7c3aed]/10">
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className={`p-2 rounded-lg ${styles.textMain} hover:bg-[#7c3aed]/10 transition-all`}>
              <ChevronLeft size={18} />
            </button>
            <div className={`px-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${styles.textMain}`}>
              {viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </div>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className={`p-2 rounded-lg ${styles.textMain} hover:bg-[#7c3aed]/10 transition-all`}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Clock />} title="My Pending" value={stats.pending} color="blue" theme={theme} />
        <StatCard icon={<CheckCircle2 />} title="My Approved" value={stats.approved} color="emerald" theme={theme} />
        <StatCard icon={<XCircle />} title="My Rejected" value={stats.rejected} color="red" theme={theme} />
      </div>

      <div className={`${styles.bgCard} border ${styles.border} rounded-2xl overflow-hidden shadow-sm`}>
        <div className={`p-5 border-b ${styles.border} flex flex-col md:flex-row gap-4 justify-between items-center`}>
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-4 py-2.5 rounded-xl gap-3 w-full max-w-lg focus-within:border-[#7c3aed] transition-all`}>
            <Search size={18} className={styles.textMuted} />
            <input 
              type="text" 
              placeholder="Search my history..." 
              className="bg-transparent border-none outline-none text-sm w-full text-inherit"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className={`${styles.bgInput} border ${styles.border} ${styles.textMain} text-xs font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#7c3aed] w-full md:w-auto`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-75">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-[#7c3aed]" size={32} />
              <p className={`text-xs font-bold ${styles.textMuted}`}>Fetching your records...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`text-[11px] ${styles.textMuted} uppercase tracking-wider font-bold border-b ${styles.border}`}>
                    <th className="p-4">Ref</th>
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4 text-center">Days</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${styles.border}`}>
                  {paginatedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#7c3aed]/5 transition-colors group">
                      <td className={`p-4 font-mono text-[10px] ${styles.textMuted}`}>#LR-{req.id.slice(-6)}</td>
                      <td className={`p-4 font-bold ${styles.textMain}`}>{req.leaveType?.name || req.type}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-bold ${styles.textMain}`}>
                            {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                          </span>
                          <span className={`text-[10px] ${styles.textMuted}`}>
                            Applied {new Date(req.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className={`p-4 text-center font-bold ${styles.textMain}`}>{req.daysRequested}</td>
                      <td className="p-4">
                        <span className={getStatusBadge(req.status)}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedItem(req); setIsViewModalOpen(true); }} 
                            className="p-2 rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {req.status.toUpperCase() === 'PENDING' && (
                            <button 
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                              title="Delete Request"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedRequests.length === 0 && (
                <div className={`p-16 text-center ${styles.textMuted}`}>
                  <User size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="italic font-medium">No personal records found for this period.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className={`p-4 border-t ${styles.border} flex items-center justify-between`}>
          <div className={`text-xs font-bold ${styles.textMuted}`}>
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className={`p-2 rounded-lg border ${styles.border} ${styles.textMain} hover:bg-white/5 disabled:opacity-30 transition-all`}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className={`p-2 rounded-lg border ${styles.border} ${styles.textMain} hover:bg-white/5 disabled:opacity-30 transition-all`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewLeaveRequestModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        theme={theme} 
        data={selectedItem} 
      />

      <ApplyLeaveModal 
        isOpen={isApplyModalOpen} 
        onClose={() => {
          setIsApplyModalOpen(false);
          fetchMyRequests(); // Refresh list if a new one was added
        }} 
        theme={theme}
        currentUser={user}
      />
    </main>
  );
};

const StatCard = ({ icon, title, value, color, theme }) => {
  const isDark = theme === 'dark';
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    red: 'bg-red-500/10 text-red-500'
  };
  return (
    <div className={`${isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm'} border ${isDark ? 'border-white/10' : 'border-slate-200'} p-6 rounded-2xl`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>{React.cloneElement(icon, { size: 24 })}</div>
        <div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
          <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>{title}</div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;