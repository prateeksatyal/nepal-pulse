import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldOff } from 'lucide-react';

export default function StatusBadge({ status, daysRemaining, showDays = true, size = 'md' }) {
  const normStatus = (status || '').toLowerCase().trim();

  let config = {
    label: 'No Warranty',
    bg: 'bg-slate-100/90 text-slate-700 border-slate-200/90',
    dot: 'bg-slate-400',
    Icon: ShieldOff,
    animateDot: false,
  };

  if (normStatus === 'active') {
    config = {
      label: 'Active',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      Icon: CheckCircle2,
      animateDot: false,
    };
  } else if (normStatus === 'expiring soon') {
    config = {
      label: 'Expiring Soon',
      bg: 'bg-amber-50 text-amber-800 border-amber-200/90',
      dot: 'bg-amber-500',
      Icon: Clock,
      animateDot: true,
    };
  } else if (normStatus === 'expired') {
    config = {
      label: 'Expired',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
      Icon: AlertTriangle,
      animateDot: false,
    };
  }

  const { Icon } = config;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border transition-all shadow-xs ${config.bg} ${
        isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
      title={daysRemaining !== undefined && daysRemaining !== null ? `${daysRemaining} days remaining` : config.label}
    >
      <span className="relative flex h-2 w-2">
        {config.animateDot && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      <span>{config.label}</span>
      {showDays && daysRemaining !== undefined && daysRemaining !== null && (
        <span className="text-[11px] opacity-75 font-mono ml-0.5">
          {daysRemaining >= 0 ? `${daysRemaining}d left` : `${Math.abs(daysRemaining)}d ago`}
        </span>
      )}
    </span>
  );
}
