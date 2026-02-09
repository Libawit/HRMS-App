import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Camera, Edit3, 
  Briefcase, Hash, Calendar, Fingerprint, Info, Lock, KeyRound,
  ShieldCheck, Globe
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Import the Manager-specific Edit Modal
import EditProfile from '../../modals/manager/EditProfile';

const Profile = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Use outlet context to get theme from the parent layout
  const { theme } = useOutletContext();

  // Profile data preserved exactly as provided
  const [profile, setProfile] = useState({
    name: "Alex Thompson",
    role: "Lead Operations Manager",
    empId: "MGR-99201",
    department: "Engineering",
    email: "alex.t@lytical.com",
    phone: "+1 (555) 000-1234",
    location: "London, UK",
    address: "221B Baker Street, Marylebone, London",
    joined: "January 14, 2024",
    dob: "May 12, 1992",
    gender: "Male",
    level: "Level 4 (Executive Management)",
    password: "••••••••" 
  });

  const isDark = theme === 'dark';
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    inputBg: isDark ? 'bg-[#0f1623]' : 'bg-slate-100',
    accent: '#7c3aed'
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 ${styles.bgBody} no-scrollbar animate-in fade-in duration-500`}>
      
      {/* Profile Hero Card */}
      <div className={`${styles.bgCard} border ${styles.border} rounded-[3.5rem] p-10 mb-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7c3aed] opacity-5 blur-[120px] -mr-48 -mt-48"></div>
        
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="w-44 h-44 rounded-[3.5rem] bg-linear-to-tr from-[#7c3aed] to-[#4f46e5] p-1.5 shadow-2xl">
              <div className="w-full h-full rounded-[3.2rem] bg-[#0b1220] flex items-center justify-center text-white text-6xl font-black uppercase tracking-tighter">
                {profile.name[0]}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl shadow-lg transition-all hover:scale-110 border-4 border-[#0b1220]">
              <Camera size={20} />
            </button>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-3">
               <h1 className={`text-5xl font-black tracking-tighter ${styles.textMain}`}>{profile.name}</h1>
               <div className="flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-4 py-1.5 rounded-2xl w-fit mx-auto lg:mx-0">
                  <ShieldCheck size={14} className="text-[#7c3aed]" />
                  <span className="text-[#7c3aed] text-[10px] font-black uppercase tracking-widest">Department Manager</span>
               </div>
            </div>
            <p className="text-[#7c3aed] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center lg:justify-start gap-2">
              <Globe size={14} /> {profile.role} • {profile.department} Unit
            </p>
            <div className={`mt-4 flex items-center justify-center lg:justify-start gap-2 text-[10px] font-bold ${styles.textMuted} uppercase tracking-widest`}>
                <Calendar size={12} /> Appointed {profile.joined}
            </div>
          </div>

          <button 
            onClick={() => setIsEditOpen(true)}
            className="px-10 py-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-purple-500/30 transition-all active:scale-95 flex items-center gap-3"
          >
            <Edit3 size={18} /> Edit Manager Profile
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Admin Managed Section (LOCKED) */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-10`}>
          <h3 className={`text-xl font-bold mb-8 flex items-center gap-3 ${styles.textMain}`}>
            <Lock className="text-[#94a3b8]" size={20}/> Management Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailField label="Legal Full Name" value={profile.name} icon={<User size={14}/>} styles={styles} isLocked />
            <DetailField label="Assigned Department" value={profile.department} icon={<Briefcase size={14}/>} styles={styles} isLocked />
            <DetailField label="Management ID" value={profile.empId} icon={<Hash size={14}/>} styles={styles} isLocked />
            <DetailField label="Birth Date" value={profile.dob} icon={<Calendar size={14}/>} styles={styles} isLocked />
            <DetailField label="Gender" value={profile.gender} icon={<User size={14}/>} styles={styles} isLocked />
            <DetailField label="Authority Level" value={profile.level} icon={<ShieldCheck size={14}/>} styles={styles} isLocked />
          </div>
        </div>

        {/* Self-Service Section (EDITABLE) */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-10 border-[#7c3aed22]`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-xl font-bold flex items-center gap-3 ${styles.textMain}`}>
                <Fingerprint className="text-[#7c3aed]" size={20}/> Contact & Secure Access
            </h3>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full">Self-Managed</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailField label="Secure Line" value={profile.phone} icon={<Phone size={14}/>} styles={styles} />
            <DetailField label="Managerial Email" value={profile.email} icon={<Mail size={14}/>} styles={styles} />
            <DetailField label="Account Password" value={profile.password} icon={<KeyRound size={14}/>} styles={styles} />
            <DetailField label="Duty Station" value={profile.location} icon={<MapPin size={14}/>} styles={styles} />
            <div className="md:col-span-2">
                <DetailField label="Registered Residence" value={profile.address} icon={<MapPin size={14}/>} styles={styles} />
            </div>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className={`text-xs font-medium ${styles.textMuted}`}>
                Note: Core Identity data (Name, Dept, DOB) is managed by System Administration. To request changes, please contact the IT Support Desk.
            </p>
        </div>

      </div>

      <EditProfile 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        profile={profile} 
        onSave={setProfile} 
        theme={theme} 
      />
    </main>
  );
};

const DetailField = ({ label, value, icon, styles, isLocked = false }) => (
  <div className="group">
    <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest flex items-center justify-between mb-2 ml-1">
      {label}
      {isLocked && <Lock size={10} className="text-[#94a3b8]/50" />}
    </label>
    <div className={`p-4 rounded-2xl ${styles.inputBg} ${styles.textMain} text-sm font-bold border ${styles.border} flex items-center gap-3 transition-all ${!isLocked ? 'group-hover:border-[#7c3aed55] cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
      <span className={isLocked ? "text-[#94a3b8]" : "text-[#7c3aed]"}>{icon}</span>
      {value || 'Not Specified'}
    </div>
  </div>
);

export default Profile;