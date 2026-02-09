import React from 'react';
import { X, ShieldCheck, UserCheck, Target, TrendingUp, Users, Info } from 'lucide-react';

const ViewStructure = ({ isOpen, onClose, data, theme = 'dark' }) => {
  if (!isOpen || !data) return null;
  const isDark = theme === 'dark';

  // Specific styles for the Manager's analytical view
  const styles = {
    overlay: "fixed inset-0 bg-black/90 backdrop-blur-xl z-[3000] flex items-center justify-center p-4",
    card: `relative w-full max-w-2xl rounded-[3.5rem] border ${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} overflow-hidden animate-in zoom-in-95 duration-300`,
    statBox: `p-6 rounded-[2rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`,
    label: "text-[10px] font-black uppercase tracking-[0.2em] mb-1"
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-[#7c3aed]/10 to-transparent pointer-events-none" />

        <div className="p-10 flex flex-col items-center text-center relative z-10">
          <button onClick={onClose} className="absolute top-0 right-0 p-3 text-slate-500 hover:text-[#7c3aed] transition-colors">
            <X size={24}/>
          </button>
          
          {/* Employee Profile Header */}
          <div className="relative mb-6">
            <img src={data.img} className="w-28 h-28 rounded-[2.5rem] border-4 border-[#7c3aed]/20 object-cover shadow-2xl" alt=""/>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <UserCheck size={16}/>
            </div>
          </div>

          <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.emp}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-[#7c3aed] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
              {data.pos}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Dept: {data.dept}
            </span>
          </div>

          {/* Managerial Analytics Grid */}
          <div className="grid grid-cols-2 gap-5 w-full mt-10">
            <div className={styles.statBox}>
              <div className={`flex items-center gap-2 text-emerald-500 ${styles.label}`}>
                <ShieldCheck size={14}/>
                <span>Reports To</span>
              </div>
              <p className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.supervisor}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Direct Line Manager</p>
            </div>

            <div className={styles.statBox}>
              <div className={`flex items-center gap-2 text-blue-500 ${styles.label}`}>
                <Target size={14}/>
                <span>Span of Control</span>
              </div>
              <p className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>08 Members</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Direct Reports</p>
            </div>
          </div>

          {/* Departmental Insight Section */}
          <div className={`w-full mt-6 p-6 rounded-4xl border border-dashed ${isDark ? 'border-white/10 bg-white/2' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <TrendingUp size={16} className="text-[#7c3aed]"/>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Team Productivity Context</span>
               </div>
               <Info size={14} className="text-slate-600"/>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 text-left">
                <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Internal Seniority</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#7c3aed] w-[75%] h-full rounded-full" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Approval Rating</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 w-[92%] h-full rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full mt-8 pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#7c3aed]"/>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Team Member Since 2022</span>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="w-full py-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-500/20 transition-all active:scale-95"
            >
              Return to Department Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStructure;