import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, CloudUpload, FileText, Download, Edit, 
  MoreVertical, Eye, Trash2, FolderOpen, FileSignature, 
  IdCard, GraduationCap, FileBadge, Filter, CheckSquare, Square,
  ChevronLeft, ChevronRight, Building2, BookOpen
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

// Import Modals
import AddDocuments from '../../modals/manager/AddDocuments';
import EditDocuments from '../../modals/manager/EditDocuments';
import ViewDocuments from '../../modals/manager/ViewDocuments';

const Documents = () => {
  const { theme, user } = useOutletContext(); 
  const isDark = theme === 'dark';

  const managerDeptName = user?.departmentRel?.name || "My Department";
  const managerDeptId = user?.departmentId;

  // --- State ---
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);

  // --- Fetch Logic ---
  const fetchDocuments = useCallback(async () => {
    if (!managerDeptId) return; 

    setLoading(true);
    try {
      const response = await axios.get('/api/documents', {
        params: { 
          category: currentCategory, 
          search: searchTerm,
          departmentId: managerDeptId 
        }
      });

      if (Array.isArray(response.data)) {
        setFiles(response.data);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Fetch failed:", error.message);
      setFiles([]); 
    } finally {
      setLoading(false);
    }
  }, [currentCategory, searchTerm, managerDeptId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // --- Helpers ---
  const safeFiles = Array.isArray(files) ? files : [];
  const totalPages = Math.max(1, Math.ceil(safeFiles.length / itemsPerPage));
  const currentItems = safeFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will permanently delete the record.")) {
      try {
        await axios.delete(`/api/documents/${id}`);
        setFiles(prev => prev.filter(f => f.id !== id));
        setSelectedFiles(prev => prev.filter(sid => sid !== id));
        setActiveMenu(null);
      } catch (error) {
        alert("Failed to delete document");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedFiles.length} selected documents?`)) {
      try {
        await Promise.all(selectedFiles.map(id => axios.delete(`/api/documents/${id}`)));
        setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
        setSelectedFiles([]);
      } catch (error) {
        alert("Error during bulk delete");
      }
    }
  };

  const handleDownload = (file) => {
    if (file.fileUrl) window.open(file.fileUrl, '_blank');
  };

  // --- Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    inputBg: isDark ? 'bg-[#0f1623]' : 'bg-slate-100',
  };

  return (
    <main className={`flex-1 overflow-y-auto p-8 ${styles.bgBody} transition-colors duration-500`} onClick={() => setActiveMenu(null)}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[#7c3aed]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed]">
              {managerDeptName} Department
            </span>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>Document Vault</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedFiles.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-red-500/20"
            >
              <Trash2 size={14} /> Bulk Delete ({selectedFiles.length})
            </button>
          )}
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex-1 md:flex-none bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-black px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 transition-all active:scale-95"
          >
            <CloudUpload size={18} /> Upload PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        
        {/* Sidebar Navigation */}
        <aside className={`${styles.bgCard} border ${styles.border} rounded-4xl p-6 h-fit sticky top-0`}>
          <div className="flex items-center gap-2 mb-6 px-2">
            <Filter size={16} className="text-[#7c3aed]" />
            <h4 className="text-[10px] font-black text-[#94a3b8] tracking-[0.2em] uppercase">Classifications</h4>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'all', label: 'All Vaults', icon: <FolderOpen size={18} /> },
              { id: 'contracts', label: 'Contracts', icon: <FileSignature size={18} /> },
              { id: 'academic', label: 'Academic', icon: <BookOpen size={18} /> },
              { id: 'id', label: 'Identity / IDs', icon: <IdCard size={18} /> },
              { id: 'certificate', label: 'Certificates', icon: <GraduationCap size={18} /> },
              { id: 'payslip', label: 'Payslips', icon: <FileBadge size={18} /> },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { setCurrentCategory(cat.id); setCurrentPage(1); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-black uppercase tracking-tight transition-all ${
                  currentCategory === cat.id 
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20' 
                  : `${styles.textMuted} hover:bg-white/5`
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Table Area */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-4xl p-8 shadow-sm`}>
          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
            <input 
              type="text" 
              placeholder="Filter by title or employee name..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full ${styles.inputBg} border ${styles.border} text-sm font-bold rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-[#7c3aed] ${styles.textMain} transition-all placeholder:${styles.textMuted}`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-[#94a3b8] font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="pb-6 px-4 w-12">
                    <button onClick={() => setSelectedFiles(selectedFiles.length === currentItems.length && currentItems.length > 0 ? [] : currentItems.map(f => f.id))}>
                      {selectedFiles.length === currentItems.length && currentItems.length > 0 ? <CheckSquare size={18} className="text-[#7c3aed]" /> : <Square size={18} />}
                    </button>
                  </th>
                  <th className="pb-6 px-4">Employee</th>
                  <th className="pb-6 px-4">Document Title</th>
                  <th className="pb-6 px-4 text-center">Category</th>
                  <th className="pb-6 px-4 text-right pr-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((file) => (
                  <tr key={file.id} className="group hover:bg-white/2 transition-colors">
                    <td className="py-6 px-4">
                      <button onClick={() => setSelectedFiles(prev => prev.includes(file.id) ? prev.filter(i => i !== file.id) : [...prev, file.id])}>
                        {selectedFiles.includes(file.id) ? <CheckSquare size={18} className="text-[#7c3aed]" /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center font-black text-[10px]">
                          {file.user?.name ? file.user.name[0] : 'U'}
                        </div>
                        <span className={`text-sm font-black tracking-tight ${styles.textMain}`}>{file.user?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${styles.textMain} mb-1`}>{file.name}</span>
                        <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">{file.size || 'Size Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                        <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg inline-block min-w-24">
                          {file.category}
                        </span>
                    </td>
                    <td className="py-6 px-4 text-right relative">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleDownload(file)} className="p-2.5 text-[#94a3b8] hover:text-[#7c3aed] hover:bg-[#7c3aed1a] rounded-xl transition-all">
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === file.id ? null : file.id); }}
                          className={`p-2.5 text-[#94a3b8] hover:text-[#7c3aed] hover:bg-white/5 rounded-xl ${activeMenu === file.id ? 'bg-white/5 text-[#7c3aed]' : ''}`}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>

                      {activeMenu === file.id && (
                        <div className={`absolute right-12 top-14 w-52 ${isDark ? 'bg-[#0f172a]' : 'bg-white shadow-2xl'} border ${styles.border} rounded-2xl z-50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95`}>
                          <button onClick={() => { setSelectedFileData(file); setIsViewOpen(true); }} className={`w-full text-left p-4 hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-tight ${styles.textMain}`}>
                            <Eye size={16} className="text-blue-500" /> View & Print
                          </button>
                          <button onClick={() => { setSelectedFileData(file); setIsEditOpen(true); }} className={`w-full text-left p-4 hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-tight ${styles.textMain}`}>
                            <Edit size={16} className="text-amber-500" /> Edit Metadata
                          </button>
                          <button onClick={() => handleDelete(file.id)} className="w-full text-left p-4 hover:bg-red-500/10 flex items-center gap-3 text-xs font-black uppercase tracking-tight text-red-500">
                            <Trash2 size={16} /> Erase Record
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(loading || currentItems.length === 0) && (
              <div className="py-24 text-center">
                <FileText size={48} className="mx-auto mb-4 opacity-10" />
                <p className={`${styles.textMuted} text-xs font-black uppercase tracking-widest`}>
                  {loading ? "Syncing department vault..." : "No documents found in this section"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && safeFiles.length > 0 && (
            <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8">
              <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">
                Vault Status: {safeFiles.length} Total Documents
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl border ${styles.border} text-[#94a3b8] disabled:opacity-20 hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all`}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2 mx-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                        currentPage === i + 1 ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20' : `${styles.textMuted} hover:bg-white/5`
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-xl border ${styles.border} text-[#94a3b8] disabled:opacity-20 hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddOpen && <AddDocuments isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onUpload={fetchDocuments} theme={theme} departmentId={managerDeptId} />}
      {isEditOpen && <EditDocuments isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} fileData={selectedFileData} onSave={fetchDocuments} theme={theme} />}
      {isViewOpen && <ViewDocuments isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} fileData={selectedFileData} onDelete={handleDelete} theme={theme} />}
    </main>
  );
};

export default Documents;