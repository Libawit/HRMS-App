import React, { useRef } from 'react';
import { 
  X, Printer, ShieldCheck, Building2, 
  CheckCircle2, Clock
} from 'lucide-react';

const ViewSalary = ({ isOpen, onClose, salaryData, theme = 'dark' }) => {
  const payslipRef = useRef(null);
  
  if (!isOpen || !salaryData) return null;

  const isDark = theme === 'dark';

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrint = () => {
    window.print();
  };

  const styles = {
    overlay: "fixed inset-0 bg-black/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4 md:p-10",
    container: `w-full max-w-5xl h-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden rounded-[3rem] border ${isDark ? 'bg-[#0b1220] border-white/10' : 'bg-white border-slate-200'} shadow-2xl animate-in zoom-in-95 duration-300`,
    sidebar: `w-full md:w-80 p-8 flex flex-col border-r ${isDark ? 'border-white/10 bg-[#0f172a]/50' : 'border-slate-200 bg-slate-50'}`,
    label: "text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-1",
    badge: (status) => {
      if (status === 'PAID') return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      if (status === 'VOID') return "bg-red-500/10 text-red-500 border-red-500/20";
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        
        {/* Left Action Sidebar */}
        <aside className={styles.sidebar}>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/20">
              {salaryData.user?.firstName?.[0] || 'E'}
            </div>
            <div>
              <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {salaryData.user?.firstName} {salaryData.user?.lastName}
              </h3>
              <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tighter">
                {salaryData.user?.employeeId}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <label className={styles.label}>Total Net Pay</label>
              <p className="text-3xl font-black text-[#7c3aed] tracking-tighter">
                ${salaryData.netPay?.toLocaleString()}
              </p>
              <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${styles.badge(salaryData.status)}`}>
                {salaryData.status === 'PAID' ? <CheckCircle2 size={10}/> : <Clock size={10}/>}
                {salaryData.status}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#94a3b8]">Basic Salary</span>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>${salaryData.amountBasic?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#94a3b8]">Bonus</span>
                <span className="text-emerald-500">+${salaryData.amountBonus?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#94a3b8]">Deductions</span>
                <span className="text-red-500">-${salaryData.deductions?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button 
              onClick={handlePrint} 
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-purple-500/20"
            >
              <Printer size={16} /> PRINT PAYSLIP
            </button>
            <p className="text-[9px] text-center text-[#94a3b8] font-bold mt-4 uppercase tracking-tighter px-4">
              Printer settings: Set "Layout" to Portrait and "Margins" to None for best results.
            </p>
          </div>
        </aside>

        {/* Right Preview Area */}
        <div className={`flex-1 p-6 md:p-12 overflow-y-auto no-scrollbar ${isDark ? 'bg-[#020617]' : 'bg-slate-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <ShieldCheck className="text-emerald-500" size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Official ERP Record</span>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-[#94a3b8] hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Printable Payslip Area */}
          <div id="printable-payslip" ref={payslipRef} className="bg-white rounded-4xl p-10 text-slate-900 shadow-xl min-h-fit print:m-0 print:shadow-none">
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center text-white">
                    <Building2 size={18} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter">HRMS</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Payroll Department</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black uppercase italic text-slate-200">Payslip</p>
                <p className="text-xs font-bold text-slate-600">
                  {months[salaryData.month]} {salaryData.year}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Employee Details</label>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">{salaryData.user?.firstName} {salaryData.user?.lastName}</p>
                  <p className="text-xs text-slate-500 uppercase">ID: {salaryData.user?.employeeId}</p>
                  <p className="text-xs text-slate-500 font-medium">Department: {salaryData.department?.name || 'General'}</p>
                </div>
              </div>
              <div className="text-right">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Disbursement Details</label>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 uppercase">Status: {salaryData.status}</p>
                  <p className="text-xs text-slate-500">Ref: #{salaryData.id?.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-slate-500">Issued: {new Date(salaryData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <table className="w-full mb-10">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Earnings</th>
                  <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-4 text-xs font-bold text-slate-700">Monthly Basic Salary</td>
                  <td className="py-4 text-right text-xs font-bold text-slate-900">${salaryData.amountBasic?.toLocaleString()}</td>
                  <td className="py-4 text-right text-xs font-bold text-slate-900">—</td>
                </tr>
                <tr>
                  <td className="py-4 text-xs font-bold text-slate-700">Performance Bonuses</td>
                  <td className="py-4 text-right text-xs font-bold text-emerald-600">+${salaryData.amountBonus?.toLocaleString()}</td>
                  <td className="py-4 text-right text-xs font-bold text-slate-900">—</td>
                </tr>
                <tr>
                  <td className="py-4 text-xs font-bold text-slate-700">Tax & Adjustments</td>
                  <td className="py-4 text-right text-xs font-bold text-slate-900">—</td>
                  <td className="py-4 text-right text-xs font-bold text-red-500">-${salaryData.deductions?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-slate-50 rounded-3xl p-8 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Disbursed Amount</p>
                <p className="text-xs text-slate-400 italic mt-1 font-medium">Verified electronic payment</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#7c3aed] tracking-tighter">
                  ${salaryData.netPay?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center opacity-40">
              <div className="text-[7px] font-bold text-slate-400 uppercase max-w-50 leading-relaxed">
                This document is a digital representation of the payroll record stored in the HRMS ERP system.
              </div>
              <div className="flex flex-col items-end">
                <div className="w-12 h-12 bg-slate-100 rounded-lg mb-1"></div>
                <p className="text-[8px] font-black text-slate-400">QR SECURE</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-payslip, #printable-payslip * { visibility: visible; }
          #printable-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px !important;
          }
          /* Hide scrollbars during print */
          ::-webkit-scrollbar { display: none; }
        }
      `}} />
    </div>
  );
};

export default ViewSalary;