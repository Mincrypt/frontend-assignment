'use client';

import React from 'react';
import { Search, X, Filter, ArrowUpDown, RotateCcw, AlertCircle } from 'lucide-react';
import { Category, CategoryItem } from '@/types/product';
import Button from '../ui/Button';

export interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedSort,
  onSortChange,
  onReset,
  isLoading = false,
}) => {
  const hasActiveFilters = Boolean(searchTerm || selectedCategory || selectedSort);

  // Normalize category name & value
  const getCategoryValue = (cat: Category): string => {
    if (typeof cat === 'string') return cat;
    return cat.slug || cat.name;
  };

  const getCategoryLabel = (cat: Category): string => {
    if (typeof cat === 'string') return cat.replace(/-/g, ' ');
    return cat.name || cat.slug;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-5 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products by title, brand, or description..."
              disabled={isLoading}
              className="w-full bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="lg:col-span-3 relative">
          <div className="relative flex items-center">
            <Filter className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                onCategoryChange(e.target.value);
              }}
              disabled={isLoading}
              className="w-full bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-100 text-sm rounded-xl pl-10 pr-8 py-2.5 outline-none transition-all appearance-none cursor-pointer capitalize disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => {
                const val = getCategoryValue(cat);
                const label = getCategoryLabel(cat);
                return (
                  <option key={`${val}-${idx}`} value={val} className="bg-slate-900 text-slate-100 capitalize">
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Sort Selector */}
        <div className="lg:col-span-3 relative">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-100 text-sm rounded-xl pl-10 pr-8 py-2.5 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Default Order</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating-desc">Rating: High → Low</option>
              <option value="rating-asc">Rating: Low → High</option>
              <option value="title-asc">Title: A → Z</option>
              <option value="title-desc">Title: Z → A</option>
            </select>
          </div>
        </div>

        {/* Reset Action */}
        <div className="lg:col-span-1 flex justify-end">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Reset all search, category, and sort filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="lg:hidden">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* API Notice when both search and category are active */}
      {searchTerm && selectedCategory && (
        <div className="flex items-center gap-2 p-2.5 px-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>
            Filtering by category <strong className="capitalize text-white">{selectedCategory}</strong> with client-side query matching for &quot;{searchTerm}&quot; (DummyJSON limitation handled).
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
