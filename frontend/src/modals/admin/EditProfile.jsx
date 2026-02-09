import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Briefcase, Hash, Calendar, Info } from 'lucide-react';

const EditProfile = ({ isOpen, onClose, profile, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState({ ...profile });

  // Sync state when profile prop changes or modal opens
  useEffect(() => {
    if (isOpen) setFormData({ ...profile });
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const styles = {
    overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4',
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl`,
    header: 'p-8 border-b border-white/5 flex justify-between items-center',
    content: 'p-8 max-h-[70vh] overflow-y-auto custom-scrollbar',
    footer: 'p-8 border-t border-white/5 flex justify-end gap-4',
    label: 'text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2 ml-1',
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} outline-none focus:border-[#7c3aed] transition-all`,
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
        <div className={styles.header}>
          <div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Personal Information</h2>
            <p className="text-[#94a3b8] text-xs font-medium mt-1">Update your identity and contact details</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-[#94a3b8]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className={styles.content}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className={styles.label}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Gender */}
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

              {/* Date of Birth */}
              <div>
                <label className={styles.label}>Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    type="text"
                    className={`${styles.input} pl-12`}
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    placeholder="May 12, 1992"
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className={styles.label}>Employee ID</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.empId}
                    onChange={(e) => setFormData({...formData, empId: e.target.value})}
                    placeholder="LYT-000"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className={styles.label}>Department</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g. IT Department"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={styles.label}>Corporate Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    type="email"
                    className={`${styles.input} pl-12`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="work@company.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={styles.label}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (000) 000-0000"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className={styles.label}>Permanent Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-[#7c3aed]" size={16} />
                  <textarea 
                    rows="3"
                    className={`${styles.input} pl-12 resize-none`}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter full street address"
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
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#94a3b8] hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'} transition-all`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;