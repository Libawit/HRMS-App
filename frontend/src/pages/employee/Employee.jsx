import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import axios from 'axios';
import {  
  Mail, Phone, ShieldCheck, Eye, Download, MoreVertical
} from 'lucide-react';

import PreviewEmployeeModal from '../../modals/employee/PreviewEmployee';

const EmployeeDirectory = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const user = context?.user; // Using the logged-in user from context
  const isDark = theme === 'dark';

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Dynamic Styles matching your refined UI
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardClass = isDark ? 'bg-[#0b1220] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm';

  // Format user data for the specific card display
  const myInformation = {
    id: user?.employeeId || 'EMP-000',
    name: user ? `${user.firstName} ${user.lastName}` : 'Loading...',
    role: user?.jobPosition || 'Staff Member',
    email: user?.email || 'email@company.com',
    phone: user?.workPhone || '+251...',
    status: user?.isActive ? 'Active' : 'Inactive',
    avatar: user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=7c3aed&color=fff`,
  };

  const handleDownload = () => {
    const data = `Employee Record: ${myInformation.name}\nID: ${myInformation.id}\nRole: ${myInformation.role}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `My_Profile.txt`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-6">
        <div>
          <p className="text-[#7c3aed] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            Secure Portal &nbsp; • &nbsp; Personal Access
          </p>
          <div className="flex items-center gap-4">
            <h1 className={`text-5xl font-black tracking-tighter ${textMain}`}>My Profile</h1>
            <ShieldCheck className="text-emerald-500" size={32} />
          </div>
        </div>
      </div>

      {/* Profile Card Container - Centered for Private View */}
      <div className="flex justify-center md:justify-start">
        <div className={`${cardClass} border p-8 rounded-[3.5rem] w-full max-w-md transition-all duration-500 group relative overflow-hidden`}>
          
          {/* Top Section: Avatar & Identity */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
               <img 
                src={myInformation.avatar} 
                className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl border-4 border-[#7c3aed]/20" 
                alt="Avatar" 
              />
              <div className="absolute -bottom-2 -right-2 bg-[#7c3aed] p-2 rounded-xl text-white shadow-lg">
                <ShieldCheck size={16} />
              </div>
            </div>

            <div>
              <h2 className={`font-black ${textMain} text-3xl tracking-tight mb-1 lowercase`}>
                {myInformation.name}
              </h2>
              <p className="text-[11px] text-[#7c3aed] font-black uppercase tracking-[0.3em]">
                {myInformation.role}
              </p>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 mb-8 bg-white/5 p-6 rounded-4xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
                <Mail size={18} />
              </div>
              <span className={`text-sm font-bold ${textMuted}`}>{myInformation.email}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
                <Phone size={18} />
              </div>
              <span className={`text-sm font-bold ${textMuted}`}>{myInformation.phone}</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className={`pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} flex justify-between items-center`}>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-[#7c3aed] uppercase tracking-widest mb-1">Status</span>
              <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                {myInformation.status}
              </span>
            </div>

            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-all shadow-lg shadow-[#7c3aed]/20 flex items-center gap-2"
            >
              <Eye size={14} /> View Full Profile
            </button>
          </div>

          {/* Subtle Background Icon */}
          <ShieldCheck className="absolute -top-10 -right-10 text-[#7c3aed]/5 w-40 h-40" />
        </div>
      </div>

      {/* Modal */}
      {user && (
        <PreviewEmployeeModal 
          isOpen={isPreviewOpen} 
          employee={user} 
          onClose={() => setIsPreviewOpen(false)} 
          theme={theme}
        />
      )}
    </div>
  );
};

export default EmployeeDirectory;