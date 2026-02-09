import React from 'react';
import { X, ShieldCheck, ArrowRight, UserCheck, Building, Target } from 'lucide-react';

const ViewStructure = ({ isOpen, onClose, data, theme = 'dark' }) => {
  if (!isOpen || !data) return null;
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-3000 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-[3rem] border ${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl shadow-purple-500/10' : 'bg-white border-slate-200 shadow-xl'} overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className="p-10 flex flex-col items-center text-center">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white transition-colors">
            <X size={24}/>
          </button>
          
          <img src={data.img} className="w-24 h-24 rounded-4xl border-4 border-[#7c3aed]/20 mb-6 object-cover" alt=""/>
          <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.emp}</h2>
          <p className="text-[#7c3aed] font-black text-xs uppercase tracking-widest mt-1">{data.pos} • {data.dept}</p>

          <div className="grid grid-cols-2 gap-4 w-full mt-10">
            <div className={`p-6 rounded-4xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <ShieldCheck size={16}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Reports To</span>
              </div>
              <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.supervisor}</p>
            </div>
            <div className={`p-6 rounded-4xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Target size={16}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Direct Reports</span>
              </div>
              <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>14 Staff</p>
            </div>
          </div>

          <div className="w-full mt-10 pt-10 border-t border-white/5 flex flex-col gap-4">
             <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">● Hierarchy Verified</span>
             </div>
             <button onClick={onClose} className="w-full py-5 bg-[#7c3aed] text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-500/20 hover:bg-[#6d28d9] transition-all">
                Close Relationship View
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStructure;