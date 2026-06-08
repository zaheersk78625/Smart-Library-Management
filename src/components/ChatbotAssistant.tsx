import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Sparkles, Send, X, Bot, User, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'bot',
      text: `Greetings! I am **Libbot**, your Smart AI Librarian assistant at Alexandria. 

You can ask me anything about:
1. Our available books and categories (e.g., *"What books do you have in productivity?"*)
2. Borrowing, returning, and tracking rules.
3. Fines structures or how to use our interactive Quick Scanner.
How can I assist you with the collection today?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsgText = inputText;
    setInputText('');

    const newUserMsg: ChatMessage = {
      id: 'um_' + Date.now(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          chatHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
        }),
      });

      const data = await response.json();
      const botResponse: ChatMessage = {
        id: 'bm_' + Date.now(),
        sender: 'bot',
        text: data.reply || "I am currently calibrating. Please retry your message.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'em_' + Date.now(),
        sender: 'bot',
        text: 'I apologize, but we experienced an offline synchronization error with our Gemini server. Please check the network context.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-300 hover:bg-indigo-700 hover:scale-105 transition duration-200 cursor-pointer"
          title="Open AI Librarian Assist"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white border-2 border-white">
            AI
          </span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-200">
          
          {/* Panel Header */}
          <div className="bg-indigo-600 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Bot className="h-4.5 w-4.5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold leading-tight">Libbot Assist</h3>
                <span className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Powered by Gemini AI
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-indigo-100 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick FAQ Helpers banner */}
          <div className="bg-indigo-50/50 p-2 border-b border-indigo-100 text-[10.5px] text-indigo-800 flex items-center gap-1.5 font-medium select-none overflow-x-auto whitespace-nowrap">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
            Quick queries:
            <button 
              onClick={() => { setInputText("What are the book borrowing limits?"); }}
              className="bg-white border border-indigo-100 rounded px-1.5 py-0.5 hover:bg-indigo-50 cursor-pointer"
            >
              "Fees & duration"
            </button>
            <button 
              onClick={() => { setInputText("Recommend category productivity books"); }}
              className="bg-white border border-indigo-100 rounded px-1.5 py-0.5 hover:bg-indigo-50 cursor-pointer"
            >
              "Recommend books"
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Icon */}
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border text-[11px] ${
                    isUser ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold' : 'bg-white border-gray-100 text-gray-700'
                  }`}>
                    {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`rounded-xl px-3 py-2 text-xs max-w-[75%] leading-relaxed ${
                    isUser 
                      ? 'bg-indigo-600 text-white font-sans font-medium rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none font-sans shadow-sm whitespace-pre-line'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-indigo-600 animate-spin" />
                </div>
                <div className="rounded-xl px-3 py-2 text-xs bg-white text-gray-400 border border-gray-100 rounded-tl-none font-mono">
                  Librarian is cataloging thoughts...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Inputs form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-1.5">
            <input
              type="text"
              placeholder="Ask Libbot about catalog titles, rules..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2.5 shadow-sm transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
