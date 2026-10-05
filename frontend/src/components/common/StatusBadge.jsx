import React from 'react';

export default function StatusBadge({ status, daysRemaining, showDays = true, size = 'md' }) {
  const normStatus = (status || '').toLowerCase().trim();

  let config = {
    label: 'No Warranty',
    bg: 'bg-[#F1F3F1] text-slate-700 border-[#D9DEDA]',
    dot: 'bg-slate-400',
  };

  if (normStatus === 'active') {
    config = {
      label: 'Active',
      bg: 'bg-[#EAF6EC] text-[#15803D] border-[#15803D]/20',
      dot: 'bg-[#15803D]',
    };
  } else if (normStatus === 'expiring soon') {
    config = {
      label: 'Expiring Soon',
      bg: 'bg-[#FFF5DA] text-[#B7791F] border-[#B7791F]/20',
      dot: 'bg-[#B7791F]',
    };
  } else if (normStatus === 'expired') {
    config = {
      label: 'Expired',
      bg: 'bg-[#FDECEC] text-[#B42318] border-[#B42318]/20',
      dot: 'bg-[#B42318]',
    };
  }

  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${config.bg} ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
      }`}
      title={daysRemaining !== undefined && daysRemaining !== null ? `${daysRemaining} days remaining` : config.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {showDays && daysRemaining !== undefined && daysRemaining !== null && (
        <span className="text-[11px] opacity-75 font-mono ml-0.5">
          ({daysRemaining >= 0 ? `${daysRemaining}d` : `${Math.abs(daysRemaining)}d ago`})
        </span>
      )}
    </span>
  );
}
