'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import ProductForm from '@/components/products/ProductForm';
import { productService } from '@/services/productService';
import { useProductOverlay } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';
import { Category, ProductFormValues, Product } from '@/types/product';

export default function AddProductPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { addLocalProduct } = useProductOverlay();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const catList = await productService.getCategories();
        if (isMounted) setCategories(catList);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (formValues: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Product> = {
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
        thumbnail: formValues.thumbnail?.trim() || 'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png',
        images: [
          formValues.thumbnail?.trim() || 'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png',
        ],
        rating: 5.0,
      };

      // 1. Send API request to DummyJSON endpoint
      const response = await productService.createProduct(payload);

      // 2. Assign unique ID if response does not provide one, and store in local context overlay
      const createdProduct: Product = {
        ...response,
        id: response.id || Date.now(),
        isLocalAdded: true,
      };
      addLocalProduct(createdProduct);

      success(
        'Product Created Successfully',
        `"${createdProduct.title}" has been added to your catalog.`
      );

      // 3. Redirect back to products catalog
      router.push('/products');
    } catch (err: any) {
      toastError('Failed to Create Product', err.message || 'An error occurred while saving.');
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
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors p-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <PlusCircle className="w-7 h-7 text-indigo-400" />
            <span>Add New Product</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create a new item in your inventory catalog with client-side validation.
          </p>
        </div>

        {/* Product Form */}
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitButtonText="Create Product"
        />
      </div>
    </AppShell>
  );
}
