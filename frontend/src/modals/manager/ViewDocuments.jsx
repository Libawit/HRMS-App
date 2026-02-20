import React, { useRef } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Calendar, 
  Printer, 
  Trash2, 
  ShieldCheck,
  ExternalLink,
  Info,
  User
} from 'lucide-react';

const ViewDocuments = ({ isOpen, onClose, fileData, onDelete, theme = 'dark' }) => {
  const iframeRef = useRef(null);

  if (!isOpen || !fileData) return null;

  // --- Handlers ---
  const handleDownload = () => {
    if (!fileData.fileUrl) return;
    const link = document.createElement('a');
    link.href = fileData.fileUrl;
    link.setAttribute('download', fileData.name);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    if (!fileData.fileUrl) return;
    const printWindow = window.open(fileData.fileUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert("Please allow pop-ups to print this document.");
    }
  };

  const handleDelete = () => {
    // Managers should have a confirmation check for data integrity
    if (window.confirm(`Are you sure you want to permanently delete this document for ${fileData.user?.name || 'this employee'}?`)) {
      onDelete(fileData.id);
    }
  };

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    overlay: "fixed inset-0 bg-black/90 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 md:p-6",
    card: isDark 
      ? "bg-[#0b1220] border border-white/10 w-full max-w-7xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300" 
      : "bg-white border border-slate-200 w-full max-w-7xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row",
    sidebar: isDark ? "w-full md:w-80 border-r border-white/10 bg-[#0f172a]/50 p-8 flex flex-col" : "w-full md:w-80 border-r border-slate-200 bg-slate-50 p-8 flex flex-col",
    label: "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1.5",
    value: `text-sm font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`,
    preview: isDark ? "flex-1 bg-[#020617] relative flex flex-col" : "flex-1 bg-slate-200 relative flex flex-col"
  };

  const entryDate = new Date(fileData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        
        {/* SIDEBAR: Managerial Context */}
        <aside className={styles.sidebar}>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Manager View</h3>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                Secure Access
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className={styles.label}>Employee Dossier</div>
            <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#7c3aed] to-[#4f46e5] text-white flex items-center justify-center text-xs font-black">
                {fileData.user?.name ? fileData.user.name[0] : <User size={14}/>}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.user?.name}</span>
                <span className="text-[9px] font-bold text-purple-500 uppercase tracking-tighter">
                  Dept: {fileData.department?.name || 'Department Member'}
                </span>
              </div>
            </div>

            <div className={styles.label}>Document Filename</div>
            <div className={styles.value + " break-all"}>{fileData.name}</div>

            <div className={styles.label}>Category</div>
            <div className="mb-6">
              <span className="text-[9px] font-black uppercase bg-[#7c3aed1a] text-[#7c3aed] px-3 py-1.5 rounded-lg border border-[#7c3aed33] tracking-widest">
                {fileData.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
              <div>
                <div className={styles.label}>File Size</div>
                <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.size}</div>
              </div>
              <div>
                <div className={styles.label}>Entry Date</div>
                <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{entryDate}</div>
              </div>
            </div>
          </div>

          {/* MANAGER ACTIONS */}
          <div className="space-y-3 mt-8 pt-8 border-t border-white/5">
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-sm font-black transition-all active:scale-95 shadow-xl shadow-purple-500/20"
            >
              <Download size={18} /> Download
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handlePrint}
                className={`flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'} hover:bg-white/5 transition-all`}
              >
                <Printer size={16} /> Print
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </aside>

        {/* PREVIEW AREA */}
        <div className={styles.preview}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10 bg-[#0b1220]' : 'border-slate-300 bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Info size={14} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                Confidential Department Record
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.open(fileData.fileUrl, '_blank')}
                className={`p-2.5 rounded-xl hover:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-slate-600'}`}
                title="Open in new tab"
              >
                <ExternalLink size={18} />
              </button>
              <button 
                onClick={onClose}
                className={`p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all ${isDark ? 'text-white' : 'text-slate-600'}`}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8 bg-[#020617] overflow-hidden">
            <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'border-white/5' : 'border-slate-400'}`}>
              <iframe 
                ref={iframeRef}
                src={`${fileData.fileUrl}#toolbar=0&navpanes=0`} 
                className="w-full h-full bg-white"
                title="Manager Secure Viewer"
              />
            </div>
          </div>
          
          <div className="p-4 text-center border-t border-white/5 bg-[#0b1220]">
            <p className="text-[9px] text-[#94a3b8] font-medium tracking-[0.2em] uppercase">
              Management Portal • Vault v2.0 • Session Restricted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocuments;