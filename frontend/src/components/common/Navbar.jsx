import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  LogOut,
  Menu,
  Shield,
  LayoutDashboard,
  ChevronDown,
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
    <header className="bg-white border-b border-[#D9DEDA] sticky top-0 z-30">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-[#F1F3F1] rounded-md transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0F6B68] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#101827] tracking-tight text-base leading-tight">
                WarrantyFlow
              </span>
              <span className="text-[11px] font-medium text-slate-500 leading-none">
                Warranty & Asset Management
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Mode Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Admin shortcut switcher if admin */}
          {isAdmin && (
            <div className="flex items-center p-0.5 bg-[#F1F3F1] rounded-md border border-[#D9DEDA] text-xs">
              <Link
                to="/admin"
                className="px-2.5 py-1 font-medium rounded text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#0F6B68]" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
              <Link
                to="/dashboard"
                className="px-2.5 py-1 font-medium rounded text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">User</span>
              </Link>
            </div>
          )}

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border border-[#D9DEDA] hover:bg-[#F1F3F1] transition-colors text-left bg-white"
            >
              <div className="w-6 h-6 rounded-md bg-[#0F6B68]/10 text-[#0F6B68] font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-semibold text-[#111827] leading-tight truncate max-w-[130px]">
                  {user?.name || 'User'}
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
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-md shadow-sm border border-[#D9DEDA] py-1.5 z-50 divide-y divide-[#D9DEDA]">
                  <div className="px-3.5 py-2">
                    <p className="text-xs font-bold text-[#111827] truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-[#F1F3F1] px-1.5 py-0.5 rounded">
                      {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-[#F1F3F1] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Account Settings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-[#F1F3F1] transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#0F6B68]" />
                        Admin Console
                      </Link>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-[#B42318] hover:bg-[#FDECEC] transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
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
