'use client';

import React from 'react';
import { PackageSearch, SearchX, RefreshCcw } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps {
  type?: 'search' | 'category' | 'products' | 'error';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'products',
  title,
  description,
  actionText,
  onAction,
  isLoading = false,
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <SearchX className="w-12 h-12 text-slate-500" />,
          title: title || 'No products match your search',
          description: description || 'Try checking for spelling errors or searching for a different keyword.',
          actionText: actionText || 'Clear Search',
        };
      case 'category':
        return {
          icon: <PackageSearch className="w-12 h-12 text-slate-500" />,
          title: title || 'No products found in this category',
          description: description || 'There are currently no products available in this selected category.',
          actionText: actionText || 'Show All Products',
        };
      case 'error':
        return {
          icon: <RefreshCcw className="w-12 h-12 text-rose-400" />,
          title: title || 'Failed to load products',
          description: description || 'There was a problem connecting to the server. Please try again.',
          actionText: actionText || 'Retry Request',
        };
      case 'products':
      default:
        return {
          icon: <PackageSearch className="w-12 h-12 text-slate-500" />,
          title: title || 'No products found',
          description: description || 'Your inventory list is currently empty. Get started by adding a product.',
          actionText: actionText || 'Add New Product',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 my-4">
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-4 inline-flex items-center justify-center">
        {content.icon}
      </div>
      <h3 className="text-lg font-bold text-slate-100 max-w-sm">{content.title}</h3>
      <p className="text-sm text-slate-400 mt-1.5 max-w-md leading-relaxed">
        {content.description}
      </p>
      {onAction && (
        <div className="mt-6">
          <Button
            variant={type === 'error' ? 'danger' : 'secondary'}
            onClick={onAction}
            isLoading={isLoading}
            size="sm"
          >
            {content.actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
