import React, { useState, useMemo } from 'react';
import { 
  Users, GitMerge, Search, Filter, 
  Download, Plus, MoreVertical, Edit, 
  Trash2, Eye, ShieldCheck, Map, UserPlus, 
  AlertCircle, RefreshCcw, ChevronRight, Share2,
  ChevronLeft, ChevronDown
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Import Modals
import EditStructure from '../../modals/admin/EditStructure';
import ViewStructure from '../../modals/admin/ViewStructure';

const Structure = () => {
  // Logic: Sync with the global layout theme
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('assignment');
  const [selectedDept, setSelectedDept] = useState('Executive');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Inline Form State (Add/Update Hierarchy)
  const [newAssignment, setNewAssignment] = useState({
    employeeName: '',
    supervisorName: ''
  });

  // Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  // Core Data State
  const [assignments, setAssignments] = useState([
    { id: 1, emp: "Thomas Clark", dept: "Finance", pos: "Accountant", role: "Supervisor", supervisor: "Sarah Johnson", img: "https://i.pravatar.cc/32?img=11" },
    { id: 2, emp: "Sarah Johnson", dept: "HR", pos: "HR Director", role: "Admin", supervisor: "John Smith", img: "https://i.pravatar.cc/32?img=5" },
    { id: 3, emp: "Kevin Hart", dept: "IT", pos: "DevOps", role: "Staff", supervisor: "Michael Chen", img: "https://i.pravatar.cc/32?img=8" },
    { id: 4, emp: "John Smith", dept: "Executive", pos: "CEO", role: "Admin", supervisor: "None", img: "https://i.pravatar.cc/32?img=12" },
    { id: 5, emp: "Michael Chen", dept: "IT", pos: "Lead Dev", role: "Supervisor", supervisor: "John Smith", img: "https://i.pravatar.cc/32?img=13" },
    { id: 6, emp: "Emily Davis", dept: "Finance", pos: "Junior Accountant", role: "Staff", supervisor: "Thomas Clark", img: "https://i.pravatar.cc/32?img=1" },
    { id: 7, emp: "Robert Wilson", dept: "IT", pos: "Backend Dev", role: "Staff", supervisor: "Michael Chen", img: "https://i.pravatar.cc/32?img=2" },
    { id: 8, emp: "Sophia Brown", dept: "HR", pos: "Recruiter", role: "Staff", supervisor: "Sarah Johnson", img: "https://i.pravatar.cc/32?img=3" },
  ]);

  // --- Handlers ---
  const handleUpdateHierarchy = () => {
    if (!newAssignment.employeeName || !newAssignment.supervisorName) {
      alert("Please select both an employee and a supervisor.");
      return;
    }
    const updated = assignments.map(asg => 
      asg.emp === newAssignment.employeeName 
      ? { ...asg, supervisor: newAssignment.supervisorName } 
      : asg
    );
    setAssignments(updated);
    setNewAssignment({ employeeName: '', supervisorName: '' });
    setCurrentPage(1);
  };

  const handleSaveEdit = (updatedData) => {
    setAssignments(assignments.map(asg => asg.id === updatedData.id ? updatedData : asg));
    setIsEditOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm("Remove this reporting relationship?")) {
      const updatedFiltered = assignments.filter(a => a.id !== id);
      setAssignments(updatedFiltered);
      const maxPage = Math.ceil(updatedFiltered.length / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) setCurrentPage(maxPage);
    }
  };

  // --- Filtering & Pagination Logic ---
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => 
      a.emp.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignments, searchTerm]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  
  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssignments.slice(start, start + itemsPerPage);
  }, [filteredAssignments, currentPage]);

  const deptMembers = assignments.filter(a => a.dept === selectedDept);

  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-[3rem] overflow-hidden transition-all duration-500`,
    tabBtn: (active) => `py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 px-8 ${
      active ? 'text-[#7c3aed] border-[#7c3aed]' : `border-transparent ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`
    }`,
    input: `w-full p-4 rounded-2xl border transition-all appearance-none text-sm font-bold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 ${
        isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`,
    label: `text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`
  };

  return (
    <main className={`flex-1 p-6 lg:p-10 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      {/* Header Area */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-[0.3em] mb-3">Organization &nbsp; • &nbsp; Hierarchy</p>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Structure & Flow</h1>
        </div>
        <div className="flex gap-4">
          <button className={`flex items-center gap-2 border px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <Share2 size={16}/> Share Structure
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {/* Tab Selection */}
        <div className={`flex gap-4 px-8 border-b transition-colors ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'} overflow-x-auto no-scrollbar`}>
          <button onClick={() => setActiveTab('assignment')} className={styles.tabBtn(activeTab === 'assignment')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><Users size={18}/> Assignments</div>
          </button>
          <button onClick={() => setActiveTab('relationships')} className={styles.tabBtn(activeTab === 'relationships')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><GitMerge size={18}/> Visual Tree</div>
          </button>
        </div>

        <div className="p-8 lg:p-12">
          {activeTab === 'assignment' ? (
            /* TAB 1: ASSIGNMENT INTERFACE */
            <div className="space-y-10 animate-in fade-in duration-300">
              
              {/* Add/Update Quick Form */}
              <div className={`p-8 lg:p-10 rounded-[2.5rem] border-2 border-dashed transition-all ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                    <UserPlus size={24}/>
                  </div>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Configure Reporting Line</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Connect employees to their direct managers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-1 relative">
                    <label className={styles.label}>Subordinate</label>
                    <div className="relative">
                      <select 
                        value={newAssignment.employeeName}
                        onChange={(e) => setNewAssignment({...newAssignment, employeeName: e.target.value})}
                        className={styles.input}
                      >
                        <option value="">Choose Employee...</option>
                        {assignments.map(a => <option key={a.id} value={a.emp}>{a.emp}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"/>
                    </div>
                  </div>
                  <div className="space-y-1 relative">
                    <label className={styles.label}>Direct Supervisor</label>
                    <div className="relative">
                      <select 
                        value={newAssignment.supervisorName}
                        onChange={(e) => setNewAssignment({...newAssignment, supervisorName: e.target.value})}
                        className={styles.input}
                      >
                        <option value="">Choose Manager...</option>
                        <option value="None">Independent (Top Level)</option>
                        {assignments.filter(a => a.role !== 'Staff').map(a => <option key={a.id} value={a.emp}>{a.emp}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"/>
                    </div>
                  </div>
                  <button onClick={handleUpdateHierarchy} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95">
                    <RefreshCcw size={16}/> Sync Hierarchy
                  </button>
                </div>
              </div>

              {/* Assignments Table */}
              <div className="space-y-6">
                <div className="relative group">
                  <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-[#7c3aed]' : 'text-slate-400'}`} size={20} />
                  <input 
                    type="text" 
                    placeholder="Search structure by name, department or role..." 
                    className={`${styles.input} pl-14 py-5 text-base`}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-[0.2em] font-black`}>
                        <th className="pb-4 px-6">Employee</th>
                        <th className="pb-4 px-6">Org Details</th>
                        <th className="pb-4 px-6">Reporting Authority</th>
                        <th className="pb-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData.map(item => (
                        <tr key={item.id} className={`group transition-all ${isDark ? 'hover:bg-white/3' : 'hover:bg-slate-50'}`}>
                          <td className={`py-5 px-6 rounded-l-3xl border-y border-l transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                            <div className="flex items-center gap-4">
                              <img src={item.img} className="w-12 h-12 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform" alt=""/>
                              <span className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.emp}</span>
                            </div>
                          </td>
                          <td className={`py-5 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                            <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.dept}</p>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#7c3aed]">{item.pos}</span>
                          </td>
                          <td className={`py-5 px-6 border-y transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                            {item.supervisor === "None" ? (
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-500/5 px-3 py-1.5 rounded-lg border border-slate-500/10 italic">Lvl 0: Independent</span>
                            ) : (
                              <div className="flex items-center gap-2.5 bg-[#7c3aed]/10 px-4 py-2 rounded-xl border border-[#7c3aed]/10 w-fit">
                                <ShieldCheck size={14} className="text-[#7c3aed]"/>
                                <span className="text-[11px] font-black uppercase tracking-tight text-[#7c3aed]">{item.supervisor}</span>
                              </div>
                            )}
                          </td>
                          <td className={`py-5 px-6 rounded-r-3xl border-y border-r text-right transition-colors ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-white'}`}>
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => { setSelectedRelationship(item); setIsViewOpen(true); }} 
                                className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]'}`}
                              >
                                <Eye size={18}/>
                              </button>
                              <button 
                                onClick={() => { setSelectedRelationship(item); setIsEditOpen(true); }} 
                                className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-[#7c3aed]' : 'border-slate-100 text-slate-400 hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]'}`}
                              >
                                <Edit size={18}/>
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)} 
                                className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-slate-500 hover:text-white hover:bg-red-500' : 'border-slate-100 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                              >
                                <Trash2 size={18}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {filteredAssignments.length > 0 && (
                  <div className={`flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t transition-colors ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} Nodes
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5' : 'border-slate-100'} ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#7c3aed] hover:text-white'}`}
                      >
                        <ChevronLeft size={18}/>
                      </button>

                      <div className="flex gap-1.5">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                              currentPage === i + 1 
                              ? 'bg-[#7c3aed] text-white shadow-lg' 
                              : `border ${isDark ? 'border-white/5 text-slate-500 hover:bg-white/5' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/5' : 'border-slate-100'} ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#7c3aed] hover:text-white'}`}
                      >
                        <ChevronRight size={18}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: RELATIONSHIP TREE VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-in slide-in-from-right-4 duration-500">
              
              {/* Dept Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-6 text-center lg:text-left">Directory</h4>
                {['Executive', 'Finance', 'IT', 'HR'].map(dept => (
                  <button 
                    key={dept} 
                    onClick={() => setSelectedDept(dept)}
                    className={`w-full text-left p-6 rounded-4xl border transition-all flex justify-between items-center ${
                      selectedDept === dept 
                      ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-2xl shadow-purple-500/30 translate-x-2' 
                      : `border-transparent ${isDark ? 'text-slate-500 hover:bg-white/5 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`
                    }`}
                  >
                    <span className="text-sm font-black uppercase tracking-widest">{dept}</span>
                    <ChevronRight size={18} className={selectedDept === dept ? 'opacity-100' : 'opacity-20'}/>
                  </button>
                ))}
              </div>

              {/* Tree Visualization */}
              <div className={`lg:col-span-3 min-h-150 border transition-all ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-100 bg-slate-50/50'} rounded-[3rem] p-10 flex flex-col items-center`}>
                <div className="mb-16 text-center">
                   <h3 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedDept} Hierarchy</h3>
                   <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-2">Interactive Reporting Architecture</p>
                </div>

                <div className="flex flex-col items-center gap-16 w-full max-w-2xl">
                  {deptMembers.map((member, idx) => (
                    <div key={member.id} className="relative flex flex-col items-center w-full">
                      {idx !== 0 && (
                        <div className="absolute -top-16 flex flex-col items-center h-16">
                           <div className="w-0.5 h-full bg-linear-to-b from-[#7c3aed]/0 via-[#7c3aed]/30 to-[#7c3aed]/60"></div>
                        </div>
                      )}
                      <div 
                        onClick={() => { setSelectedRelationship(member); setIsViewOpen(true); }}
                        className={`w-full max-w-sm p-8 rounded-[2.5rem] border group transition-all cursor-pointer text-center relative ${
                          isDark 
                          ? 'bg-[#0f172a] border-white/10 hover:border-[#7c3aed] shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                          : 'bg-white border-slate-200 hover:border-[#7c3aed] shadow-xl shadow-slate-200/50'
                        }`}
                      >
                        <div className="relative inline-block mb-5">
                          <img src={member.img} className="w-20 h-20 rounded-[1.8rem] border-4 border-[#7c3aed]/10 group-hover:scale-110 group-hover:rotate-3 transition-transform" alt=""/>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#7c3aed] rounded-xl flex items-center justify-center text-white border-4 border-current transition-colors duration-500" style={{ color: isDark ? '#0f172a' : '#ffffff' }}>
                             <ShieldCheck size={14}/>
                          </div>
                        </div>
                        <h4 className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.emp}</h4>
                        <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-[0.2em] mt-1 mb-6">{member.pos}</p>
                        
                        <div className={`pt-5 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} flex flex-col gap-1`}>
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Immediate Supervisor</span>
                           <span className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{member.supervisor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals - PASSED THEME EXPLICITLY HERE */}
      <ViewStructure 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        data={selectedRelationship} 
        theme={theme} 
      />
      <EditStructure 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        data={selectedRelationship} 
        onSave={handleSaveEdit} 
        theme={theme}
      />
    </main>
  );
};

export default Structure;