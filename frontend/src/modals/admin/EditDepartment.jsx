import React, { useState, useEffect } from 'react';
import { X, Layers, Trash2, Save, Loader2 } from 'lucide-react';

const EditDepartmentModal = ({ isOpen, onClose, theme = 'dark', data, departments, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    manager: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync local state when the selected department (data prop) changes
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        parentId: data.parentId || '',
        manager: data.manager || '',
        description: data.description || ''
      });
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';

  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200",
    modalContent: `${isDark ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-lg rounded-2xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[12px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`,
    input: `w-full ${isDark ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed] transition-all`,
    textMain: isDark ? 'text-white' : 'text-slate-900'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/auth/departments/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Convert empty string back to null for the database
          parentId: formData.parentId === "" ? null : formData.parentId 
        }),
      });

      if (response.ok) {
        onSuccess(); // Refresh the list in the parent component
        onClose();
      } else {
        const errData = await response.json();
        alert(errData.message || "Failed to update department");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Network error. Is your backend running?");
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
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Layers size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.textMain}`}>Edit Department</h3>
              <p className="text-[11px] text-slate-500">Modify properties for {data.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Department Name */}
          <div>
            <label className={styles.label}>Department Name</label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                className={`${styles.input} pl-10`}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Parent Department Selection */}
            <div>
              <label className={styles.label}>Parent Unit</label>
              <select 
                className={styles.input}
                value={formData.parentId || ""}
                onChange={(e) => setFormData({...formData, parentId: e.target.value})}
              >
                <option value="">No Parent (Top Level)</option>
                {departments
                  .filter(dept => dept.id !== data.id) // Cannot be own parent
                  .map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))
                }
              </select>
            </div>

            {/* Manager Name */}
            <div>
              <label className={styles.label}>Manager</label>
              <input 
                type="text"
                placeholder="Manager Name"
                className={styles.input}
                value={formData.manager}
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={styles.label}>Description</label>
            <textarea 
              className={`${styles.input} min-h-20 resize-none`}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end pt-6 border-t border-white/5 gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal;