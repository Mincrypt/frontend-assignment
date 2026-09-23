'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Edit3,
  Trash2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Box,
  Layers,
  Sparkles,
  PackageX,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import ProductReviewList from '@/components/products/ProductReviewList';
import DeleteModal from '@/components/products/DeleteModal';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { productService } from '@/services/productService';
import { useProductOverlay } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/types/product';
import { calculateOriginalPrice, formatCurrency } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { getMergedProduct, isDeleted, deleteLocalProduct } = useProductOverlay();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      // 1. Check if product was deleted locally
      if (isDeleted(Number(productId))) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      try {
        let fetched: Product | null = null;
        try {
          fetched = await productService.getProduct(productId);
        } catch (err: any) {
          // If API fails (e.g. 404 or invalid ID), check if it exists in locally added items
          fetched = null;
        }

        const merged = getMergedProduct(Number(productId), fetched);

        if (!merged) {
          if (isMounted) setNotFound(true);
        } else {
          if (isMounted) {
            setProduct(merged);
            const initialImg = merged.thumbnail || merged.images?.[0] || '/file.svg';
            setSelectedImage(initialImg);
          }
        }
      } catch (err) {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, isDeleted, getMergedProduct]);

  const handleDeleteConfirm = async () => {
    if (!product) return;

    setIsDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      deleteLocalProduct(product.id);
      success('Product Deleted', `"${product.title}" has been deleted.`);
      router.push('/products');
    } catch (err: any) {
      toastError('Delete Failed', err.message || 'Unable to delete product.');
      setIsDeleting(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) return <Badge variant="outOfStock" size="md">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="lowStock" size="md">{stock} Units Left (Low Stock)</Badge>;
    return <Badge variant="inStock" size="md">{stock} Units in Stock</Badge>;
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors p-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>

          {product && !isLoading && !notFound && (
            <div className="flex items-center gap-2">
              <Link href={`/products/${product.id}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-amber-300" />}
                >
                  Edit Product
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && <ProductDetailSkeleton />}

        {/* 404 Product Not Found State */}
        {!isLoading && (notFound || !product) && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Product Not Found</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-md">
              We couldn&apos;t find a product with ID <strong className="text-slate-200">#{productId}</strong>. It might have been deleted or the URL is invalid.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/products">
                <Button variant="primary">Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Product Details Content */}
        {!isLoading && product && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Image Gallery Column */}
              <div className="lg:col-span-6 space-y-4">
                {/* Main Selected Image */}
                <div className="relative w-full aspect-square max-h-[440px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-2xl">
                  <Image
                    src={selectedImage || '/file.svg'}
                    alt={product.title}
                    fill
                    className="object-contain p-4"
                    priority
                    unoptimized
                  />
                  {product.isLocalAdded && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-lg">
                        <Sparkles className="w-3.5 h-3.5" /> Newly Added
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-20 h-20 rounded-xl bg-slate-900 border overflow-hidden p-1 shrink-0 transition-all cursor-pointer ${
                          selectedImage === img
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                            : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} view ${idx + 1}`}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Column */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="category" size="md">
                      {product.category}
                    </Badge>
                    {product.brand && (
                      <span className="text-xs font-medium text-slate-400">
                        Brand: <strong className="text-slate-200">{product.brand}</strong>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {product.title}
                  </h1>

                  {/* Rating & Stock row */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-300">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{Number(product.rating || 0).toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">
                        ({product.reviews?.length || 0} reviews)
                      </span>
                    </div>

                    {getStockBadge(product.stock)}

                    {product.sku && (
                      <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Current Price
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-white">
                        {formatCurrency(product.price)}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 ? (
                        <span className="text-sm line-through text-slate-400">
                          {formatCurrency(
                            calculateOriginalPrice(product.price, product.discountPercentage)
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold">
                      Save {Math.round(product.discountPercentage)}%
                    </div>
                  ) : null}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <Truck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Shipping</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {product.shippingInformation || 'Standard 3-5 days delivery'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Warranty</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {product.warrantyInformation || '1 year official warranty'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Return Policy</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {product.returnPolicy || '30 days return window'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <Box className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Dimensions & Weight</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {product.dimensions
                          ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`
                          : 'Standard package'}{' '}
                        {product.weight ? `(${product.weight} kg)` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="pt-8 border-t border-slate-800">
              <ProductReviewList
                reviews={product.reviews}
                averageRating={product.rating}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={product}
        isLoading={isDeleting}
      />
    </AppShell>
  );
}
