import React, { useState, useEffect } from 'react';
// Added Search and User to the imports
import { X, Layers, Save, Loader2, Search, User } from 'lucide-react';

const EditDepartmentModal = ({ isOpen, onClose, theme = 'dark', data, departments, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    manager: '',
    description: ''
  });
  
  // Missing state variables for the search functionality
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch Managers List ---
  useEffect(() => {
  const fetchManagers = async () => {
    if (!isOpen) return;
    try {
      const token = localStorage.getItem('token'); // Retrieve token
      const response = await fetch('http://localhost:5000/api/auth/search-users?role=Manager', {
        headers: {
          'Authorization': `Bearer ${token}` // Add this
        }
      });
      if (!response.ok) return;
      const result = await response.json();
      setManagers(result);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  fetchManagers();
}, [isOpen]);

  // --- Sync local state when the selected department changes ---
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        parentId: data.parentId || '',
        manager: data.manager || '',
        description: data.description || ''
      });
      setSearchTerm(data.manager || ''); // Initialize search box with current manager
    }
  }, [data]);

  // Filter managers based on what the user types
  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';

  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm",
    modalContent: `${isDark ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-lg rounded-2xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'} overflow-visible`,
    header: `flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`,
    label: `block text-[12px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`,
    input: `w-full ${isDark ? 'bg-[#0b1220] text-white' : 'bg-slate-50 text-slate-900'} border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed] transition-all`,
    textMain: isDark ? 'text-white' : 'text-slate-900'
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const token = localStorage.getItem('token'); // Retrieve token
    const response = await fetch(`http://localhost:5000/api/auth/departments/${data.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Add this
      },
      body: JSON.stringify({
        ...formData,
        parentId: formData.parentId === "" ? null : formData.parentId 
      }),
    });

    if (response.ok) {
      onSuccess();
      onClose();
    } else {
      const errData = await response.json();
      alert(errData.message || "Failed to update");
    }
  } catch (error) {
    alert("Network error.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
            <div>
              <label className={styles.label}>Parent Unit</label>
              <select 
                className={styles.input}
                value={formData.parentId || ""}
                onChange={(e) => setFormData({...formData, parentId: e.target.value})}
              >
                <option value="">No Parent (Top Level)</option>
                {departments
                  .filter(dept => dept.id !== data.id)
                  .map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))
                }
              </select>
            </div>

            {/* Manager Selection with Search */}
            <div className="relative">
              <label className={styles.label}>Manager</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text"
                  className={`${styles.input} pl-9`}
                  placeholder="Find manager..."
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                />
              </div>

              {showDropdown && (
                <div className={`absolute z-2100 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-2xl ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-slate-200'}`}>
                  {filteredManagers.length > 0 ? (
                    filteredManagers.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => {
                          setFormData({ ...formData, manager: m.name });
                          setSearchTerm(m.name);
                          setShowDropdown(false);
                        }}
                        className={`p-3 text-sm cursor-pointer flex items-center gap-3 ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        <User size={14} className="text-purple-500" />
                        <span>{m.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-500 text-center italic">No managers found.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={styles.label}>Description</label>
            <textarea 
              className={`${styles.input} min-h-20 resize-none`}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter details..."
            ></textarea>
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-white/5 gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500">Cancel</button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#7c3aed] text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal;