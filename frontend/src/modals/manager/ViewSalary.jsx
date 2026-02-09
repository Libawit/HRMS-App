import React, { useRef } from 'react';
import { 
  X, Download, Printer, ShieldCheck, 
  Building2, FileText, UserCheck, Info
} from 'lucide-react';

const ViewSalary = ({ isOpen, onClose, salaryData, theme = 'dark' }) => {
  const payslipRef = useRef(null);
  const managerDept = "Engineering"; // Context-driven
  const managerName = "Admin Manager"; // Context-driven

  if (!isOpen || !salaryData) return null;

  const isDark = theme === 'dark';

  const handlePrint = () => {
    const printContent = payslipRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); 
  };

  const styles = {
    overlay: "fixed inset-0 bg-[#020617]/95 backdrop-blur-xl z-[3000] flex items-center justify-center p-4 md:p-10",
    container: `w-full max-w-6xl h-full max-h-[92vh] flex flex-col md:flex-row overflow-hidden rounded-[3.5rem] border ${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} shadow-2xl animate-in fade-in zoom-in-95 duration-300`,
    sidebar: `w-full md:w-85 p-10 flex flex-col border-r ${isDark ? 'border-white/10 bg-[#0f172a]/50' : 'border-slate-200 bg-slate-50/50'}`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] block mb-2"
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        
        {/* Managerial Summary Sidebar */}
        <aside className={styles.sidebar}>
          <div className="mb-10 text-center md:text-left">
             <span className="inline-block px-3 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] text-[9px] font-black uppercase tracking-widest mb-4">
               {managerDept} Unit
             </span>
             <h3 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
               Reviewing Payroll
             </h3>
             <p className="text-xs text-[#94a3b8] font-medium mt-2">Final disbursement audit for {salaryData.emp}</p>
          </div>

          <div className="flex-1 space-y-10">
            <div className={`p-6 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
              <label className={styles.label}>Net Payout</label>
              <p className="text-4xl font-black text-[#7c3aed] tracking-tighter">${salaryData.net.toLocaleString()}</p>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                 <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-[#94a3b8]">Gross Earnings</span>
                   <span className={isDark ? 'text-white' : 'text-slate-900'}>${(salaryData.basic + salaryData.bonus).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-[#94a3b8]">Total Deductions</span>
                   <span className="text-red-500">-${salaryData.deductions.toLocaleString()}</span>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                 <Info size={16} className="text-blue-500 mt-0.5" />
                 <div>
                   <p className="text-[10px] font-black text-blue-500 uppercase">Manager Note</p>
                   <p className="text-[11px] text-[#94a3b8] leading-relaxed mt-1">
                     {salaryData.adjustmentReason || "Standard monthly processing. No manual adjustments recorded."}
                   </p>
                 </div>
               </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-4xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 active:scale-95">
              <Download size={18} /> Archive Record
            </button>
            <button onClick={handlePrint} className={`w-full flex items-center justify-center gap-3 py-5 border ${isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-600'} rounded-4xl text-[10px] font-black uppercase tracking-widest transition-all`}>
              <Printer size={18} /> Print Document
            </button>
          </div>
        </aside>

        {/* Professional Document Preview */}
        <div className={`flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar ${isDark ? 'bg-[#020617]' : 'bg-slate-100'}`}>
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <UserCheck className="text-emerald-500" size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Managerial Authorization Complete</span>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-full transition-all text-[#94a3b8] hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Payslip Canvas */}
          <div ref={payslipRef} className="bg-white rounded-[3rem] p-12 text-slate-900 shadow-2xl min-h-full">
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#7c3aed] rounded-xl flex items-center justify-center text-white">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter">LyticalSMS</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{managerDept} Operations Center</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black uppercase italic text-slate-100 mb-1 leading-none">Official Slips</p>
                <p className="text-sm font-black text-[#7c3aed]">{salaryData.month}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">REF: #{salaryData.idNo}-{salaryData.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-16 mb-16">
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">Recipient Information</label>
                <div className="space-y-2">
                  <p className="text-lg font-black">{salaryData.emp}</p>
                  <p className="text-xs text-slate-500 font-bold">Employee ID: <span className="text-slate-900">{salaryData.idNo}</span></p>
                  <p className="text-xs text-slate-500 font-bold">Department: <span className="text-slate-900">{managerDept}</span></p>
                </div>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">Processing Authority</label>
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-900">Authorized by: {managerName}</p>
                  <p className="text-xs text-slate-500">Approval Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500 font-medium">Status: Disbursement Cleared</p>
                </div>
              </div>
            </div>

            <table className="w-full mb-12">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay Component</th>
                  <th className="text-right py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
                  <th className="text-right py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-6 text-xs font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={14} className="text-slate-300" /> Basic Compensation
                  </td>
                  <td className="py-6 text-right text-sm font-black text-slate-900">${salaryData.basic.toLocaleString()}</td>
                  <td className="py-6 text-right text-sm font-bold text-slate-300">—</td>
                </tr>
                <tr>
                  <td className="py-6 text-xs font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={14} className="text-slate-300" /> Unit Performance Bonus
                  </td>
                  <td className="py-6 text-right text-sm font-black text-emerald-600">+${salaryData.bonus.toLocaleString()}</td>
                  <td className="py-6 text-right text-sm font-bold text-slate-300">—</td>
                </tr>
                <tr>
                  <td className="py-6 text-xs font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={14} className="text-slate-300" /> Statutory Deductions
                  </td>
                  <td className="py-6 text-right text-sm font-bold text-slate-300">—</td>
                  <td className="py-6 text-right text-sm font-black text-red-500">-${salaryData.deductions.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-slate-900 rounded-4xl p-10 flex justify-between items-center text-white">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Net Salary Disbursed</p>
                <div className="flex items-center gap-2">
                   <ShieldCheck size={16} className="text-emerald-400" />
                   <p className="text-xs text-slate-300 font-medium">Verified by Departmental Head</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black tracking-tighter">${salaryData.net.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t-2 border-slate-100 flex justify-between items-center opacity-40">
              <div className="text-[9px] font-black text-slate-400 uppercase max-w-xs leading-relaxed">
                Security Warning: Confidential document. Unauthorized reproduction is strictly prohibited under corporate policy.
              </div>
              <div className="flex flex-col items-end">
                <div className="w-24 h-8 bg-slate-100 rounded mb-2"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Manager Digital Seal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSalary;