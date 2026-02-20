import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, GitMerge, Eye, Lock, Info, Loader2, ShieldCheck } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig'; // Adjust path to your axios config
import ViewStructure from '../../modals/employee/ViewStructure';

const API_BASE = "http://localhost:5000/api";

const Structure = () => {
  const { theme, user: currentUser } = useOutletContext();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('assignment');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawStructure, setRawStructure] = useState([]);

  // --- Fetch Logic ---
  const fetchMyStructure = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // We fetch the whole department structure, then filter on the frontend for privacy
      const res = await axios.get(`${API_BASE}/structure?departmentId=${currentUser.departmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRawStructure(res.data);
    } catch (err) {
      console.error("Error fetching structure:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchMyStructure(); }, [fetchMyStructure]);

  // --- Privacy Logic: Filter for ONLY the current user's immediate circle ---
  const myStructure = useMemo(() => {
    if (!rawStructure.length || !currentUser) return [];

    return rawStructure.filter(item => 
      item.employeeId === currentUser.id || // The User
      item.managerId === currentUser.id ||  // Their Direct Reports
      // Check if this item is the User's boss
      rawStructure.some(inner => inner.employeeId === currentUser.id && inner.managerId === item.employeeId)
    );
  }, [rawStructure, currentUser]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
    </div>
  );

  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[2rem] overflow-hidden`,
    tabBtn: (active) => `py-4 text-sm font-bold transition-all border-b-2 px-6 ${
      active ? 'text-[#7c3aed] border-[#7c3aed]' : `border-transparent ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`
    }`,
  };

  return (
    <main className={`flex-1 p-6 md:p-10 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'} overflow-y-auto`}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Employee Portal</p>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>My Reporting Line</h1>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
          <Lock size={14}/>
          <span className="text-[10px] font-black uppercase tracking-widest">View Only Mode</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className="flex gap-4 px-8 border-b border-white/5">
          <button onClick={() => setActiveTab('assignment')} className={styles.tabBtn(activeTab === 'assignment')}>
            <div className="flex items-center gap-2"><Users size={18}/> My Team</div>
          </button>
          <button onClick={() => setActiveTab('relationships')} className={styles.tabBtn(activeTab === 'relationships')}>
            <div className="flex items-center gap-2"><GitMerge size={18}/> Hierarchy Tree</div>
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'assignment' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-6">
                <Info size={18} className="text-blue-500"/>
                <p className={`text-xs ${isDark ? 'text-blue-200/70' : 'text-blue-700'}`}>
                    You are viewing your immediate reporting circle.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-[#94a3b8] uppercase tracking-widest border-b border-white/5">
                      <th className="pb-5 px-4 font-black">Employee</th>
                      <th className="pb-5 px-4 font-black">Relationship</th>
                      <th className="pb-5 px-4 font-black">Dept / Role</th>
                      <th className="pb-5 px-4 font-black text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myStructure.map(item => (
                      <tr key={item.id} className="group hover:bg-white/2">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white font-bold">
                                {item.employee?.firstName?.charAt(0)}
                            </div>
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {item.employee?.firstName} {item.employee?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                           {item.employeeId === currentUser.id ? (
                             <span className="text-[10px] font-black uppercase px-3 py-1 bg-white/5 text-white rounded-lg">You</span>
                           ) : item.managerId === currentUser.id ? (
                             <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">Direct Report</span>
                           ) : (
                             <span className="text-[10px] font-black uppercase px-3 py-1 bg-[#7c3aed]/10 text-[#7c3aed] rounded-lg">Supervisor</span>
                           )}
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-xs font-bold text-[#94a3b8]">{item.department?.name}</p>
                          <span className="text-[9px] font-black uppercase text-[#7c3aed]">{item.jobPosition?.title}</span>
                        </td>
                        <td className="py-5 px-4 text-right">
                          <button 
                            onClick={() => { setSelectedRelationship(item); setIsViewOpen(true); }} 
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                          >
                            <Eye size={18}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-12 w-full">
                {myStructure
                  .sort((a, b) => (a.employeeId === currentUser.id ? 1 : a.managerId === currentUser.id ? 2 : -1)) 
                  .map((member, idx) => (
                    <div key={member.id} className="relative flex flex-col items-center">
                      {idx !== 0 && <div className="absolute -top-12 w-0.5 h-12 bg-[#7c3aed]/30"></div>}
                      <div className={`w-72 p-6 rounded-3xl border ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'} text-center`}>
                        <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {member.employee?.firstName} {member.employee?.lastName}
                        </h4>
                        <p className="text-[10px] font-bold text-[#7c3aed] uppercase mt-1">{member.jobPosition?.title}</p>
                        <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-center gap-2">
                           <ShieldCheck size={14} className="text-emerald-500"/>
                           <span className="text-[10px] font-black text-[#94a3b8] uppercase">
                              {member.manager ? `Reports to: ${member.manager.firstName}` : "Independent"}
                           </span>
                        </div>
                      </div>
                    </div>
                ))}
             </div>
          )}
        </div>
      </div>

      <ViewStructure isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} data={selectedRelationship} />
    </main>
  );
};

export default Structure;