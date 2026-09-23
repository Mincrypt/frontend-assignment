'use client';

import React from 'react';
import { ProductReview } from '@/types/product';
import { Star, MessageSquare, User } from 'lucide-react';

export interface ProductReviewListProps {
  reviews?: ProductReview[];
  averageRating?: number;
}

export const ProductReviewList: React.FC<ProductReviewListProps> = ({
  reviews = [],
  averageRating = 0,
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
        <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p>No customer reviews available yet for this item.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <span>Customer Reviews ({reviews.length})</span>
        </h3>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-white">{Number(averageRating).toFixed(1)}</span>
          <span className="text-slate-400">/ 5.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-colors"
          >
            <div>
              {/* Header: Rating & Date */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(rev.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {formatDate(rev.date)}
                </span>
              </div>

              {/* Comment */}
              <p className="text-sm text-slate-300 italic leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-800/60">
              <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                {rev.reviewerName ? rev.reviewerName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-200">{rev.reviewerName || 'Verified Buyer'}</div>
                {rev.reviewerEmail && (
                  <div className="text-slate-500 text-[10px]">{rev.reviewerEmail}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviewList;
