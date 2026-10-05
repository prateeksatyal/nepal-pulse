import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  LogOut,
  Menu,
  ShieldAlert,
  LayoutDashboard,
  ChevronDown,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between h-16">
        {/* Left side: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 text-white flex items-center justify-center shadow-sm shadow-brand-500/20 group-hover:scale-[1.02] transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
                WarrantyFlow
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-widest hidden sm:inline-block">
                  Pro
                </span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-normal">
                Enterprise Asset & Warranty System
              </span>
            </div>
          </Link>
        </div>

        {/* Right side: Admin switcher, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin shortcut badge if user is an admin */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs">
              <Link
                to="/admin"
                className="px-3 py-1.5 font-semibold rounded-lg text-purple-700 hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Admin Console</span>
              </Link>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 font-semibold rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">User View</span>
              </Link>
            </div>
          )}

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all text-left bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-slate-500 capitalize leading-none mt-0.5">
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-elevated border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
                  <div className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      user?.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-500" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
