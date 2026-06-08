import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Mail,
  Check,
  RefreshCw,
  PlusCircle,
  FileCheck2,
  Trash2,
  BadgeAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Book, BorrowRecord, DashboardStats, User } from '../types';

interface AdminDashboardProps {
  stats: DashboardStats | null;
  borrowRecords: BorrowRecord[];
  usersList: User[];
  onAddBook: (bookData: any) => Promise<void>;
  onProcessReturn: (recordId: string) => Promise<void>;
  onClearFine: (recordId: string) => Promise<void>;
  onSendNotice: (recordId: string) => Promise<void>;
  onRefreshData: () => void;
  books: Book[];
}

export default function AdminDashboard({
  stats,
  borrowRecords,
  usersList,
  onAddBook,
  onProcessReturn,
  onClearFine,
  onSendNotice,
  onRefreshData,
  books,
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'transactions' | 'users' | 'add-book'>('stats');

  // Book form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fiction');
  const [isbn, setIsbn] = useState('');
  const [totalCopies, setTotalCopies] = useState(3);
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [bookCreated, setBookCreated] = useState(false);

  // Notice alert banner state
  const [noticeMessage, setNoticeMessage] = useState('');

  // Recharts colors
  const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  const handleSubmitBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !isbn || !totalCopies) return;

    try {
      await onAddBook({
        title,
        author,
        category,
        isbn,
        totalCopies,
        coverUrl,
        synopsis,
      });
      setBookCreated(true);
      setTitle('');
      setAuthor('');
      setIsbn('');
      setCoverUrl('');
      setSynopsis('');
      setTimeout(() => setBookCreated(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSendNotice = async (recordId: string) => {
    try {
      await onSendNotice(recordId);
      setNoticeMessage('Urgent email alert and database notice broadcast successfully.');
      setTimeout(() => setNoticeMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerProcessReturn = async (recordId: string) => {
    try {
      await onProcessReturn(recordId);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerClearFine = async (recordId: string) => {
    try {
      await onClearFine(recordId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Admin Operations Console</h2>
          <p className="text-xs text-gray-500">Overview of inventory tracking, loan logs, student catalogs, and dynamic fines calculation.</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={onRefreshData}
            title="Reload statistics and borrow parameters"
            className="rounded-lg p-2 bg-slate-50 border border-slate-200 text-gray-600 hover:bg-slate-100 font-bold text-xs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setActiveSubTab('stats')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                activeSubTab === 'stats' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSubTab('transactions')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                activeSubTab === 'transactions' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveSubTab('users')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                activeSubTab === 'users' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveSubTab('add-book')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                activeSubTab === 'add-book' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" /> Book
            </button>
          </div>
        </div>
      </div>

      {noticeMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 p-4 font-sans text-xs font-medium text-indigo-700">
          <FileCheck2 className="h-4 w-4 text-indigo-500 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Subtab Render */}
      {activeSubTab === 'stats' && stats && (
        <div className="space-y-6">
          
          {/* Card Widgets */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-sans">Active Stock Items</span>
                <div className="rounded-lg bg-indigo-50 p-1 text-indigo-600"><BookOpen className="h-4 w-4" /></div>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mt-2 font-mono tracking-tight leading-none">
                {stats.availableBooks} / {stats.totalBooks}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">{books.length} unique titles registered</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-sans">Active Issues / Loans</span>
                <div className="rounded-lg bg-amber-50 p-1 text-amber-600"><FileCheck2 className="h-4 w-4" /></div>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mt-2 font-mono tracking-tight leading-none">
                {stats.issuedBooks}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">Outstanding items checked out</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-sans">Accumulated Fines</span>
                <div className="rounded-lg bg-emerald-50 p-1 text-emerald-600"><DollarSign className="h-4 w-4" /></div>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mt-2 font-mono tracking-tight leading-none text-emerald-600">
                ${stats.totalFines.toFixed(2)}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">Dynamic rate ($1.50/day policy)</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-sans">Overdue Alerts</span>
                <div className="rounded-lg bg-rose-50 p-1 text-rose-600"><AlertTriangle className="h-4 w-4 animate-pulse" /></div>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mt-2 font-mono tracking-tight leading-none text-rose-600">
                {stats.overdueCount}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">Automated emails flagged</p>
            </div>

          </div>

          {/* Graphics Area */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* BorrowTrends Chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 md:col-span-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Borrow Trends Weekly Flow</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.borrowTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBorrow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                    <Area type="monotone" dataKey="count" name="Books Barrowed" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorBorrow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category distribution piechart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 md:col-span-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Inventory Category Weight</h3>
              <div className="h-64 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Transactions Subtab */}
      {activeSubTab === 'transactions' && (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Live Lending Registry & Overdue Calculations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-150">
                  <th className="p-3">Borrower / Student</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Fine Debt</th>
                  <th className="p-3 text-right">Actions Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {borrowRecords.map(r => {
                  const isReturned = r.status === 'returned';
                  const isOverdue = r.status === 'overdue' || (r.fineAmount > 0 && !isReturned);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-gray-800">{r.username}</div>
                        <span className="text-[10px] text-gray-400 font-mono italic">UID: {r.userId}</span>
                      </td>
                      <td className="p-3 font-semibold text-gray-700">{r.bookTitle}</td>
                      <td className="p-3 text-gray-500">{new Date(r.issueDate).toLocaleDateString()}</td>
                      <td className="p-3 text-gray-500">{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        {isReturned ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700 border border-emerald-100 uppercase">
                            Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-700 border border-rose-100 uppercase animate-pulse">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-bold text-indigo-700 border border-indigo-100 uppercase">
                            Active Loan
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        {r.fineAmount > 0 ? (
                          <span className="text-rose-600">${r.fineAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">$0.00</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {!isReturned && (
                          <button
                            onClick={() => triggerProcessReturn(r.id)}
                            title="Accept physical book at counter"
                            className="inline-flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2 py-1 shadow-xs cursor-pointer transition"
                          >
                            <Check className="h-3 w-3" /> Return
                          </button>
                        )}
                        {isOverdue && !isReturned && (
                          <button
                            onClick={() => triggerSendNotice(r.id)}
                            title="Simulate dispatching a warning email about overdue constraints"
                            className="inline-flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[10px] px-2 py-1 shadow-xs cursor-pointer transition"
                          >
                            <Mail className="h-3 w-3" /> Notice
                          </button>
                        )}
                        {r.fineAmount > 0 && (
                          <button
                            onClick={() => triggerClearFine(r.id)}
                            title="Override accumulated fines"
                            className="inline-flex items-center rounded border border-gray-200 hover:bg-rose-50 hover:text-rose-600 text-gray-500 font-bold text-[10px] px-2 py-1 transition"
                          >
                            Override Fine
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users subtab */}
      {activeSubTab === 'users' && (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700">Registered Accounts Dashboard</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-150">
                <th className="p-3">User Identifiers</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Security Role</th>
                <th className="p-3">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3">
                    <div className="font-bold text-gray-800">{u.username}</div>
                    <span className="text-[9.5px] font-mono text-gray-400">UUID: {u.id}</span>
                  </td>
                  <td className="p-3 text-gray-600 font-mono">{u.email}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-tight ${
                      u.role === 'admin' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100 font-bold' 
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add book Form */}
      {activeSubTab === 'add-book' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Add New Book to Collection</h3>
          
          {bookCreated && (
            <div className="p-3.5 mb-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-semibold">
              ✔ Book successfully indexed into virtual catalog.
            </div>
          )}

          <form onSubmit={handleSubmitBook} className="space-y-4 text-xs text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Book Title *</label>
                <input
                  type="text"
                  placeholder="The Midnight Library"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Author *</label>
                <input
                  type="text"
                  placeholder="Matt Haig"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Category / Genre *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-indigo-500 transition"
                >
                  <option value="Fiction">Fiction</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Biography">Biography</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">ISBN Code *</label>
                <input
                  type="text"
                  placeholder="978-0525559474"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Total Copies *</label>
                <input
                  type="number"
                  min="1"
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Book Cover Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Synopsis</label>
              <textarea
                placeholder="A brief summary of what the book explains..."
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition"
            >
              Securely Catalog Book
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
