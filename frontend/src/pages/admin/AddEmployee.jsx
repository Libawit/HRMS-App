import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, User, Briefcase, Mail, MapPin, 
  ChevronRight, Save, CheckCircle, AlertCircle, X,
  FileText, ShieldCheck, HeartPulse, Lock, Calendar, Loader2, Trash2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const AddEmployee = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const [departments, setDepartments] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);

  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  
  const [emailError, setEmailError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ employeeId: '', nationalId: '' });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    nationalId: '', maritalStatus: 'Single', employeeId: '',
    departmentId: '', jobPositionId: '', hireDate: '',
    workPhone: '', address: '', emergencyContactName: '',
    emergencyRelationship: '', emergencyPhone: '', email: '',
    password: '', role: 'Employee', allowLogin: true
  });

  const fileInputRef = useRef(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [deptRes, posRes] = await Promise.all([
          fetch('http://localhost:5000/api/auth/departments', { headers }),
          fetch('http://localhost:5000/api/positions', { headers })
        ]);

        // Handle cases where the response might not be JSON (like a 401 error page)
        if (!deptRes.ok || !posRes.ok) {
          throw new Error('Unauthorized or Server Error');
        }

        setDepartments(await deptRes.json());
        setAllPositions(await posRes.json());
      } catch (err) { 
        console.error("Metadata fetch failed", err); 
      }
    };
    fetchMetadata();
  }, []);

  // --- Filter Positions based on Department ---
  useEffect(() => {
    if (formData.departmentId) {
      setFilteredPositions(allPositions.filter(p => p.departmentId === formData.departmentId));
    } else {
      setFilteredPositions([]);
    }
  }, [formData.departmentId, allPositions]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setEmailError('Email is required'); return false; }
    if (!regex.test(email)) { setEmailError('Enter a valid email'); return false; }
    setEmailError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'departmentId' ? { jobPositionId: '' } : {})
    }));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setShowNotification({ type: 'error', message: 'Image must be less than 2MB' });
        return;
      }
      setSelectedFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // --- REMOVE PHOTO LOGIC ---
  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input
    }
  };

  // --- SUBMIT LOGIC ---
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateEmail(formData.email)) return;

  setIsSubmitting(true);
  const token = localStorage.getItem('token'); // Get the token

  const dataToSend = new FormData();
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    dataToSend.append(key, value === null ? '' : value);
  });

  if (selectedFile) {
    dataToSend.append('profileImage', selectedFile);
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // Add the badge here
        // Note: Do NOT set 'Content-Type' when sending FormData; 
        // the browser needs to set the boundary itself.
      },
      body: dataToSend, 
    });

    const data = await response.json();
    // ... rest of your logic

      if (response.ok) {
        setShowNotification({ type: 'success', message: 'Employee Created Successfully!' });
        setFormData({
          firstName: '', lastName: '', dateOfBirth: '', gender: '',
          nationalId: '', maritalStatus: 'Single', employeeId: '',
          departmentId: '', jobPositionId: '', hireDate: '',
          workPhone: '', address: '', emergencyContactName: '',
          emergencyRelationship: '', emergencyPhone: '', email: '',
          password: '', role: 'Employee', allowLogin: true
        });
        setProfilePreview(null);
        setSelectedFile(null);
      } else {
        const errMsg = data.message?.toLowerCase() || '';
        if (errMsg.includes('employee id')) {
          setFieldErrors(prev => ({ ...prev, employeeId: 'ID already assigned' }));
        }
        if (errMsg.includes('national id')) {
          setFieldErrors(prev => ({ ...prev, nationalId: 'ID already exists' }));
        }
        setShowNotification({ type: 'error', message: data.message || 'Registration failed' });
      }
    } catch (err) {
      setShowNotification({ type: 'error', message: 'Connection to server failed' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowNotification(null), 5000);
    }
  };

  const styles = {
    body: isDark ? 'bg-[#020617] text-gray-200' : 'bg-[#f8fafc] text-slate-900',
    card: isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-black/10 shadow-sm',
    input: isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    sectionHeader: 'text-[#7c3aed] text-[11px] font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-6',
    border: isDark ? 'border-white/10' : 'border-black/10',
    errorLabel: "text-[9px] text-red-500 font-black uppercase tracking-widest mt-1 ml-1"
  };

  return (
    <div className={`min-h-screen ${styles.body} p-6 lg:p-10 transition-colors duration-300`}>
      {showNotification && (
        <div className={`fixed top-6 right-6 z-9999 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-right-10 ${
          showNotification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {showNotification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-xs uppercase tracking-widest">{showNotification.message}</span>
          <button onClick={() => setShowNotification(null)}><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
        <div>
          <p className={`${styles.textMuted} text-[10px] mb-1 uppercase tracking-widest font-black`}>Directory / Registration</p>
          <h1 className="text-4xl font-black tracking-tighter">Add New Employee</h1>
        </div>
        <button type="submit" form="employee-form" disabled={isSubmitting} className="flex items-center justify-center gap-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50">
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isSubmitting ? 'Registering...' : 'Complete Registration'}
        </button>
      </div>

      <form id="employee-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
        <div className="xl:col-span-2 space-y-8">
          <div className={`${styles.card} border p-8 rounded-[2.5rem]`}>
            <h3 className={styles.sectionHeader}><User className="inline mr-2" size={14} /> 01. Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>First Name</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} placeholder="John" />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Last Name</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} placeholder="Doe" />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Date of Birth</label>
                <input required name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Gender</label>
                <select required name="gender" value={formData.gender} onChange={handleChange} className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>National ID / Passport</label>
                <input required name="nationalId" value={formData.nationalId} onChange={handleChange} type="text" className={`w-full ${styles.input} border p-4 rounded-xl outline-none font-bold ${fieldErrors.nationalId ? 'border-red-500' : 'focus:border-[#7c3aed]'}`} placeholder="ID-123456" />
                {fieldErrors.nationalId && <p className={styles.errorLabel}>{fieldErrors.nationalId}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Marital Status</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`}>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`${styles.card} border p-8 rounded-[2.5rem]`}>
            <h3 className={styles.sectionHeader}><Briefcase className="inline mr-2" size={14} /> 02. Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Employee ID</label>
                <input required name="employeeId" value={formData.employeeId} onChange={handleChange} type="text" className={`w-full ${styles.input} border p-4 rounded-xl outline-none font-bold ${fieldErrors.employeeId ? 'border-red-500' : 'focus:border-[#7c3aed]'}`} placeholder="EMP001" />
                {fieldErrors.employeeId && <p className={styles.errorLabel}>{fieldErrors.employeeId}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Hire Date</label>
                <input required name="hireDate" value={formData.hireDate} onChange={handleChange} type="date" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Department</label>
                <select required name="departmentId" value={formData.departmentId} onChange={handleChange} className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`}>
                  <option value="">Select Department</option>
                  {departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Job Position</label>
                <select required name="jobPositionId" value={formData.jobPositionId} onChange={handleChange} disabled={!formData.departmentId} className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] disabled:opacity-50 font-bold`}>
                  <option value="">{formData.departmentId ? "Select Position" : "Choose Dept First"}</option>
                  {filteredPositions.map(pos => (<option key={pos.id} value={pos.id}>{pos.title}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div className={`${styles.card} border p-8 rounded-[2.5rem]`}>
            <h3 className={styles.sectionHeader}><Mail className="inline mr-2" size={14} /> 03. Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Work Phone</label>
                <input required name="workPhone" value={formData.workPhone} onChange={handleChange} type="tel" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} placeholder="+233..." />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Residential Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] resize-none font-bold`} placeholder="House No, Street, City"></textarea>
              </div>
            </div>
          </div>

          <div className={`${styles.card} border p-8 rounded-[2.5rem]`}>
            <h3 className={styles.sectionHeader}><HeartPulse className="inline mr-2" size={14} /> 04. Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Contact Name</label>
                <input required name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} type="text" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Relationship</label>
                <input required name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleChange} type="text" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Phone</label>
                <input required name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} type="tel" className={`w-full ${styles.input} border p-4 rounded-xl outline-none focus:border-[#7c3aed] font-bold`} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`${styles.card} border p-8 rounded-[2.5rem]`}>
            <h3 className={styles.sectionHeader}><ShieldCheck className="inline mr-2" size={14} /> 05. Login Credentials</h3>
            <div className="space-y-5">
              <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} rounded-xl border`}>
                <p className="text-sm font-bold">Enable Account</p>
                <input type="checkbox" name="allowLogin" checked={formData.allowLogin} onChange={handleChange} className="w-5 h-5 accent-[#7c3aed] cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Login Email</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${emailError ? 'text-red-500' : 'text-slate-500'}`} size={16} />
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className={`w-full ${styles.input} border pl-11 p-3 rounded-xl outline-none text-sm font-bold ${emailError ? 'border-red-500' : 'focus:border-[#7c3aed]'}`} />
                </div>
                {emailError && <p className={styles.errorLabel}>{emailError}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>Default Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input required name="password" value={formData.password} onChange={handleChange} type="password" className={`w-full ${styles.input} border pl-11 p-3 rounded-xl outline-none focus:border-[#7c3aed] text-sm font-bold`} placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs ${styles.textMuted} font-bold ml-1`}>System Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className={`w-full ${styles.input} border p-3 rounded-xl text-sm font-bold outline-none`}>
                  <option value="Employee">Standard Employee</option>
                  <option value="Manager">Department Manager</option>
                  <option value="Admin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`${styles.card} border p-8 rounded-[2.5rem] text-center`}>
            <h3 className={styles.sectionHeader}>Profile Picture</h3>
            <div className="relative group mx-auto w-36 h-36 mb-6">
              <div className={`w-full h-full rounded-[2.5rem] border-4 border-dashed ${styles.border} overflow-hidden flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                {profilePreview ? (
                  <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className={styles.textMuted} />
                )}
              </div>
              
              {/* Conditional Overlay: If photo exists, show Update/Remove options */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2.5rem] gap-2">
                <button type="button" onClick={() => fileInputRef.current.click()} className="text-white font-black text-[10px] uppercase tracking-widest hover:text-[#7c3aed] transition-colors">
                  {profilePreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {profilePreview && (
                  <>
                    <div className="w-8 h-px bg-white/20" />
                    <button type="button" onClick={handleRemovePhoto} className="text-red-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:text-red-500 transition-colors">
                      <Trash2 size={12} /> Remove
                    </button>
                  </>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleProfileChange}
                key={profilePreview || 'empty'} 
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;