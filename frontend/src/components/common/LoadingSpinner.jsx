import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading data...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center py-16 text-slate-500 gap-3 ${className}`}>
      <div className="relative">
        <Loader2 className={`animate-spin text-brand-600 ${sizeClasses[size] || sizeClasses.md}`} />
      </div>
      {label && <p className="text-xs font-semibold text-slate-500 tracking-wide">{label}</p>}
    </div>
  );
}
