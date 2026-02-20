import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Briefcase, Hash, Calendar, Camera, Lock } from 'lucide-react';

const EditProfile = ({ isOpen, onClose, profile, onSave, theme = 'dark' }) => {
  const [formData, setFormData] = useState({ ...profile, password: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);


useEffect(() => {
  if (isOpen && profile) {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.workPhone || '', // Map workPhone to phone
      address: profile.address || '',
      password: '' 
    });
  }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const getImageSrc = () => {
  if (previewImage) return previewImage; // Show the local upload preview
  if (profile?.profileImage) {
    // Check if the path already contains http (external) or needs the backend prefix
    return profile.profileImage.startsWith('http') 
      ? profile.profileImage 
      : `http://localhost:5000${profile.profileImage}`;
  }
  return '/default-avatar.png'; // Fallback
};

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData to handle image upload
    const data = new FormData();
    data.append('firstName', formData.firstName); // Using your DB schema fields
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    
    if (formData.password) {
        data.append('password', formData.password);
    }
    
    if (selectedFile) {
      data.append('profileImage', selectedFile);
    }

    onSave(data); // Pass FormData to the parent
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <div>
              <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h2>
              <p className="text-[#94a3b8] text-xs font-medium mt-1">Update your profile picture and contact details</p>
            </div>
            <button type="button" onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-[#94a3b8]">
              <X size={20} />
            </button>
          </div>

          <div className={styles.content}>
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-[#7c3aed]/20">
                        <img 
                            src={getImageSrc()} 
                            className="w-full h-full object-cover" 
                            alt="Preview"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                        <Camera className="text-white" size={24} />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                <p className="text-[10px] font-bold text-[#7c3aed] uppercase mt-3 tracking-widest">Change Photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="md:col-span-2">
                <label className={styles.label}>Corporate Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    className={`${styles.input} pl-12`}
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={styles.label}>New Password (Leave blank to keep current)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                  <input 
                    type="password"
                    className={`${styles.input} pl-12`}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className={styles.label}>Permanent Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-[#7c3aed]" size={16} />
                  <textarea 
                    rows="2"
                    className={`${styles.input} pl-12 resize-none`}
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={`px-6 py-3 text-xs font-black uppercase ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-[#7c3aed] text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;