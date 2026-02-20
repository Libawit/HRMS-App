import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const JobPosition = () => {
  const { theme, user } = useOutletContext(); // Assuming 'user' is passed in context
  const isDark = theme === 'dark';

  const [myPosition, setMyPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosition = async () => {
      try {
        setLoading(true);
        // Calls your backend router.get('/', protect, jobPositionController.getPositions);
        const response = await api.get('/positions'); 
        
        // Find the specific position assigned to this user
        // We match by title or you can adjust to match a positionId if you have it in your user object
        const found = response.data.find(pos => pos.title === user?.jobTitle) || response.data[0];
        
        setMyPosition(found);
      } catch (error) {
        console.error("Error fetching position:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyPosition();
  }, [user]);

  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    heading: isDark ? 'text-white' : 'text-slate-900',
  };

  if (loading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center ${styles.bgBody}`}>
        <Loader2 className="animate-spin text-[#7c3aed] mb-4" size={40} />
        <p className={styles.textMuted}>Securing position details...</p>
      </div>
    );
  }

  if (!myPosition) {
    return (
      <div className={`flex-1 p-6 ${styles.bgBody} ${styles.textMain} flex items-center justify-center`}>
        <div className="text-center p-10 border-2 border-dashed border-slate-500/20 rounded-3xl">
          <Briefcase className="mx-auto mb-4 opacity-20" size={48} />
          <p className="font-bold opacity-50">No official position mapping found for your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-10 ${styles.bgBody} transition-colors animate-in fade-in duration-700`}>
      <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${styles.textMuted} mb-2`}>
        Employee Portal &nbsp; &gt; &nbsp; My Career &nbsp; &gt; &nbsp; Role Details
      </div>
      
      <div className="mb-8">
        <h1 className={`text-3xl font-black tracking-tighter ${styles.heading}`}>My Position</h1>
        <p className={`text-sm font-medium ${styles.textMuted}`}>Official details regarding your current role and compensation band</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8 md:p-10 transition-all shadow-2xl shadow-black/20`}>
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
            <div className={`w-20 h-20 rounded-3xl ${styles.bgInput} border ${styles.border} flex items-center justify-center text-[#7c3aed] shadow-xl shadow-purple-500/5`}>
              <Briefcase size={36} />
            </div>
            <div>
              <h2 className={`text-3xl font-black tracking-tight ${styles.heading}`}>{myPosition.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20">
                  {myPosition.department?.name || 'Departmentalized'}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${styles.textMuted}`}>
                  <MapPin size={16} className="text-rose-500" /> Remote / Head Office
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-3xl ${styles.bgInput} border ${styles.border} transition-all hover:border-emerald-500/30`}>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase mb-3 tracking-widest ${styles.textMuted}`}>
                <DollarSign size={14} className="text-emerald-500" /> Salary Band
              </div>
              <p className="text-2xl font-black text-emerald-500">{myPosition.salary}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter italic">Subject to annual review</p>
            </div>

            <div className={`p-6 rounded-3xl ${styles.bgInput} border ${styles.border} transition-all hover:border-blue-500/30`}>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase mb-3 tracking-widest ${styles.textMuted}`}>
                <Clock size={14} className="text-blue-500" /> Employment Type
              </div>
              <p className={`text-2xl font-black ${styles.heading}`}>{myPosition.type}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter italic">Active Contract</p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-5 ${styles.textMuted}`}>Requirements & Expectations</h3>
            <div className="flex flex-wrap gap-3">
              {(myPosition.requirements || "Standard Policy").split(',').map((req, i) => (
                <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-500/5 border ${styles.border} text-sm font-bold ${styles.textMain} hover:bg-[#7c3aed]/5 transition-colors`}>
                  <CheckCircle size={16} className="text-[#7c3aed]" /> {req.trim()}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={`${styles.bgCard} border ${styles.border} rounded-4xl p-8`}>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-blue-500" size={28} />
              <h3 className={`font-black uppercase text-xs tracking-widest ${styles.heading}`}>Verification</h3>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${styles.textMuted} mb-6`}>
              This information is encrypted and verified by the Human Resources system. If you believe there is a discrepancy in your title or compensation, please contact <strong>HR Global Support</strong>.
            </p>
            <div className={`text-[10px] py-3 px-4 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-center font-black uppercase tracking-widest`}>
              VERIFIED: {new Date(myPosition.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className={`${styles.bgCard} border ${styles.border} rounded-4xl p-8 relative overflow-hidden group`}>
             <div className="flex items-center gap-3 mb-3 relative z-10">
                <Calendar className="text-purple-500" size={24} />
                <h3 className={`font-black uppercase text-xs tracking-widest ${styles.heading}`}>Updated At</h3>
             </div>
             <p className={`text-2xl font-black ${styles.heading} relative z-10`}>{new Date(myPosition.updatedAt).toLocaleDateString()}</p>
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Calendar size={100} className={isDark ? "text-white" : "text-purple-900"} />
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default JobPosition;