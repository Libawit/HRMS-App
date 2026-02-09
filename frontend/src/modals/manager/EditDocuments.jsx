import React, { useState, useEffect } from 'react';
import { X, Save, FileText, FolderTree, User, Building2, History } from 'lucide-react';

const EditDocuments = ({ isOpen, onClose, onSave, fileData, theme = 'dark' }) => {
  // --- Local State ---
  const [formData, setFormData] = useState({
    name: '',
    cat: 'contracts'
  });

  // Sync state when fileData prop changes
  useEffect(() => {
    if (fileData) {
      setFormData({
        name: fileData.name || '',
        cat: fileData.cat || 'contracts'
      });
    }
  }, [fileData]);

  if (!isOpen) return null;

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    overlay: "fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200" 
      : "bg-white border border-slate-200 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl",
    input: isDark
      ? "w-full bg-[#0f1623] border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7c3aed] text-[#e5e7eb] transition-all"
      : "w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-[#7c3aed] text-[#1e293b] transition-all",
    label: "block text-[10px] text-[#94a3b8] mb-2 uppercase font-black tracking-widest",
    textMain: isDark ? "text-[#e5e7eb]" : "text-[#1e293b]"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass back original data merged with new form data and an audit timestamp
    onSave({ 
      ...fileData, 
      ...formData, 
      lastEdited: new Date().toISOString().split('T')[0] 
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className={`text-2xl font-black tracking-tighter ${styles.textMain}`}>Update Record</h3>
            <p className="text-xs text-[#94a3b8] mt-1">Refine document metadata and classification.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-[#94a3b8]">
            <X size={24} />
          </button>
        </div>

        {/* Employee Context Info (Manager Reference) */}
        <div className="mb-8 p-5 rounded-3xl bg-[#7c3aed1a] border border-[#7c3aed33] flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <User size={20} />
           </div>
           <div>
              <p className={`text-sm font-black ${styles.textMain}`}>{fileData?.emp || 'Unknown Employee'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <Building2 size={12} className="text-[#7c3aed]" />
                 <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{fileData?.dept || 'General Dept'}</span>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Name Field */}
          <div>
            <label className={styles.label}>Document Filename</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${styles.input} pl-12`}
                placeholder="e.g. Contract_V2.pdf"
                required
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className={styles.label}>Vault Classification</label>
            <div className="relative">
              <FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <select 
                value={formData.cat}
                onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                className={`${styles.input} pl-12 appearance-none`}
              >
                <option value="contracts">Contracts</option>
                <option value="identity">Identity/IDs</option>
                <option value="certificates">Certificates</option>
                <option value="payslips">Payslips</option>
              </select>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center gap-2 pt-2 text-[#94a3b8]">
             <History size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Original Upload: {fileData?.date}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
            <button 
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest ${styles.textMain} hover:bg-white/5 transition-all`}
            >
              Discard
            </button>
            <button 
              type="submit"
              className="px-8 py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-purple-500/20 transition-all active:scale-95"
            >
              <Save size={16} /> Commit Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocuments;