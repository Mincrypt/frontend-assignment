'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Star, Eye, Edit3, Trash2, ArrowUp, ArrowDown, Package, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';

export interface ProductTableProps {
  products: Product[];
  currentSort: string;
  onSortToggle: (field: string) => void;
  onDeleteClick: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  currentSort,
  onSortToggle,
  onDeleteClick,
}) => {
  const getSortIcon = (field: string) => {
    if (currentSort === `${field}-asc`) {
      return <ArrowUp className="w-3.5 h-3.5 text-indigo-400 inline ml-1" />;
    }
    if (currentSort === `${field}-desc`) {
      return <ArrowDown className="w-3.5 h-3.5 text-indigo-400 inline ml-1" />;
    }
    return null;
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) return <Badge variant="outOfStock">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="lowStock">{stock} Left (Low)</Badge>;
    return <Badge variant="inStock">{stock} In Stock</Badge>;
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <th className="py-3.5 px-4 w-16 text-center">Image</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSortToggle('title')}
              >
                <div className="flex items-center gap-1">
                  <span>Product Title</span>
                  {getSortIcon('title')}
                </div>
              </th>
              <th className="py-3.5 px-4">Category</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSortToggle('price')}
              >
                <div className="flex items-center gap-1">
                  <span>Price</span>
                  {getSortIcon('price')}
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSortToggle('rating')}
              >
                <div className="flex items-center gap-1">
                  <span>Rating</span>
                  {getSortIcon('rating')}
                </div>
              </th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.map((product) => {
              const imageSrc = product.thumbnail || product.images?.[0] || '/file.svg';

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Thumbnail */}
                  <td className="py-3 px-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden mx-auto relative shrink-0">
                      <Image
                        src={imageSrc}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="object-contain w-full h-full p-1 group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                  </td>

                  {/* Title & Brand */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1"
                        title={product.title}
                      >
                        {product.title}
                      </Link>
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
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      {product.brand && <span>{product.brand}</span>}
                      {product.sku && (
                        <span className="font-mono text-[11px] text-slate-500">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <Badge variant="category">{product.category}</Badge>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">
                      {formatCurrency(product.price)}
                    </div>
                    {product.discountPercentage && product.discountPercentage > 0 ? (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        -{Math.round(product.discountPercentage)}% off
                      </span>
                    ) : null}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-slate-200">
                        {Number(product.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4">
                    {getStockBadge(product.stock)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
