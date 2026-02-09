import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, CloudUpload, FileText, Download, Edit, 
  MoreVertical, Eye, Trash2, FolderOpen, FileSignature, 
  IdCard, GraduationCap, FileBadge, Filter,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Import Modals
import AddDocuments from '../../modals/admin/AddDocuments';
import ViewDocuments from '../../modals/admin/ViewDocuments';
import EditDocuments from '../../modals/admin/EditDocuments';

const Documents = () => {
  // --- Theme Sync ---
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const isDark = theme === 'dark';

  // --- State ---
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentDepartment, setCurrentDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [departments, setDepartments] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 
  
  // Modal Visibility States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // Added Edit State
  const [selectedFileData, setSelectedFileData] = useState(null);

  // --- Fetch Departments ---
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // --- API Functions ---
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/documents", {
        params: {
          category: currentCategory,
          departmentId: currentDepartment,
          search: searchTerm
        }
      });
      setFiles(response.data);
      setCurrentPage(1); 
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentDepartment, searchTerm]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // --- Core Functions ---
  const handleDownload = (file) => {
    window.open(file.fileUrl, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record? This will remove the physical file as well.")) return;
    try {
      await axios.delete(`http://localhost:3000/api/documents/${id}`);
      setFiles(prev => prev.filter(f => f.id !== id));
      setActiveMenu(null);
      setIsViewOpen(false); // Close view modal if open
    } catch (error) {
      alert("Failed to delete document from server.");
    }
  };

  const handleUpdateFiles = (updatedDoc) => {
    setFiles(prev => prev.map(f => f.id === updatedDoc.id ? updatedDoc : f));
    setActiveMenu(null);
  };

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(files.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // --- Dynamic Style Constants ---
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-white/5' : 'border-slate-200';
  const cardClass = isDark ? 'bg-[#0b1220] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = isDark ? 'bg-[#0f1623] border-white/10' : 'bg-slate-50 border-slate-200';

  return (
    <main 
      className={`flex-1 overflow-y-auto p-6 transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f1f5f9]'}`} 
      onClick={() => setActiveMenu(null)}
    >
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <nav className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-purple-500' : 'text-indigo-600'}`}>
            Admin Portal &nbsp; • &nbsp; Records
          </nav>
          <h1 className={`text-4xl font-black tracking-tighter ${textMain}`}>Document Vault</h1>
          <p className={`${textMuted} text-sm font-medium mt-1`}>Secure repository for employee records.</p>
        </div>
        
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-purple-500/20 transition-all active:scale-95"
        >
          <CloudUpload size={18} /> Upload PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className={`${cardClass} border rounded-4xl p-6 h-fit sticky top-0`}>
          <div className="flex items-center gap-2 mb-6 px-2">
            <Filter size={14} className={isDark ? "text-purple-500" : "text-indigo-600"} />
            <h4 className={`text-[10px] font-black tracking-[0.2em] uppercase ${textMuted}`}>Classification</h4>
          </div>
          <nav className="space-y-2 mb-8">
            {[
              { id: 'all', label: 'All Vaults', icon: <FolderOpen size={18} /> },
              { id: 'contracts', label: 'Contracts', icon: <FileSignature size={18} /> },
              { id: 'academic', label: 'Academic', icon: <GraduationCap size={18} /> },
              { id: 'identity', label: 'Identity/IDs', icon: <IdCard size={18} /> },
              { id: 'certificates', label: 'Certificates', icon: <FileBadge size={18} /> },
              { id: 'payslips', label: 'Payslips', icon: <FileBadge size={18} /> }
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setCurrentCategory(cat.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs transition-all uppercase tracking-tight font-black ${
                  currentCategory === cat.id 
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20' 
                  : `${textMuted} hover:bg-white/5 hover:text-purple-500`
                }`}
              >
                <span className="flex items-center gap-4">{cat.icon} {cat.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-2">
            <h4 className={`text-[10px] font-black tracking-[0.2em] uppercase ${textMuted} mb-4`}>Department</h4>
            <select 
              value={currentDepartment}
              onChange={(e) => { setCurrentDepartment(e.target.value); setCurrentPage(1); }}
              className={`w-full p-4 rounded-2xl text-xs font-black uppercase outline-none border transition-all ${
                isDark ? 'bg-[#0f1623] border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`${cardClass} border rounded-[2.5rem] p-8 min-h-150 flex flex-col`}>
          <div className="relative mb-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Filter by employee name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${inputClass} border text-sm font-bold rounded-2xl pl-16 pr-6 py-6 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${textMain}`}
            />
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-purple-500" size={40} />
                <span className={`text-xs font-black uppercase tracking-widest ${textMuted}`}>Syncing Vault...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2">
                <FolderOpen className={textMuted} size={48} />
                <span className={`text-xs font-black uppercase tracking-widest ${textMuted}`}>No records found</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-[0.2em] border-b ${borderClass} ${textMuted} font-black`}>
                    <th className="pb-6 px-4">Employee</th>
                    <th className="pb-6 px-4">Document</th>
                    <th className="pb-6 px-4 text-center">Category</th>
                    <th className="pb-6 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${borderClass}`}>
                  {currentItems.map((file) => (
                    <tr key={file.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs">
                            {file.user?.name ? file.user.name[0] : '?'}
                          </div>
                          <div className="flex flex-col">
                             <span className={`text-sm font-black tracking-tight ${textMain}`}>{file.user?.name || 'Unknown'}</span>
                             <span className="text-[9px] font-bold text-[#7c3aed] uppercase tracking-widest">{file.department?.name || 'General'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'} text-red-500`}>
                            <FileText size={18} />
                          </div>
                          <div className="flex flex-col">
                             <span className={`text-sm font-bold truncate max-w-50 ${textMain}`}>{file.name}</span>
                             <span className={`text-[10px] font-bold ${textMuted}`}>{file.size}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          {file.category}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-right relative">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleDownload(file)} className={`p-3 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                            <Download size={20} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === file.id ? null : file.id); }}
                            className={`p-3 rounded-xl transition-all ${activeMenu === file.id ? 'bg-purple-500 text-white' : isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                          >
                            <MoreVertical size={20} />
                          </button>
                        </div>

                        {activeMenu === file.id && (
                          <div className={`absolute right-14 top-16 w-56 border rounded-2xl z-50 shadow-2xl overflow-hidden ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}>
                            <button onClick={() => { setSelectedFileData(file); setIsViewOpen(true); }} className={`w-full text-left p-4 hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              <Eye size={16} className="text-blue-500" /> View & Print
                            </button>
                            <button onClick={() => { setSelectedFileData(file); setIsEditOpen(true); }} className={`w-full text-left p-4 hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              <Edit size={16} className="text-amber-500" /> Edit Record
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
            )}
          </div>

          {/* Pagination */}
          <div className={`mt-10 flex justify-between items-center border-t ${borderClass} pt-8`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`w-11 h-11 flex items-center justify-center rounded-xl border ${borderClass} disabled:opacity-20 ${textMain}`}>
                <ChevronLeft size={20}/>
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`w-11 h-11 flex items-center justify-center rounded-xl border ${borderClass} disabled:opacity-20 ${textMain}`}>
                <ChevronRight size={20}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddDocuments 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onUpload={fetchDocuments} 
        theme={theme} 
      />

      {isEditOpen && (
        <EditDocuments 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          fileData={selectedFileData} 
          onSave={handleUpdateFiles} 
          theme={theme} 
        />
      )}
      
      {isViewOpen && (
        <ViewDocuments 
          isOpen={isViewOpen} 
          onClose={() => setIsViewOpen(false)} 
          fileData={selectedFileData} 
          onDelete={handleDelete} 
          theme={theme} 
        />
      )}
    </main>
  );
};

export default Documents;