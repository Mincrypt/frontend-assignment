'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Star, Eye, Edit3, Trash2, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';

export interface ProductCardGridProps {
  products: Product[];
  onDeleteClick: (product: Product) => void;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  onDeleteClick,
}) => {
  const getStockBadge = (stock: number) => {
    if (stock <= 0) return <Badge variant="outOfStock">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="lowStock">{stock} Left</Badge>;
    return <Badge variant="inStock">{stock} In Stock</Badge>;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => {
        const imageSrc = product.thumbnail || product.images?.[0] || '/file.svg';

        return (
          <div
            key={product.id}
            className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all group"
          >
            {/* Top row: Thumbnail & Header Info */}
            <div className="flex gap-3.5 items-start">
              <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative">
                <Image
                  src={imageSrc}
                  alt={product.title}
                  width={80}
                  height={80}
                  className="object-contain w-full h-full p-1 group-hover:scale-105 transition-transform"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="category" size="sm">
                    {product.category}
                  </Badge>
                  {product.isLocalAdded && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      <Sparkles className="w-2.5 h-2.5" /> NEW
                    </span>
                  )}
                  {product.isLocalEdited && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                      EDITED
                    </span>
                  )}
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-2 mt-1 text-sm"
                >
                  {product.title}
                </Link>

                {product.brand && (
                  <p className="text-xs text-slate-400 mt-0.5">{product.brand}</p>
                )}
              </div>
            </div>

            {/* Middle Row: Price, Rating & Stock */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
              <div>
                <div className="text-base font-bold text-slate-100">
                  {formatCurrency(product.price)}
                </div>
                {product.discountPercentage && product.discountPercentage > 0 ? (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    -{Math.round(product.discountPercentage)}% off
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950 text-xs font-semibold">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{Number(product.rating || 0).toFixed(1)}</span>
                </div>
                {getStockBadge(product.stock)}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/60">
              <Link
                href={`/products/${product.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </Link>

              <Link
                href={`/products/${product.id}/edit`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>

              <button
                type="button"
                onClick={() => onDeleteClick(product)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/60 text-rose-300 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
                title="Delete product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductCardGrid;
