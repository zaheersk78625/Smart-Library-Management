import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Sparkles, CheckCircle, AlertTriangle, Camera, Monitor, Play, RefreshCw, X } from 'lucide-react';
import { Book } from '../types';

interface VirtualScannerProps {
  books: Book[];
  preselectedBookId?: string;
  onClose: () => void;
  onSuccessBorrow: (bookId: string) => void;
  onSuccessReturn: (recordId: string, bookId: string) => void;
  activeBorrows: any[]; // BorrowRecord list
}

export default function VirtualScanner({
  books,
  preselectedBookId = '',
  onClose,
  onSuccessBorrow,
  onSuccessReturn,
  activeBorrows,
}: VirtualScannerProps) {
  const [targetBookId, setTargetBookId] = useState(preselectedBookId || (books[0]?.id || ''));
  const [scanType, setScanType] = useState<'checkout' | 'return'>('checkout');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [cameraMode, setCameraMode] = useState<'virtual' | 'webcam'>('virtual');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-switch return tab or preselected book logic
  useEffect(() => {
    if (preselectedBookId) {
      setTargetBookId(preselectedBookId);
      // Auto determine if checkout or return based on if user has checked it out already
      const hasBorrowed = activeBorrows.some(b => b.bookId === preselectedBookId && b.status !== 'returned');
      setScanType(hasBorrowed ? 'return' : 'checkout');
    }
  }, [preselectedBookId, activeBorrows]);

  // Handle webcam start / stop
  useEffect(() => {
    if (cameraMode === 'webcam') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Camera capture error:', err);
          addLog('Webcam setup failed. Defaulting back to Virtual Scanner Emulator...');
          setCameraMode('virtual');
        });
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [cameraMode]);

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const addLog = (msg: string) => {
    setScanLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleScanAction = () => {
    if (scanStatus === 'scanning') return;

    setScanStatus('scanning');
    setFeedbackMsg('');
    addLog(`Initializing optical scanning sequence...`);
    addLog(`Mode toggled: ${scanType === 'checkout' ? 'BOOK ISSUE / LOAN' : 'BOOK RETURN'}`);

    // If checkout, targetBook is selected. If return, we look for borrow details
    const book = books.find(b => b.id === targetBookId);
    if (!book) {
      setScanStatus('error');
      setFeedbackMsg('Invalid scan targeted.');
      addLog('Error: Scanning Target catalog not synchronized.');
      return;
    }

    addLog(`Searching for QR matrix targeting core ISBN: ${book.isbn}`);
    
    // Animate a 2 second scan
    setTimeout(() => {
      if (scanType === 'checkout') {
        if (book.availableCopies <= 0) {
          setScanStatus('error');
          setFeedbackMsg(`"${book.title}" is currently out of stock structural limits.`);
          addLog(`Scanning completed: Rejected. 0 copies in physical library stock.`);
          return;
        }

        const isAlreadyBorrowed = activeBorrows.some(b => b.bookId === book.id && b.status !== 'returned');
        if (isAlreadyBorrowed) {
          setScanStatus('error');
          setFeedbackMsg(`Verification failed: You are already borrowing "${book.title}".`);
          addLog(`Scan Rejected: Duplicate issue token prohibited.`);
          return;
        }

        // Trigger Success borrow API
        onSuccessBorrow(book.id);
        setScanStatus('success');
        setFeedbackMsg(`Checkout Successful! QR authenticated matching title "${book.title}".`);
        addLog(`Secured JWT Auth successfully. Book Loan generated. Enjoy reading!`);
      } else {
        // Return book logic
        const borrowedRecord = activeBorrows.find(b => b.bookId === book.id && b.status !== 'returned');
        if (!borrowedRecord) {
          setScanStatus('error');
          setFeedbackMsg(`No current borrow record exists for "${book.title}".`);
          addLog(`Scan Rejected: Book holds default inventory, no matching borrowed token found.`);
          return;
        }

        onSuccessReturn(borrowedRecord.id, book.id);
        setScanStatus('success');
        setFeedbackMsg(`Book Returned Successfully! Thank you.`);
        addLog(`Auth confirmed. Borrow record ${borrowedRecord.id} set to "returned". Fines recalculated.`);
      }
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-1.5 uppercase font-mono">
              <QrCode className="h-4.5 w-4.5 text-indigo-500" /> Alexandria QR Terminal v3.2
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic selector block */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-mono text-slate-400 capitalize mb-1">Target Scanner Item</label>
            <select
              value={targetBookId}
              onChange={(e) => setTargetBookId(e.target.value)}
              disabled={scanStatus === 'scanning'}
              className="w-full rounded-lg bg-slate-800 text-xs text-white border border-slate-700 p-2 outline-none focus:border-indigo-500 font-mono"
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} (ISBN: {b.isbn})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Action</label>
              <div className="flex bg-slate-800 rounded-lg p-1 select-none border border-slate-700">
                <button
                  onClick={() => setScanType('checkout')}
                  disabled={scanStatus === 'scanning'}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-bold font-mono transition ${
                    scanType === 'checkout' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ISSUE
                </button>
                <button
                  onClick={() => setScanType('return')}
                  disabled={scanStatus === 'scanning'}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-bold font-mono transition ${
                    scanType === 'return' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RETURN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Screen: Camera Frame vs Virtual Laser simulator */}
        <div className="relative flex-1 min-h-[220px] bg-black flex items-center justify-center overflow-hidden">
          
          {cameraMode === 'webcam' ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute left-0 top-0 h-full w-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center">
              <div className="text-center space-y-2 opacity-50 select-none">
                <Camera className="h-10 w-10 text-slate-600 mx-auto stroke-1" />
                <p className="text-xs text-slate-400 font-mono">Virtual QR Sensor Matrix</p>
              </div>
            </div>
          )}

          {/* Holographic HUD Overlay */}
          <div className="absolute inset-0 border-[16px] border-black/40 pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-5 w-5 border-l-2 border-t-2 border-indigo-500" />
              <div className="h-5 w-5 border-r-2 border-t-2 border-indigo-500" />
            </div>
            <div className="flex justify-between">
              <div className="h-5 w-5 border-l-2 border-b-2 border-indigo-500" />
              <div className="h-5 w-5 border-r-2 border-b-2 border-indigo-500" />
            </div>
          </div>

          {/* Interactive Red Laser Line */}
          {scanStatus === 'scanning' && (
            <div className="absolute left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_10px_#22c55e] animate-bounce w-full" />
          )}

          {/* Overlay state banners */}
          <div className="absolute p-4 text-center">
            {scanStatus === 'idle' && (
              <button
                onClick={handleScanAction}
                className="font-mono text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 transition uppercase tracking-wide cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" /> Initialize Scanning Mode
              </button>
            )}

            {scanStatus === 'scanning' && (
              <div className="bg-black/80 rounded-xl px-4 py-3 border border-indigo-500/30 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin" />
                <span className="font-mono text-xs text-slate-200 tracking-tight">Aligning Lens onto book ISBN...</span>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="bg-emerald-950/90 rounded-2xl p-4 max-w-sm border border-emerald-500/40 text-left shadow-2xl animate-in zoom-in-95 duration-100">
                <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span className="font-mono text-xs font-bold tracking-tight">ACCESS RESOLUTON: IN</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{feedbackMsg}</p>
                <button
                  onClick={() => setScanStatus('idle')}
                  className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 font-mono text-[10.5px] font-bold py-1 px-3 rounded-lg text-white"
                >
                  SCAN NEXT
                </button>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="bg-rose-950/90 rounded-2xl p-4 max-w-sm border border-rose-500/40 text-left shadow-2xl">
                <div className="flex items-center gap-2 text-rose-400 mb-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span className="font-mono text-xs font-bold">ACCESS RESOLUTION: REJECTED</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{feedbackMsg}</p>
                <button
                  onClick={() => setScanStatus('idle')}
                  className="mt-3 w-full bg-rose-600 hover:bg-rose-500 font-mono text-[10.5px] font-bold py-1 px-3 rounded-lg text-white"
                >
                  RETRY SEQUENCE
                </button>
              </div>
            )}
          </div>

          {/* Quick toggle at bottom right of center screen */}
          <div className="absolute bottom-3 right-3 flex bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setCameraMode('virtual')}
              title="Virtual Computer Camera Simulator"
              className={`rounded px-2.5 py-1 text-[10.5px] font-mono flex items-center gap-1 transition ${
                cameraMode === 'virtual' ? 'bg-slate-700 text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Monitor className="h-3 w-3" /> Virtual
            </button>
            <button
              onClick={() => setCameraMode('webcam')}
              title="Activate physical camera of device"
              className={`rounded px-2.5 py-1 text-[10.5px] font-mono flex items-center gap-1 transition ${
                cameraMode === 'webcam' ? 'bg-slate-700 text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Camera className="h-3 w-3" /> Webcam
            </button>
          </div>

        </div>

        {/* Diagnostics & Logs */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 font-mono text-[10.5px]">
          <span className="text-slate-400 font-bold block mb-1.5 uppercase letter-spacing-wide">Diagnosis Logs (Terminal output)</span>
          <div className="h-28 overflow-y-auto space-y-1 bg-black/50 p-2.5 rounded-lg border border-slate-900 text-indigo-300/90">
            {scanLog.map((log, idx) => (
              <div key={idx} className="leading-relaxed">{log}</div>
            ))}
            <div className="text-slate-500">&gt; Optical scanner connected. Listening on local port 3000...</div>
          </div>
        </div>

      </div>
    </div>
  );
}
