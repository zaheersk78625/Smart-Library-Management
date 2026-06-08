import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Star, QrCode, BookOpen, AlertCircle, Plus, Sparkles, Send } from 'lucide-react';
import { Book, User } from '../types';

interface BookCatalogProps {
  books: Book[];
  user: User | null;
  onBorrowBook: (bookId: string) => void;
  onAddReview: (bookId: string, rating: number, text: string) => void;
  onOpenScanner: (bookId: string) => void;
  onOpenAddBookModal?: () => void;
}

export default function BookCatalog({
  books,
  user,
  onBorrowBook,
  onAddReview,
  onOpenScanner,
  onOpenAddBookModal,
}: BookCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');

  // Review submission state
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // QR Code base64 data for detail modal
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loadingQR, setLoadingQR] = useState(false);

  // Categories list
  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  // Voice recognition init
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(''), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setSpeechError('Failed to capture speech. Please check microphone permissions.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.start();
  };

  // Filter books
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch QR Code for the selected book when double-clicked or opened
  useEffect(() => {
    if (selectedBook) {
      setLoadingQR(true);
      fetch(`/api/qrcode?text=library-book-checkout-${selectedBook.id}`)
        .then(res => res.json())
        .then(data => {
          setQrCodeUrl(data.qrCodeUrl || '');
          setLoadingQR(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingQR(false);
        });
    } else {
      setQrCodeUrl('');
    }
  }, [selectedBook]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      await onAddReview(selectedBook.id, userRating, reviewText);
      // Refresh current selected book details
      const updatedBook = books.find(b => b.id === selectedBook.id);
      if (updatedBook) {
        setSelectedBook(updatedBook);
      }
      setReviewText('');
      setUserRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Action Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search Input and Voice */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search by title, author, category, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-12 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            onClick={handleVoiceSearch}
            title="Voice Search"
            className={`absolute inset-y-1.5 right-1.5 flex items-center justify-center w-8.5 rounded-lg transition ${
              isListening 
                ? 'bg-rose-100 text-rose-600 animate-pulse' 
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                selectedCategory === c
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {c}
            </button>
          ))}

          {user?.role === 'admin' && onOpenAddBookModal && (
            <button
              onClick={onOpenAddBookModal}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer ml-auto sm:ml-2"
            >
              <Plus className="h-3.5 w-3.5" /> Book
            </button>
          )}
        </div>

      </div>

      {/* Voice Assistant Error Banner */}
      {speechError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-4">
          <BookOpen className="h-12 w-12 text-gray-300 stroke-1" />
          <h3 className="mt-4 font-sans text-sm font-bold text-gray-800">No books found</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xs text-center leading-relaxed">
            Try adjusting your spelling, filter tag, or dictation phrase to look through our catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBooks.map(b => {
            const availRatio = b.totalCopies > 0 ? (b.availableCopies / b.totalCopies) * 100 : 0;
            const isOutOfStock = b.availableCopies <= 0;

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBook(b)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-indigo-100 transition duration-200 cursor-pointer"
              >
                {/* Book Cover Visual */}
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-gray-50 mb-3">
                  <img
                    src={b.coverUrl}
                    alt={b.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 right-2.5 rounded-md bg-white/90 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-bold text-gray-800 border border-gray-100">
                    {b.category}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-gray-700">{b.rating}</span>
                    <span className="text-[10px] text-gray-400">({b.reviews.length} reviews)</span>
                  </div>

                  <h3 className="font-sans text-sm font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 line-clamp-1">
                    {b.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{b.author}</p>

                  {/* Stock tracking indicator */}
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                      <span>Available</span>
                      <span className={isOutOfStock ? 'text-rose-500 font-bold' : 'text-gray-700'}>
                        {isOutOfStock ? '0 (Out of stock)' : `${b.availableCopies} / ${b.totalCopies}`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${availRatio}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOutOfStock ? 'bg-rose-500' : availRatio <= 30 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Quick Checkout Buttons */}
                <div className="mt-3.5 pt-2 flex items-center justify-between border-t border-gray-50">
                  <span className="text-[9.5px] font-mono text-gray-400 tracking-tight">{b.isbn}</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenScanner(b.id)}
                      title="Issue / Return Book with QR Code Scan"
                      className="rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={isOutOfStock}
                      onClick={() => onBorrowBook(b.id)}
                      className={`text-[11px] font-bold rounded-lg px-2.5 py-1.5 shadow-xs transition ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                      }`}
                    >
                      Borrow
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Detail Modal featuring Interactive QR & Reviews */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{selectedBook.category}</span>
                <h2 className="text-lg font-bold text-gray-950 mt-0.5">{selectedBook.title}</h2>
                <p className="text-xs text-gray-500">By {selectedBook.author} &mdash; ISBN: {selectedBook.isbn}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                &times;
              </button>
            </div>

            {/* Scrollable grid area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                
                {/* Visual Cover and QR Code generator */}
                <div className="md:col-span-2 space-y-3">
                  <div className="aspect-3/4 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="h-full w-full object-cover" />
                  </div>
                  
                  {/* Generated Base64 Actionable Library QR */}
                  <div className="rounded-xl border border-dashed border-gray-200 p-2.5 bg-gray-50 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-600 mb-1 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 text-indigo-600" /> Smart QR Checkout
                    </span>
                    {loadingQR ? (
                      <div className="h-28 w-28 flex items-center justify-center">
                        <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Library QR Checkin" className="h-28 w-28 bg-white border border-gray-100 p-1.5 rounded-lg shadow-inner" />
                    ) : (
                      <div className="h-28 w-28 bg-gray-200 rounded-lg" />
                    )}
                    <span className="text-[9px] text-gray-400 mt-1 leading-tight">
                      Scan digital code at physical desks or launch the Virtual Quick-Scanner contextually below.
                    </span>
                  </div>
                </div>

                {/* Synopsis and Reviews submission */}
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Book Synopsis</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedBook.synopsis}</p>
                  </div>

                  {/* Submit review */}
                  <form onSubmit={submitReview} className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                    <h4 className="text-xs font-bold text-gray-800">Leave a Review</h4>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">My Rating:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setUserRating(n)}
                            className="text-amber-400 transition hover:scale-110"
                          >
                            <Star className={`h-4.5 w-4.5 ${userRating >= n ? 'fill-amber-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Write a comment about this book..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none transition focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 hover:bg-indigo-700 transition font-bold text-xs flex items-center justify-center shrink-0"
                      >
                        {submittingReview ? <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-3 w-3" />}
                      </button>
                    </div>
                  </form>

                  {/* List of Previous Reviews */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-800">Reviews & Critiques ({selectedBook.reviews.length})</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {selectedBook.reviews.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">No reviews yet. Be the first to share your thoughts!</p>
                      ) : (
                        selectedBook.reviews.map(r => (
                          <div key={r.id} className="border-b border-gray-150 pb-2 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-800">{r.username}</span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-2.5 w-2.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mt-0.5 font-sans leading-relaxed">{r.text}</p>
                            <span className="text-[9px] text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Footer borrowings */}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center bg-white">
              <span className="text-xs text-gray-500">Available: <b className="text-gray-800">{selectedBook.availableCopies} copies</b></span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBook(null);
                    onOpenScanner(selectedBook.id);
                  }}
                  className="rounded-lg border border-gray-200 hover:bg-gray-50 px-4 py-2 font-bold text-xs text-gray-600 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5 text-gray-500" /> Scanner
                </button>
                <button
                  onClick={() => {
                    onBorrowBook(selectedBook.id);
                    setSelectedBook(null);
                  }}
                  disabled={selectedBook.availableCopies <= 0}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  Borrow Book
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
