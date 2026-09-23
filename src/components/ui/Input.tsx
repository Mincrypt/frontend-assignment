'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      wrapperClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-300 tracking-wide select-none"
          >
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-slate-900/80 border text-slate-100 placeholder-slate-500 rounded-lg text-sm px-3.5 py-2.5 transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-950 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30 text-rose-100'
                : 'border-slate-700/80 hover:border-slate-600'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs text-rose-400 flex items-center gap-1 font-medium mt-0.5">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-slate-400 mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
