import React, { useState, useMemo } from 'react';
import { 
  Search, FileText, Download, Eye, FolderOpen, FileSignature, 
  IdCard, GraduationCap, FileBadge, Filter, ChevronLeft, ChevronRight,
  Lock
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Only the View Modal is kept for Employee access
import ViewDocuments from '../../modals/employee/ViewDocuments';

const Documents = () => {
  // --- Theme Logic via useOutletContext ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- Current User Identity (Scoped to the logged-in employee) ---
  const currentUser = { name: "John Doe" };

  // --- State ---
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal Visibility States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);

  // --- Data ---
  const [files] = useState([
    { id: 1, emp: "Jessica Taylor", name: "Employee_NDA_2024.pdf", cat: "contracts", size: "1.2 MB", date: "2024-01-10" },
    { id: 3, emp: "John Doe", name: "Degree_Certificate.pdf", cat: "certificates", size: "2.1 MB", date: "2023-11-20" },
    { id: 7, emp: "John Doe", name: "John_Doe_Contract.pdf", cat: "contracts", size: "1.8 MB", date: "2024-01-05" },
    { id: 8, emp: "John Doe", name: "Passport_Scan.pdf", cat: "identity", size: "800 KB", date: "2024-05-12" },
    { id: 4, emp: "Sarah Johnson", name: "Paystub_Dec_2025.pdf", cat: "payslips", size: "150 KB", date: "2025-12-01" },
  ]);

  // --- CORE FUNCTIONS ---

  const handleDownload = (file) => {
    console.log("Downloading:", file.name);
  };

  // --- Filtering Logic (Strictly filters by currentUser.name) ---
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // SECURITY: Ensure the document belongs to the logged-in user
      const isMyDocument = file.emp === currentUser.name;
      const matchCategory = currentCategory === 'all' || file.cat === currentCategory;
      const matchSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isMyDocument && matchCategory && matchSearch;
    });
  }, [currentCategory, searchTerm, files, currentUser.name]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);

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
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody}`} onClick={() => setActiveMenu(null)}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${styles.textMain}`}>My Documents</h1>
          <p className={`${styles.textMuted} text-sm mt-1`}>Access and view your personal records and certificates.</p>
        </div>
        
        {/* Security Indicator */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${styles.border} ${styles.textMuted}`}>
          <Lock size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Read Only Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Filters */}
        <aside className={`${styles.bgCard} border ${styles.border} rounded-4xl p-6 h-fit`}>
          <div className="flex items-center gap-2 mb-6 px-2">
            <Filter size={16} className="text-[#7c3aed]" />
            <h4 className="text-[10px] font-bold text-[#94a3b8] tracking-[0.2em] uppercase">My Vaults</h4>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'all', label: 'All Files', icon: <FolderOpen size={16} /> },
              { id: 'contracts', label: 'My Contracts', icon: <FileSignature size={16} /> },
              { id: 'identity', label: 'My Identity', icon: <IdCard size={16} /> },
              { id: 'certificates', label: 'Certificates', icon: <GraduationCap size={16} /> },
              { id: 'payslips', label: 'Payslips', icon: <FileBadge size={16} /> },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { setCurrentCategory(cat.id); setCurrentPage(1); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm transition-all ${
                  currentCategory === cat.id 
                  ? 'bg-[#7c3aed] text-white font-black shadow-lg shadow-purple-500/20' 
                  : `${styles.textMuted} hover:bg-white/5 hover:text-[#7c3aed]`
                }`}
              >
                <span className="flex items-center gap-3">
                  {cat.icon} {cat.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className={`${styles.bgCard} border ${styles.border} rounded-4xl p-8`}>
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
            <input 
              type="text" 
              placeholder="Search your documents..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full ${styles.inputBg} border ${styles.border} text-sm rounded-2xl pl-14 pr-6 py-5 outline-none focus:border-[#7c3aed] ${styles.textMain} transition-all`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-[#94a3b8] uppercase tracking-[0.15em] border-b border-white/5">
                  <th className="pb-5 px-4">Document Name</th>
                  <th className="pb-5 px-4">Size</th>
                  <th className="pb-5 px-4">Upload Date</th>
                  <th className="pb-5 px-4">Category</th>
                  <th className="pb-5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.length > 0 ? currentItems.map((file) => (
                  <tr key={file.id} className="group hover:bg-white/2 transition-colors">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                          <FileText size={16} />
                        </div>
                        <span className={`text-sm font-bold ${styles.textMain}`}>{file.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`text-xs ${styles.textMuted}`}>{file.size}</span>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`text-xs ${styles.textMuted}`}>{file.date}</span>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg text-[#94a3b8]">
                        {file.cat}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right relative">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedFileData(file); setIsViewOpen(true); }} 
                          className="p-2.5 text-[#94a3b8] hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                          title="View Document"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDownload(file)} 
                          className="p-2.5 text-[#94a3b8] hover:text-[#7c3aed] hover:bg-[#7c3aed1a] rounded-xl transition-all"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className={`py-20 text-center ${styles.textMuted} italic`}>
                      No documents found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredFiles.length > itemsPerPage && (
            <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-6">
              <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFiles.length)} of {filteredFiles.length}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl border ${styles.border} ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#7c3aed] text-[#7c3aed]'} transition-all`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-xl border ${styles.border} ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#7c3aed] text-[#7c3aed]'} transition-all`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL ONLY */}
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