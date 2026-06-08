import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Sparkles,
  Award,
  Plus,
  Minus,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Calendar,
  Flame,
  ChevronRight
} from 'lucide-react';
import { BorrowRecord } from '../types';

interface ReadingGoalTrackerProps {
  userId: string;
  borrowHistory: BorrowRecord[];
}

export default function ReadingGoalTracker({ userId, borrowHistory }: ReadingGoalTrackerProps) {
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth(); // 0-11
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentMonthNum];

  // Storage key based on user and year
  const storageKey = `alexandria_reading_goals_${userId}_${currentYear}`;

  // Local state
  const [target, setTarget] = useState<number>(3);
  const [externalBooks, setExternalBooks] = useState<string[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');

  // First-load initialization
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.target === 'number') {
          setTarget(parsed.target);
        }
        if (Array.isArray(parsed.externalBooks)) {
          setExternalBooks(parsed.externalBooks);
        }
      } catch (e) {
        console.error('Error parsing reading goals:', e);
      }
    }
  }, [storageKey]);

  // Persist change
  const saveToStorage = (newTarget: number, newExtBooks: string[]) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        target: newTarget,
        externalBooks: newExtBooks
      })
    );
  };

  const handleIncrementGoal = () => {
    const nextVal = target + 1;
    setTarget(nextVal);
    saveToStorage(nextVal, externalBooks);
  };

  const handleDecrementGoal = () => {
    if (target <= 1) return;
    const nextVal = target - 1;
    setTarget(nextVal);
    saveToStorage(nextVal, externalBooks);
  };

  const handleAddExternalBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const bookEntry = newBookAuthor.trim() 
      ? `${newBookTitle.trim()} by ${newBookAuthor.trim()}`
      : newBookTitle.trim();

    const updated = [...externalBooks, bookEntry];
    setExternalBooks(updated);
    saveToStorage(target, updated);

    setNewBookTitle('');
    setNewBookAuthor('');
    setShowLogForm(false);
  };

  const handleRemoveExternalBook = (index: number) => {
    const updated = externalBooks.filter((_, i) => i !== index);
    setExternalBooks(updated);
    saveToStorage(target, updated);
  };

  // Filter library books returned in current month
  const libraryReturnedThisMonth = borrowHistory.filter(h => {
    if (h.status !== 'returned' || !h.returnDate) return false;
    const retDate = new Date(h.returnDate);
    return retDate.getMonth() === currentMonthNum && retDate.getFullYear() === currentYear;
  });

  const libraryCount = libraryReturnedThisMonth.length;
  const externalCount = externalBooks.length;
  const totalCompleted = libraryCount + externalCount;
  
  const completionPercentage = Math.min(100, Math.round((totalCompleted / target) * 100));

  // Determine encouragement message and badge
  let badgeName = 'Novice Scholar';
  let colorClass = 'text-indigo-600 bg-indigo-50 border-indigo-100';
  let accentBarClass = 'bg-indigo-600';
  let message = 'Start tracking your monthly academic reading milestones!';

  if (completionPercentage >= 100) {
    badgeName = 'Legendary Sage 👑';
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    accentBarClass = 'bg-amber-500';
    message = 'Incredible! You matched and conquered your reading target. Masterclass!';
  } else if (completionPercentage >= 75) {
    badgeName = 'High Academic Scholar';
    colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-100';
    accentBarClass = 'bg-emerald-600';
    message = 'Outstanding! The goal is in near sight. Keep fueling the fire.';
  } else if (completionPercentage >= 50) {
    badgeName = 'Active Scholar';
    colorClass = 'text-violet-700 bg-violet-50 border-violet-100';
    accentBarClass = 'bg-violet-600';
    message = 'Halfway there! Keep exploring our volumes.';
  } else if (completionPercentage > 0) {
    badgeName = 'Ascending Reader';
    colorClass = 'text-sky-700 bg-sky-50 border-sky-100';
    accentBarClass = 'bg-sky-600';
    message = 'First step completed! Keep diving into the records.';
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-5 shadow-sm text-left font-sans">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-amber-500" /> Academic Reading Goals Tracker
          </h3>
          <p className="text-[11.5px] text-gray-500 mt-0.5">
            Pledge, track, and celebrate literary milestones for {currentMonthName} {currentYear}.
          </p>
        </div>

        {/* Badge Indicator */}
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold border ${colorClass}`}>
          <Award className="h-3.5 w-3.5" />
          {badgeName}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Circle/Dial Progress bar section */}
        <div className="md:col-span-4 flex flex-col items-center justify-center py-2 relative">
          
          <div className="relative h-28 w-28 flex items-center justify-center">
            {/* SVG Circle Track */}
            <svg className="absolute inset-0 h-full w-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-gray-100 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                className={`fill-none stroke-current transition-all duration-500 ${
                  completionPercentage >= 100 ? 'text-amber-500' : 'text-indigo-600'
                }`}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - completionPercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="text-center space-y-0.5">
              <span className="text-2xl font-extrabold font-mono tracking-tight text-gray-900">
                {totalCompleted}
              </span>
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                of {target} books
              </span>
            </div>
          </div>

          <div className="mt-2.5 text-center">
            <span className="text-xs font-bold text-gray-700">{completionPercentage}% Completed</span>
          </div>
        </div>

        {/* Goal Adjuster + Analytics block */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Pledge Goal Adjuster Box */}
          <div className="bg-slate-50/75 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-indigo-500" /> Target Books Goal:
              </span>
              <p className="text-[10px] text-gray-500">Pledge the total items you want to complete this month.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrementGoal}
                disabled={target <= 1}
                className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-slate-50 text-gray-600 disabled:opacity-50 transition cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-base font-extrabold text-gray-900 px-1 w-6 text-center">
                {target}
              </span>
              <button
                onClick={handleIncrementGoal}
                className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-slate-50 text-gray-600 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Dynamic Horizontal Progress Bar */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600" /> Monthly Progress Status
              </span>
              <span className="font-mono font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded text-[11px]">
                {completionPercentage}% Achieved
              </span>
            </div>
            <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden border border-gray-200 p-[1.5px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  completionPercentage >= 100 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm animate-pulse' 
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Inspirational Prompt box */}
          <div className="rounded-xl border border-indigo-50 bg-indigo-50/40 p-3 flex gap-2.5 items-start">
            <Sparkles className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-indigo-950">Librarian Insight:</span>
              <p className="text-[10.5px] text-indigo-800 leading-normal">{message}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Books Read split break overview */}
      <div className="pt-3 border-t border-gray-150 space-y-3.5">
        
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
            Completed Library Logs & External Books ({totalCompleted})
          </span>

          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-0.5"
          >
            {showLogForm ? 'Cancel Logging' : '+ Log External Book'}
          </button>
        </div>

        {/* Form to log external book */}
        {showLogForm && (
          <form onSubmit={handleAddExternalBook} className="bg-slate-5 w-full rounded-xl border border-slate-205 p-3 space-y-3 animate-in slide-in-from-top-4 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-gray-600 mb-0.5">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sapiens"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full bg-white rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-gray-600 mb-0.5">Author (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Yuval Noah Harari"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full bg-white rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 rounded-lg transition shadow-sm cursor-pointer"
            >
              Log External Book Read
            </button>
          </form>
        )}

        {/* List of books completed */}
        {totalCompleted === 0 ? (
          <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-gray-100 text-gray-400 text-[11px]">
            No completed materials logged this month. Complete a loan return to automatically sync book completions.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Library list */}
            {libraryReturnedThisMonth.map(h => (
              <div key={h.id} className="flex items-center gap-2.5 bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-2 px-3 text-xs">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-left overflow-hidden">
                  <span className="font-bold text-gray-800 block truncate leading-snug">{h.bookTitle}</span>
                  <span className="text-[9.5px] text-gray-400 block font-medium">Returned Returned Catalog Item</span>
                </div>
              </div>
            ))}

            {/* External list */}
            {externalBooks.map((bName, index) => (
              <div key={index} className="flex items-center justify-between gap-2 bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-2 px-3 text-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div className="text-left overflow-hidden">
                    <span className="font-bold text-gray-800 block truncate leading-snug">{bName}</span>
                    <span className="text-[9.5px] text-gray-400 block font-medium">External Reading Log</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveExternalBook(index)}
                  className="text-gray-400 hover:text-rose-600 text-xs px-1 hover:bg-rose-50 rounded"
                  title="Remove external log"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
