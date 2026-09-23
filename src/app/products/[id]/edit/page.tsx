'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, PackageX } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import ProductForm from '@/components/products/ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { productService } from '@/services/productService';
import { useProductOverlay } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';
import { Category, Product, ProductFormValues } from '@/types/product';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { getMergedProduct, updateLocalProduct, isDeleted } = useProductOverlay();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isDeleted(Number(productId))) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [cats, fetchedProduct] = await Promise.allSettled([
          productService.getCategories(),
          productService.getProduct(productId),
        ]);

        if (cats.status === 'fulfilled' && isMounted) {
          setCategories(cats.value);
        }

        let baseProduct: Product | null = null;
        if (fetchedProduct.status === 'fulfilled') {
          baseProduct = fetchedProduct.value;
        }

        const merged = getMergedProduct(Number(productId), baseProduct);

        if (!merged) {
          if (isMounted) setNotFound(true);
        } else {
          if (isMounted) setProduct(merged);
        }
      } catch (err) {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId, isDeleted, getMergedProduct]);

  const handleSubmit = async (formValues: ProductFormValues) => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      const updates: Partial<Product> = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        price: Number(formValues.price),
        discountPercentage: formValues.discountPercentage ? Number(formValues.discountPercentage) : 0,
        stock: Number(formValues.stock),
        brand: formValues.brand.trim(),
        category: formValues.category,
        sku: formValues.sku ? formValues.sku.trim() : undefined,
        warrantyInformation: formValues.warrantyInformation ? formValues.warrantyInformation.trim() : undefined,
        shippingInformation: formValues.shippingInformation ? formValues.shippingInformation.trim() : undefined,
        thumbnail: formValues.thumbnail?.trim() || product.thumbnail,
      };

      // 1. Call DummyJSON update endpoint
      await productService.updateProduct(product.id, updates);

      // 2. Update in local context overlay
      updateLocalProduct(product.id, updates);

      success(
        'Product Updated Successfully',
        `"${updates.title}" changes have been saved.`
      );

      // 3. Navigate back to product view
      router.push(`/products/${product.id}`);
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Unable to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/products/${productId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors p-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and Return</span>
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Edit3 className="w-7 h-7 text-amber-400" />
            <span>Edit Product</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Modify product properties and save changes with instant local synchronization.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 animate-pulse">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* 404 State */}
        {!isLoading && (notFound || !product) && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Product Not Found</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-md">
              Unable to find product ID <strong className="text-slate-200">#{productId}</strong> for editing.
            </p>
            <div className="mt-6">
              <Link href="/products">
                <Button variant="primary">Return to Catalog</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Form */}
        {!isLoading && product && (
          <ProductForm
            initialData={product}
            categories={categories}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitButtonText="Save Changes"
          />
        )}
      </div>
    </AppShell>
  );
}
