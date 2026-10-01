import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldOff } from 'lucide-react';

export default function StatusBadge({ status, daysRemaining, showDays = true, size = 'md' }) {
  const normStatus = (status || '').toLowerCase().trim();

  let config = {
    label: 'No Warranty',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    Icon: ShieldOff,
  };

  if (normStatus === 'active') {
    config = {
      label: 'Active',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      Icon: CheckCircle2,
    };
  } else if (normStatus === 'expiring soon') {
    config = {
      label: 'Expiring Soon',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      Icon: Clock,
    };
  } else if (normStatus === 'expired') {
    config = {
      label: 'Expired',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      Icon: AlertTriangle,
    };
  }

  const { Icon } = config;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      title={daysRemaining !== undefined && daysRemaining !== null ? `${daysRemaining} days remaining` : config.label}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {showDays && daysRemaining !== undefined && daysRemaining !== null && (
        <span className="opacity-75 font-normal">
          ({daysRemaining >= 0 ? `${daysRemaining}d` : `${Math.abs(daysRemaining)}d ago`})
        </span>
      )}
    </span>
  );
}
