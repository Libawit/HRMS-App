import React, { useState } from 'react';
import { X, Layers, Info, User, Network, Loader2 } from 'lucide-react';

const AddDepartmentModal = ({ isOpen, onClose, onSuccess, theme = 'dark', departments = [] }) => {
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    manager: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // --- Styles ---
  const isDark = theme === 'dark';
  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200",
    modalContent: `${isDark ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-lg rounded-2xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[11px] font-black uppercase tracking-[0.15em] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`,
    input: `w-full ${isDark ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 transition-all`,
    textMain: isDark ? 'text-white' : 'text-slate-900'
  };

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Convert empty string to null for database compatibility
          parentId: formData.parentId === "" ? null : formData.parentId 
        }),
      });

      if (response.ok) {
        setFormData({ name: '', parentId: '', manager: '', description: '' });
        onSuccess(); // Refresh the list in parent
        onClose();   // Close modal
      } else {
        const err = await response.json();
        alert(err.message || "Error creating department");
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-xl flex items-center justify-center text-[#7c3aed]">
              <Layers size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.textMain}`}>Add New Department</h3>
              <p className="text-[11px] text-slate-500 font-medium">Create a new organizational unit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Department Name */}
          <div>
            <label className={styles.label}>Department Name</label>
            <div className="relative">
              <input 
                type="text" 
                className={styles.input} 
                placeholder="e.g. Engineering, Marketing..." 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Parent Department */}
          <div>
            <label className={styles.label}>Parent Department</label>
            <select 
              className={styles.input}
              value={formData.parentId}
              onChange={(e) => setFormData({...formData, parentId: e.target.value})}
            >
              <option value="">No Parent (Top Level)</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Department Manager */}
          <div>
            <label className={styles.label}>Department Manager</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Enter manager name..."
              value={formData.manager}
              onChange={(e) => setFormData({...formData, manager: e.target.value})}
            />
          </div>

          {/* Description */}
          <div>
            <label className={styles.label}>Description</label>
            <textarea 
              className={`${styles.input} min-h-24 resize-none`} 
              placeholder="Briefly describe the department's purpose..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Unit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;