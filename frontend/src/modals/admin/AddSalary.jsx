import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Save, User, Briefcase, Calculator, ArrowUpCircle, 
  ArrowDownCircle, Loader2, Search, Calendar, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddSalary = ({ isOpen, onClose, onSave, theme = 'dark' }) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  
  const [formData, setFormData] = useState({
    amountBasic: 0,
    amountBonus: 0,
    deductions: 0,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    status: 'PENDING'
  });

  const dropdownRef = useRef(null);
  const isDark = theme === 'dark';

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // --- Click Outside Handler ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Fetch Employees (Synced with AddDocuments logic) ---
  useEffect(() => {
    if (isOpen) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const res = await axios.get('http://localhost:3000/api/auth/users');
          const data = Array.isArray(res.data) ? res.data : [];
          
          // Use the exact same formatting logic as AddDocuments
          const formatted = data.map(emp => ({
            ...emp,
            fullName: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || "Unknown Employee"
          }));
          
          setEmployees(formatted);
        } catch (err) {
          console.error("Failed to load employees", err);
          toast.error("Failed to sync employee list");
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [isOpen]);

  // --- Search Logic ---
  const filteredEmployees = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    if (!search || (selectedEmployee && selectedEmployee.fullName.toLowerCase() === search)) return [];
    
    return employees.filter(emp => 
      emp.fullName.toLowerCase().includes(search) ||
      emp.employeeId?.toLowerCase().includes(search)
    ).slice(0, 5);
  }, [searchTerm, employees, selectedEmployee]);

  const netPayPreview = (Number(formData.amountBasic) + Number(formData.amountBonus)) - Number(formData.deductions);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedEmployee(null);
    setIsDropdownOpen(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null); // Clear previous errors
    if (!selectedEmployee) return toast.error("Please select an employee");

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userId: selectedEmployee.id,
        amountBasic: parseFloat(formData.amountBasic),
        amountBonus: parseFloat(formData.amountBonus),
        deductions: parseFloat(formData.deductions),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
      };

      await axios.post('http://localhost:3000/api/salaries', payload);
      toast.success("Salary record created successfully!");
      onSave();
      handleClose();
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Failed to create salary";
      
      // Set the error message to display in the UI
      setErrorMsg(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4",
    modal: `${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden`,
    input: `w-full ${isDark ? 'bg-[#0f1623] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#7c3aed] transition-all`,
    dropdown: `${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'} absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl max-h-52 overflow-y-auto p-2`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-2 block ml-1"
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#7c3aed]/5 to-transparent">
          <div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Generate New Payslip</h2>
            <p className="text-xs text-[#94a3b8] font-medium mt-1">Setup payroll components for the current cycle</p>
          </div>
          <button onClick={handleClose} className="p-3 hover:bg-white/10 rounded-2xl text-[#94a3b8] transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SEARCH EMPLOYEE */}
            <div className="relative" ref={dropdownRef}>
              <label className={styles.label}>Employee Search*</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <input 
                  type="text"
                  placeholder="Search name or ID..."
                  className={`${styles.input} pl-12`}
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    if (selectedEmployee) setSelectedEmployee(null);
                  }}
                />
              </div>

              {isDropdownOpen && searchTerm && (
                <div className={styles.dropdown}>
                  {loading ? (
                    <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-[#7c3aed]" /></div>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSearchTerm(emp.fullName);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-xs uppercase">
                          {emp.fullName[0]}
                        </div>
                        <div>
                          <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.fullName}</div>
                          <div className="text-[10px] opacity-50 font-bold uppercase">ID: {emp.employeeId}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] font-bold text-slate-500 uppercase">No matching employees</div>
                  )}
                </div>
              )}
            </div>

            {/* PAYROLL YEAR */}
            <div>
              <label className={styles.label}>Payroll Year</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]" size={16} />
                <input name="year" type="number" required value={formData.year} onChange={handleChange} className={`${styles.input} pl-12`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-4xl ${isDark ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-50 border border-emerald-100'}`}>
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2"><ArrowUpCircle size={14}/> Earnings</h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Basic Salary ($)</label>
                  <input name="amountBasic" type="number" step="0.01" value={formData.amountBasic} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Bonuses ($)</label>
                  <input name="amountBonus" type="number" step="0.01" value={formData.amountBonus} onChange={handleChange} className={styles.input} />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-4xl ${isDark ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100'}`}>
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2"><ArrowDownCircle size={14}/> Deductions</h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Total Deductions ($)</label>
                  <input name="deductions" type="number" step="0.01" value={formData.deductions} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Salary Month</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={16} />
                    <select name="month" value={formData.month} onChange={handleChange} className={`${styles.input} pl-12 appearance-none`}>
                      {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/10 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} flex flex-col md:flex-row justify-between items-center gap-6`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7c3aed] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Calculator size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Net Payable Preview</p>
                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${netPayPreview.toLocaleString()}</p>
              </div>
            </div>
            {selectedEmployee && (
              <div className="text-right">
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Selected Employee</p>
                <p className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{selectedEmployee.fullName}</p>
              </div>
            )}
          </div>
          {/* Error Alert Box */}
{errorMsg && (
  <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
    isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
  }`}>
    <div className="bg-red-500 p-1.5 rounded-lg">
      <AlertTriangle className="text-white" size={16} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">Entry Denied</p>
      <p className={`text-xs font-bold ${isDark ? 'text-red-200' : 'text-red-700'}`}>
        {errorMsg}
      </p>
    </div>
    <button onClick={() => setErrorMsg(null)} className="text-red-500/50 hover:text-red-500">
       <X size={16} />
    </button>
  </div>
)}



          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 py-4 text-sm font-bold text-[#94a3b8] hover:text-red-500 transition-colors">Discard</button>
            <button 
              type="submit" 
              disabled={loading || !selectedEmployee} 
              className="flex-2 py-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-3xl font-black text-sm shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Finalize & Create Payslip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalary;