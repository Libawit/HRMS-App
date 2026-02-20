import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Mail, Phone, MapPin, Camera, Edit3, 
  Briefcase, Hash, Calendar, Fingerprint, Loader2
} from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { useOutletContext } from 'react-router-dom';

// Import Modals
import EditProfile from '../../modals/manager/EditProfile';

const API_BASE = "http://localhost:5000/api";

const Profile = () => {
  const { theme } = useOutletContext(); 
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  // --- 1. Fetch Logged-in User Data ---
  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Or however you store your JWT
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSave = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`${API_BASE}/auth/update-me`, formData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' 
      }
    });

    // Refresh the local state with the new user data
    // res.data.user comes from the controller response above
    setProfile(res.data.user); 
    setIsEditOpen(false); 
    alert("Profile updated successfully!");
  } catch (err) {
    console.error("Update failed:", err.response?.data || err.message);
    alert(err.response?.data?.detail || "Failed to update profile");
  }
};

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    inputBg: isDark ? 'bg-[#0f1623]' : 'bg-slate-100',
  };

  if (loading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${styles.bgBody}`}>
        <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
      </div>
    );
  }

  if (!profile) return <div className="p-10 text-center">Profile not found.</div>;

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 ${styles.bgBody}`}>
      
      {/* Profile Hero Card */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-[3rem] p-10 mb-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed] opacity-5 blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="w-40 h-40 rounded-[3rem] bg-linear-to-tr from-[#7c3aed] to-[#4f46e5] p-1 shadow-2xl">
              <div className="w-full h-full rounded-[2.8rem] bg-[#0b1220] overflow-hidden flex items-center justify-center">
                {profile.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-5xl font-black uppercase">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </span>
                )}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl shadow-lg transition-all hover:scale-110">
              <Camera size={20} />
            </button>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
               <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>
                {profile.firstName} {profile.lastName}
               </h1>
               <span className="bg-[#7c3aed]/10 text-[#7c3aed] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit mx-auto lg:mx-0">
                {profile.role}
               </span>
            </div>
            <p className="text-[#7c3aed] font-bold text-sm uppercase tracking-[0.2em]">
              {profile.jobPosition} • {profile.department}
            </p>
          </div>

          <button 
            onClick={() => setIsEditOpen(true)}
            className="px-8 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-sm font-black shadow-xl shadow-purple-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Personal & Identity Section */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8`}>
          <h3 className={`text-xl font-bold mb-8 flex items-center gap-3 ${styles.textMain}`}>
            <Fingerprint className="text-[#7c3aed]" size={20}/> Identity Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailField label="Email Address" value={profile.email} icon={<Mail size={14}/>} styles={styles} />
            <DetailField label="Gender" value={profile.gender} icon={<User size={14}/>} styles={styles} />
            <DetailField label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'} icon={<Calendar size={14}/>} styles={styles} />
            <DetailField label="Employee ID" value={profile.employeeId} icon={<Hash size={14}/>} styles={styles} />
          </div>
        </div>

        {/* Contact & Address Section */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8`}>
          <h3 className={`text-xl font-bold mb-8 flex items-center gap-3 ${styles.textMain}`}>
            <Phone className="text-[#7c3aed]" size={20}/> Communication & Location
          </h3>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DetailField label="Phone Number" value={profile.workPhone} icon={<Phone size={14}/>} styles={styles} />
              <DetailField label="Address" value={profile.address} icon={<MapPin size={14}/>} styles={styles} />
            </div>
          </div>
        </div>

      </div>

      {isEditOpen && (
        <EditProfile 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          profile={profile} 
          onSave={handleSave} // Refresh after edit
          theme={theme} 
        />
      )}
    </main>
  );
};

const DetailField = ({ label, value, icon, styles }) => (
  <div className="group">
    <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2 ml-1">
      {label}
    </label>
    <div className={`p-4 rounded-2xl ${styles.inputBg} ${styles.textMain} text-sm font-bold border ${styles.border} flex items-center gap-3 transition-all group-hover:border-[#7c3aed55]`}>
      <span className="text-[#7c3aed]">{icon}</span>
      {value || 'Not Specified'}
    </div>
  </div>
);

export default Profile;