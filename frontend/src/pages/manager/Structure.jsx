import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, GitMerge, Search, Plus, Edit, 
  Trash2, Eye, ShieldCheck, UserPlus, 
  RefreshCcw, ChevronRight, Share2,
  ChevronLeft, Lock
} from 'lucide-react';

// Import Modals
import EditStructure from '../../modals/manager/EditStructure';
import ViewStructure from '../../modals/manager/ViewStructure'; // Path updated to manager context

const Structure = () => {
  // --- Context Integration ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const managerDept = context?.managerDept || 'IT'; 

  const [activeTab, setActiveTab] = useState('assignment');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newAssignment, setNewAssignment] = useState({
    employeeName: '',
    supervisorName: ''
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  const isDark = theme === 'dark';

  const [assignments, setAssignments] = useState([
    { id: 1, emp: "Thomas Clark", dept: "Finance", pos: "Accountant", role: "Supervisor", supervisor: "Sarah Johnson", img: "https://i.pravatar.cc/32?img=11" },
    { id: 2, emp: "Sarah Johnson", dept: "HR", pos: "HR Director", role: "Admin", supervisor: "John Smith", img: "https://i.pravatar.cc/32?img=5" },
    { id: 3, emp: "Kevin Hart", dept: "ICT", pos: "DevOps", role: "Staff", supervisor: "Michael Chen", img: "https://i.pravatar.cc/32?img=8" },
    { id: 5, emp: "Michael Chen", dept: "ICT", pos: "Lead Dev", role: "Supervisor", supervisor: "John Smith", img: "https://i.pravatar.cc/32?img=13" },
    { id: 7, emp: "Robert Wilson", dept: "ICT", pos: "Backend Dev", role: "Staff", supervisor: "Michael Chen", img: "https://i.pravatar.cc/32?img=2" },
  ]);

  const departmentalData = useMemo(() => {
    return assignments.filter(a => a.dept === managerDept);
  }, [assignments, managerDept]);

  const handleUpdateHierarchy = () => {
    if (!newAssignment.employeeName || !newAssignment.supervisorName) return;
    setAssignments(prev => prev.map(asg => 
      asg.emp === newAssignment.employeeName 
      ? { ...asg, supervisor: newAssignment.supervisorName } 
      : asg
    ));
    setNewAssignment({ employeeName: '', supervisorName: '' });
  };

  const handleSaveEdit = (updatedData) => {
    setAssignments(prev => prev.map(asg => asg.id === updatedData.id ? updatedData : asg));
    setIsEditOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm("Remove this reporting relationship?")) {
      setAssignments(prev => prev.filter(a => a.id !== id));
    }
  };

  const filteredAssignments = useMemo(() => {
    return departmentalData.filter(a => 
      a.emp.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departmentalData, searchTerm]);

  const currentTableData = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[2rem] overflow-hidden`,
    tabBtn: (active) => `py-4 text-sm font-bold transition-all border-b-2 px-6 ${
      active ? 'text-[#7c3aed] border-[#7c3aed]' : `border-transparent ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`
    }`,
    input: `w-full p-3.5 rounded-xl border ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-white border-slate-200'} text-sm font-bold outline-none focus:border-[#7c3aed] transition-all`
  };

  return (
    <main className={`flex-1 p-6 md:p-10 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'} overflow-y-auto`}>
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock size={12} className="text-[#7c3aed]" />
            <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">{managerDept} Department Control</p>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Team Structure</h1>
        </div>
        <button className="flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-5 py-3.5 rounded-2xl text-xs font-black text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-all">
          <Share2 size={16}/> EXPORT DEPT MAP
        </button>
      </div>

      <div className={styles.card}>
        <div className="flex gap-4 px-8 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('assignment')} className={styles.tabBtn(activeTab === 'assignment')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><Users size={18}/> Manage Reports</div>
          </button>
          <button onClick={() => setActiveTab('relationships')} className={styles.tabBtn(activeTab === 'relationships')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><GitMerge size={18}/> Visual Tree</div>
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'assignment' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Assignment Form */}
              <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                    <UserPlus size={20}/>
                  </div>
                  <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Assign Supervisor within {managerDept}</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Team Member</label>
                    <select 
                      value={newAssignment.employeeName}
                      onChange={(e) => setNewAssignment({...newAssignment, employeeName: e.target.value})}
                      className={styles.input}
                    >
                      <option value="">Select Employee...</option>
                      {departmentalData.map(a => <option key={a.id} value={a.emp}>{a.emp}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Report To</label>
                    <select 
                      value={newAssignment.supervisorName}
                      onChange={(e) => setNewAssignment({...newAssignment, supervisorName: e.target.value})}
                      className={styles.input}
                    >
                      <option value="">Select Supervisor...</option>
                      {assignments.filter(a => a.role !== 'Staff').map(a => <option key={a.id} value={a.emp}>{a.emp} ({a.dept})</option>)}
                    </select>
                  </div>
                  <button onClick={handleUpdateHierarchy} className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2">
                    <Plus size={16}/> UPDATE RELATION
                  </button>
                </div>
              </div>

              {/* Scoped Table */}
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                  <input 
                    type="text" 
                    placeholder={`Search within ${managerDept}...`} 
                    className={`${styles.input} pl-14 py-4`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-[#94a3b8] uppercase tracking-widest border-b border-white/5">
                        <th className="pb-5 px-4 font-black">Member</th>
                        <th className="pb-5 px-4 font-black">Current Role</th>
                        <th className="pb-5 px-4 font-black">Direct Supervisor</th>
                        <th className="pb-5 px-4 font-black text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentTableData.map(item => (
                        <tr key={item.id} className="group hover:bg-white/2 transition-colors">
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <img src={item.img} className="w-10 h-10 rounded-2xl border border-white/10" alt=""/>
                              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.emp}</span>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <span className="text-[10px] font-black uppercase text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-1 rounded-md">{item.pos}</span>
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#94a3b8]">
                              <ShieldCheck size={14} className="text-[#7c3aed]"/>
                              {item.supervisor}
                            </div>
                          </td>
                          <td className="py-5 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => { setSelectedRelationship(item); setIsViewOpen(true); }} 
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-emerald-400 transition-all"
                                title="View Relationship Details"
                              >
                                <Eye size={18}/>
                              </button>
                              <button 
                                onClick={() => { setSelectedRelationship(item); setIsEditOpen(true); }} 
                                className="p-2 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-500 transition-all"
                              >
                                <Edit size={18}/>
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)} 
                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all"
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
              </div>
            </div>
          ) : (
            /* Scoped Tree View */
            <div className="animate-in slide-in-from-right-4 duration-500">
              <div className="min-h-125 border border-white/5 rounded-[2.5rem] bg-white/1 p-10 flex flex-col items-center">
                <div className="mb-12 text-center">
                   <h3 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{managerDept} Team Map</h3>
                </div>

                <div className="flex flex-col items-center gap-12 w-full">
                  {departmentalData.map((member, idx) => (
                    <div key={member.id} className="relative flex flex-col items-center">
                      {idx !== 0 && <div className="absolute -top-12 w-0.5 h-12 bg-[#7c3aed]/30"></div>}
                      <div 
                        onClick={() => { setSelectedRelationship(member); setIsViewOpen(true); }} 
                        className={`w-72 p-6 rounded-4xl border ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'} hover:border-[#7c3aed] transition-all cursor-pointer text-center group`}
                      >
                        <div className="relative inline-block">
                          <img src={member.img} className="w-16 h-16 rounded-2xl mx-auto mb-4 border-2 border-[#7c3aed]/20 group-hover:scale-105 transition-all" alt=""/>
                          <div className="absolute -bottom-1 -right-1 bg-[#7c3aed] p-1 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye size={10} />
                          </div>
                        </div>
                        <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.emp}</h4>
                        <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest">{member.pos}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Components */}
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