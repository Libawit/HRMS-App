import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, User, Briefcase, Mail, ShieldCheck, Camera, Loader2, 
  CheckCircle, AlertCircle, Trash2, Upload
} from 'lucide-react';

const EditEmployeeModal = ({ employee, isOpen, onClose, theme, onUpdateSuccess }) => {
  const fileInputRef = useRef(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  
  const [departments, setDepartments] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);

  // Check if the user is editing their own record
  // We pull the logged-in user ID from localStorage/Token
  const loggedInUserId = JSON.parse(localStorage.getItem('user'))?.id;
  const isSelfEditing = employee?.id === loggedInUserId;
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '', nationalId: '',
    maritalStatus: 'Single', employeeId: '', departmentId: '', jobPositionId: '',
    hireDate: '', workPhone: '', address: '', emergencyContactName: '',
    emergencyRelationship: '', emergencyPhone: '', email: '', 
    role: 'Employee', allowLogin: true
  });

  const isDark = theme === 'dark';

  const styles = {
    overlay: `fixed inset-0 z-[3000] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300 ${isDark ? 'bg-[#020617]/90' : 'bg-slate-900/40'}`,
    modal: `${isDark ? 'bg-[#0b1220] border-white/10 text-gray-100' : 'bg-white border-slate-200 text-slate-900'} w-full max-w-[1250px] max-h-[95vh] rounded-[3rem] border flex flex-col overflow-hidden shadow-2xl`,
    header: `px-10 py-8 border-b flex justify-between items-center ${isDark ? 'bg-[#0f172a]/50 border-white/5' : 'bg-slate-50 border-slate-100'}`,
    footer: `px-10 py-6 border-t flex justify-end gap-3 ${isDark ? 'bg-[#0f172a]/80 border-white/5' : 'bg-slate-50 border-slate-100'}`,
    content: "p-10 overflow-y-auto custom-scrollbar",
    card: `${isDark ? 'bg-[#0f172a]/40 border-white/5' : 'bg-slate-50 border-slate-100'} border p-8 rounded-[2.5rem] transition-all`,
    input: `w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`,
    sectionHeader: `text-indigo-600 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 border-b pb-3 mb-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`,
    label: "text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] block mb-1.5 ml-1",
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          fetch('http://localhost:3000/api/auth/departments'),
          fetch('http://localhost:3000/api/auth/positions')
        ]);
        setDepartments(await deptRes.json());
        setAllPositions(await posRes.json());
      } catch (err) { console.error(err); }
    };
    if (isOpen) fetchMetadata();
  }, [isOpen]);

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        ...employee,
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        allowLogin: employee.isActive ?? true,
      });
      setProfilePreview(employee.profileImage);
      setSelectedFile(null);
    }
  }, [employee, isOpen]);

  useEffect(() => {
    if (formData.departmentId) {
      setFilteredPositions(allPositions.filter(p => p.departmentId === formData.departmentId));
    }
  }, [formData.departmentId, allPositions]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'departmentId' ? { jobPositionId: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (!['department', 'jobPosition', 'createdAt', 'updatedAt', 'auditLogs', 'departmentRel', 'jobPositionRel'].includes(key)) {
          data.append(key, formData[key]);
        }
      });

      if (selectedFile) data.append('profileImage', selectedFile);

      const response = await fetch(`http://localhost:3000/api/auth/employees/${employee.id}`, {
        method: 'PATCH',
        headers: {
            // Include token if your routes are protected
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        // If editing self, update local storage with new data/token
        if (isSelfEditing) {
            if (result.token) localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.employee));
        }

        setShowNotification({ type: 'success', message: 'RECORDS UPDATED' });
        setTimeout(() => { 
          onUpdateSuccess(); 
          onClose(); 
          setShowNotification(null); 
          if (isSelfEditing) window.location.reload(); // Refresh to update UI/Sidebar
        }, 1500);
      } else {
        setShowNotification({ type: 'error', message: result.message || 'UPDATE FAILED' });
      }
    } catch (err) {
      setShowNotification({ type: 'error', message: 'SERVER ERROR' });
    } finally { setIsSubmitting(false); }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {showNotification && (
        <div className={`fixed top-10 right-10 z-5000 flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 ${
          showNotification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
        }`}>
          {showNotification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-black text-[10px] uppercase tracking-widest">{showNotification.message}</span>
        </div>
      )}

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">
                {isSelfEditing ? "Edit My Profile" : "Edit Employee Profile"}
            </h1>
            <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-1">
                {isSelfEditing ? "Personal Account Settings" : `System ID: ${employee.id}`}
            </p>
          </div>
          <button onClick={onClose} className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              
              <div className={styles.card}>
                <h3 className={styles.sectionHeader}><User size={14} /> 01. Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={styles.label}>First Name</label><input name="firstName" value={formData.firstName} onChange={handleChange} className={styles.input} /></div>
                  <div><label className={styles.label}>Last Name</label><input name="lastName" value={formData.lastName} onChange={handleChange} className={styles.input} /></div>
                  <div><label className={styles.label}>Date of Birth</label><input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className={styles.input} /></div>
                  <div>
                    <label className={styles.label}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={styles.input}>
                      <option value="male">Male</option><option value="female">Female</option>
                    </select>
                  </div>
                  <div><label className={styles.label}>National ID</label><input name="nationalId" value={formData.nationalId} onChange={handleChange} className={styles.input} /></div>
                  <div><label className={styles.label}>Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={styles.input}>
                      <option>Single</option><option>Married</option><option>Divorced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.sectionHeader}><Briefcase size={14} /> 02. Professional Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={styles.label}>Employee ID Number</label><input name="employeeId" value={formData.employeeId} onChange={handleChange} className={styles.input} /></div>
                  <div><label className={styles.label}>Hire Date</label><input name="hireDate" type="date" value={formData.hireDate} onChange={handleChange} className={styles.input} /></div>
                  <div><label className={styles.label}>Department</label>
                    <select name="departmentId" value={formData.departmentId} onChange={handleChange} className={styles.input}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div><label className={styles.label}>Job Position</label>
                    <select name="jobPositionId" value={formData.jobPositionId} onChange={handleChange} className={styles.input}>
                      <option value="">Select Position</option>
                      {filteredPositions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.sectionHeader}><Mail size={14} /> 03. Contact & Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={styles.label}>Work Phone</label><input name="workPhone" value={formData.workPhone} onChange={handleChange} className={styles.input} /></div>
                  <div><label className={styles.label}>Email Address</label><input name="email" type="email" value={formData.email} onChange={handleChange} className={styles.input} /></div>
                  <div className="md:col-span-2"><label className={styles.label}>Home Address</label><textarea name="address" rows="2" value={formData.address} onChange={handleChange} className={`${styles.input} resize-none`} /></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className={styles.card}>
                <h3 className={styles.sectionHeader}><Camera size={14} /> Profile Picture</h3>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-indigo-500/10 border-2 border-dashed border-indigo-500/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-indigo-500/40" />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all"
                    >
                      <Upload size={18} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      Change
                    </button>
                    {profilePreview && (
                      <button 
                        type="button"
                        onClick={removeImage}
                        className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.sectionHeader}><ShieldCheck size={14} /> Access Control</h3>
                <div className="space-y-6">
                  <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} ${isSelfEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Member</span>
                    <input 
                        type="checkbox" 
                        name="allowLogin" 
                        disabled={isSelfEditing} 
                        checked={formData.allowLogin} 
                        onChange={handleChange} 
                        className="w-5 h-5 accent-indigo-600" 
                    />
                  </div>
                  <div>
                    <label className={styles.label}>System Role</label>
                    <select 
                        name="role" 
                        disabled={isSelfEditing} 
                        value={formData.role} 
                        onChange={handleChange} 
                        className={styles.input}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                    </select>
                    {isSelfEditing && (
                        <p className="text-[8px] text-amber-500 font-bold uppercase mt-2 px-1">
                            Role cannot be self-modified for security.
                        </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={`px-10 py-3.5 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all ${isDark ? 'bg-[#0f172a] border-white/10 text-slate-400 hover:bg-white/5' : 'bg-white border-slate-200 text-slate-500'}`}>Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;