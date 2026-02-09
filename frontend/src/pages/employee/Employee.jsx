import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; 
import { 
  Plus, MoreVertical, Edit, Trash2, Download, ShieldCheck 
} from 'lucide-react';

// Using the employee-specific preview modal for personal view
import PreviewEmployeeModal from '../../modals/employee/PreviewEmployee';

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  // Get theme from Layout context
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Exact Dynamic Style Constants from your reference
  const cardBg = isDark ? 'bg-[#0b1220] border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-sm';
  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-slate-400' : 'text-slate-500';

  // Strictly defining the logged-in user's data (Private View)
  const myInformation = {
    id: 'EMP-012', 
    name: 'James Wilson', // Name synced with your Employee ID: EMP-012 records
    role: 'Senior Developer', 
    position: 'Lead Architecture',
    dept: 'Engineering', 
    email: 'j.wilson@company.com', 
    phone: '555-0199',
    status: 'Active', 
    avatar: 'https://i.pravatar.cc/150?u=james',
    bio: 'Lead frontend architect specializing in secure enterprise systems. Managing core engineering operations and system scalability.',
    location: 'Main Headquarter',
    joined: '2020'
  };

  const togglePreview = (emp) => {
    setSelectedEmp(emp);
    setIsPreviewOpen(!isPreviewOpen);
    setActiveDropdown(null);
  };

  const handleDownload = (emp) => {
    const data = `Employee Record: ${emp.name}\nID: ${emp.id}\nDept: ${emp.dept}\nRole: ${emp.role}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `My_Record_${emp.id}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header - Styled exactly as reference */}
      <div className="flex flex-col md:flex-row justify-between md:items-center m-8 gap-4">
        <div>
          <nav className={`text-[0.85rem] font-medium mb-1 ${subText}`}>
            Home &nbsp; &gt; &nbsp; Secure Portal &nbsp; &gt; &nbsp; My Profile
          </nav>
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl font-black tracking-tighter ${titleText}`}>Personal Profile</h1>
            <ShieldCheck className="text-emerald-500" size={24} />
          </div>
        </div>
      </div>

      {/* Grid - Only displaying the single "My Information" Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className={`${cardBg} p-7 rounded-[2.5rem] group relative transition-all duration-300 hover:scale-[1.01]`}>
          
          {/* Action Dropdown */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-5">
              <img src={myInformation.avatar} className="w-16 h-16 rounded-3xl object-cover border-2 border-white/5 shadow-lg" alt="Avatar" />
              <div>
                <div className={`font-black text-lg tracking-tight ${titleText}`}>{myInformation.name}</div>
                <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{myInformation.role}</div>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === myInformation.id ? null : myInformation.id)} 
                className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <MoreVertical size={20} />
              </button>
              
              {activeDropdown === myInformation.id && (
                <div className={`absolute right-0 top-full mt-2 w-48 border rounded-2xl shadow-2xl z-20 p-1.5 overflow-hidden ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}>
                  <button 
                    onClick={() => handleDownload(myInformation)} 
                    className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Download size={14}/> Download Info
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <p className={`text-xs mb-6 line-clamp-3 leading-relaxed ${subText}`}>
            {myInformation.bio}
          </p>
          
          <div className={`pt-6 border-t flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-tighter text-indigo-500 mb-1">Current Status</span>
               <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                {myInformation.status}
              </span>
            </div>
            
            <button 
              onClick={() => togglePreview(myInformation)} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                isDark 
                ? 'bg-white/5 text-white border-white/5 hover:bg-indigo-600 hover:border-indigo-600' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
              }`}
            >
              View Full Info
            </button>
          </div>
        </div>
      </div>

      {/* MODAL COMPONENTS */}
      {selectedEmp && (
        <PreviewEmployeeModal 
          isOpen={isPreviewOpen} 
          employee={selectedEmp} 
          onClose={() => setIsPreviewOpen(false)} 
          theme={theme}
        />
      )}
    </div>
  );
};

export default EmployeeDirectory;