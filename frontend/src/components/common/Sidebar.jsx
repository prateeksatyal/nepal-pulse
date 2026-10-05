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
  Database,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, mode = 'user' }) {
  const { isAdmin } = useAuth();

  const userNavSections = [
    {
      title: 'Core Management',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Products & Assets', path: '/products', icon: Package },
        { label: 'Warranties', path: '/warranties', icon: Shield },
      ],
    },
    {
      title: 'Services & Storage',
      items: [
        { label: 'Service & Repairs', path: '/services', icon: Wrench },
        { label: 'Documents Vault', path: '/documents', icon: FileText },
        { label: 'User Profile', path: '/profile', icon: User },
      ],
    },
  ];

  const adminNavSections = [
    {
      title: 'Administration',
      items: [
        { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'User Accounts', path: '/admin/users', icon: Users },
        { label: 'Categories', path: '/admin/categories', icon: Tags },
      ],
    },
    {
      title: 'Global Assets & Audits',
      items: [
        { label: 'All Products', path: '/admin/products', icon: Package },
        { label: 'All Warranties', path: '/admin/warranties', icon: Shield },
        { label: 'All Repairs', path: '/admin/services', icon: Wrench },
      ],
    },
  ];

  const sections = mode === 'admin' ? adminNavSections : userNavSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-5 px-3.5 overflow-y-auto justify-between">
          <div className="space-y-6">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </span>
                </div>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/dashboard' || item.path === '/admin'}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                          isActive
                            ? mode === 'admin'
                              ? 'bg-purple-50/90 text-purple-900 font-bold shadow-xs'
                              : 'bg-brand-50/90 text-brand-900 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded-lg transition-colors ${
                              isActive
                                ? mode === 'admin'
                                  ? 'text-purple-600 bg-purple-100/70'
                                  : 'text-brand-600 bg-brand-100/70'
                                : 'text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {isActive && (
                            <div className={`w-1.5 h-4 rounded-full ${
                              mode === 'admin' ? 'bg-purple-600' : 'bg-brand-600'
                            }`} />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* System Footer Card */}
          <div className="p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200/70 mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">WarrantyFlow System</span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-400">v1.2</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              PostgreSQL & Supabase Storage encrypted engine.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
