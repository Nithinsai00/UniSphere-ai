import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'risk' | 'status' | 'priority' | 'role' | 'score';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'risk',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  const cleanLabel = (label || '').toLowerCase();

  if (cleanLabel.includes('high') || cleanLabel.includes('critical') || cleanLabel.includes('urgent')) {
    colorClasses = 'bg-red-50 text-red-700 border-red-200';
  } else if (cleanLabel.includes('mod') || cleanLabel.includes('medium') || cleanLabel.includes('progress') || cleanLabel.includes('warning')) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (cleanLabel.includes('low') || cleanLabel.includes('completed') || cleanLabel.includes('active') || cleanLabel.includes('improved')) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (cleanLabel.includes('insufficient') || cleanLabel.includes('unassessed') || cleanLabel.includes('provisional')) {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (cleanLabel.includes('admin')) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (cleanLabel.includes('faculty')) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (cleanLabel.includes('student')) {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ${sizeClasses} ${colorClasses}`}
    >
      {label}
    </span>
  );
};
