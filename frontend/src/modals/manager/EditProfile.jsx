import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Briefcase, Hash, Calendar, ShieldCheck, Award } from 'lucide-react';

const EditProfile = ({ isOpen, onClose, profile, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => {
    if (isOpen) setFormData({ ...profile });
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const styles = {
    overlay: 'fixed inset-0 bg-black/80 backdrop-blur-md z-[5000] flex items-center justify-center p-4',
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`,
    header: 'p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#7c3aed]/5 to-transparent',
    content: 'p-10 max-h-[70vh] overflow-y-auto no-scrollbar',
    footer: 'p-8 border-t border-white/5 flex justify-end gap-4',
    label: 'text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] block mb-2 ml-1',
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} outline-none focus:border-[#7c3aed] transition-all`,
    readOnly: `w-full ${isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'} border rounded-2xl p-4 text-sm font-bold cursor-not-allowed`,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header - Manager Context */}
        <div className={styles.header}>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#7c3aed]/10 text-[#7c3aed] text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Administrative Access
                </span>
            </div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Update Management Profile
            </h2>
            <p className="text-[#94a3b8] text-xs font-medium">Maintain your professional and contact information</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-[#94a3b8]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Primary Identity (Editable) */}
              <div className="md:col-span-2">
                <label className={styles.label}>Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Contact Information (Editable) */}
              <div>
                <label className={styles.label}>Managerial Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    type="email"
                    className={`${styles.input} pl-12`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className={styles.label}>Secure Phone Line</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* Identity & Bio (Editable) */}
              <div>
                <label className={styles.label}>Gender</label>
                <select 
                  className={styles.input}
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={styles.label}>Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </div>

              {/* Professional Metadata (Read Only for Managers) */}
              <div className="md:col-span-2 pt-4 border-t border-white/5">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Corporate Metadata (Locked)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>Employee ID</label>
                        <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <div className={`${styles.readOnly} pl-12`}>{formData.empId}</div>
                        </div>
                    </div>

                    <div>
                        <label className={styles.label}>Assigned Department</label>
                        <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <div className={`${styles.readOnly} pl-12`}>{formData.department}</div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className={styles.label}>Authority Level</label>
                        <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <div className={`${styles.readOnly} pl-12`}>{formData.level || "Level 4 (Executive Management)"}</div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Address (Editable) */}
              <div className="md:col-span-2">
                <label className={styles.label}>Registered Residence</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-[#7c3aed]" size={16} />
                  <textarea 
                    rows="3"
                    className={`${styles.input} pl-12 resize-none font-medium`}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button 
              type="button"
              onClick={onClose}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#94a3b8] hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'} transition-all`}
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              className="px-10 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-purple-500/30 transition-all flex items-center gap-3 active:scale-95"
            >
              <Save size={18} /> Finalize Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;