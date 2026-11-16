import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'emerald',
  height = 'md',
  showLabel = false,
  className
}) => {
  const safeValue = Math.min(100, Math.max(0, Math.round(value || 0)));

  const colorStyles = {
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    blue: 'bg-gradient-to-r from-sky-500 to-blue-500',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400'
  };

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{safeValue}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5', heightStyles[height])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', colorStyles[color])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};
