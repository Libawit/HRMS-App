import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { 
  Clock, Calendar, Play, Square, Info, AlertCircle, ShieldCheck, 
  Timer, CheckCircle2, MapPin, Printer, Loader2, Bot
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

const TimeTracking = () => {
  const context = useOutletContext();
  const theme = context?.theme || 'dark';
  const isDark = theme === 'dark';

  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState('Inactive');
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState('--:--');
  const [todayTotal, setTodayTotal] = useState('0h 0m');
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  
  const staticStationId = "COMPANY-MAIN-STATION-001"; 
  const qrRef = useRef(); // Reference for the QR section

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/attendance/me/today'); // Using your instance

      if (res.data) {
        const currentlyIn = !!res.data.checkIn && !res.data.checkOut;
        setIsPunchedIn(currentlyIn);
        setStatus(currentlyIn ? 'Working' : 'Inactive');
        setPunchInTime(res.data.checkIn ? new Date(res.data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--');
        setTodayTotal(res.data.workHours ? `${res.data.workHours}h` : '0h 0m');
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPunch = async () => {
    const action = isPunchedIn ? 'OUT' : 'IN';
    if (!window.confirm(`Confirm Manual Punch ${action}?`)) return;

    try {
      setPunchLoading(true);
      const res = await axios.post(`/attendance/punch`, { stationId: staticStationId });
      await fetchCurrentStatus();
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Punch failed");
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const botUsername = "HRMS_Attendance_Bot"; 
  const qrValue = `https://t.me/${botUsername}?start=${staticStationId}`;

  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardClass = `transition-all duration-300 border rounded-[2rem] ${
    isDark ? 'bg-[#0b1220] border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-sm'
  }`;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f1f5f9]'}`}>
      
      {/* --- PRINT ONLY STYLES --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; background: white !important; }
          #printable-qr-area, #printable-qr-area * { visibility: visible; }
          #printable-qr-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="no-print mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-purple-500' : 'text-indigo-600'}`}>
            Employee Portal &nbsp; • &nbsp; Time Tracking
          </nav>
          <h1 className={`text-[2rem] font-black tracking-tighter ${titleText}`}>Shift Management</h1>
        </div>
        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border ${isDark ? 'border-white/5 bg-[#0b1220]' : 'border-slate-300 bg-white shadow-sm'}`}>
          <MapPin size={16} className={isDark ? "text-purple-500" : "text-indigo-600"} />
          <span className={`text-xs font-black uppercase tracking-tight ${titleText}`}>HQ Station: 001</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6 no-print">
          {/* ... Shift Management Card ... */}
          <div className={`${cardClass} p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-black/20`}>
            <div className={`absolute -top-10 -right-10 opacity-[0.03] pointer-events-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Clock size={320} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                    isPunchedIn ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isPunchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    Status: {status}
                  </div>
                </div>
                
                <div className={`text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none ${titleText}`}>
                  {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                
                <div className={`flex items-center gap-2 text-sm font-bold tracking-tight pt-2 ${subText}`}>
                  <Calendar size={18} className={isDark ? "text-purple-500" : "text-indigo-600"} />
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="w-full md:w-auto">
                <button 
                  onClick={handleManualPunch}
                  disabled={punchLoading}
                  className={`w-full md:w-72 flex items-center justify-center gap-4 px-10 py-8 rounded-3xl font-black text-xl transition-all active:scale-95 shadow-2xl hover:scale-[1.02] ${
                    isPunchedIn 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                    : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-purple-500/30'
                  } disabled:opacity-50`}
                >
                  {punchLoading ? <Loader2 className="animate-spin" /> : (isPunchedIn ? <Square size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />)}
                  {isPunchedIn ? 'PUNCH OUT' : 'PUNCH IN'}
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-10 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="space-y-1">
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${subText}`}>Shift Entry</div>
                <div className={`text-2xl font-black ${titleText}`}>{punchInTime}</div>
              </div>
              <div className="space-y-1">
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${subText}`}>Session Status</div>
                <div className={`text-2xl font-black ${isPunchedIn ? 'text-emerald-500' : titleText}`}>
                  {isPunchedIn ? "Active Now" : "Inactive"}
                </div>
              </div>
              <div className="space-y-1">
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${subText}`}>Today's Hours</div>
                <div className={`text-2xl font-black ${isDark ? 'text-purple-400' : 'text-indigo-600'}`}>{todayTotal}</div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} p-8`}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-500' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                <ShieldCheck size={20} />
              </div>
              <h3 className={`font-black uppercase tracking-widest text-xs ${titleText}`}>Bot Verification System</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-wider mb-2">
                  <Bot size={14} /> Telegram Sync
                </div>
                <p className={`text-xs leading-relaxed ${subText}`}>
                  Your Telegram must be verified with your company email. Once linked, scan the QR to punch.
                </p>
              </div>
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-wider mb-2">
                  <AlertCircle size={14} /> Fraud Alert
                </div>
                <p className={`text-xs leading-relaxed ${subText}`}>
                  Every QR scan logs your Telegram ID and location. Do not share station codes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- QR SECTION --- */}
        <div className="space-y-6">
          <div id="printable-qr-area" className={`${cardClass} p-8 flex flex-col items-center text-center`}>
            <div className="mb-8">
              <div className={`no-print w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100'}`}>
                <Printer size={24} className={isDark ? "text-purple-400" : "text-indigo-600"} />
              </div>
              <h3 className={`font-black text-xl tracking-tight ${titleText}`}>Station QR Entrance</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${subText}`}>Scan via Telegram Bot to Punch</p>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] mb-8 shadow-2xl ring-8 ring-slate-100/50 print:ring-0 print:shadow-none">
              <QRCodeSVG value={qrValue} size={220} level={"H"} includeMargin={false} />
            </div>

            <div className="w-full space-y-4">
                <button 
                  onClick={handlePrint}
                  className="no-print flex items-center justify-center gap-3 w-full py-4 bg-[#7c3aed] text-white rounded-2xl font-black text-xs hover:bg-[#6d28d9] transition-all"
                >
                  <Printer size={18} /> PRINT FOR ENTRANCE
                </button>
                <div className={`p-4 rounded-2xl border flex flex-col items-center gap-1 ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Online</div>
                    <div className={`text-[11px] font-mono font-bold ${isDark ? 'text-emerald-200/50' : 'text-emerald-700'}`}>{staticStationId}</div>
                </div>
            </div>
          </div>

          <div className={`no-print ${cardClass} p-6 flex items-center gap-5 border-l-4 ${isDark ? 'border-l-purple-500' : 'border-l-indigo-600'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-purple-500/10 text-purple-500' : 'bg-indigo-50 text-indigo-600'}`}>
              <CheckCircle2 size={28} />
            </div>
            <div>
              <div className={`text-sm font-black uppercase tracking-tight ${titleText}`}>Cloud Sync</div>
              <div className={`text-xs font-bold ${subText}`}>Punch data is live</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TimeTracking;