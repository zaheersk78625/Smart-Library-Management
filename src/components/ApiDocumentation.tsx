import React from 'react';
import { Terminal, Copy, Check, Lock, Cpu, Globe } from 'lucide-react';

export default function ApiDocumentation() {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'Authenticate academic credentials. Returns a cryptographically secured RSA-JWT token.',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@library.com', password: 'student123' }, null, 2),
      response: JSON.stringify({ token: 'eyJhbGciOi...', user: { id: 'user_2', username: 'student', email: 'student@library.com', role: 'student' } }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/books',
      description: 'Get total structured books index complete with summaries, ratings, available inventory ratios, and previous critiques.',
      headers: {},
      body: null,
      response: JSON.stringify([
        {
          id: 'book_1',
          title: 'The Midnight Library',
          author: 'Matt Haig',
          category: 'Fiction',
          isbn: '978-0525559474',
          totalCopies: 5,
          availableCopies: 4,
          rating: 4.5
        }
      ], null, 2),
    },
    {
      method: 'POST',
      path: '/api/borrow',
      description: 'Request a book issue/loan. Triggers catalog decrement and schedules return logs.',
      headers: { 'Authorization': 'Bearer <token>', 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: 'book_1' }, null, 2),
      response: JSON.stringify({ id: 'borrow_4', userId: 'user_2', bookId: 'book_1', bookTitle: 'The Midnight Library', status: 'issued', dueDate: '2026-06-22T00:00:00Z', fineAmount: 0 }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/ai/recommendations',
      description: 'Query Gemini 3.5 Flash collaborative predictive models to match user history against physical shelf topics.',
      headers: { 'Authorization': 'Bearer <token>' },
      body: null,
      response: JSON.stringify([
        {
          bookId: 'book_3',
          title: 'Atomic Habits',
          reason: 'Predicted via productivity historical affinity... Confidence rating: high.',
          score: 0.95
        }
      ], null, 2),
    }
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-600" /> REST API Endpoint Reference Catalog
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Complete microservice documentation matching routing definitions located inside `/server.ts`.
        </p>
      </div>

      {/* Docs Grid */}
      <div className="space-y-6">
        {endpoints.map((ep, idx) => {
          const curlText = `curl -X ${ep.method} \\-H "Content-Type: application/json" \\${Object.keys(ep.headers).includes('Authorization') ? '-H "Authorization: Bearer <your_jwt_token>" \\\n' : ''}${ep.body ? `-d '${ep.body}' \\\n` : ''}"http://0.0.0.0:3000${ep.path}"`;

          return (
            <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
              
              {/* Routing Tag Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider ${
                    ep.method === 'POST' ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-xs font-bold text-indigo-950">{ep.path}</span>
                </div>
                {Object.keys(ep.headers).includes('Authorization') && (
                  <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                    <Lock className="h-3 w-3" /> SECURED JWT ROUTE
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-sans">{ep.description}</p>

              {/* Collapsed blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-[11px] font-mono">
                
                {/* Inputs payload / Curl request */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Example cURL Request</span>
                    <button
                      onClick={() => copyToClipboard(curlText, idx)}
                      className="text-gray-400 hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-950 text-indigo-300 overflow-x-auto max-h-48 leading-relaxed shadow-inner">
                    {curlText}
                  </pre>
                </div>

                {/* Outputs payload response */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">JSON Response Shape</span>
                  <pre className="p-3.5 rounded-xl bg-slate-50 border border-gray-150 text-slate-700 overflow-x-auto max-h-48 leading-relaxed shadow-inner">
                    {ep.response}
                  </pre>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
