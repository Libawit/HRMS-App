import React from 'react';
import { 
  Download, X, User, Briefcase, Mail, 
  MapPin, HeartPulse, ShieldCheck, Fingerprint, Calendar 
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const PreviewEmployeeModal = ({ employee, isOpen, onClose, onDownload }) => {
  // --- Theme Logic ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  if (!isOpen || !employee) return null;

  // --- Dynamic Theme Styles ---
  const styles = {
    overlay: `fixed inset-0 z-[3000] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300 ${
      isDark ? "bg-[#020617]/95" : "bg-slate-900/60"
    }`,
    modal: `w-full max-w-[1150px] max-h-[92vh] rounded-[3rem] border flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 ${
      isDark ? "bg-[#0b1220] border-white/10" : "bg-white border-slate-200"
    }`,
    header: `px-10 py-8 border-b flex justify-between items-center ${
      isDark ? "bg-[#0f172a]/50 border-white/5" : "bg-slate-50 border-slate-100"
    }`,
    footer: `px-10 py-6 border-t flex justify-end gap-3 ${
      isDark ? "bg-[#0f172a]/80 border-white/5" : "bg-slate-50 border-slate-100"
    }`,
    content: "p-10 overflow-y-auto custom-scrollbar",
    sectionHeader: `text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 border-b pb-3 mb-6 ${
      isDark ? "text-[#7c3aed] border-white/5" : "text-indigo-600 border-slate-100"
    }`,
    label: `text-[10px] font-black uppercase tracking-[0.1em] block mb-1.5 ${
      isDark ? "text-slate-500" : "text-slate-400"
    }`,
    value: `text-sm font-bold tracking-tight ${
      isDark ? "text-white" : "text-slate-900"
    }`,
    dataCard: `border p-4 rounded-2xl transition-colors ${
      isDark 
        ? "bg-[#0f172a]/40 border-white/5 hover:bg-[#0f172a]/60" 
        : "bg-slate-50/50 border-slate-200/60 hover:bg-slate-50"
    }`
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* TOP HEADER BAR */}
        <div className={styles.header}>
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                src={employee.avatar || "/api/placeholder/150/150"} 
                className={`w-20 h-20 rounded-4xl object-cover border-2 shadow-lg ${
                    isDark ? "border-[#7c3aed]/20" : "border-indigo-100"
                }`} 
                alt="Profile" 
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#0b1220] rounded-full"></div>
            </div>
            <div>
              <h2 className={`text-3xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                {employee.name}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    isDark ? "bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                }`}>
                    {employee.position}
                </span>
                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                    {employee.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => onDownload(employee)}
              className={`px-6 py-3 rounded-2xl border flex items-center gap-2 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest ${
                isDark 
                  ? "bg-white/5 border-white/10 text-slate-400 hover:text-[#7c3aed] hover:bg-white/10" 
                  : "bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <Download size={18} /> Download Record
            </button>
            <button 
              onClick={onClose}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                isDark 
                  ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" 
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-900"
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className={styles.content}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8 space-y-10">
              {/* 1. Personal Information */}
              <section>
                <h3 className={styles.sectionHeader}><User size={14}/> 01. Personal Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className={styles.dataCard}><label className={styles.label}>First Name</label><p className={styles.value}>{employee.name?.split(' ')[0]}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Last Name</label><p className={styles.value}>{employee.name?.split(' ')[1]}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Date of Birth</label><p className={styles.value}>{employee.dob}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Gender</label><p className={styles.value}>{employee.gender}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>National ID</label><p className={styles.value}>{employee.nationalId}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Marital Status</label><p className={styles.value}>{employee.maritalStatus || 'Single'}</p></div>
                </div>
              </section>

              {/* 2. Employment Details */}
              <section>
                <h3 className={styles.sectionHeader}><Briefcase size={14}/> 02. Professional Records</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className={styles.dataCard}><label className={styles.label}>Employee ID</label><p className={`${styles.value} font-mono ${isDark ? "text-[#7c3aed]" : "text-indigo-600"}`}>{employee.id}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Department</label><p className={styles.value}>{employee.dept}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Position</label><p className={styles.value}>{employee.position}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Hire Date</label><p className={styles.value}>{employee.hireDate}</p></div>
                </div>
              </section>

              {/* 3. Emergency Contact */}
              <section>
                <h3 className={styles.sectionHeader}><HeartPulse size={14}/> 03. Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={styles.dataCard}><label className={styles.label}>Contact Name</label><p className={styles.value}>{employee.emergencyName || employee.emergencyContact}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Relationship</label><p className={styles.value}>{employee.emergencyRel || employee.relationship}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Emergency Phone</label><p className={styles.value}>{employee.emergencyPhone}</p></div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">
              <section className={`p-6 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50/50 border-slate-100"}`}>
                <h3 className={styles.sectionHeader + " border-none mb-4"}><Mail size={14}/> Contact Info</h3>
                <div className="space-y-4">
                  <div><label className={styles.label}>Work Email</label><p className={`text-sm font-bold break-all ${isDark ? "text-[#7c3aed]" : "text-indigo-600"}`}>{employee.email}</p></div>
                  <div><label className={styles.label}>Work Phone</label><p className={styles.value}>{employee.phone}</p></div>
                  <div><label className={styles.label}>Home Address</label><p className="text-xs text-slate-400 leading-relaxed font-medium">{employee.address}</p></div>
                </div>
              </section>

              {/* FIXED SYSTEM ACCESS SECTION FOR LIGHT MODE */}
              <section className={`p-6 rounded-[2.5rem] border ${
                isDark 
                  ? "bg-[#0f172a] border-white/5" 
                  : "bg-slate-100 border-slate-200" 
              }`}>
                <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 mb-4 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  <ShieldCheck size={14}/> System Access
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={styles.label}>Access Level</label>
                    <p className={`text-xs font-black uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                      {employee.role}
                    </p>
                  </div>
                  <div>
                    <label className={styles.label}>Username</label>
                    <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {employee.username}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <p className="mr-auto text-[10px] text-slate-500 font-bold italic">
            * This is a read-only profile. Contact HR for any data corrections.
          </p>
          <button 
            onClick={onClose} 
            className={`px-10 py-3.5 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all ${
                isDark 
                ? "bg-[#0f172a] border-white/10 text-slate-400 hover:bg-white/5" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewEmployeeModal;