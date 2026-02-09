import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Camera, Edit3, 
  Briefcase, Hash, Calendar, Fingerprint, Loader2, Info
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Import Modals
import EditProfile from '../../modals/admin/EditProfile';

const Profile = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Fetch Profile Data ---
  const fetchProfile = async () => {
  try {
    setLoading(true);
    const res = await axios.get('/api/auth/me');
    const data = res.data;

    // Use a robust mapping that checks every possible location for the data
    const mappedData = {
      ...data,
      firstName: data.firstName || "Not Specified",
      lastName: data.lastName || "Not Specified",
      employeeId: data.employeeId || "Not Specified",
      nationalId: data.nationalId || "Not Specified",
      gender: data.gender || "Not Specified",
      
      // Handle the Header Display
      displayPosition: data.jobPositionRel?.title || data.jobPosition || "No Position",
      displayDept: data.departmentRel?.name || data.department || "Unassigned",
      
      // Handle the Date formatting safely
      displayDOB: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      }) : "Not Specified",
    };

    setProfile(mappedData);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    toast.error("Could not load your profile data");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- Handle Quick Image Upload ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setIsUploading(true);
      const res = await axios.patch(`/api/auth/employees/${profile.id}`, formData);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      // Re-run fetch to fix mapping and update UI
      await fetchProfile(); 
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  if (loading || !profile) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin" />
    </div>
  );

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f1f5f9]',
    textMain: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    card: isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200 shadow-sm',
    inputBg: isDark ? 'bg-[#0f1623]' : 'bg-slate-50',
    border: isDark ? 'border-white/5' : 'border-slate-200',
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 transition-colors duration-500 ${styles.bgBody}`}>
      
      {/* Profile Hero Card */}
      <div className={`${styles.card} border rounded-[3.5rem] p-10 mb-10 relative overflow-hidden shadow-2xl`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7c3aed] opacity-10 blur-[120px] -mr-40 -mt-40"></div>
        
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-44 h-44 rounded-[3.5rem] bg-linear-to-tr from-[#7c3aed] to-[#4f46e5] p-1.5 shadow-2xl overflow-hidden">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover rounded-[3.3rem]" />
              ) : (
                <div className={`w-full h-full rounded-[3.3rem] ${isDark ? 'bg-[#0b1220]' : 'bg-white'} flex items-center justify-center ${styles.textMain} text-6xl font-black`}>
                  {profile.firstName?.[0]}
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 p-4 bg-[#7c3aed] text-white rounded-2xl cursor-pointer border-4 border-[#020617]">
              <Camera size={20} />
              <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <nav className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-purple-500">Identity Profile</nav>
            <h1 className={`text-5xl font-black tracking-tighter ${styles.textMain} mb-2`}>
              {profile.firstName} {profile.lastName}
            </h1>
            <p className={`${styles.textMuted} font-black text-sm uppercase tracking-[0.25em] flex items-center justify-center lg:justify-start gap-2`}>
              <Briefcase size={16} className="text-purple-500" /> {profile.displayPosition} <span className="opacity-30">•</span> {profile.displayDept}
            </p>
          </div>

          <button onClick={() => setIsEditOpen(true)} className="px-10 py-5 bg-[#7c3aed] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">
            Modify Profile
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        <div className={`${styles.card} border rounded-[2.5rem] p-10`}>
          <SectionHeader icon={<Fingerprint />} title="Identity Details" isDark={isDark} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <DetailField label="First Name" value={profile.firstName} icon={<User size={16}/>} styles={styles} />
            <DetailField label="Last Name" value={profile.lastName} icon={<User size={16}/>} styles={styles} />
            <DetailField label="Employee ID" value={profile.employeeId} icon={<Hash size={16}/>} styles={styles} />
            <DetailField label="National ID" value={profile.nationalId} icon={<Fingerprint size={16}/>} styles={styles} />
            <DetailField label="Gender" value={profile.gender} icon={<User size={16}/>} styles={styles} />
            <DetailField label="Date of Birth" value={profile.displayDOB} icon={<Calendar size={16}/>} styles={styles} />
          </div>
        </div>

        <div className={`${styles.card} border rounded-[2.5rem] p-10`}>
          <SectionHeader icon={<Mail />} title="Communication" isDark={isDark} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <DetailField label="Corporate Email" value={profile.email} icon={<Mail size={16}/>} styles={styles} />
            <DetailField label="Work Phone" value={profile.workPhone} icon={<Phone size={16}/>} styles={styles} />
            <DetailField label="Marital Status" value={profile.maritalStatus} icon={<Info size={16}/>} styles={styles} />
            <DetailField label="Home Address" value={profile.address} icon={<MapPin size={16}/>} styles={styles} />
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditProfile 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          profile={profile} 
          onSave={fetchProfile} 
          theme={theme} 
        />
      )}
    </main>
  );
};

const SectionHeader = ({ icon, title, isDark }) => (
  <div className="flex items-center gap-3 mb-10">
    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">{icon}</div>
    <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
  </div>
);

const DetailField = ({ label, value, icon, styles }) => (
  <div className="group">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block mb-3 ml-1">{label}</label>
    <div className={`p-5 rounded-2xl ${styles.inputBg} ${styles.textMain} text-sm font-black border ${styles.border} flex items-center gap-4 transition-all duration-300 group-hover:border-purple-500/50 group-hover:translate-x-1 shadow-sm`}>
      <span className="text-purple-500 opacity-80">{icon}</span>
      <span className="tracking-tight">{value || 'Not Specified'}</span>
    </div>
  </div>
);

export default Profile;