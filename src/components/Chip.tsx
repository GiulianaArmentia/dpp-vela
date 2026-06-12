'use client';

import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'withIcon' | 'textOnly';
  color?: 'green' | 'amber' | 'blue' | 'violet' | 'gray' | 'red';
  icon?: React.ReactNode;
  className?: string;
}

const colorMap = {
  green: {
    bg: 'bg-accent-green/10',
    text: 'text-accent-green',
    border: 'border-accent-green/20',
  },
  amber: {
    bg: 'bg-accent-amber/10',
    text: 'text-accent-amber',
    border: 'border-accent-amber/20',
  },
  blue: {
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    border: 'border-accent-blue/20',
  },
  violet: {
    bg: 'bg-accent-violet/10',
    text: 'text-accent-violet',
    border: 'border-accent-violet/20',
  },
  gray: {
    bg: 'bg-accent-gray/10',
    text: 'text-accent-gray',
    border: 'border-accent-gray/20',
  },
  red: {
    bg: 'bg-accent-red/10',
    text: 'text-accent-red',
    border: 'border-accent-red/20',
  },
};

export function Chip({
  children,
  variant = 'textOnly',
  color = 'gray',
  icon,
  className = '',
}: ChipProps) {
  const colors = colorMap[color];
  const hasIcon = variant === 'withIcon' && icon;

  return (
    <span
      className={`inline-flex items-center ${hasIcon ? 'gap-1' : ''} px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {hasIcon && icon}
      {children}
    </span>
  );
}

interface CategoryProgressBarProps {
  percentage: number;
  className?: string;
}

export function CategoryProgressBar({ percentage, className = '' }: CategoryProgressBarProps) {
  const color = percentage >= 100 ? '#86EFAC' : percentage >= 80 ? '#34D399' : '#FCD34D';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold text-text-primary min-w-[28px] text-right">{percentage}%</span>
      <div className="flex-1 h-1.5 rounded-full bg-bg-inner overflow-hidden min-w-[48px] max-w-[80px]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
