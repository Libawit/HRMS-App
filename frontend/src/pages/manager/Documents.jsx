import React, { useState } from 'react';
import { 
  Search, CloudUpload, FileText, Download, Edit, 
  MoreVertical, Eye, Trash2, FolderOpen, FileSignature, 
  IdCard, GraduationCap, FileBadge, Filter, CheckSquare, Square,
  ChevronLeft, ChevronRight, Building2
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Import Modals
import AddDocuments from '../../modals/manager/AddDocuments';
import EditDocuments from '../../modals/manager/EditDocuments';
import ViewDocuments from '../../modals/manager/ViewDocuments';

const Documents = () => {
  // --- Theme Logic: Sync with the global layout context ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Auth Context (Mock) ---
  const managerDept = "Engineering"; 

  // --- State ---
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Modal Visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);

  // --- Data State ---
  const [files, setFiles] = useState([
    { id: 1, emp: "Jessica Taylor", dept: "Engineering", name: "Employee_NDA_2024.pdf", cat: "contracts", size: "1.2 MB", date: "2024-01-10" },
    { id: 2, emp: "Michael Chen", dept: "Engineering", name: "Passport_Copy.pdf", cat: "identity", size: "450 KB", date: "2024-02-15" },
    { id: 3, emp: "John Smith", dept: "Marketing", name: "Degree_Certificate.pdf", cat: "certificates", size: "2.1 MB", date: "2023-11-20" },
    { id: 4, emp: "Sarah Johnson", dept: "Engineering", name: "Paystub_Dec_2025.pdf", cat: "payslips", size: "150 KB", date: "2025-12-01" },
    { id: 5, emp: "David Wilson", dept: "Sales", name: "Contract_Renewal.pdf", cat: "contracts", size: "2.4 MB", date: "2024-03-01" },
    { id: 6, emp: "Emma Brown", dept: "Engineering", name: "ID_Card_Front.pdf", cat: "identity", size: "300 KB", date: "2024-03-05" },
    { id: 7, emp: "Liam Neeson", dept: "Engineering", name: "Certification_AWS.pdf", cat: "certificates", size: "800 KB", date: "2024-03-10" }
  ]);

  // --- Actions ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this document?")) {
      setFiles(prev => prev.filter(f => f.id !== id));
      setSelectedFiles(prev => prev.filter(sid => sid !== id));
      setActiveMenu(null);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedFiles.length} selected documents from your department records?`)) {
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
      setSelectedFiles([]);
    }
  };

  const handleDownload = (file) => {
    console.log(`Downloading: ${file.name}`);
  };

  // --- Filtering Logic (Scope restricted to managerDept) ---
  const filteredFiles = files.filter(file => {
    const isInDepartment = file.dept === managerDept;
    const matchCategory = currentCategory === 'all' || file.cat === currentCategory;
    const matchSearch = file.emp.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return isInDepartment && matchCategory && matchSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const currentItems = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Theme/Styles ---
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
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[#7c3aed]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed]">{managerDept} Department</span>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>Document Management</h1>
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
            <CloudUpload size={18} /> Add New Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Category Filter */}
        <aside className={`${styles.bgCard} border ${styles.border} rounded-4xl p-6 h-fit sticky top-0`}>
          <div className="flex items-center gap-2 mb-6 px-2">
            <Filter size={16} className="text-[#7c3aed]" />
            <h4 className="text-[10px] font-black text-[#94a3b8] tracking-[0.2em] uppercase">Folders</h4>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'all', label: 'All Files', icon: <FolderOpen size={16} /> },
              { id: 'contracts', label: 'Contracts', icon: <FileSignature size={16} /> },
              { id: 'identity', label: 'Employee IDs', icon: <IdCard size={16} /> },
              { id: 'certificates', label: 'Certifications', icon: <GraduationCap size={16} /> },
              { id: 'payslips', label: 'Payroll Logs', icon: <FileBadge size={16} /> },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { setCurrentCategory(cat.id); setCurrentPage(1); }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all ${
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

        {/* List View */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-4xl p-8 shadow-sm`}>
          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or file title..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full ${styles.inputBg} border ${styles.border} text-sm rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-[#7c3aed] ${styles.textMain} transition-all placeholder:${styles.textMuted}`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-[#94a3b8] font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="pb-6 px-4 w-12">
                    <button onClick={() => setSelectedFiles(selectedFiles.length === currentItems.length ? [] : currentItems.map(f => f.id))}>
                      {selectedFiles.length === currentItems.length && currentItems.length > 0 ? <CheckSquare size={18} className="text-[#7c3aed]" /> : <Square size={18} />}
                    </button>
                  </th>
                  <th className="pb-6 px-4">Employee</th>
                  <th className="pb-6 px-4">Document Title</th>
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
                        <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center font-black text-xs">
                          {file.emp[0]}
                        </div>
                        <span className={`text-sm font-bold ${styles.textMain}`}>{file.emp}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${styles.textMain} mb-1`}>{file.name}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md">{file.cat}</span>
                           <span className="text-[9px] font-bold text-[#94a3b8] uppercase">{file.size}</span>
                        </div>
                      </div>
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
                          <button onClick={() => { setSelectedFileData(file); setIsViewOpen(true); }} className={`w-full text-left p-4 hover:bg-white/5 flex items-center gap-3 text-xs font-bold ${styles.textMain}`}>
                            <Eye size={16} className="text-blue-500" /> Open Full View
                          </button>
                          <button onClick={() => { setSelectedFileData(file); setIsEditOpen(true); }} className={`w-full text-left p-4 hover:bg-white/5 flex items-center gap-3 text-xs font-bold ${styles.textMain}`}>
                            <Edit size={16} className="text-amber-500" /> Edit Metadata
                          </button>
                          <button onClick={() => handleDelete(file.id)} className="w-full text-left p-4 hover:bg-red-500/10 flex items-center gap-3 text-xs font-bold text-red-500">
                            <Trash2 size={16} /> Delete Document
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {currentItems.length === 0 && (
              <div className="py-20 text-center">
                <FileText size={48} className="mx-auto mb-4 opacity-10" />
                <p className={`${styles.textMuted} text-xs font-bold uppercase tracking-widest`}>No documents found in this folder</p>
              </div>
            )}
          </div>

          {/* Footer / Pagination */}
          <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8">
            <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">
              Manager View: {filteredFiles.length} Records in {managerDept}
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
        </div>
      </div>

      {/* MODALS */}
      {isAddOpen && <AddDocuments isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onUpload={(newDocs) => setFiles([...files, ...newDocs])} theme={theme} />}
      {isEditOpen && <EditDocuments isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} fileData={selectedFileData} onSave={(updated) => setFiles(files.map(f => f.id === updated.id ? updated : f))} theme={theme} />}
      {isViewOpen && <ViewDocuments isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} fileData={selectedFileData} onDelete={handleDelete} theme={theme} />}

    </main>
  );
};

export default Documents;