'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      children,
      className = '',
      wrapperClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-300 tracking-wide select-none"
          >
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none bg-slate-900/80 border text-slate-100 rounded-lg text-sm pl-3.5 pr-10 py-2.5 transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-950 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-slate-700/80 hover:border-slate-600'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <span className="text-xs text-rose-400 flex items-center gap-1 font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
