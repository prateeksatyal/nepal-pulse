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
    <div className={`w-full text-center py-12 px-6 rounded-lg border border-[#D9DEDA] bg-white ${className}`}>
      <div className="w-12 h-12 rounded-lg bg-[#F1F3F1] border border-[#D9DEDA] text-slate-500 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-slate-600 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold text-[#101827] tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
      {actionButton && <div className="flex justify-center">{actionButton}</div>}
    </div>
  );
}
