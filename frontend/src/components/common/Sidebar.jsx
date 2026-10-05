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
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, mode = 'user' }) {
  const { user, isAdmin } = useAuth();

  const userNavSections = [
    {
      title: 'Management',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Products', path: '/products', icon: Package },
        { label: 'Warranties', path: '/warranties', icon: Shield },
      ],
    },
    {
      title: 'Records & Vault',
      items: [
        { label: 'Service & Repairs', path: '/services', icon: Wrench },
        { label: 'Documents & Receipts', path: '/documents', icon: FileText },
        { label: 'Account Profile', path: '/profile', icon: User },
      ],
    },
  ];

  const adminNavSections = [
    {
      title: 'Administration',
      items: [
        { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Categories', path: '/admin/categories', icon: Tags },
      ],
    },
    {
      title: 'System Records',
      items: [
        { label: 'All Products', path: '/admin/products', icon: Package },
        { label: 'All Warranties', path: '/admin/warranties', icon: Shield },
        { label: 'All Service Records', path: '/admin/services', icon: Wrench },
      ],
    },
  ];

  const sections = mode === 'admin' ? adminNavSections : userNavSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container: Deep Ink #101827 */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#101827] text-slate-300 border-r border-[#172235] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-4 px-3 overflow-y-auto justify-between">
          <div className="space-y-6">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 pb-1.5 pt-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                        `group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#172235] text-white font-semibold border-l-2 border-[#0F6B68]'
                            : 'text-slate-300 hover:text-white hover:bg-[#172235]/70'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              isActive ? 'text-[#0F6B68]' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* User & Role Status Bar */}
          <div className="pt-3 border-t border-[#172235]">
            <div className="p-3 bg-[#172235] rounded-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0F6B68] text-white flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
