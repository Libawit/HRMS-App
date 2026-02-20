import React from 'react';
import { X, ShieldCheck, UserCheck, Building, Target, Briefcase } from 'lucide-react';

const ViewStructure = ({ isOpen, onClose, data, theme = 'dark' }) => {
  if (!isOpen || !data) return null;
  const isDark = theme === 'dark';

  // Helper to resolve display name from the nested employee object
  const getDisplayName = (user) => {
    if (!user) return 'N/A';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.name || user.email?.split('@')[0] || 'Unknown User';
  };

  // Extracting data based on your Prisma include structure
  const employeeName = getDisplayName(data.employee);
  const jobTitle = data.jobPosition?.title || data.employee?.jobPositionRel?.title || 'Staff Member';
  const deptName = data.department?.name || data.employee?.departmentRel?.name || 'Unassigned';
  const supervisorName = data.manager ? getDisplayName(data.manager) : 'Independent (Self-Reporting)';
  
  // Initials for avatar placeholder since data.img might not exist in DB
  const initials = employeeName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-3000 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-[3rem] border relative ${isDark ? 'bg-[#0b1220] border-white/10 shadow-2xl shadow-purple-500/10' : 'bg-white border-slate-200 shadow-xl'} overflow-hidden animate-in zoom-in-95 duration-300`}>
        
        <div className="p-10 flex flex-col items-center text-center">
          <button 
            onClick={onClose} 
            className={`absolute top-8 right-8 p-3 rounded-full transition-colors ${isDark ? 'text-slate-500 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <X size={24}/>
          </button>
          
          {/* Profile Image / Initials */}
          {data.employee?.image ? (
            <img src={data.employee.image} className="w-24 h-24 rounded-4xl border-4 border-[#7c3aed]/20 mb-6 object-cover" alt={employeeName}/>
          ) : (
            <div className="w-24 h-24 rounded-4xl bg-linear-to-tr from-[#7c3aed] to-purple-400 flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg">
              {initials}
            </div>
          )}

          <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {employeeName}
          </h2>
          
          <div className="flex items-center gap-2 mt-2">
            <p className="text-[#7c3aed] font-black text-xs uppercase tracking-widest">{jobTitle}</p>
            <span className="text-slate-500">•</span>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{deptName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-10">
            {/* Reports To Box */}
            <div className={`p-6 rounded-4xl border text-left ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <ShieldCheck size={16}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Reports To</span>
              </div>
              <p className={`text-lg font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {supervisorName}
              </p>
            </div>

            {/* Department Box */}
            <div className={`p-6 rounded-4xl border text-left ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Building size={16}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Organization Unit</span>
              </div>
              <p className={`text-lg font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {deptName}
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="w-full mt-10 pt-10 border-t border-white/5 flex flex-col gap-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hierarchy Status</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <UserCheck size={14}/> Verified Line
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee ID</span>
                <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {/* We look into data.employee.employeeId (the field in your User model)
                    If that's missing, we fall back to the first 8 chars of the unique ID */}
                  {data.employee?.employeeId || data.employee?.id?.substring(0, 8).toUpperCase() || 'N/A'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-full py-5 bg-[#7c3aed] text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-500/20 hover:bg-[#6d28d9] transition-all"
            >
              Close Relationship View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStructure;