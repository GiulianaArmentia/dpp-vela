'use client';

import React from 'react';

interface ActionButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'textOnly' | 'textWithIcon' | 'iconOnly' | 'fill' | 'secondary';
  intent?: 'danger' | 'accent' | 'neutral';
  onClick?: () => void;
  className?: string;
}

const intentMap = {
  danger: {
    text: 'text-red-400 hover:text-red-300',
    bg: 'bg-transparent hover:bg-red-400/10',
    border: 'border-red-400/20 hover:border-red-400/40',
    fill: 'bg-red-500 border border-red-500 text-white hover:bg-red-400',
    secondary: 'bg-red-500/5 border border-red-500/20 text-red-300 hover:bg-red-500/10 hover:border-red-500/30',
  },
  accent: {
    text: 'text-text-link hover:text-primary-light',
    bg: 'bg-transparent hover:bg-text-link/10',
    border: 'border-text-link/20 hover:border-text-link/40',
    fill: 'bg-accent-violet border border-accent-violet text-bg-page hover:bg-primary-light',
    secondary: 'bg-accent-violet/10 border border-accent-violet/30 text-accent-violet hover:bg-accent-violet/20 hover:border-accent-violet/50',
  },
  neutral: {
    text: 'text-text-secondary hover:text-text-primary',
    bg: 'bg-transparent hover:bg-bg-inner',
    border: 'border-border hover:border-border-inner',
    fill: 'bg-bg-inner border border-border text-text-primary hover:bg-bg-card',
    secondary: 'bg-bg-inner/50 border border-border text-text-secondary hover:bg-bg-inner hover:text-text-primary',
  },
};

export function ActionButton({
  children,
  icon,
  variant = 'textOnly',
  intent = 'accent',
  onClick,
  className = '',
}: ActionButtonProps) {
  const styles = intentMap[intent];

  if (variant === 'fill') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${styles.fill} ${className}`}
      >
        {icon}
        {children}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${styles.secondary} ${className}`}
      >
        {icon}
        {children}
      </button>
    );
  }

  if (variant === 'iconOnly') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${styles.border} ${styles.bg} ${styles.text} transition-colors ${className}`}
      >
        {icon}
      </button>
    );
  }

  if (variant === 'textWithIcon') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${styles.text} ${className}`}
      >
        {icon}
        {children}
      </button>
    );
  }

  // textOnly
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${styles.text} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
