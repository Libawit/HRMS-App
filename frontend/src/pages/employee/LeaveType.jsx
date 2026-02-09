import React, { useState, useMemo } from 'react';
import { 
  Search, ChevronDown, Eye, Palette, 
  CheckCircle2, XCircle 
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// External Modal - Kept only View for read-only context
import ViewLeaveTypeModal from '../../modals/admin/ViewLeaveType';

const LeaveType = () => {
  // Logic: Sync with the global layout theme via Outlet Context
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const isDark = theme === 'dark';

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // --- Mock Data ---
  const [leaveTypes] = useState([
    { id: 1, name: 'Annual Leave', color: '#4CAF50', description: 'Standard yearly vacation days for rest and recreation.', requiresApproval: true, maxDays: 20, accrual: 'Monthly', createdAt: '2023-01-01' },
    { id: 2, name: 'Sick Leave', color: '#F44336', description: 'Medical absence for recovery or doctor appointments.', requiresApproval: true, maxDays: 12, accrual: 'Fixed', createdAt: '2023-02-15' },
    { id: 3, name: 'Maternity Leave', color: '#9C27B0', description: 'Leave for childbirth and newborn childcare.', requiresApproval: true, maxDays: 90, accrual: 'One-time', createdAt: '2023-03-10' },
    { id: 4, name: 'Paternity Leave', color: '#673AB7', description: 'Parental leave specifically for new fathers.', requiresApproval: true, maxDays: 10, accrual: 'One-time', createdAt: '2023-04-05' },
    { id: 5, name: 'Bereavement Leave', color: '#FF9800', description: 'Compassionate leave for family loss.', requiresApproval: true, maxDays: 5, accrual: 'Fixed', createdAt: '2023-05-20' },
    { id: 6, name: 'Unpaid Leave', color: '#64748b', description: 'Authorized leave without pay for personal reasons.', requiresApproval: true, maxDays: 0, accrual: 'None', createdAt: '2023-06-12' },
    { id: 7, name: 'Personal Leave', color: '#E91E63', description: 'Time off for miscellaneous personal requirements.', requiresApproval: true, maxDays: 3, accrual: 'Fixed', createdAt: '2023-07-01' },
  ]);

  // --- Theme Styles Logic ---
  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-[3rem] overflow-hidden transition-all duration-500`,
    input: `w-full p-4 rounded-2xl border transition-all appearance-none text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 ${
        isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`
  };

  // --- Combined Filter & Sort Logic ---
  const processedLeaveTypes = useMemo(() => {
    // 1. Filter
    let result = leaveTypes.filter(type => 
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    return result.sort((a, b) => {
      if (sortBy === 'A - Z') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'Approval Required') {
        return (a.requiresApproval === b.requiresApproval) ? 0 : a.requiresApproval ? -1 : 1;
      } else {
        // Default: Newest (using ID or createdAt)
        return b.id - a.id;
      }
    });
  }, [searchTerm, sortBy, leaveTypes]);

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
        {/* Toolbar Selection */}
        <div className={`flex flex-col md:flex-row gap-6 p-8 lg:px-12 border-b transition-colors ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
          
          {/* Search Box */}
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

          {/* Sort Dropdown */}
          <div className="relative min-w-60">
            <select 
              className={styles.input}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">Newest First</option>
              <option value="A - Z">Alphabetical (A - Z)</option>
              <option value="Approval Required">Requires Approval</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"/>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-8 lg:p-12 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-[0.2em] font-black`}>
                <th className="pb-4 px-6 w-16 text-center">ID</th>
                <th className="pb-4 px-6">Leave Designation</th>
                <th className="pb-4 px-6">Definition</th>
                <th className="pb-4 px-6">Protocols</th>
                <th className="pb-4 px-6">Allowances</th>
                <th className="pb-4 px-6 text-right">Command</th>
              </tr>
            </thead>
            <tbody>
              {processedLeaveTypes.map((type, index) => (
                <tr key={type.id} className="group transition-all">
                  <td className={`py-6 px-6 text-center rounded-l-4xl border-y border-l font-black text-xs transition-colors ${isDark ? 'border-white/5 bg-white/1 text-slate-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                    {String(type.id).padStart(2, '0')}
                  </td>
                  
                  <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl shadow-inner border-4 border-white/10 transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {type.name}
                      </span>
                    </div>
                  </td>

                  <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                    <span className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'} line-clamp-1 max-w-70`}>
                      {type.description}
                    </span>
                  </td>

                  <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
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

                  <td className={`py-6 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{type.maxDays} Days</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#7c3aed]">{type.accrual} Accrual</span>
                    </div>
                  </td>

                  <td className={`py-6 px-6 rounded-r-4xl border-y border-r text-right transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenView(type)}
                        className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]'}`}
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {processedLeaveTypes.length === 0 && (
            <div className={`py-32 text-center rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-slate-50/50'}`}>
              <Palette size={48} className={`mx-auto mb-4 opacity-20 ${isDark ? 'text-white' : 'text-slate-900'}`} />
              <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>No Data Found</h3>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-[0.2em] mt-2`}>Try adjusting your search parameters</p>
            </div>
          )}
        </div>
      </div>

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