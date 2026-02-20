import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronDown, 
  Eye, Palette, CheckCircle2, XCircle, 
  Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

// External Modals - Only View Modal retained
import ViewLeaveTypeModal from '../../modals/manager/ViewLeaveType';

const LeaveType = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // --- Fetch Data from Backend ---
  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      // Ensure the endpoint matches your updated API structure
      const response = await axios.get('http://localhost:5000/api/auth/leave-types');
      setLeaveTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // --- Theme Styles Logic ---
  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-[3rem] overflow-hidden transition-all duration-500`,
    input: `w-full p-4 rounded-2xl border transition-all appearance-none text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 ${
        isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`,
  };

  // --- Filter & Sort Logic ---
  const filteredLeaveTypes = useMemo(() => {
    let result = leaveTypes.filter(type => 
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortBy === 'A - Z') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Approval Required') {
      result = result.filter(type => type.requiresApproval);
    }
    
    return result;
  }, [searchTerm, leaveTypes, sortBy]);

  // --- Handlers ---
  const handleOpenView = (type) => {
    setSelectedLeave(type);
    setIsViewModalOpen(true);
  };

  return (
    <main className={`flex-1 p-6 lg:p-10 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      
      {/* Header Area */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-[0.3em] mb-3">Configuration &nbsp; • &nbsp; Settings</p>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Leave Categories</h1>
        </div>
      </div>

      <div className={styles.card}>
        {/* Toolbar */}
        <div className={`flex flex-col md:flex-row gap-6 p-8 lg:px-12 border-b transition-colors ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="relative flex-1 group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-[#7c3aed]' : 'text-slate-400'}`} size={20} />
            <input 
              type="text" 
              placeholder={`Search across ${leaveTypes.length} leave types...`} 
              className={`${styles.input} pl-14 py-5 text-base`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative min-w-50">
            <select 
              className={styles.input}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Newest</option>
              <option>A - Z</option>
              <option>Approval Required</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"/>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-12 overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
               <p className="text-xs font-black uppercase tracking-widest opacity-50">Syncing Database...</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-[0.2em] font-black`}>
                  <th className="pb-4 px-6 w-16 text-center">ID</th>
                  <th className="pb-4 px-6">Leave Designation</th>
                  <th className="pb-4 px-6">Definition</th>
                  <th className="pb-4 px-6">Protocols</th>
                  <th className="pb-4 px-6">Allowances</th>
                  <th className="pb-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaveTypes.map((type, index) => (
                  <tr key={type.id} className="group transition-all">
                    <td className={`py-6 px-6 text-center rounded-l-4xl border-y border-l font-black text-xs ${isDark ? 'border-white/5 bg-white/1 text-slate-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    
                    <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl shadow-inner border-4 border-white/10" style={{ backgroundColor: type.color }} />
                        <span className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{type.name}</span>
                      </div>
                    </td>

                    <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <span className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'} line-clamp-1 max-w-70`}>
                        {type.description || "No description provided."}
                      </span>
                    </td>

                    <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      {type.requiresApproval ? (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                          <CheckCircle2 size={12} strokeWidth={3} /> Verified Approval
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20 uppercase tracking-widest">
                          <XCircle size={12} strokeWidth={3} /> No Approval
                        </div>
                      )}
                    </td>

                    <td className={`py-6 px-6 border-y ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <div className="flex flex-col">
                        <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{type.maxDays} Days</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#7c3aed]">{type.accrual}</span>
                      </div>
                    </td>

                    <td className={`py-6 px-6 rounded-r-4xl border-y border-r text-right ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenView(type)} 
                          className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white'}`}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredLeaveTypes.length === 0 && (
            <div className={`py-32 text-center rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-slate-50/50'}`}>
              <Palette size={48} className={`mx-auto mb-4 opacity-20 ${isDark ? 'text-white' : 'text-slate-900'}`} />
              <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>No Data Found</h3>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      <ViewLeaveTypeModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        theme={theme} 
        data={selectedLeave} 
      />
    </main>
  );
};

export default LeaveType;