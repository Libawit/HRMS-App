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
  Building2,
  Lock
} from 'lucide-react';

const ViewDocuments = ({ isOpen, onClose, fileData, onDelete, theme = 'dark' }) => {
  const iframeRef = useRef(null);

  if (!isOpen || !fileData) return null;

  // --- Handlers ---
  const handleDownload = () => {
    // In a production app, use the actual file URL from your cloud storage
    const link = document.createElement('a');
    link.href = '#'; 
    link.setAttribute('download', fileData.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`SECURITY ALERT: Are you sure you want to permanently erase "${fileData.name}" from the department vault?`)) {
      onDelete(fileData.id);
      onClose();
    }
  };

  // --- Theme Styles ---
  const isDark = theme === 'dark';
  const styles = {
    overlay: "fixed inset-0 bg-[#020617]/95 backdrop-blur-md z-[3000] flex items-center justify-center p-4 md:p-10",
    card: isDark 
      ? "bg-[#0b1220] border border-white/10 w-full max-w-7xl h-full rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row animate-in zoom-in-95 duration-300" 
      : "bg-white border border-slate-200 w-full max-w-7xl h-full rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row",
    sidebar: isDark ? "w-full md:w-80 border-r border-white/10 bg-[#0f172a]/50 p-8 flex flex-col" : "w-full md:w-80 border-r border-slate-200 bg-slate-50 p-8 flex flex-col",
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-2",
    value: `text-sm font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`,
    preview: isDark ? "flex-1 bg-[#020617] relative flex flex-col" : "flex-1 bg-slate-100 relative flex flex-col"
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        
        {/* SIDEBAR: Departmental Context & Metadata */}
        <aside className={styles.sidebar}>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-[#7c3aed]/10 text-[#7c3aed] rounded-3xl shadow-inner">
              <FileText size={32} />
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Review</h3>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> Encrypted
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            <div className={styles.label}>Document Name</div>
            <div className={styles.value}>{fileData.name}</div>

            <div className={styles.label}>Ownership</div>
            <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#7c3aed] to-[#4f46e5] text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-purple-500/20">
                {fileData.emp?.[0]}
              </div>
              <div>
                <span className={`text-xs font-black block ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.emp}</span>
                <div className="flex items-center gap-1 text-[9px] text-[#94a3b8] font-bold uppercase">
                  <Building2 size={10} /> {fileData.dept || 'Engineering'}
                </div>
              </div>
            </div>

            <div className={styles.label}>Vault Type</div>
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase bg-[#7c3aed1a] text-[#7c3aed] px-4 py-2 rounded-xl border border-[#7c3aed22] inline-block tracking-widest">
                {fileData.cat}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className={styles.label}>File Size</div>
                <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.size}</div>
              </div>
              <div>
                <div className={styles.label}>Created</div>
                <div className={`text-xs font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {fileData.date}
                </div>
              </div>
            </div>
          </div>

          {/* MANAGER ACTION HUB */}
          <div className="space-y-3 mt-8 pt-8 border-t border-white/5">
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-purple-500/20"
            >
              <Download size={18} /> Export PDF
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handlePrint}
                className={`flex items-center justify-center gap-2 py-3.5 border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'} hover:bg-white/5 transition-all`}
              >
                <Printer size={16} /> Print
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 py-3.5 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
              >
                <Trash2 size={16} /> Erase
              </button>
            </div>
          </div>
        </aside>

        {/* PREVIEW PANEL */}
        <div className={styles.preview}>
          <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10 bg-[#0b1220]' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <Lock size={16} />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Secure Inspection Mode
                </span>
                <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest mt-0.5">Session ID: {Math.random().toString(36).substr(2, 9)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className={`p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-slate-600'}`}>
                <ExternalLink size={20} />
              </button>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-red-500 text-[#94a3b8] hover:text-white rounded-2xl transition-all border border-white/5"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* PDF Frame */}
          <div className="flex-1 p-8 overflow-hidden">
            <div className={`w-full h-full rounded-4xl overflow-hidden shadow-2xl border-4 ${isDark ? 'border-[#1e293b]' : 'border-slate-300'}`}>
              <iframe 
                ref={iframeRef}
                src={`/api/files/preview/${fileData.id}#toolbar=0&navpanes=0`} 
                className="w-full h-full bg-white"
                title="LyticalSMS Secure Viewer"
              />
            </div>
          </div>
          
          <div className="p-5 text-center border-t border-white/5 bg-black/20">
            <p className="text-[9px] text-[#475569] font-black tracking-[0.3em] uppercase">
              Authenticated Manager Review • Hardware Encrypted Session • LyticalSMS v2.0
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewDocuments;