import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, FileText, Download, Eye, FolderOpen, FileSignature, 
  IdCard, GraduationCap, FileBadge, Filter, ChevronLeft, ChevronRight,
  Lock, Loader2, BookOpen
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

// Only the View Modal is kept for Employee access
import ViewDocuments from '../../modals/employee/ViewDocuments';

const Documents = () => {
  // --- Theme & User Logic via useOutletContext ---
  const { theme, user } = useOutletContext(); 
  const isDark = theme === 'dark';

  // --- State ---
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modal Visibility States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);

  // --- Fetch Data from Backend ---
  const fetchMyDocuments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/documents', {
        params: { 
          userId: user.id, 
          category: currentCategory,
          search: searchTerm 
        }
      });
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("❌ Error fetching your documents:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDocuments();
  }, [currentCategory, searchTerm, user?.id]);

  // --- Core Functions ---
  const handleDownload = (file) => {
    if (file.fileUrl) {
        window.open(file.fileUrl, '_blank');
    }
  };

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(files.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
    inputBg: isDark ? 'bg-[#0f1623]' : 'bg-slate-100',
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} transition-colors duration-300`}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>My Documents</h1>
          <p className={`${styles.textMuted} text-sm mt-1`}>Manage and view your official employee records.</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${styles.border} ${styles.textMuted}`}>
          <Lock size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Secure Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className={`${styles.bgCard} border ${styles.border} rounded-4xl p-6 h-fit sticky top-6`}>
          <div className="flex items-center gap-2 mb-6 px-2">
            <Filter size={16} className="text-[#7c3aed]" />
            <h4 className="text-[10px] font-bold text-[#94a3b8] tracking-[0.2em] uppercase">My Vaults</h4>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'all', label: 'All Files', icon: <FolderOpen size={18} /> },
              { id: 'contracts', label: 'Contracts', icon: <FileSignature size={18} /> },
              { id: 'academic', label: 'Academic', icon: <BookOpen size={18} /> },
              { id: 'id', label: 'Identity / IDs', icon: <IdCard size={18} /> },
              { id: 'certificate', label: 'Certificates', icon: <GraduationCap size={18} /> },
              { id: 'payslip', label: 'Payslips', icon: <FileBadge size={18} /> },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { setCurrentCategory(cat.id); setCurrentPage(1); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs uppercase font-black tracking-tight transition-all ${
                  currentCategory === cat.id 
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20' 
                  : `${styles.textMuted} hover:bg-white/5 hover:text-[#7c3aed]`
                }`}
              >
                <span className="flex items-center gap-4">
                  {cat.icon} {cat.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-[2.5rem] p-8`}>
          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
            <input 
              type="text" 
              placeholder="Filter your records by name..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full ${styles.inputBg} border ${styles.border} text-sm font-bold rounded-2xl pl-16 pr-6 py-6 outline-none focus:border-[#7c3aed] ${styles.textMain} transition-all`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-[#94a3b8] uppercase tracking-[0.2em] border-b border-white/5 font-black">
                  <th className="pb-6 px-4">Document Details</th>
                  <th className="pb-6 px-4">Size</th>
                  <th className="pb-6 px-4">Uploaded</th>
                  <th className="pb-6 px-4">Category</th>
                  <th className="pb-6 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
                            <span className={`text-xs font-black uppercase tracking-widest ${styles.textMuted}`}>Syncing Records...</span>
                        </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? currentItems.map((file) => (
                  <tr key={file.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'} text-red-500 transition-transform group-hover:scale-110`}>
                          <FileText size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-sm font-black tracking-tight ${styles.textMain}`}>{file.name}</span>
                            <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">PDF Document</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`text-xs font-bold ${styles.textMuted}`}>{file.size || 'N/A'}</span>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`text-xs font-bold ${styles.textMuted}`}>
                        {new Date(file.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-[#94a3b8]">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedFileData(file); setIsViewOpen(true); }} 
                          className={`p-3 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="View"
                        >
                          <Eye size={20} />
                        </button>
                        <button 
                          onClick={() => handleDownload(file)} 
                          className={`p-3 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:text-[#7c3aed] hover:bg-[#7c3aed]/10' : 'text-slate-400 hover:text-[#7c3aed] hover:bg-purple-50'}`}
                          title="Download"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className={`py-24 text-center ${styles.textMuted} italic`}>
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <FolderOpen size={48} />
                        <span className="text-xs font-black uppercase tracking-widest mt-4">No documents found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && files.length > itemsPerPage && (
            <div className="mt-10 flex justify-between items-center border-t border-white/5 pt-8">
              <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, files.length)} of {files.length}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl border ${styles.border} ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed]/5'} transition-all`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl border ${styles.border} ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed]/5'} transition-all`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedFileData && (
        <ViewDocuments 
          isOpen={isViewOpen} 
          onClose={() => { setIsViewOpen(false); setSelectedFileData(null); }} 
          fileData={selectedFileData} 
          theme={theme} 
        />
      )}

    </main>
  );
};

export default Documents;