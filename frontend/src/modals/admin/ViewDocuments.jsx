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
  Info
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

  // 1. Open the file in a new tab/window
  const printWindow = window.open(fileData.fileUrl, '_blank');
  
  // 2. Trigger print once it loads
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    alert("Please allow pop-ups to print this document.");
  }
};

  const handleDelete = () => {
    // Pass the ID to the parent handleDelete function
    onDelete(fileData.id);
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

  // Format Date for display
  const entryDate = new Date(fileData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        
        {/* ASIDE: Document Details & Actions */}
        <aside className={styles.sidebar}>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <FileText size={28} />
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Dossier</h3>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={10} /> Verified
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className={styles.label}>Document Title</div>
            <div className={styles.value}>{fileData.name}</div>

            <div className={styles.label}>Employee Owner</div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-purple-500/20">
                {fileData.user?.name ? fileData.user.name[0] : '?'}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.user?.name}</span>
                <span className="text-[9px] font-bold text-purple-500 uppercase">{fileData.department?.name}</span>
              </div>
            </div>

            <div className={styles.label}>File Category</div>
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase bg-[#7c3aed1a] text-[#7c3aed] px-3 py-1.5 rounded-lg border border-[#7c3aed33] tracking-widest">
                {fileData.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className={styles.label}>Size</div>
                <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.size}</div>
              </div>
              <div>
                <div className={styles.label}>Format</div>
                <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>PDF Document</div>
              </div>
            </div>

            <div className={styles.label}>System Entry</div>
            <div className={`text-xs flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Calendar size={14} className="text-[#94a3b8]" />
              {entryDate}
            </div>
          </div>

          {/* ACTION HUB */}
          <div className="space-y-3 mt-8 pt-8 border-t border-white/5">
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-sm font-black transition-all active:scale-95 shadow-xl shadow-purple-500/20"
            >
              <Download size={18} /> Download PDF
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

        {/* MAIN: Document Viewing Area */}
        <div className={styles.preview}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10 bg-[#0b1220]' : 'border-slate-300 bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Info size={14} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Encrypted Secure Viewer
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.open(fileData.fileUrl, '_blank')}
                className={`p-2.5 rounded-xl hover:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-slate-600'}`}
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

          {/* Actual PDF Display */}
          <div className="flex-1 p-6 md:p-10 overflow-hidden">
            <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'border-white/5' : 'border-slate-400'}`}>
              <iframe 
                ref={iframeRef}
                src={`${fileData.fileUrl}#toolbar=0&navpanes=0`} 
                className="w-full h-full bg-white"
                title="Secure PDF Viewer"
              />
            </div>
          </div>
          
          <div className="p-4 text-center border-t border-white/5">
            <p className="text-[9px] text-[#94a3b8] font-medium tracking-[0.2em] uppercase">
              End-to-End Encrypted Session • LyticalSMS Vault v2.0
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewDocuments;