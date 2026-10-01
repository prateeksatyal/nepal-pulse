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
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white shadow-sm max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
