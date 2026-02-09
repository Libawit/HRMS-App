import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  X, CloudUpload, FileText, Search, 
  Trash2, Loader2, User 
} from 'lucide-react';

const AddDocuments = ({ isOpen, onClose, onUpload, theme = 'dark' }) => {
  // --- State ---
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Added for search behavior
  const [category, setCategory] = useState('contracts');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef(null); // Added to match Leave Request logic
  const fileInputRef = useRef(null);
  const isDark = theme === 'dark';

  // --- Click Outside Handler (Matching Leave Request) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Fetch All Employees ---
  useEffect(() => {
    if (isOpen) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const res = await axios.get('http://localhost:3000/api/auth/users');
          const data = Array.isArray(res.data) ? res.data : [];
          
          const formatted = data.map(emp => ({
            ...emp,
            fullName: emp.name || `${emp.firstName} ${emp.lastName}`
          }));
          
          setEmployees(formatted);
        } catch (err) {
          console.error("Failed to load employees", err);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [isOpen]);

  // --- Filter Logic ---
  const filteredEmployees = useMemo(() => {
    const search = searchTerm.toLowerCase();
    if (!search.trim() || selectedEmployee?.fullName === searchTerm) return [];
    return employees.filter(emp => 
      emp.fullName.toLowerCase().includes(search) ||
      emp.employeeId?.toLowerCase().includes(search)
    ).slice(0, 5);
  }, [searchTerm, employees, selectedEmployee]);

  if (!isOpen) return null;

  // --- Styles (Synced with Leave Request) ---
  const styles = {
    overlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border border-white/10 w-full max-w-xl rounded-4xl p-8 shadow-2xl" 
      : "bg-white border border-slate-200 w-full max-w-xl rounded-4xl p-8 shadow-2xl",
    input: isDark
      ? "w-full bg-[#020617] border-white/10 focus:border-[#7c3aed] text-white rounded-2xl p-4 text-sm font-bold outline-none transition-all"
      : "w-full bg-[#f1f5f9] border-slate-200 focus:border-[#7c3aed] text-slate-900 rounded-2xl p-4 text-sm font-bold outline-none transition-all",
    dropdown: isDark 
      ? "bg-[#0f172a] border-white/10 shadow-2xl" 
      : "bg-white border-slate-200 shadow-xl",
    label: "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block",
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedEmployee(null);
    setUploadQueue([]);
    setIsDropdownOpen(false);
    onClose();
  };

  // Inside AddDocuments.jsx -> handleUpload function
const handleUpload = async () => {
  if (!selectedEmployee || uploadQueue.length === 0) return;
  setIsUploading(true);

  try {
    const item = uploadQueue[0];
    const formData = new FormData();
    
    formData.append('file', item.file); 
    formData.append('category', category);
    formData.append('userId', selectedEmployee.id);
    
    // Fix: Provide a fallback or ensure it's a string
    const deptId = selectedEmployee.departmentId || "";
    formData.append('departmentId', deptId);

    await axios.post('http://localhost:3000/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    onUpload(); 
    handleClose();
  } catch (error) {
    // Improved error logging to see the exact message from Prisma/Server
    console.error("Server Response:", error.response?.data);
    alert(error.response?.data?.error || "Upload failed.");
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-black text-xl tracking-tighter text-[#7c3aed]">Upload Vault</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Add PDF to employee profile</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"><X size={20} strokeWidth={3} /></button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Searchable Employee Field - Exact match to Leave Request */}
            <div className="relative" ref={dropdownRef}>
              <label className={styles.label}>Select Employee*</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search name or ID..."
                  className={`${styles.input} pl-12`}
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    if (selectedEmployee) setSelectedEmployee(null);
                  }}
                />
              </div>

              {isDropdownOpen && searchTerm && (
                <div className={`absolute z-50 w-full mt-2 rounded-2xl border max-h-52 overflow-y-auto p-2 ${styles.dropdown}`}>
                  {loading ? (
                    <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-[#7c3aed]" /></div>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <button 
                        key={emp.id}
                        type="button"
                        onClick={() => { 
                          setSelectedEmployee(emp); 
                          setSearchTerm(emp.fullName); 
                          setIsDropdownOpen(false); 
                        }}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-sm">
                          {emp.fullName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-black">{emp.fullName}</div>
                          <div className="text-[10px] opacity-50 font-bold uppercase">ID: {emp.employeeId}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] font-bold text-slate-500 uppercase">No employee found</div>
                  )}
                </div>
              )}
            </div>

            {/* Category selection */}
            <div>
              <label className={styles.label}>Vault Category*</label>
              <select className={styles.input} value={category} onChange={(e) => setCategory(e.target.value)}>
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
            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {uploadQueue.length > 0 ? "PDF Ready for Upload" : "Click to select PDF"}
            </p>
            {selectedEmployee && (
              <p className="text-[10px] text-[#7c3aed] mt-2 font-black uppercase tracking-widest bg-[#7c3aed]/10 py-1 px-3 rounded-full inline-block">
                Target: {selectedEmployee.fullName}
              </p>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                const f = e.target.files[0];
                if (f?.type === 'application/pdf') {
                  setUploadQueue([{ id: Date.now(), file: f, name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + ' MB' }]);
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
                  <span className={`text-xs font-black truncate max-w-50 ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{file.size}</span>
                </div>
              </div>
              <button onClick={() => setUploadQueue([])} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-white/5">
          <button onClick={handleClose} className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-all">Cancel</button>
          <button 
            onClick={handleUpload}
            disabled={isUploading || !selectedEmployee || uploadQueue.length === 0}
            className="bg-[#7c3aed] text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-20 disabled:grayscale"
          >
            {isUploading ? <Loader2 className="animate-spin" size={14} /> : <CloudUpload size={14} />}
            Finalize & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocuments;