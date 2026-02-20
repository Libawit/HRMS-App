import React, { useState, useEffect } from 'react';
import { X, Save, CloudUpload, Loader2, FileEdit, User, ShieldAlert } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const EditDocuments = ({ isOpen, onClose, onSave, fileData, theme = 'dark' }) => {
  const [formData, setFormData] = useState({ name: '', cat: 'contracts' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fileData) {
      setFormData({
        name: fileData.name || '',
        cat: fileData.category || 'contracts' 
      });
      setSelectedFile(null); // Reset file selection when data changes
    }
  }, [fileData]);

  if (!isOpen || !fileData) return null;

  const isDark = theme === 'dark';
  
  const styles = {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[4000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" 
      : "bg-white border border-slate-200 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl",
    input: isDark
      ? "w-full bg-[#020617] border border-white/5 rounded-2xl p-4 outline-none focus:border-[#7c3aed] text-white font-bold text-sm transition-all"
      : "w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-[#7c3aed] text-slate-900 font-bold text-sm transition-all",
    label: "block text-[10px] text-slate-500 mb-2 uppercase font-black tracking-[0.15em]",
    readOnlyBox: isDark ? "bg-white/5 border border-white/5" : "bg-slate-100 border border-slate-200"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.cat);
      if (selectedFile) data.append('file', selectedFile);

      const response = await axios.patch(`http://localhost:5000/api/documents/${fileData.id}`, data);
      
      onSave(response.data); 
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Section */}
        <div className="p-8 border-b border-white/5 bg-linear-to-r from-transparent to-[#7c3aed]/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#7c3aed]/10 text-[#7c3aed] rounded-2xl">
              <FileEdit size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Dossier</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Update vault metadata</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Read Only Context for Manager */}
          <div className={`p-4 rounded-2xl flex items-center gap-4 ${styles.readOnlyBox}`}>
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center font-black">
              {fileData.user?.name ? fileData.user.name[0] : <User size={16}/>}
            </div>
            <div>
              <span className={styles.label + " mb-0"}>Belongs to</span>
              <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {fileData.user?.name || 'Unknown Employee'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={styles.label}>Document Display Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                placeholder="Enter filename..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={styles.label}>Record Classification</label>
              <select 
                value={formData.cat}
                onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                className={styles.input + " appearance-none cursor-pointer"}
              >
                <option value="contracts">Contracts</option>
                <option value="identity">Identity/IDs</option>
                <option value="certificates">Certificates</option>
                <option value="academic">Academic</option>
                <option value="payslips">Payslips</option>
              </select>
            </div>
          </div>

          {/* Replace File - High Visibility Upload */}
          <div>
            <label className={styles.label}>Version Control (Optional)</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden" 
                id="manager-edit-upload"
              />
              <label 
                htmlFor="manager-edit-upload"
                className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-4xl cursor-pointer transition-all ${
                  selectedFile 
                  ? 'border-emerald-500 bg-emerald-500/5' 
                  : 'border-white/5 bg-white/2 hover:border-[#7c3aed] hover:bg-[#7c3aed]/5'
                }`}
              >
                <CloudUpload size={28} className={selectedFile ? 'text-emerald-500' : 'text-[#7c3aed]'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedFile ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {selectedFile ? fileData.name : 'Overwrite Existing PDF'}
                </span>
                {selectedFile && <span className="text-[8px] font-bold opacity-60 uppercase">New file staged</span>}
              </label>
            </div>
          </div>

          {/* Manager Warning */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-tighter">
              Notice: Editing this record will update the timestamp and visibility for the employee. Ensure data accuracy before saving.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10 py-4 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#7c3aed]/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Commit Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocuments;