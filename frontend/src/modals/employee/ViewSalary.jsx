import React, { useRef } from 'react';
import { 
  X, Download, Printer, DollarSign, 
  ShieldCheck, Calendar, Building2, Lock,
  FileText, TrendingUp, MinusCircle
} from 'lucide-react';

const ViewSalary = ({ isOpen, onClose, salaryData, theme = 'dark' }) => {
  const payslipRef = useRef(null);
  
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
    overlay: "fixed inset-0 bg-black/95 backdrop-blur-xl z-[3000] flex items-center justify-center p-4 md:p-10",
    container: `w-full max-w-6xl h-full max-h-[92vh] flex flex-col md:flex-row overflow-hidden rounded-[3rem] border ${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300`,
    sidebar: `w-full md:w-80 p-8 flex flex-col border-r ${isDark ? 'border-white/10 bg-[#0f172a]/50' : 'border-slate-200 bg-slate-50'}`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-1"
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        
        {/* Left Action Sidebar */}
        <aside className={styles.sidebar}>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FileText size={24} />
            </div>
            <div>
              <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>My Payslip</h3>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <Lock size={10} /> Personal Record
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
              <label className={styles.label}>Net Earnings</label>
              <p className="text-3xl font-black text-[#7c3aed] tracking-tighter">${salaryData.net}</p>
              <p className="text-[9px] text-[#94a3b8] font-bold mt-1 tracking-widest uppercase">Cleared to Bank</p>
            </div>

            <div className="space-y-6 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Building2 size={14}/></div>
                  <span className="text-[10px] font-black text-[#94a3b8] uppercase">Base Pay</span>
                </div>
                <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${salaryData.basic}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><TrendingUp size={14}/></div>
                  <span className="text-[10px] font-black text-[#94a3b8] uppercase">Bonuses</span>
                </div>
                <span className="text-xs font-black text-emerald-500">+${salaryData.bonus}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><MinusCircle size={14}/></div>
                  <span className="text-[10px] font-black text-[#94a3b8] uppercase">Deductions</span>
                </div>
                <span className="text-xs font-black text-red-500">-${salaryData.deductions}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-purple-500/20">
              <Download size={18} /> Export PDF
            </button>
            <button onClick={handlePrint} className={`w-full flex items-center justify-center gap-3 py-4 border ${isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-600'} rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all`}>
              <Printer size={18} /> Print Document
            </button>
          </div>
        </aside>

        {/* Right Preview Area */}
        <div className={`flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar ${isDark ? 'bg-[#020617]' : 'bg-slate-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                 <ShieldCheck className="text-emerald-500" size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Encrypted Access</span>
               </div>
               <span className="text-[9px] text-[#475569] font-bold">Session: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-[#94a3b8] hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Actual Payslip Document */}
          <div ref={payslipRef} className="bg-white rounded-4xl p-12 text-slate-900 shadow-2xl min-h-full border border-slate-200">
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-[#7c3aed] rounded-xl flex items-center justify-center text-white">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter">LyticalSMS</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Employee Portal • Payroll Department</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black uppercase italic text-slate-200 tracking-widest">OFFICIAL PAYSLIP</p>
                <p className="text-sm font-black text-[#7c3aed]">{salaryData.month}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Employee Information</label>
                <div className="space-y-1">
                  <p className="text-base font-black text-slate-900">{salaryData.emp}</p>
                  <p className="text-xs font-bold text-slate-500 italic">Account ID: {salaryData.idNo}</p>
                  <p className="text-xs text-slate-400 font-medium">LyticalSMS Active Personnel</p>
                </div>
              </div>
              <div className="text-right p-6">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Transaction Summary</label>
                <div className="space-y-1">
                  <p className="text-xs font-black">REF: #LSMS-{salaryData.id}-{new Date().getFullYear()}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Processed: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-[#7c3aed] font-black uppercase tracking-widest">Status: Fully Paid</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100 mb-10">
                <table className="w-full">
                <thead>
                    <tr className="bg-slate-50">
                    <th className="text-left p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Earnings Description</th>
                    <th className="text-right p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    <tr>
                    <td className="p-5 text-xs font-bold text-slate-700">Monthly Basic Remuneration</td>
                    <td className="p-5 text-right text-xs font-black text-slate-900">${salaryData.basic.toLocaleString()}</td>
                    </tr>
                    <tr>
                    <td className="p-5 text-xs font-bold text-slate-700">Performance Incentive & Bonus</td>
                    <td className="p-5 text-right text-xs font-black text-emerald-600">+${salaryData.bonus.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-red-50/30">
                    <td className="p-5 text-xs font-bold text-red-700 uppercase tracking-tighter">Tax & Statutory Deductions</td>
                    <td className="p-5 text-right text-xs font-black text-red-600">-${salaryData.deductions.toLocaleString()}</td>
                    </tr>
                </tbody>
                </table>
            </div>

            <div className="bg-[#0b1220] rounded-4xl p-8 flex justify-between items-center text-white">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Payable Amount</p>
                <p className="text-xs text-slate-400 italic">This amount has been credited to your registered bank account.</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white tracking-tighter">${salaryData.net.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <div className="text-[8px] font-bold text-slate-300 uppercase leading-relaxed max-w-xs">
                Computer generated document. Securely issued via LyticalSMS v2.0 Employee Portal. Valid without physical signature.
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                    <Lock size={20} className="text-slate-200" />
                 </div>
                 <span className="text-[7px] font-black text-slate-300 tracking-widest uppercase">Certified Original</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSalary;