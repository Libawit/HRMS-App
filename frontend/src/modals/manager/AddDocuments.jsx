import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Loader2, CloudUpload, FileText, Trash2, CheckCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

const AddDocuments = ({ isOpen, onClose, theme = 'dark', onUpload }) => {
  // --- Auth Context (Same as Attendance/Leave logic) ---
  const { user } = useOutletContext();
  const managerDeptId = user?.departmentId || user?.dept_id; 

  // --- UI & Data State ---
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Document Specific State ---
  const [category, setCategory] = useState('contracts');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const isDark = theme === 'dark';

  // --- Close Dropdown on Outside Click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Fetch All Users ---
  useEffect(() => {
    if (isOpen) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const res = await axios.get('http://localhost:5000/api/auth/users');
          setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Failed to fetch employees", err);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [isOpen]);

  // --- EXACT SEARCH & FILTERING LOGIC ---
  
  // 1. Filter by Department ID (Restricts manager to their own team)
  const deptEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (!managerDeptId) return true; 
      const empDeptId = emp.dept_id || emp.departmentId || emp.department_id;
      return String(empDeptId) === String(managerDeptId);
    });
  }, [employees, managerDeptId]);

  // 2. Search Logic within that department
  const filteredEmployees = useMemo(() => {
    return deptEmployees.filter(emp => {
      const fullName = (emp.name || `${emp.firstName} ${emp.lastName}`).toLowerCase();
      const empId = (emp.employeeId || "").toLowerCase();
      const search = searchQuery.toLowerCase();
      return fullName.includes(search) || empId.includes(search);
    });
  }, [deptEmployees, searchQuery]);

  const handleUpload = async () => {
    if (!selectedEmployee || uploadQueue.length === 0) return;
    setIsUploading(true);

    try {
      const item = uploadQueue[0];
      const formData = new FormData();
      
      formData.append('file', item.file); 
      formData.append('category', category);
      formData.append('userId', selectedEmployee.id || selectedEmployee._id);
      
      // Ensure departmentId is linked to the document
      const docDeptId = selectedEmployee.dept_id || selectedEmployee.departmentId || managerDeptId;
      formData.append('departmentId', docDeptId);

      await axios.post('http://localhost:5000/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (onUpload) onUpload(); 
      handleClose();
    } catch (error) {
      alert(error.response?.data?.error || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedEmployee(null);
    setUploadQueue([]);
    setIsDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const styles = {
    overlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark ? "bg-[#0b1220] border-white/10 text-[#e5e7eb]" : "bg-white border-slate-200 text-[#1e293b]",
    input: isDark ? "bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white" : "bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900",
    dropdown: isDark ? "bg-[#0f172a] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
  };

  return (
    <div className={styles.overlay}>
      <div className={`w-full max-w-xl rounded-4xl border ${styles.card} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-linear-to-r from-transparent to-purple-500/5">
          <div>
            <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Upload Vault</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Department: {managerDeptId || 'Global Access'}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Employee Search (Restricted by Department logic) */}
            <div className="relative" ref={dropdownRef}>
              <label className={styles.label}>Select Team Member*</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  autoComplete="off"
                  placeholder="Search team..."
                  className={`w-full border rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all ${styles.input}`}
                  value={searchQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                    if (selectedEmployee) setSelectedEmployee(null);
                  }}
                />
              </div>

              {isDropdownOpen && searchQuery && (
                <div className={`absolute z-50 w-full mt-2 rounded-2xl border max-h-52 overflow-y-auto p-2 ${styles.dropdown}`}>
                  {loading ? (
                    <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-[#7c3aed]" /></div>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => {
                      const displayName = emp.name || `${emp.firstName} ${emp.lastName}`;
                      return (
                        <button 
                          key={emp.id || emp._id}
                          type="button"
                          className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                          onClick={() => { 
                            setSelectedEmployee(emp); 
                            setSearchQuery(displayName); 
                            setIsDropdownOpen(false); 
                          }}
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-sm">
                            {displayName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-black">{displayName}</div>
                            <div className="text-[10px] opacity-50 font-bold uppercase">ID: {emp.employeeId || 'N/A'}</div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-[10px] font-bold text-slate-500 uppercase">
                      No matching team members
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category selection */}
            <div>
              <label className={styles.label}>Document Category*</label>
              <select 
                className={`w-full border rounded-2xl p-4 text-sm font-black outline-none ${styles.input}`}
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="contracts">Contracts</option>
                <option value="identity">Identity/IDs</option>
                <option value="certificates">Certificates</option>
                <option value="payslips">Payslips</option>
                <option value="academic">Academic</option>
              </select>
            </div>
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => selectedEmployee && fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
              selectedEmployee 
                ? 'border-[#7c3aed] bg-[#7c3aed]/5 cursor-pointer hover:bg-[#7c3aed]/10' 
                : 'border-white/5 bg-white/2 opacity-30 cursor-not-allowed'
            }`}
          >
            <CloudUpload size={40} className="text-[#7c3aed] mx-auto mb-3" />
            <p className="text-sm font-black">
              {uploadQueue.length > 0 ? "PDF Ready for Upload" : "Click to select PDF"}
            </p>
            {!selectedEmployee && <p className="text-[10px] text-red-500 font-bold mt-2 uppercase">Select a team member first</p>}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                const f = e.target.files[0];
                if (f?.type === 'application/pdf') {
                  setUploadQueue([{ id: Date.now(), file: f, name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + ' MB' }]);
                } else if (f) {
                  alert("Please upload PDF files only");
                }
              }} 
              accept=".pdf" 
              className="hidden" 
            />
          </div>

          {/* Queue View */}
          {uploadQueue.map((file) => (
            <div key={file.id} className={`p-4 rounded-2xl border flex items-center justify-between animate-in slide-in-from-bottom-2 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl"><FileText className="text-red-500" size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-xs font-black truncate max-w-50">{file.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{file.size}</span>
                </div>
              </div>
              <button onClick={() => setUploadQueue([])} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-colors">
                <Trash2 size={18}/>
              </button>
            </div>
          ))}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={handleClose} className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">Cancel</button>
            <button 
              onClick={handleUpload}
              disabled={isUploading || !selectedEmployee || uploadQueue.length === 0}
              className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-20 disabled:grayscale"
            >
              {isUploading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
              Finalize Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocuments;