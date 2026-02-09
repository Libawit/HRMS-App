import React, { useState, useMemo } from 'react';
import { 
  Users, GitMerge, Search, Eye, ShieldCheck, 
  ChevronRight, Info, Lock
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Import only the View modal as Edit is restricted for employees
import ViewStructure from '../../modals/employee/ViewStructure';

const Structure = () => {
  // --- Theme Logic via useOutletContext ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Current User Identity ---
  // In a production app, this would come from your Auth Context
  const currentUser = { name: "John Smith", role: "Admin", dept: "Executive" };

  const [activeTab, setActiveTab] = useState('assignment');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  // --- Full Data (Simulated Database) ---
  const allAssignments = [
    { id: 1, emp: "Thomas Clark", dept: "Finance", pos: "Accountant", role: "Supervisor", supervisor: "Sarah Johnson", img: "https://i.pravatar.cc/32?img=11" },
    { id: 2, emp: "Sarah Johnson", dept: "HR", pos: "HR Director", role: "Admin", supervisor: "John Smith", img: "https://i.pravatar.cc/32?img=5" },
    { id: 3, emp: "Kevin Hart", dept: "IT", pos: "DevOps", role: "Staff", supervisor: "Michael Chen", img: "https://i.pravatar.cc/32?img=8" },
    { id: 4, emp: "John Smith", dept: "Executive", pos: "CEO", role: "Admin", supervisor: "None", img: "https://i.pravatar.cc/32?img=12" },
    { id: 5, emp: "Michael Chen", dept: "IT", pos: "Lead Dev", role: "Supervisor", supervisor: "John Smith", img: "https://i.pravatar.cc/32?img=13" },
    { id: 8, emp: "Sophia Brown", dept: "HR", pos: "Recruiter", role: "Staff", supervisor: "Sarah Johnson", img: "https://i.pravatar.cc/32?img=3" },
  ];

  // --- Privacy Logic: Filter for ONLY the current user's immediate circle ---
  const myStructure = useMemo(() => {
    const userRecord = allAssignments.find(u => u.emp === currentUser.name);
    return allAssignments.filter(a => 
      a.emp === currentUser.name || // Himself
      a.supervisor === currentUser.name || // His direct reports
      (userRecord && a.emp === userRecord.supervisor) // His direct boss
    );
  }, [currentUser.name]);

  const styles = {
    card: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[2rem] overflow-hidden`,
    tabBtn: (active) => `py-4 text-sm font-bold transition-all border-b-2 px-6 ${
      active ? 'text-[#7c3aed] border-[#7c3aed]' : `border-transparent ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`
    }`,
  };

  return (
    <main className={`flex-1 p-6 md:p-10 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'} overflow-y-auto`}>
      {/* Header Area */}
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
        {/* Tab Selection */}
        <div className="flex gap-4 px-8 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('assignment')} className={styles.tabBtn(activeTab === 'assignment')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><Users size={18}/> My Team</div>
          </button>
          <button onClick={() => setActiveTab('relationships')} className={styles.tabBtn(activeTab === 'relationships')}>
            <div className="flex items-center gap-2 whitespace-nowrap"><GitMerge size={18}/> Organization Chart</div>
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'assignment' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-6">
                <Info size={18} className="text-blue-500"/>
                <p className={`text-xs ${isDark ? 'text-blue-200/70' : 'text-blue-700'}`}>
                    You are viewing your immediate reporting structure. To request a change in your supervisor assignment, please contact HR.
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
                      <tr key={item.id} className="group hover:bg-white/2 transition-colors">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <img src={item.img} className="w-10 h-10 rounded-2xl border border-white/10" alt=""/>
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.emp}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                           {item.emp === currentUser.name ? (
                             <span className="text-[10px] font-black uppercase px-3 py-1 bg-white/5 text-white rounded-lg">You</span>
                           ) : item.supervisor === currentUser.name ? (
                             <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">Direct Report</span>
                           ) : (
                             <span className="text-[10px] font-black uppercase px-3 py-1 bg-[#7c3aed]/10 text-[#7c3aed] rounded-lg">Supervisor</span>
                           )}
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-xs font-bold text-[#94a3b8]">{item.dept}</p>
                          <span className="text-[9px] font-black uppercase text-[#7c3aed]">{item.pos}</span>
                        </td>
                        <td className="py-5 px-4 text-right">
                          <button 
                            onClick={() => { setSelectedRelationship(item); setIsViewOpen(true); }} 
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
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
            <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-500">
              <div className="mb-12 text-center">
                 <h3 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>My Hierarchy Tree</h3>
                 <p className="text-xs text-[#94a3b8] font-medium">Visual representation of your reporting path</p>
              </div>

              

[Image of corporate organizational structure]


              <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
                {myStructure
                  .sort((a, b) => (a.supervisor === "None" ? -1 : 1)) // Put boss on top
                  .map((member, idx) => (
                  <div key={member.id} className="relative flex flex-col items-center">
                    {idx !== 0 && <div className="absolute -top-12 w-0.5 h-12 bg-[#7c3aed]/30"></div>}
                    <div className={`w-72 p-6 rounded-4xl border ${isDark ? 'bg-[#0f172a] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'} group text-center`}>
                      <img src={member.img} className="w-16 h-16 rounded-2xl mx-auto mb-4 border-2 border-[#7c3aed]/20" alt=""/>
                      <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.emp}</h4>
                      <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mb-4">{member.pos}</p>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
                         <ShieldCheck size={14} className="text-emerald-500"/>
                         <span className="text-[10px] font-black text-[#94a3b8] uppercase">
                            {member.supervisor === "None" ? "Independent" : `Reports to: ${member.supervisor}`}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Modal Only */}
      <ViewStructure isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} data={selectedRelationship} />
    </main>
  );
};

export default Structure;