import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  User, 
  ArrowRight,
  ShieldCheck,
  Info,
  Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/axiosConfig'; // Ensure this points to your axios instance

const Department = () => {
  // --- Theme Logic ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State for Database Data ---
  const [myDept, setMyDept] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Logic using your Backend Logic ---
  useEffect(() => {
    const fetchMyDepartment = async () => {
      try {
        setLoading(true);
        // Using your defined route: router.get('/departments', protect, deptController.getAllDepartments);
        // Your controller logic filters by user.departmentId automatically
        const res = await api.get('/auth/my-department');
        
        // Since Prisma findMany returns an array, we take the first element
        if (res.data && res.data.length > 0) {
          setMyDept(res.data[0]);
        }
      } catch (error) {
        console.error("Error fetching department:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyDepartment();
  }, []);

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    bgInput: isDark ? 'bg-[#0f1623]' : 'bg-[#f1f5f9]',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center ${styles.bgBody}`}>
        <Loader2 className="animate-spin text-[#7c3aed] mb-4" size={40} />
        <p className={`text-xs font-black uppercase tracking-widest ${styles.textMuted}`}>Loading Assignment...</p>
      </div>
    );
  }

  // --- Error/Empty State ---
  if (!myDept) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${styles.bgBody} ${styles.textMain}`}>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
            <h2 className="font-bold text-amber-500">Unassigned Unit</h2>
            <p className={`text-sm ${styles.textMuted} mt-1`}>Your account is not currently linked to a specific department. Please contact HR.</p>
        </div>
      </div>
    );
  }

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} transition-colors duration-300 min-h-screen`}>
      {/* Breadcrumb */}
      <div className={`text-[11px] font-bold uppercase tracking-widest ${styles.textMuted} mb-2`}>
        Organization &gt; My Department
      </div>
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className={`text-3xl font-extrabold tracking-tight ${styles.textMain}`}>My Department</h1>
        <p className={`text-sm ${styles.textMuted}`}>Official departmental assignment and reporting structure</p>
      </div>

      <div className="max-w-4xl">
        <div className={`${styles.bgCard} border ${styles.border} rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-black/20`}>
          {/* Subtle Background Icon */}
          <FolderTree size={120} className="absolute -right-8 -bottom-8 opacity-5 text-[#7c3aed]" />

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Department Icon Box */}
            <div className={`w-20 h-20 rounded-2xl ${styles.bgInput} border ${styles.border} flex items-center justify-center text-[#7c3aed] shrink-0 shadow-xl shadow-purple-500/10`}>
              <FolderTree size={40} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className={`text-2xl font-bold ${styles.textMain}`}>{myDept.name}</h2>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Active Unit
                </span>
                
              </div>
              
              <p className={`text-lg ${styles.textMuted} mb-6 leading-relaxed max-w-2xl`}>
                {myDept.description || "No description available for this department."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reporting Line Card */}
                <div className={`${styles.bgInput} p-4 rounded-xl border ${styles.border}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.textMuted} block mb-2`}>
                    Reporting Line
                  </span>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold bg-[#7c3aed]/10 text-[#7c3aed]`}>
                    {!myDept.parent ? 'Top Level Unit' : (
                      <>
                        <ArrowRight size={14} />
                        {myDept.parent.name}
                      </>
                    )}
                  </div>
                </div>

                {/* Manager Card */}
                <div className={`${styles.bgInput} p-4 rounded-xl border ${styles.border}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.textMuted} block mb-2`}>
                    Department Head
                  </span>
                  <div className={`flex items-center gap-2 font-bold ${styles.textMain}`}>
                    <User size={16} className="text-[#7c3aed]" />
                    {myDept.manager || "Not Assigned"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`mt-8 pt-6 border-t ${styles.border} flex items-center gap-3`}>
            <ShieldCheck size={18} className="text-blue-500" />
            <p className={`text-xs ${styles.textMuted}`}>
              This information is managed by the system administrator. You have <strong>View-Only</strong> access to your assigned department.
            </p>
          </div>
        </div>

        {/* Informative Note */}
        <div className={`mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3 items-start`}>
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-400/80 leading-relaxed">
                Your department assignment affects your project permissions and internal communication channels. 
                If your department head or assignment has changed, please contact <strong>HR Support</strong> to update your profile.
            </p>
        </div>
      </div>
    </main>
  );
};

export default Department;