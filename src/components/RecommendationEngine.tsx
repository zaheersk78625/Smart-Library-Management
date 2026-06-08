import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, BookOpen, Star, RefreshCw, BadgeAlert, TrendingUp } from 'lucide-react';
import { Book } from '../types';

interface RecommendationEngineProps {
  books: Book[];
  userId: string;
}

interface AIRecommendItem {
  bookId: string;
  title: string;
  reason: string;
  score: number;
}

export default function RecommendationEngine({ books, userId }: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = () => {
    setLoading(true);
    setError('');
    fetch(`/api/ai/recommendations?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('API server failed');
        return res.json();
      })
      .then(data => {
        setRecommendations(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to securely establish connection to Gemini predictive systems.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="rounded-2xl bg-indigo-50 border border-indigo-100/70 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-700">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <h3 className="text-base font-bold tracking-tight">Gemini ML Recommendation Engine</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
            Our real-time collaborative and content-based filtering model matches your historical reading velocity, catalog categories, and book ratings with our entire storage index to predict highly engaging next reads.
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-bold text-xs shadow-md transition disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
        >
          {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Iterate Model
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="relative">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <Cpu className="absolute top-2.5 left-2.5 h-5 w-5 text-indigo-600 animate-pulse" />
          </div>
          <h4 className="mt-4 text-sm font-bold text-gray-800 font-sans">Compiling reading patterns...</h4>
          <p className="mt-1 text-xs text-slate-400 font-mono tracking-tight text-center max-w-xs leading-relaxed">
            Querying server prediction vectors in Gemini 3.5 Flash...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 bg-rose-50/50 rounded-2xl border border-rose-100 text-center px-4">
          <BadgeAlert className="h-10 w-10 text-rose-500 stroke-1" />
          <h4 className="mt-3 text-sm font-bold text-gray-800">Connection Interrupted</h4>
          <p className="mt-1 text-xs text-gray-500 max-w-xs mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="rounded-lg bg-rose-600 text-white font-semibold text-xs px-4 py-2 shadow transition hover:bg-rose-700"
          >
            Retry Sync
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500 mt-2 font-mono">No recommendation data generated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase font-sans">
            Personalized Predicted Matches
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => {
              // Match book details to read cover photo or categories
              const bookObj = books.find(b => b.id === rec.bookId || b.title === rec.title);
              const scorePercentage = Math.round((Number(rec.score) || 0.9) * 100);

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-sm hover:shadow-md hover:border-indigo-100 transition duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-700 font-mono tracking-wide uppercase">
                        {bookObj?.category || 'General'}
                      </span>
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[10.5px] font-bold">
                        <TrendingUp className="h-3 w-3" />
                        <span>{scorePercentage}% Match</span>
                      </div>
                    </div>

                    {/* Book Cover and Title Mini HUD */}
                    <div className="flex gap-3">
                      <div className="h-16 w-12 rounded-md overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        <img
                          src={bookObj?.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                          alt={rec.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-sans text-gray-900 tracking-tight leading-tight line-clamp-2">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{bookObj?.author || 'Unknown Author'}</p>
                        {bookObj && (
                          <div className="flex items-center gap-0.5 mt-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold text-gray-600">{bookObj.rating} / 5</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reasoning Description Box */}
                    <p className="text-xs text-gray-600 leading-semibold bg-slate-50/70 p-3 rounded-lg leading-relaxed font-sans mt-2.5">
                      {rec.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
