import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  DollarSign,
  AlertTriangle,
  Library,
  Layers,
  Sparkles,
  Search,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  LogIn,
  KeyRound,
  Mail,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import Navbar from './components/Navbar';
import BookCatalog from './components/BookCatalog';
import VirtualScanner from './components/VirtualScanner';
import RecommendationEngine from './components/RecommendationEngine';
import AdminDashboard from './components/AdminDashboard';
import ChatbotAssistant from './components/ChatbotAssistant';
import ApiDocumentation from './components/ApiDocumentation';
import DockerInstructions from './components/DockerInstructions';
import ReadingGoalTracker from './components/ReadingGoalTracker';
import { Book, BorrowRecord, DashboardStats, Notification, User } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('library_jwt_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Core application states
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Visual layout states
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [scannerTargetBookId, setScannerTargetBookId] = useState<string | null>(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  // Auth Forms
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authRole, setAuthRole] = useState<'student' | 'admin'>('student');
  const [authError, setAuthError] = useState('');

  // Setup security headers automatically
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // 1. Verify user session or fetch user details on load
  useEffect(() => {
    if (token) {
      setLoadingUser(true);
      fetch('/api/auth/me', {
        headers: getHeaders(),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Expired session');
          }
          return res.json();
        })
        .then(data => {
          setUser(data.user);
          setLoadingUser(false);
        })
        .catch(err => {
          console.error(err);
          handleLogout();
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
    }
  }, [token]);

  // 2. Fetch books collection
  const fetchBooks = () => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data || []))
      .catch(err => console.error('E_BOOKS_FETCH:', err));
  };

  // 3. Fetch user borrow history
  const fetchBorrowHistory = () => {
    if (!token) return;
    fetch('/api/borrow/history', {
      headers: getHeaders(),
    })
      .then(res => res.json())
      .then(data => {
        setBorrowHistory(data || []);
      })
      .catch(err => console.error('E_BORROW_FETCH:', err));
  };

  // 4. Fetch notifications mailbox alerts
  const fetchNotifications = () => {
    if (!token) return;
    fetch('/api/notifications', {
      headers: getHeaders(),
    })
      .then(res => res.json())
      .then(data => setNotifications(data || []))
      .catch(err => console.error('E_NOTIF_FETCH:', err));
  };

  // 5. Fetch statistics indicators (mainly for admin counters)
  const fetchStats = () => {
    if (!token) return;
    fetch('/api/stats', {
      headers: getHeaders(),
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('E_STATS_FETCH:', err));
  };

  // Bulk synchronizer
  const synchronizeDatabase = () => {
    fetchBooks();
    fetchBorrowHistory();
    fetchNotifications();
    fetchStats();
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (user) {
      synchronizeDatabase();
    }
  }, [user]);

  // Auth Handlers
  const handleQuickLogin = (email: string, pass: string) => {
    setAuthError('');
    setAuthEmail(email);
    setAuthPassword(pass);
    setIsRegistering(false);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    })
      .then(async res => {
        if (!res.ok) {
          let errorMsg = 'Login verification failed';
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } catch (e) {
            errorMsg = `Server error (${res.status})`;
          }
          throw new Error(errorMsg);
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('library_jwt_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setAuthEmail('');
        setAuthPassword('');
      })
      .catch(err => {
        console.error(err);
        setAuthError(err.message);
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword) {
      setAuthError('Please fill out all credential spaces.');
      return;
    }

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword }),
    })
      .then(async res => {
        if (!res.ok) {
          let errorMsg = 'Login verification failed';
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } catch (e) {
            errorMsg = `Server error (${res.status})`;
          }
          throw new Error(errorMsg);
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('library_jwt_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setAuthEmail('');
        setAuthPassword('');
      })
      .catch(err => {
        console.error(err);
        setAuthError(err.message);
      });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername || !authEmail || !authPassword) {
      setAuthError('Please supply all credentials.');
      return;
    }

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: authUsername,
        email: authEmail,
        password: authPassword,
        role: authRole,
      }),
    })
      .then(async res => {
        if (!res.ok) {
          let errorMsg = 'Registration failed';
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } catch (e) {
            errorMsg = `Server error (${res.status})`;
          }
          throw new Error(errorMsg);
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('library_jwt_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setAuthUsername('');
        setAuthEmail('');
        setAuthPassword('');
      })
      .catch(err => {
        console.error(err);
        setAuthError(err.message);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('library_jwt_token');
    setToken(null);
    setUser(null);
    setBorrowHistory([]);
    setNotifications([]);
    setStats(null);
    setActiveTab('catalog');
  };

  // Mark all alerts read
  const handleMarkNotificationsRead = () => {
    fetch('/api/notifications/read', {
      method: 'POST',
      headers: getHeaders(),
    })
      .then(() => fetchNotifications())
      .catch(err => console.error(err));
  };

  // Book borrow trigger
  const handleBorrowBook = (bookId: string) => {
    fetch('/api/borrow', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId }),
    })
      .then(async res => {
        if (!res.ok) {
          let errorMsg = 'Failed to borrow';
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } catch (e) {
            errorMsg = `Server error (${res.status})`;
          }
          throw new Error(errorMsg);
        }
        return res.json();
      })
      .then(() => {
        synchronizeDatabase();
      })
      .catch(err => {
        alert(err.message);
      });
  };

  // Book manual return
  const handleProcessReturn = async (recordId: string) => {
    await fetch('/api/return', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recordId }),
    })
      .then(res => res.json())
      .then(() => synchronizeDatabase())
      .catch(err => console.error(err));
  };

  // Clear or Pay Dynamic Fine override
  const handleClearFine = async (recordId: string) => {
    await fetch('/api/fines/pay', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recordId }),
    })
      .then(res => res.json())
      .then(() => synchronizeDatabase())
      .catch(err => console.error(err));
  };

  // Simulate email overdue notice trigger
  const handleSendNotice = async (recordId: string) => {
    await fetch('/api/alerts/send', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recordId }),
    })
      .then(res => res.json())
      .catch(err => console.error(err));
  };

  // Leave Book review and rating update
  const handleAddReview = async (bookId: string, rating: number, text: string) => {
    await fetch(`/api/books/${bookId}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, text }),
    })
      .then(res => res.json())
      .then(() => fetchBooks())
      .catch(err => console.error(err));
  };

  // Admin inserts book direct from modal or tab handles
  const handleAddBook = async (bookData: any) => {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookData),
    });
    if (!res.ok) {
      let errorMsg = 'Book catalog insertion failed';
      try {
        const data = await res.json();
        errorMsg = data.error || errorMsg;
      } catch (e) {
        errorMsg = `Server error (${res.status})`;
      }
      throw new Error(errorMsg);
    }
    await res.json();
    fetchBooks();
  };

  // Handles camera scanner action triggers
  const handleOpenScanner = (bookId: string) => {
    setScannerTargetBookId(bookId);
  };

  // Main UI Loader gating
  if (loadingUser) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <h3 className="mt-4 font-sans text-sm font-bold text-gray-800">Authenticating cryptokey credentials...</h3>
      </div>
    );
  }

  // Gateway Gatekeeper Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mx-auto">
            <Library className="h-6.5 w-6.5" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900">
              Alexandria Smart Library
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Log in with your academic credentials to borrow, audit overdue status, query AI Libbot, and see predictive book ratings.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 sm:rounded-2xl border border-gray-100 sm:px-10">
            
            {authError && (
              <div className="p-3 mb-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs font-semibold text-left">
                💀 credential mismatched: {authError}
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 text-xs font-medium text-left text-gray-700">
              
              {isRegistering && (
                <div>
                  <label className="block text-gray-600 mb-1">Campus Username</label>
                  <input
                    type="text"
                    required
                    placeholder="john_student"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full rounded-lg border border-gray-205 py-2 px-3 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-600 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@library.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-205 py-2 px-3 outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Security PIN / Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-205 py-2 px-3 outline-none focus:border-indigo-500 transition"
                />
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-gray-600 mb-1">System Privilege Level</label>
                  <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-150 mt-1 select-none">
                    <button
                      type="button"
                      onClick={() => setAuthRole('student')}
                      className={`flex-1 rounded-md py-1 px-3 text-center text-xs font-semibold ${
                        authRole === 'student' ? 'bg-indigo-600 text-white' : 'text-gray-500'
                      }`}
                    >
                      Student/Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('admin')}
                      className={`flex-1 rounded-md py-1 px-3 text-center text-xs font-semibold ${
                        authRole === 'admin' ? 'bg-indigo-600 text-white' : 'text-gray-500'
                      }`}
                    >
                      Admin Registrar
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-2.5 text-xs text-white font-bold shadow-md transition cursor-pointer mt-2"
              >
                {isRegistering ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                <span>{isRegistering ? 'Register & Initialize Wallet' : 'Authorize Secure Access'}</span>
              </button>

            </form>

            {/* Pivot log/register */}
            <div className="mt-6 border-t border-gray-150 pt-4 flex justify-between items-center text-[11px]">
              <span className="text-gray-400">
                {isRegistering ? 'Already hold database token?' : 'First time on smart campus?'}
              </span>
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError('');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isRegistering ? 'Login Gate' : 'Register Gate'}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Preconfigured Test Accounts Credentials Help block */}
            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs text-slate-500">
              <span className="font-bold text-slate-700 block mb-2 select-none">⚡ Instant 1-Click Sign In:</span>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student@library.com', 'student123')}
                  className="flex flex-col items-center justify-center p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-100 font-semibold cursor-pointer transition text-center"
                >
                  <span className="text-[11px] font-bold">Student Account</span>
                  <span className="text-[9px] font-mono text-indigo-500">student123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@library.com', 'admin123')}
                  className="flex flex-col items-center justify-center p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-100 font-semibold cursor-pointer transition text-center"
                >
                  <span className="text-[11px] font-bold">Admin Registrar</span>
                  <span className="text-[9px] font-mono text-amber-600">admin123</span>
                </button>
              </div>
              <div className="space-y-1 block mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                <div>Manual: <code className="font-mono bg-slate-100 px-1 rounded text-slate-600">student@library.com</code> : <code className="font-mono bg-slate-100 px-1 rounded text-slate-600">student123</code></div>
                <div>Manual: <code className="font-mono bg-slate-100 px-1 rounded text-slate-600">admin@library.com</code> : <code className="font-mono bg-slate-100 px-1 rounded text-slate-600">admin123</code></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Main Authenticated Dashboard Screen Layout
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-gray-900 pb-16">
      
      {/* Navbar top-level banner */}
      <Navbar
        user={user}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main maxed container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Dynamic Inner Tab Display routing */}
        <section className="animate-in fade-in duration-200">
          
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">Digital Book Inventory Stock</h2>
                <p className="text-xs text-gray-500">Search available physical copies, view ratings, rate book contents, or scan QR indexes instantly.</p>
              </div>
              <BookCatalog
                books={books}
                user={user}
                onBorrowBook={handleBorrowBook}
                onAddReview={handleAddReview}
                onOpenScanner={handleOpenScanner}
                onOpenAddBookModal={() => setIsAddBookModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'my-books' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">My Active Borrowed Loans ({borrowHistory.filter(h => h.status !== 'returned').length})</h2>
                <p className="text-xs text-gray-500">Track returning due date parameters, resolve outstanding overdue fees, or inspect your archive history log.</p>
              </div>

              {/* Personal Reading Goal Tracker */}
              <ReadingGoalTracker userId={user.id} borrowHistory={borrowHistory} />

              {borrowHistory.filter(h => h.status !== 'returned').length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-4">
                  <Library className="h-10 w-10 text-gray-300 stroke-1" />
                  <h3 className="mt-4 font-sans text-sm font-bold text-gray-800">Your shelf is completely empty</h3>
                  <p className="mt-1 text-xs text-gray-500 max-w-xs text-center leading-relaxed">
                    Browse our collection of classics and productivity handbooks in the catalog and loan books via QR scanners.
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="mt-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 cursor-pointer transition shadow-md"
                  >
                    Go browse catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {borrowHistory
                    .filter(h => h.status !== 'returned')
                    .map(h => {
                      const isOverdue = h.status === 'overdue' || h.fineAmount > 0;
                      const bookObj = books.find(book => book.id === h.bookId);

                      return (
                        <div
                          key={h.id}
                          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex gap-4 items-start"
                        >
                          <div className="h-24 w-18 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={bookObj?.coverUrl} alt={h.bookTitle} className="h-full w-full object-cover" />
                          </div>
                          
                          <div className="flex-1 text-left text-xs text-gray-500 space-y-1">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 leading-tight">{h.bookTitle}</h3>
                              <p className="text-[10.5px] text-gray-400 font-medium">Author: {bookObj?.author || 'Unknown'}</p>
                            </div>

                            <div className="flex items-center gap-1.5 pt-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium text-gray-700">Due: {new Date(h.dueDate).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                              {isOverdue ? (
                                <div className="text-rose-600 font-bold font-mono text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  <span>Overdue Fine: ${h.fineAmount.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-bold text-indigo-700 border border-indigo-100 uppercase">
                                  Loan active
                                </span>
                              )}
                              
                              <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                  onClick={() => handleOpenScanner(h.bookId)}
                                  className="rounded-lg border border-gray-200 p-2 hover:bg-slate-50 text-gray-600 transition"
                                  title="Scanner Checkout / Return"
                                >
                                  QR Scanner
                                </button>
                                <button
                                  onClick={() => handleProcessReturn(h.id)}
                                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 text-xs transition shadow cursor-pointer"
                                >
                                  ReturnBook
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Historic returns logs */}
              {borrowHistory.filter(h => h.status === 'returned').length > 0 && (
                <div className="space-y-2 mt-8 text-left">
                  <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase font-sans">Recently Returned Vault Archives</h4>
                  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] text-gray-400 uppercase font-bold border-b border-gray-100">
                          <th className="p-3">Book Title</th>
                          <th className="p-3">Date Loaned</th>
                          <th className="p-3">Returned On</th>
                          <th className="p-3">Status / Penalty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {borrowHistory
                          .filter(h => h.status === 'returned')
                          .map(h => (
                            <tr key={h.id} className="text-slate-600 text-xs">
                              <td className="p-3 font-semibold text-gray-700">{h.bookTitle}</td>
                              <td className="p-3">{new Date(h.issueDate).toLocaleDateString()}</td>
                              <td className="p-3">{h.returnDate ? new Date(h.returnDate).toLocaleDateString() : 'N/A'}</td>
                              <td className="p-3">
                                <span className="inline-flex items-center rounded bg-emerald-50 text-emerald-700 font-bold text-[9.5px] px-2 py-0.5 border border-emerald-100 uppercase">
                                  Returned on shelf
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <RecommendationEngine books={books} userId={user.id} />
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <AdminDashboard
              stats={stats}
              borrowRecords={borrowHistory}
              usersList={[...new Map<string, BorrowRecord>(borrowHistory.map(b => [b.userId, b])).values()].map((t: BorrowRecord) => ({
                id: t.userId,
                username: t.username,
                email: `${t.username}@library.com`,
                role: 'student' as const,
                createdAt: t.issueDate
              }))}
              onAddBook={handleAddBook}
              onProcessReturn={handleProcessReturn}
              onClearFine={handleClearFine}
              onSendNotice={handleSendNotice}
              onRefreshData={synchronizeDatabase}
              books={books}
            />
          )}

          {activeTab === 'api-docs' && (
            <ApiDocumentation />
          )}

        </section>

      </main>

      {/* Floating Smart chatbot librarian assistant panel */}
      <ChatbotAssistant />

      {/* Global Interactive QR Video Scanner Emulator Container */}
      {scannerTargetBookId && (
        <VirtualScanner
          books={books}
          preselectedBookId={scannerTargetBookId}
          onClose={() => setScannerTargetBookId(null)}
          onSuccessBorrow={handleBorrowBook}
          onSuccessReturn={handleProcessReturn}
          activeBorrows={borrowHistory}
        />
      )}

      {/* Global Simple Add Book Modal for Admin Quick Actions */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-sans font-bold text-sm text-gray-900">Index Book Details</h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
              >
                &times;
              </button>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await handleAddBook({
                    title: formData.get('title') as string,
                    author: formData.get('author') as string,
                    category: formData.get('category') as string,
                    isbn: formData.get('isbn') as string,
                    totalCopies: parseInt(formData.get('copies') as string || '1'),
                    coverUrl: formData.get('coverUrl') as string,
                    synopsis: formData.get('synopsis') as string,
                  });
                  setIsAddBookModalOpen(false);
                } catch (err: any) {
                  alert(err.message);
                }
              }}
              className="space-y-3 text-left text-xs text-gray-700 font-medium"
            >
              <div>
                <label className="block text-gray-600 mb-0.5">Book Title *</label>
                <input type="text" name="title" required className="w-full rounded-lg border border-gray-200 p-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-0.5">Author *</label>
                  <input type="text" name="author" required className="w-full rounded-lg border border-gray-200 p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Category *</label>
                  <select name="category" className="w-full rounded-lg border border-gray-200 p-2 text-xs">
                    <option value="Fiction">Fiction</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Biography">Biography</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-0.5">ISBN Code *</label>
                  <input type="text" name="isbn" required className="w-full rounded-lg border border-gray-200 p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Stock Copies *</label>
                  <input type="number" name="copies" min="1" defaultValue="4" required className="w-full rounded-lg border border-gray-200 p-2 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Cover Image URL</label>
                <input type="url" name="coverUrl" className="w-full rounded-lg border border-gray-200 p-2 text-xs" />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Synopsis Summary</label>
                <textarea name="synopsis" rows={3} className="w-full rounded-lg border border-gray-200 p-2 text-xs resize-none" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl transition">
                Securely Index Book
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Bottom Instructions Anchor for Developer Testing */}
      <footer className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 border-t border-gray-150 mt-16 pb-8 text-center text-xs text-gray-400 space-y-2">
        <p className="flex items-center justify-center gap-1">
          <BookOpen className="h-4 w-4" /> Alexandria Smart Library &mdash; Full-Stack Demonstration Environment.
        </p>
        <div className="flex justify-center gap-4 text-[11px] font-semibold text-gray-500">
          <button onClick={() => setActiveTab('api-docs')} className="hover:text-indigo-600 transition flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> REST APIs Docs
          </button>
          <span>&bull;</span>
          <button onClick={() => { alert("This application runs securely with an isolated Express backend container and stores dynamic records in server memory."); }} className="hover:text-indigo-600 transition">
            Persisted Memory Sandbox
          </button>
        </div>
      </footer>

    </div>
  );
}
