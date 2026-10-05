import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Shield,
  Wrench,
  FileText,
  User,
  Users,
  Tags,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, mode = 'user' }) {
  const { isAdmin } = useAuth();

  const userNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Warranties', path: '/warranties', icon: Shield },
    { label: 'Service Records', path: '/services', icon: Wrench },
    { label: 'Documents & Receipts', path: '/documents', icon: FileText },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'User Accounts', path: '/admin/users', icon: Users },
    { label: 'Categories (CRUD)', path: '/admin/categories', icon: Tags },
    { label: 'All Products', path: '/admin/products', icon: Package },
    { label: 'All Warranties', path: '/admin/warranties', icon: Shield },
    { label: 'All Service Records', path: '/admin/services', icon: Wrench },
  ];

  const navItems = mode === 'admin' ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-4 px-3 overflow-y-auto justify-between">
          <div className="space-y-1">
            <div className="px-3 pb-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {mode === 'admin' ? 'Administrator Controls' : 'User Workspace'}
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/admin'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? mode === 'admin'
                          ? 'bg-purple-50 text-purple-800 font-semibold'
                          : 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? mode === 'admin'
                                ? 'text-purple-600'
                                : 'text-brand-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight
                          className={`w-4 h-4 ${
                            mode === 'admin' ? 'text-purple-400' : 'text-brand-400'
                          }`}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Application Status Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-700">WarrantyFlow</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Asset tracking, warranty lifecycle, and service records.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
