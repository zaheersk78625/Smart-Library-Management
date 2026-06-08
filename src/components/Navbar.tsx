import React, { useState } from 'react';
import { BookOpen, User, LogOut, Bell, Shield, Database, Terminal, Cpu } from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface NavbarProps {
  user: UserType | null;
  notifications: Notification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onMarkNotificationsRead: () => void;
}

export default function Navbar({
  user,
  notifications,
  activeTab,
  setActiveTab,
  onLogout,
  onMarkNotificationsRead,
}: NavbarProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && unreadCount > 0) {
      onMarkNotificationsRead();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-sans text-lg font-bold tracking-tight text-gray-900">
              Alexandria
            </h1>
            <p className="font-sans text-[10px] font-semibold tracking-wider text-indigo-600 uppercase">
              Smart Library
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 font-sans text-sm font-medium">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`rounded-lg px-3 py-2 transition ${
                activeTab === 'catalog'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Book Catalog
            </button>
            <button
              onClick={() => setActiveTab('my-books')}
              className={`rounded-lg px-3 py-2 transition ${
                activeTab === 'my-books'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              My Borrowed
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`rounded-lg px-3 py-2 transition flex items-center gap-1.5 ${
                activeTab === 'recommendations'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Cpu className="h-4 w-4" /> Recommended
            </button>
            
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`rounded-lg px-3 py-2 transition flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Shield className="h-4 w-4" /> Admin Console
              </button>
            )}

            <button
              onClick={() => setActiveTab('api-docs')}
              className={`rounded-lg px-3 py-2 transition flex items-center gap-1.5 ${
                activeTab === 'api-docs'
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" /> REST APIs
            </button>
          </nav>
        )}

        {/* User profile & Alerts */}
        {user ? (
          <div className="flex items-center gap-4">
            
            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={handleNotifClick}
                className="relative rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50">
                    <span className="text-xs font-bold text-gray-800">Mailbox & Warnings</span>
                    <span className="text-[10px] font-semibold text-indigo-600 uppercase">Simulated Mail</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto pt-1">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-gray-400">
                        No recent email notifications
                      </p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-lg mb-1 transition text-left ${
                            n.read ? 'bg-white' : 'bg-indigo-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-bold text-gray-800">{n.title}</h4>
                            <span className="text-[9px] text-gray-400">
                              {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-900">{user.username}</span>
                <span className="text-[10px] text-gray-500 capitalize">{user.role} Account</span>
              </div>
              <div className="h-8.5 w-8.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <User className="h-4.5 w-4.5" />
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">Secured with RSA-JWT</span>
          </div>
        )}

      </div>
    </header>
  );
}
