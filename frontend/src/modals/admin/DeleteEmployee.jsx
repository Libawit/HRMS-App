import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

const DeleteEmployeeModal = ({ isOpen, onClose, onConfirm, theme, employee }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !employee) return null;

  const isDark = theme === 'dark';

  const styles = {
    overlay: `fixed inset-0 z-[5000] flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-300 ${
      isDark ? 'bg-[#020617]/95' : 'bg-slate-900/60'
    }`,
    modal: `${
      isDark ? 'bg-[#0b1220] border-white/10 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : 'bg-white border-slate-200 shadow-2xl'
    } w-full max-w-md rounded-[2.5rem] border p-10 text-center animate-in fade-in zoom-in duration-300`,
    iconBox: `w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 transition-transform hover:scale-110 duration-500 ${
      isDark 
        ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
        : 'bg-red-50 border-red-100 text-red-600'
    }`,
    title: `text-2xl font-black tracking-tighter mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`,
    description: `text-sm leading-relaxed mb-8 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`,
    cancelBtn: `flex-1 px-6 py-4 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all ${
      isDark 
        ? 'border-white/10 text-slate-400 hover:bg-white/5' 
        : 'border-slate-200 text-slate-500 hover:bg-slate-100'
    }`
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      // 1. Call your API (Ensure this route exists in authRoutes.js)
      const response = await fetch(`http://localhost:3000/api/auth/employees/${employee.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 2. Trigger the refresh in the Directory
        if (onConfirm) await onConfirm(); 
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete employee'}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error: Could not reach the server.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconBox}>
          {isDeleting ? <Loader2 size={36} className="animate-spin" /> : <Trash2 size={36} strokeWidth={2.5} />}
        </div>

        <h3 className={styles.title}>Confirm Deletion</h3>
        <p className={styles.description}>
          Are you sure you want to delete <span className="text-red-500 font-black">
            {employee.firstName} {employee.lastName}
          </span>? 
          <br /><br />
          This action is irreversible and will remove all associated data from the database.
        </p>

        <div className="flex gap-4">
          <button onClick={onClose} disabled={isDeleting} className={styles.cancelBtn}>
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={isDeleting}
            className="flex-1 px-6 py-4 rounded-2xl bg-red-500 hover:bg-red-600 disabled:bg-slate-600 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-2"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEmployeeModal;