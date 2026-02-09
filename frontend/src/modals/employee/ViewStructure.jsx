import React from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  Shield, 
  MapPin, 
  Building2,
  Calendar
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const ViewStructure = ({ isOpen, onClose, data }) => {
  // Use context if available, otherwise default to dark
  const context = useOutletContext();
  const isDark = context?.theme === 'dark';

  if (!isOpen || !data) return null;

  const styles = {
    overlay: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300",
    content: `relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border ${
      isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200 shadow-2xl'
    } animate-in zoom-in-95 duration-300`,
    header: `p-8 pb-4 flex justify-between items-start`,
    section: `p-8 pt-0 space-y-6`,
    label: `text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`,
    infoBox: `flex items-center gap-4 p-4 rounded-2xl border ${
      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
    }`,
    textMain: `text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`,
    textSub: `text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`,
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        
        {/* Header with Close */}
        <div className={styles.header}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-[#7c3aed]/20">
              <img src={data.img} alt={data.emp} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {data.emp}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed]">
                {data.pos}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.section}>
          
          {/* Assignment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={styles.label}>Department</p>
              <div className="flex items-center gap-2 mt-2">
                <Building2 size={16} className="text-[#7c3aed]" />
                <span className={styles.textMain}>{data.dept}</span>
              </div>
            </div>
            <div>
              <p className={styles.label}>System Role</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield size={16} className="text-emerald-500" />
                <span className={styles.textMain}>{data.role}</span>
              </div>
            </div>
          </div>

          <hr className={isDark ? "border-white/5" : "border-slate-100"} />

          {/* Reporting Line */}
          <div>
            <p className={styles.label + " mb-3"}>Direct Reporting Line</p>
            <div className={styles.infoBox}>
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
                <User size={20} />
              </div>
              <div>
                <p className={styles.textSub}>Reports Directly To</p>
                <p className={styles.textMain}>{data.supervisor}</p>
              </div>
            </div>
          </div>

          {/* View Only Disclaimer */}
          <div className={`flex items-start gap-3 p-4 rounded-2xl ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'} border ${isDark ? 'border-amber-500/10' : 'border-amber-100'}`}>
            <Calendar size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-amber-200/50' : 'text-amber-700'}`}>
              <strong>Note:</strong> This information is retrieved from the central payroll and HR system. 
              Only administrators can modify reporting relationships. If these details are incorrect, please contact support.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 text-center border-t ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              isDark 
              ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default ViewStructure;