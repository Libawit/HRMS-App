import React from 'react';
import { 
  Download, Edit, Trash2, X, User, Briefcase, Mail, 
  MapPin, HeartPulse, ShieldCheck, Fingerprint, Calendar, Eye 
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const PreviewEmployeeModal = ({ 
  employee, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onDownload,
  isReadOnly = false 
}) => {
  // --- Theme & Context Sync ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const isDark = theme === 'dark';

  if (!isOpen || !employee) return null;

  // --- Dynamic Style Constants ---
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-white/5' : 'border-slate-200';
  const cardClass = isDark ? 'bg-[#0f172a]/40 border-white/5' : 'bg-slate-50 border-slate-200';
  const sidebarCard = isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100/50 border-slate-200';
  const modalBg = isDark ? 'bg-[#0b1220]' : 'bg-white';

  const styles = {
    overlay: "fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-[3000] flex items-center justify-center p-4 transition-all",
    modal: `${modalBg} w-full max-w-[1150px] max-h-[92vh] rounded-[4rem] border ${borderClass} flex flex-col overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300`,
    header: `px-10 py-10 border-b ${borderClass} flex flex-col md:flex-row justify-between items-center gap-6 ${isDark ? 'bg-[#0f172a]/50' : 'bg-slate-50/50'}`,
    footer: `px-10 py-8 border-t ${borderClass} flex justify-end gap-4 ${isDark ? 'bg-[#0f172a]/80' : 'bg-slate-50'}`,
    content: "p-10 overflow-y-auto custom-scrollbar",
    sectionHeader: "text-[#7c3aed] text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 border-b border-[#7c3aed]/10 pb-4 mb-8",
    label: `text-[9px] ${textMuted} font-black uppercase tracking-[0.2em] block mb-2`,
    value: `text-sm font-black ${textMain} tracking-tight`,
    dataCard: `${cardClass} border p-5 rounded-[1.8rem] hover:border-[#7c3aed]/30 transition-all duration-300 group`
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* TOP HEADER BAR */}
        <div className={styles.header}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#7c3aed] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img 
                src={employee.avatar || "/api/placeholder/150/150"} 
                className="w-24 h-24 rounded-[2.5rem] object-cover border-2 border-[#7c3aed]/30 shadow-2xl relative z-10" 
                alt="Profile" 
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-[#0b1220] rounded-full z-20 shadow-lg"></div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-3">
                <h2 className={`text-4xl font-black ${textMain} tracking-tighter`}>{employee.name}</h2>
                {isReadOnly && (
                  <span className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    <Eye size={14} /> Manager View
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-[#7c3aed]/10 text-[#7c3aed] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border border-[#7c3aed]/20 shadow-sm">
                  {employee.position}
                </span>
                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-500/20 shadow-sm">
                  {employee.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 bg-white/5 p-2 rounded-3xl border border-white/5">
            <button 
              onClick={() => onDownload(employee)}
              className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${borderClass} flex items-center justify-center text-slate-400 hover:text-[#7c3aed] hover:shadow-lg transition-all active:scale-90`}
              title="Download Record"
            >
              <Download size={22} />
            </button>
            
            {!isReadOnly && (
              <>
                <button 
                  onClick={() => onEdit(employee)}
                  className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${borderClass} flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:shadow-lg transition-all active:scale-90`}
                >
                  <Edit size={22} />
                </button>
                <button 
                  onClick={() => onDelete(employee.id)}
                  className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <Trash2 size={22} />
                </button>
              </>
            )}
            
            <button 
              onClick={onClose}
              className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-900'} border ${borderClass} flex items-center justify-center ${isDark ? 'text-white' : 'text-white'} hover:opacity-80 transition-all active:scale-90`}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className={styles.content}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-12">
              {/* 1. Personal Information */}
              <section className="animate-in slide-in-from-bottom-4 duration-500">
                <h3 className={styles.sectionHeader}><User size={16} className="text-purple-500"/> 01. Personal Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div className={styles.dataCard}><label className={styles.label}>First Name</label><p className={styles.value}>{employee.name?.split(' ')[0]}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Last Name</label><p className={styles.value}>{employee.name?.split(' ')[1]}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Date of Birth</label><p className={styles.value}>{employee.dob}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Gender</label><p className={styles.value}>{employee.gender}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>National ID</label><p className={styles.value}>{employee.nationalId}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Marital Status</label><p className={styles.value}>{employee.maritalStatus || 'Single'}</p></div>
                </div>
              </section>

              {/* 2. Employment Details */}
              <section className="animate-in slide-in-from-bottom-6 duration-700">
                <h3 className={styles.sectionHeader}><Briefcase size={16} className="text-blue-500"/> 02. Professional Records</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div className={`${styles.dataCard} border-l-4 border-l-[#7c3aed]`}><label className={styles.label}>Employee ID</label><p className={`${styles.value} text-[#7c3aed] font-mono uppercase`}>{employee.id}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Department</label><p className={styles.value}>{employee.dept}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Position</label><p className={styles.value}>{employee.position}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Hire Date</label><p className={styles.value}>{employee.hireDate}</p></div>
                </div>
              </section>

              {/* 4. Emergency Contact */}
              <section className="animate-in slide-in-from-bottom-8 duration-1000">
                <h3 className={styles.sectionHeader}><HeartPulse size={16} className="text-red-500"/> 04. Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={styles.dataCard}><label className={styles.label}>Contact Name</label><p className={styles.value}>{employee.emergencyName || employee.emergencyContact}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Relationship</label><p className={styles.value}>{employee.emergencyRel || employee.relationship}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Emergency Phone</label><p className={styles.value}>{employee.emergencyPhone}</p></div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">
              <section className={`${sidebarCard} p-8 rounded-[3rem] border shadow-sm`}>
                <h3 className={styles.sectionHeader + " border-none mb-6"}><Mail size={16} className="text-indigo-500"/> Contact Info</h3>
                <div className="space-y-6">
                  <div>
                    <label className={styles.label}>Work Email</label>
                    <p className={`text-sm font-black text-[#7c3aed] break-all underline decoration-[#7c3aed]/20 underline-offset-4`}>{employee.email}</p>
                  </div>
                  <div>
                    <label className={styles.label}>Work Phone</label>
                    <p className={styles.value}>{employee.phone}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${borderClass}`}>
                    <label className={styles.label}>Home Address</label>
                    <p className={`text-xs ${textMuted} leading-relaxed font-bold`}>
                      <MapPin size={10} className="inline mr-1 mb-0.5" /> {employee.address}
                    </p>
                  </div>
                </div>
              </section>

              <section className={`${isDark ? 'bg-indigo-500/5' : 'bg-indigo-50'} p-8 rounded-[3rem] border border-indigo-500/10`}>
                <h3 className={styles.sectionHeader + " border-none mb-6"}><ShieldCheck size={16} className="text-indigo-600"/> System Access</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className={styles.label}>Access Level</label>
                      <p className={`text-xs font-black ${textMain} uppercase tracking-tighter`}>{employee.role}</p>
                    </div>
                    <ShieldCheck size={20} className="text-indigo-500 opacity-40" />
                  </div>
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-black/20' : 'bg-white'} border ${borderClass}`}>
                    <label className={styles.label}>Username</label>
                    <p className="text-[10px] font-mono font-black text-[#7c3aed] uppercase tracking-widest">{employee.username}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button 
            onClick={onClose} 
            className={`px-10 py-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border ${textMuted} font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all active:scale-95 ${isReadOnly ? 'w-full md:w-auto' : ''}`}
          >
            {isReadOnly ? 'Exit Full Profile' : 'Close Preview'}
          </button>
          
          {!isReadOnly && (
            <button 
              onClick={() => onEdit(employee)}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-purple-500/30 flex items-center gap-3 transition-all active:scale-95 hover:translate-y-0.5"
            >
              <Edit size={16} /> Edit Records
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewEmployeeModal;