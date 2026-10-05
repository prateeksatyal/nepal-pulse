import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  icon: Icon = PackageOpen,
  actionButton = null,
  className = '',
}) {
  return (
    <div className={`w-full text-center py-14 px-6 rounded-2xl border border-dashed border-slate-200/90 bg-white shadow-xs ${className}`}>
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center mx-auto mb-4 shadow-xs">
        <Icon className="w-8 h-8 text-slate-600 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">{description}</p>
      {actionButton && <div className="flex justify-center">{actionButton}</div>}
    </div>
  );
}
