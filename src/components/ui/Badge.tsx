'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'category' | 'inStock' | 'lowStock' | 'outOfStock' | 'info' | 'warning' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-xs px-3 py-1 font-semibold',
  };

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    category: 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/50 capitalize',
    inStock: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50',
    lowStock: 'bg-amber-950/70 text-amber-300 border border-amber-700/50',
    outOfStock: 'bg-rose-950/70 text-rose-300 border border-rose-700/50',
    info: 'bg-sky-950/70 text-sky-300 border border-sky-700/50',
    warning: 'bg-amber-950/70 text-amber-300 border border-amber-700/50',
    purple: 'bg-purple-950/70 text-purple-300 border border-purple-700/50',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {variant === 'inStock' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
      {variant === 'lowStock' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
      {variant === 'outOfStock' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
      {children}
    </span>
  );
};

export default Badge;
