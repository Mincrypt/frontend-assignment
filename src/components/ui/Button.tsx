'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-2.5 gap-2.5 h-12',
    };

    const variantStyles = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500 shadow-sm hover:shadow shadow-indigo-600/20 border border-transparent',
      secondary:
        'bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-800 focus:ring-slate-500 border border-slate-700',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm hover:shadow shadow-rose-600/20 border border-transparent',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-sm border border-transparent',
      outline:
        'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-slate-500',
      ghost:
        'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:ring-slate-500 border border-transparent',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
