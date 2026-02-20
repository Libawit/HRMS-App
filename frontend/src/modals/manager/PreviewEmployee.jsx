import React from 'react';
import { 
  Download, Edit, Trash2, X, User, Briefcase, Mail, 
  MapPin, HeartPulse, ShieldCheck, Calendar, Phone, Fingerprint
} from 'lucide-react';

const PreviewEmployeeModal = ({ employee, isOpen, onClose, onDownload = () => {}, theme }) => {
  if (!isOpen || !employee) return null;

  const isDark = theme === 'dark';

  // Helper to format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // DYNAMIC THEME STYLES
  const styles = {
    overlay: `fixed inset-0 z-[3000] flex items-center justify-center p-4 backdrop-blur-md transition-colors duration-300 ${
      isDark ? 'bg-[#020617]/90' : 'bg-slate-900/40'
    }`,
    modal: `${
      isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'
    } w-full max-w-[1150px] max-h-[92vh] rounded-[3rem] border flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`,
    header: `px-10 py-8 border-b flex justify-between items-center ${
      isDark ? 'bg-[#0f172a]/50 border-white/5' : 'bg-slate-50 border-slate-100'
    }`,
    footer: `px-10 py-6 border-t flex justify-end gap-3 ${
      isDark ? 'bg-[#0f172a]/80 border-white/5' : 'bg-slate-50 border-slate-100'
    }`,
    content: "p-10 overflow-y-auto custom-scrollbar",
    sectionHeader: `text-indigo-600 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 border-b pb-3 mb-6 ${
      isDark ? 'border-white/5' : 'border-slate-100'
    }`,
    label: "text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] block mb-1.5",
    value: `text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`,
    dataCard: `border p-4 rounded-2xl transition-all ${
      isDark 
        ? 'bg-[#0f172a]/40 border-white/5 hover:bg-[#0f172a]/60' 
        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
    }`,
    sidebarCard: `p-6 rounded-[2.5rem] border ${
      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/60'
    }`
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* TOP HEADER BAR */}
        <div className={styles.header}>
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* UPDATED PROFILE IMAGE CONTAINER */}
              <div className="w-24 h-24 rounded-4xl flex items-center justify-center text-white text-2xl font-black shadow-lg border-4 border-indigo-500/20 overflow-hidden bg-indigo-500">
                {employee.profileImage ? (
                  <img 
                    src={employee.profileImage}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="uppercase">${employee.firstName?.[0]}${employee.lastName?.[0]}</span>`;
                    }}
                  />
                ) : (
                  <span className="uppercase">
                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                  </span>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 rounded-full ${
                employee.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'
              } ${isDark ? 'border-[#0b1220]' : 'border-white'}`}></div>
            </div>
            <div>
              <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {employee.firstName} {employee.lastName}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                  {employee.jobPosition}
                </span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                  employee.isActive !== false 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {employee.isActive !== false ? 'Active Member' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => onDownload(employee)} className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>
              <Download size={20} />
            </button>
            
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className={styles.content}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8 space-y-10">
              {/* 1. Personal Details */}
              <section>
                <h3 className={styles.sectionHeader}><User size={14}/> 01. Personal Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className={styles.dataCard}><label className={styles.label}>First Name</label><p className={styles.value}>{employee.firstName}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Last Name</label><p className={styles.value}>{employee.lastName}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Date of Birth</label><p className={styles.value}>{formatDate(employee.dateOfBirth)}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Gender</label><p className={styles.value}>{employee.gender}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>National ID</label><p className={styles.value}>{employee.nationalId}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Marital Status</label><p className={styles.value}>{employee.maritalStatus}</p></div>
                </div>
              </section>

              {/* 2. Professional Records */}
              <section>
                <h3 className={styles.sectionHeader}><Briefcase size={14}/> 02. Professional Records</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className={styles.dataCard}><label className={styles.label}>Employee ID</label><p className={`${styles.value} text-indigo-500 font-mono`}>{employee.employeeId}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Department</label><p className={styles.value}>{employee.department}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Job Position</label><p className={styles.value}>{employee.jobPosition}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Hire Date</label><p className={styles.value}>{formatDate(employee.hireDate)}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Work Phone</label><p className={styles.value}>{employee.workPhone}</p></div>
                </div>
              </section>

              {/* 3. Emergency Contact */}
              <section>
                <h3 className={styles.sectionHeader}><HeartPulse size={14}/> 03. Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={styles.dataCard}><label className={styles.label}>Contact Name</label><p className={styles.value}>{employee.emergencyContactName}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Relationship</label><p className={styles.value}>{employee.emergencyRelationship}</p></div>
                  <div className={styles.dataCard}><label className={styles.label}>Emergency Phone</label><p className={styles.value}>{employee.emergencyPhone}</p></div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">
              <section className={styles.sidebarCard}>
                <h3 className={styles.sectionHeader + " border-none mb-4"}><Mail size={14}/> Contact Info</h3>
                <div className="space-y-4">
                  <div><label className={styles.label}>Personal Email</label><p className="text-sm font-bold text-indigo-600 break-all">{employee.email}</p></div>
                  <div><label className={styles.label}>Home Address</label><p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{employee.address}</p></div>
                </div>
              </section>

              <section className={styles.sidebarCard}>
                <h3 className={styles.sectionHeader + " border-none mb-4"}><ShieldCheck size={14}/> System Access</h3>
                <div className="space-y-4">
                  <div><label className={styles.label}>Account Role</label><p className={`text-xs font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{employee.role}</p></div>
                  <div><label className={styles.label}>System ID</label><p className="text-xs font-mono text-slate-500">{employee.id}</p></div>
                  <div className="pt-2">
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded md font-black uppercase">
                      Last Updated: {formatDate(employee.updatedAt)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button onClick={onClose} className={`px-10 py-3.5 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all ${isDark ? 'bg-[#0f172a] border-white/10 text-slate-400 hover:bg-white/5' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
            Close
          </button>
          <button onClick={() => onDownload(employee)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <Download size={16} /> Download Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewEmployeeModal;