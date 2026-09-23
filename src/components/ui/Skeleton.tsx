'use client';

import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/80 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 7,
}) => {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-3 border-b border-slate-800/60">
          <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-16 hidden lg:block" />
          <Skeleton className="h-4 w-16 hidden sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-4"
        >
          <Skeleton className="w-full h-44 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-pulse">
      <Skeleton className="h-6 w-36 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="w-full h-80 sm:h-96 rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <Skeleton className="w-20 h-20 rounded-lg" />
            <Skeleton className="w-20 h-20 rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
