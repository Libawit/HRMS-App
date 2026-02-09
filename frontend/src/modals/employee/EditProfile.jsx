import React, { useState, useEffect } from 'react';
import { 
  X, Save, User, Mail, Phone, MapPin, 
  Briefcase, Hash, Calendar, Lock, KeyRound, Eye, EyeOff 
} from 'lucide-react';

const EditProfile = ({ isOpen, onClose, profile, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState({ ...profile, password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData({ ...profile, password: '' });
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const styles = {
    overlay: 'fixed inset-0 bg-black/80 backdrop-blur-md z-[5000] flex items-center justify-center p-4',
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`,
    header: 'p-10 border-b border-white/5 bg-linear-to-r from-[#7c3aed]/5 to-transparent',
    content: 'p-10 max-h-[70vh] overflow-y-auto no-scrollbar',
    footer: 'p-8 border-t border-white/5 flex justify-end gap-4',
    label: 'text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] block mb-2 ml-1',
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} outline-none focus:border-[#7c3aed] transition-all`,
    readOnly: `w-full ${isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'} border rounded-2xl p-4 text-sm font-bold cursor-not-allowed flex items-center gap-3`,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Edit Personal Info
            </h2>
            <p className="text-[#94a3b8] text-xs font-medium mt-1">Update your contact details and account security</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-[#94a3b8]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* EDITABLE FIELDS */}
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest mb-4">Self-Service Information</p>
              </div>

              <div>
                <label className={styles.label}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className={styles.label}>Email Address</label>
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

              <div className="md:col-span-2">
                <label className={styles.label}>Current Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-[#7c3aed]" size={16} />
                  <textarea 
                    rows="2"
                    className={`${styles.input} pl-12 resize-none font-medium`}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={styles.label}>Update Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    className={`${styles.input} pl-12 pr-12`}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter new password to change"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#7c3aed]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* READ ONLY FIELDS (ADMIN ONLY) */}
              <div className="md:col-span-2 mt-4 pt-8 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Lock size={12}/> Admin Controlled (Contact HR to change)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>Full Name</label>
                        <div className={styles.readOnly}><User size={14}/> {formData.name}</div>
                    </div>
                    <div>
                        <label className={styles.label}>Employee ID</label>
                        <div className={styles.readOnly}><Hash size={14}/> {formData.empId}</div>
                    </div>
                    <div>
                        <label className={styles.label}>Department</label>
                        <div className={styles.readOnly}><Briefcase size={14}/> {formData.department}</div>
                    </div>
                    <div>
                        <label className={styles.label}>Date of Birth</label>
                        <div className={styles.readOnly}><Calendar size={14}/> {formData.dob}</div>
                    </div>
                    <div>
                        <label className={styles.label}>Gender</label>
                        <div className={styles.readOnly}><User size={14}/> {formData.gender}</div>
                    </div>
                </div>
              </div>

            </div>
          </div>

          <div className={styles.footer}>
            <button 
              type="button"
              onClick={onClose}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#94a3b8] hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'} transition-all`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-10 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-purple-500/30 transition-all flex items-center gap-3 active:scale-95"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;