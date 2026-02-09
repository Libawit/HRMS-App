import React from 'react';
import { X, Calendar, ShieldCheck, ListPlus, Clock, Info, Palette, CheckCircle2, XCircle } from 'lucide-react';

const ViewLeaveTypeModal = ({ isOpen, onClose, theme = 'dark', data }) => {
  if (!isOpen || !data) return null;

  const styles = {
    modalOverlay: "fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200",
    modalContent: `${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'} w-full max-w-lg rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} overflow-hidden animate-in zoom-in-95 duration-200`,
    header: `flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`,
    label: `text-[11px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`,
    value: `text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`,
    section: `p-4 rounded-xl ${theme === 'dark' ? 'bg-[#0b1220]' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`,
    textMain: theme === 'dark' ? 'text-white' : 'text-slate-900'
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header with Color Banner */}
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: data.color || '#7c3aed' }}
        ></div>
        
        <div className={styles.header}>
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${data.color}20`, color: data.color }}
            >
              <ListPlus size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${styles.textMain}`}>{data.name}</h3>
              <p className="text-[11px] text-slate-500 uppercase tracking-tighter">Configuration Details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
            <X size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Top Row: Color & Approval */}
          <div className="grid grid-cols-2 gap-4">
            <div className={styles.section}>
              <span className={styles.label}>Identifier Color</span>
              <div className="flex items-center gap-3 mt-2">
                <div 
                  className="w-5 h-5 rounded-full shadow-sm border border-white/20" 
                  style={{ backgroundColor: data.color }}
                ></div>
                <span className="font-mono text-xs text-slate-400 uppercase">{data.color}</span>
              </div>
            </div>
            <div className={styles.section}>
              <span className={styles.label}>Approval Status</span>
              <div className="mt-2 flex items-center gap-2">
                {data.requiresApproval ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-slate-400" />
                )}
                <span className={styles.value}>
                  {data.requiresApproval ? 'Required' : 'Auto-Approved'}
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: Allowance & Accrual */}
          <div className="grid grid-cols-2 gap-4">
            <div className={styles.section}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-[#7c3aed]" />
                <span className={styles.label}>Annual Allowance</span>
              </div>
              <p className="text-2xl font-bold text-[#7c3aed]">{data.maxDays} <span className="text-xs text-slate-500 font-normal">Days</span></p>
            </div>
            <div className={styles.section}>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-[#7c3aed]" />
                <span className={styles.label}>Accrual Policy</span>
              </div>
              <p className={styles.value}>{data.accrual}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Frequency of updates</p>
            </div>
          </div>

          {/* Description Section */}
          <div className={`${styles.section} bg-transparent border-dashed`}>
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-slate-400" />
              <span className={styles.label}>Description & Guidelines</span>
            </div>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {data.description || "No specific guidelines provided for this leave type."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 bg-slate-500/5 flex justify-end`}>
          <button 
            onClick={onClose}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/20"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveTypeModal;