import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center py-12 text-slate-500 gap-2.5 ${className}`}>
      <Loader2 className={`animate-spin text-[#0F6B68] ${sizeClasses[size] || sizeClasses.md}`} />
      {label && <p className="text-xs font-medium text-slate-500">{label}</p>}
    </div>
  );
}
