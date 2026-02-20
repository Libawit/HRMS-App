import React, { useState, useEffect } from 'react';
import { X, Save, FileText, FolderTree, CloudUpload, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const EditDocuments = ({ isOpen, onClose, onSave, fileData, theme = 'dark' }) => {
  const [formData, setFormData] = useState({ name: '', cat: 'contracts' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fileData) {
      setFormData({
        name: fileData.name || '',
        cat: fileData.category || 'contracts' // changed from .cat to .category to match your prisma
      });
    }
  }, [fileData]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const styles = {
    overlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
    card: isDark 
      ? "bg-[#0b1220] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl" 
      : "bg-white border border-slate-200 w-full max-w-md rounded-3xl p-8 shadow-2xl",
    input: isDark
      ? "w-full bg-[#0f1623] border border-white/10 rounded-xl p-3 outline-none focus:border-[#7c3aed] text-[#e5e7eb] transition-all"
      : "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-[#7c3aed] text-[#1e293b] transition-all",
    label: "block text-[11px] text-[#94a3b8] mb-2 uppercase font-bold tracking-wider",
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
      
      onSave(response.data); // Update the table in parent
      onClose();
    } catch (error) {
      alert("Failed to update document.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Record</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#94a3b8]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={styles.label}>Document Title</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label className={styles.label}>Classification</label>
            <select 
              value={formData.cat}
              onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
              className={styles.input}
            >
              <option value="contracts">Contracts</option>
              <option value="identity">Identity/IDs</option>
              <option value="certificates">Certificates</option>
              <option value="academic">Academic</option>
              <option value="payslips">Payslips</option>
            </select>
          </div>

          {/* Optional: Replace File */}
          <div>
            <label className={styles.label}>Replace File (Optional)</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden" 
                id="edit-file-upload"
              />
              <label 
                htmlFor="edit-file-upload"
                className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  selectedFile ? 'border-green-500 bg-green-500/5' : 'border-white/10 hover:border-[#7c3aed]'
                }`}
              >
                <CloudUpload size={18} className={selectedFile ? 'text-green-500' : 'text-[#7c3aed]'} />
                <span className="text-xs font-medium text-slate-400">
                  {selectedFile ? selectedFile.name : 'Click to upload new PDF'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-400 hover:bg-white/5">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocuments;