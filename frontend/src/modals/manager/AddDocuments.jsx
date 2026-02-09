import React, { useState, useRef } from 'react';
import { 
  X, 
  CloudUpload, 
  FileText, 
  Search, 
  FolderTree, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

const AddDocuments = ({ isOpen, onClose, onUpload, theme = 'dark' }) => {
  // --- Manager Context (Mock) ---
  const managerDept = "Engineering";
  const managerName = "Admin_Manager_01";
  
  // Mock Employee List (Filtered by Manager's Dept)
  const deptEmployees = [
    { id: 'emp_01', name: 'Jessica Taylor' },
    { id: 'emp_02', name: 'Michael Chen' },
    { id: 'emp_04', name: 'Sarah Johnson' },
    { id: 'emp_06', name: 'Emma Brown' },
  ];

  // --- State ---
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [category, setCategory] = useState('contracts');
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    overlay: "fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300" 
      : "bg-white border border-slate-200 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl",
    input: isDark
      ? "w-full bg-[#0f1623] border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7c3aed] text-[#e5e7eb] transition-all"
      : "w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-[#7c3aed] text-[#1e293b] transition-all",
    label: "block text-[10px] text-[#94a3b8] mb-2 uppercase font-black tracking-widest",
    dropZone: isDark
      ? "border-2 border-dashed border-white/10 bg-white/5 rounded-3xl p-12 text-center cursor-pointer hover:border-[#7c3aed] hover:bg-[#7c3aed1a] transition-all group"
      : "border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl p-12 text-center cursor-pointer hover:border-[#7c3aed] hover:bg-slate-100 transition-all"
  };

  // --- Handlers ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.filter(f => f.type === 'application/pdf').map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
    }));
    setUploadQueue([...uploadQueue, ...newFiles]);
  };

  const handleSave = () => {
    if (!selectedEmpId || uploadQueue.length === 0) {
      return;
    }
    
    const empName = deptEmployees.find(e => e.id === selectedEmpId)?.name;

    const uploadedDocs = uploadQueue.map(item => ({
      emp: empName,
      dept: managerDept,
      cat: category,
      name: item.name,
      size: item.size,
      date: new Date().toISOString().split('T')[0],
      uploadedBy: managerName // Manager Audit Trail
    }));

    onUpload(uploadedDocs);
    setUploadQueue([]);
    setSelectedEmpId('');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <ShieldAlert size={14} className="text-[#7c3aed]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed]">Managerial Upload Terminal</span>
            </div>
            <h3 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Departmental Vault</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-[#94a3b8]">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Manager Controls: Employee Scope */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={styles.label}>Member of {managerDept}</label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                <select 
                  className={`${styles.input} pl-12 appearance-none`}
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                >
                  <option value="">Select Employee...</option>
                  {deptEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={styles.label}>Vault Classification</label>
              <div className="relative">
                <FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                <select 
                  className={`${styles.input} pl-12 appearance-none`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="contracts">Legal Contracts</option>
                  <option value="identity">Identity Verification</option>
                  <option value="certificates">Skill Certificates</option>
                  <option value="payslips">Payroll Records</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
             <AlertCircle size={18} className="text-amber-500 shrink-0" />
             <p className="text-[10px] leading-relaxed text-[#94a3b8]">
               <strong>Privacy Policy:</strong> As a manager of {managerDept}, ensure you are uploading files to the correct personnel record. These files will be visible to the HR audit team.
             </p>
          </div>

          {/* Manager Upload Zone */}
          <div 
            className={styles.dropZone}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="p-5 bg-[#7c3aed]/10 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <CloudUpload size={32} className="text-[#7c3aed]" />
            </div>
            <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Push to Department Vault</h4>
            <p className="text-[11px] text-[#94a3b8] mt-1">Upload encrypted PDF files (Max 10MB)</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf" 
              multiple 
              className="hidden" 
            />
          </div>

          {/* File Batch List */}
          {uploadQueue.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              <div className="text-[9px] font-black uppercase text-[#94a3b8] tracking-widest mb-2">Pending Batch</div>
              {uploadQueue.map((file) => (
                <div key={file.id} className={`${isDark ? 'bg-white/5' : 'bg-slate-50'} border ${isDark ? 'border-white/5' : 'border-slate-100'} p-3 rounded-2xl flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-red-500" />
                    <div>
                      <div className={`text-xs font-bold truncate max-w-50 ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</div>
                      <div className="text-[9px] text-[#94a3b8] font-bold">{file.size}</div>
                    </div>
                  </div>
                  <button onClick={() => setUploadQueue(q => q.filter(f => f.id !== file.id))} className="p-2 hover:bg-red-500/10 text-[#94a3b8] hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-white/5">
          <button 
            onClick={onClose}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#94a3b8]' : 'text-slate-600'} hover:bg-white/5 transition-all`}
          >
            Abort
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedEmpId || uploadQueue.length === 0}
            className="px-10 py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-30 disabled:grayscale text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Finalize Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocuments;