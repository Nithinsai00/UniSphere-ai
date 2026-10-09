import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'primary' | 'accent';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  onClick,
  variant = 'default',
}) => {
  const borderVariants = {
    default: 'border-slate-200/80',
    danger: 'border-red-200 bg-red-50/20',
    warning: 'border-amber-200 bg-amber-50/20',
    primary: 'border-blue-200 bg-blue-50/20',
    accent: 'border-orange-200 bg-orange-50/20',
  };

  return (
    <div
      onClick={onClick}
      className={`uni-card p-5 transition-all duration-200 ${borderVariants[variant]} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-[#10213A] tracking-tight">{value}</div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}

      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span
            className={`font-medium ${
              trend.direction === 'up'
                ? 'text-emerald-600'
                : trend.direction === 'down'
                ? 'text-red-600'
                : 'text-slate-500'
            }`}
          >
            {trend.direction === 'up' ? '↑ ' : trend.direction === 'down' ? '↓ ' : '• '}
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
