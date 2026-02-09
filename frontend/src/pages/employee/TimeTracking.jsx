import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Play, 
  Square, 
  Info, 
  AlertCircle, 
  ShieldCheck, 
  Timer,
  CheckCircle2,
  RefreshCcw,
  MapPin,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useOutletContext } from 'react-router-dom';

const TimeTracking = () => {
  // --- Theme Logic via useOutletContext ---
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  // --- State ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState('Inactive');
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState('--:--');
  
  // FIXED QR VALUE: Use this same ID for all employees. 
  // Print this QR code and post it at your office entrance.
  const staticStationId = "COMPANY-MAIN-STATION-001"; 

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Theme Styles ---
  const styles = {
    bgBody: isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]',
    bgCard: isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    textMain: isDark ? 'text-[#e5e7eb]' : 'text-[#1e293b]',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-[#64748b]',
  };

  const handlePunch = () => {
    if (!isPunchedIn) {
      if (window.confirm("Do you want to Punch In at this station?")) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        setIsPunchedIn(true);
        setStatus('Working');
        setPunchInTime(timeStr);
      }
    } else {
      if (window.confirm("Are you sure you want to Punch Out?")) {
        setIsPunchedIn(false);
        setStatus('Inactive');
      }
    }
  };

  return (
    <main className={`flex-1 overflow-y-auto p-6 ${styles.bgBody} transition-colors duration-300`}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-widest ${styles.textMuted} mb-2`}>
            Employee Portal &gt; Attendance
          </div>
          <h1 className={`text-3xl font-black tracking-tight ${styles.textMain}`}>Live Time Tracking</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Section 1: Live Tracking */}
        <div className="xl:col-span-2 space-y-6">
          <div className={`${styles.bgCard} border ${styles.border} rounded-3xl p-8 relative overflow-hidden shadow-xl`}>
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-[#7c3aed]">
              <Clock size={200} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`flex h-2.5 w-2.5 rounded-full ${isPunchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className={`text-xs font-bold uppercase tracking-tighter ${styles.textMuted}`}>
                    Status: <span className={isPunchedIn ? 'text-emerald-500' : 'text-red-500'}>{status}</span>
                  </span>
                </div>
                
                <div className={`text-6xl md:text-7xl font-black tracking-tighter ${styles.textMain} mb-2 tabular-nums`}>
                  {currentTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                
                <div className={`flex items-center gap-2 ${styles.textMuted} font-medium`}>
                  <Calendar size={16} />
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="w-full md:w-auto">
                <button 
                  onClick={handlePunch}
                  className={`w-full md:w-64 flex items-center justify-center gap-3 px-10 py-6 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-2xl ${
                    isPunchedIn 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                    : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-purple-500/20'
                  }`}
                >
                  {isPunchedIn ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                  {isPunchedIn ? 'PUNCH OUT' : 'PUNCH IN'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-inherit">
              <div className="space-y-1">
                <div className={`text-[10px] font-bold uppercase ${styles.textMuted}`}>Shift Start</div>
                <div className={`text-xl font-black ${styles.textMain}`}>{punchInTime}</div>
              </div>
              <div className="space-y-1">
                <div className={`text-[10px] font-bold uppercase ${styles.textMuted}`}>Current Session</div>
                <div className={`text-xl font-black text-[#7c3aed]`}>{isPunchedIn ? "Active" : "0h 0m"}</div>
              </div>
              <div className="space-y-1">
                <div className={`text-[10px] font-bold uppercase ${styles.textMuted}`}>Today's Total</div>
                <div className={`text-xl font-black ${styles.textMain}`}>8h 45m</div>
              </div>
            </div>
          </div>

          <div className={`${styles.bgCard} border ${styles.border} rounded-3xl p-6`}>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-[#7c3aed]" size={20} />
              <h3 className={`font-bold ${styles.textMain}`}>Station Policy</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-5 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} space-y-2`}>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase">
                  <Clock size={14} /> Usage
                </div>
                <p className={`text-xs leading-relaxed ${styles.textMuted}`}>
                  Scan the printed QR code at the entrance to verify your location. This stationary code is common for all employees at this branch.
                </p>
              </div>

              <div className={`p-5 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} space-y-2`}>
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase">
                  <AlertCircle size={14} /> Security Notice
                </div>
                <p className={`text-xs leading-relaxed ${styles.textMuted}`}>
                  Punches are geo-verified. Do not attempt to scan screenshots or printed codes away from the company premises.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Fixed Station QR */}
        <div className="space-y-6">
          <div className={`${styles.bgCard} border ${styles.border} rounded-3xl p-8 flex flex-col items-center text-center shadow-lg`}>
            <div className="mb-6">
              <h3 className={`font-black text-lg ${styles.textMain}`}>Station Scan Point</h3>
              <p className={`text-xs ${styles.textMuted}`}>Print and display this code for all staff</p>
            </div>

            {/* STATIC QR CODE (Always stays the same) */}
            <div className="p-6 bg-white rounded-3xl mb-6 shadow-inner ring-1 ring-slate-100">
              <QRCodeSVG 
                value={staticStationId} 
                size={180}
                level={"H"}
                includeMargin={false}
              />
            </div>
            
            {/* Action buttons for station point (Reset removed) */}
            <div className="w-full">
              <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border ${styles.border} ${styles.textMuted} hover:bg-white/5 transition-all text-xs font-bold`}>
                 <Printer size={16} /> Print Station QR Code
              </button>
            </div>
          </div>

          {/* Sync Status */}
          <div className={`${styles.bgCard} border ${styles.border} rounded-3xl p-6 flex items-center gap-4 border-l-4 border-l-blue-500`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className={`text-sm font-bold ${styles.textMain}`}>Station Active</div>
              <div className={`text-xs ${styles.textMuted}`}>Last scan: 2 mins ago</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default TimeTracking;