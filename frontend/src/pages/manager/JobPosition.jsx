import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Briefcase, 
  DollarSign,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

// Modals
import AddJobPositionModal from '../../modals/manager/AddJobPosition';
import EditJobPositionModal from '../../modals/manager/EditJobPosition';

const JobPosition = () => {
  // --- Context Integration ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  
  // FIXED: Fallback updated to 'ICT'
  const managerDept = context?.managerDept || 'ICT'; 

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Mock Data ---
  // Note: Ensure your data includes 'ICT' entries to see them in the list
  const [positions, setPositions] = useState([
    { id: 1, title: 'Network Administrator', dept: 'ICT', salary: '$5,000 - $7,000', created: 'Jan 10, 2024', type: 'Full-time', requirements: 'Cisco Certified, Routing & Switching' },
    { id: 2, title: 'IT Support Specialist', dept: 'ICT', salary: '$3,500 - $5,000', created: 'Feb 05, 2024', type: 'Full-time', requirements: 'Hardware Troubleshooting, Active Directory' },
    { id: 3, title: 'Cybersecurity Analyst', dept: 'ICT', salary: '$7,500 - $11,000', created: 'Feb 12, 2024', type: 'Remote', requirements: 'CompTIA Security+, PenTesting' },
    { id: 4, title: 'Senior Software Engineer', dept: 'Engineering', salary: '$8,000 - $12,000', created: 'Oct 15, 2023', type: 'Full-time', requirements: '5+ years Exp, React, Node.js' },
  ]);

  // --- Theme Styles ---
  const styles = {
    bgBody: theme === 'dark' ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: theme === 'dark' ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: theme === 'dark' ? 'border-white/10' : 'border-slate-200',
    textMain: theme === 'dark' ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#64748b]',
    badgeBg: theme === 'dark' ? 'bg-white/5' : 'bg-slate-100',
  };

  // --- Manager Filtering Logic ---
  const filteredPositions = useMemo(() => {
    return positions.filter(pos => {
      const isMyDept = pos.dept === managerDept;
      const matchesSearch = pos.title.toLowerCase().includes(searchTerm.toLowerCase());
      return isMyDept && matchesSearch;
    });
  }, [searchTerm, positions, managerDept]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  const paginatedPositions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPositions.slice(start, start + itemsPerPage);
  }, [filteredPositions, currentPage]);

  // --- Handlers ---
  const handleEdit = (job) => {
    setCurrentJob(job);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this position? This action is permanent.")) {
      setPositions(positions.filter(p => p.id !== id));
    }
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody}`}>
      {/* Breadcrumb */}
      <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${styles.textMuted} mb-2`}>
        Organization <span className="text-[8px]">/</span> {managerDept} <span className="text-[8px]">/</span> Job Positions
      </div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-3xl font-black tracking-tight ${styles.textMain}`}>Manager Portal</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck size={12} /> DEPT ACCESS
            </span>
          </div>
          {/* Dynamically renders ICT now */}
          <p className={`text-sm ${styles.textMuted}`}>Manage roles and requirements for the <span className="font-bold text-[#7c3aed]">{managerDept}</span> department</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 active:scale-95"
        >
          <Plus size={18} /> New Position
        </button>
      </div>

      <div className={`${styles.bgCard} border ${styles.border} rounded-2xl overflow-hidden`}>
        {/* Search Toolbar */}
        <div className={`p-5 border-b ${styles.border}`}>
          <div className={`flex items-center ${styles.bgInput} border ${styles.border} px-4 py-2.5 rounded-xl gap-3 w-full max-w-lg focus-within:border-[#7c3aed] transition-all`}>
            <Search size={18} className={styles.textMuted} />
            <input 
              type="text" 
              placeholder={`Search roles in ${managerDept}...`} 
              className={`bg-transparent border-none outline-none text-sm w-full ${theme === 'dark' ? 'text-white' : 'text-slate-900'} placeholder:opacity-50`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`text-[11px] ${styles.textMuted} uppercase tracking-widest font-black border-b ${styles.border} bg-white/5`}>
                <th className="p-5 w-16 text-center">#</th>
                <th className="p-5">Job Details</th>
                <th className="p-5">Salary Band</th>
                <th className="p-5">Post Date</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.border}`}>
              {paginatedPositions.map((pos, index) => (
                <tr key={pos.id} className="hover:bg-[#7c3aed]/5 transition-colors group">
                  <td className={`p-5 text-center font-bold ${styles.textMuted}`}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${styles.bgInput} border ${styles.border} flex items-center justify-center text-[#7c3aed] shrink-0 shadow-sm`}>
                        <Briefcase size={22} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black text-[16px] tracking-tight ${styles.textMain}`}>{pos.title}</span>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${styles.badgeBg} ${styles.textMuted}`}>
                              <Clock size={12} /> {pos.type}
                            </span>
                            <span className={`text-[11px] ${styles.textMuted} font-medium line-clamp-1 opacity-70`}>{pos.requirements}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1.5 font-black text-emerald-500 bg-emerald-500/5 w-fit px-3 py-1 rounded-lg border border-emerald-500/10">
                      <DollarSign size={14} />
                      {pos.salary}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className={`flex items-center gap-2 ${styles.textMuted} font-bold text-[12px]`}>
                      <Calendar size={14} />
                      {pos.created}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(pos)}
                        className="p-2.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/20 text-blue-500 border border-blue-500/10 transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(pos.id)}
                        className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500 border border-red-500/10 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPositions.length === 0 && (
            <div className={`py-32 text-center ${styles.textMuted}`}>
              <Briefcase size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-black uppercase tracking-widest opacity-40">No positions found in {managerDept}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPositions.length > 0 && (
          <div className={`p-5 border-t ${styles.border} flex items-center justify-between bg-white/5`}>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.textMuted}`}>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${styles.border} ${styles.textMain} hover:bg-[#7c3aed] hover:text-white disabled:opacity-20 transition-all`}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${styles.border} ${styles.textMain} hover:bg-[#7c3aed] hover:text-white disabled:opacity-20 transition-all`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddJobPositionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        theme={theme}
        defaultDept={managerDept} 
      />

      {isEditModalOpen && (
        <EditJobPositionModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          theme={theme}
          data={currentJob}
        />
      )}
    </main>
  );
};

export default JobPosition;