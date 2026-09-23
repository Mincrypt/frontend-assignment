'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, ProductFormValues, Category } from '@/types/product';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Save, Sparkles, Image as ImageIcon } from 'lucide-react';

export interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Save Product',
}) => {
  const [formData, setFormData] = useState<ProductFormValues>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price !== undefined ? initialData.price : '',
    discountPercentage: initialData?.discountPercentage !== undefined ? initialData.discountPercentage : '',
    stock: initialData?.stock !== undefined ? initialData.stock : '',
    brand: initialData?.brand || '',
    category: initialData?.category || '',
    sku: initialData?.sku || '',
    thumbnail: initialData?.thumbnail || '',
    warrantyInformation: initialData?.warrantyInformation || '',
    shippingInformation: initialData?.shippingInformation || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [imagePreviewError, setImagePreviewError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price !== undefined ? initialData.price : '',
        discountPercentage: initialData.discountPercentage !== undefined ? initialData.discountPercentage : '',
        stock: initialData.stock !== undefined ? initialData.stock : '',
        brand: initialData.brand || '',
        category: initialData.category || '',
        sku: initialData.sku || '',
        thumbnail: initialData.thumbnail || '',
        warrantyInformation: initialData.warrantyInformation || '',
        shippingInformation: initialData.shippingInformation || '',
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormValues, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.price === '' || formData.price === undefined) {
      newErrors.price = 'Price is required';
    } else if (Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than $0';
    }

    if (formData.stock === '' || formData.stock === undefined) {
      newErrors.stock = 'Stock count is required';
    } else if (Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) {
      newErrors.stock = 'Stock must be a non-negative whole number';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand name is required';
    }

    if (
      formData.discountPercentage !== '' &&
      formData.discountPercentage !== undefined &&
      (Number(formData.discountPercentage) < 0 || Number(formData.discountPercentage) > 99)
    ) {
      newErrors.discountPercentage = 'Discount must be between 0% and 99%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ProductFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'thumbnail') {
      setImagePreviewError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  const getCategoryValue = (cat: Category): string => {
    if (typeof cat === 'string') return cat;
    return cat.slug || cat.name;
  };

  const getCategoryLabel = (cat: Category): string => {
    if (typeof cat === 'string') return cat.replace(/-/g, ' ');
    return cat.name || cat.slug;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
        {/* Core Product Information */}
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Core Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Title"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={errors.title}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Input
                label="Brand"
                placeholder="e.g. Sony, Apple, Nike"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                error={errors.brand}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                error={errors.category}
                required
                disabled={isLoading}
              >
                <option value="">Select a category</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={getCategoryValue(cat)} className="capitalize">
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide select-none block mb-1.5">
                Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed explanation of product features, specifications, and use cases..."
                disabled={isLoading}
                className={`w-full bg-slate-900/80 border text-slate-100 placeholder-slate-500 rounded-lg text-sm p-3.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-y ${
                  errors.description
                    ? 'border-rose-500/80 focus:border-rose-500 text-rose-100'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              />
              {errors.description && (
                <span className="text-xs text-rose-400 font-medium mt-1 block">
                  {errors.description}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
            <span>Pricing & Inventory</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
            <div>
              <Input
                label="Price ($ USD)"
                type="number"
                step="0.01"
                min="0"
                placeholder="29.99"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                error={errors.price}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Input
                label="Discount (%)"
                type="number"
                step="1"
                min="0"
                max="99"
                placeholder="10"
                value={formData.discountPercentage}
                onChange={(e) => handleChange('discountPercentage', e.target.value)}
                error={errors.discountPercentage}
                disabled={isLoading}
              />
            </div>

            <div>
              <Input
                label="Stock Quantity"
                type="number"
                step="1"
                min="0"
                placeholder="50"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                error={errors.stock}
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Media & Additional Info */}
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
            <span>Media & Shipping</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            <div className="sm:col-span-2">
              <Input
                label="Thumbnail Image URL"
                placeholder="https://example.com/product-image.jpg"
                value={formData.thumbnail}
                onChange={(e) => handleChange('thumbnail', e.target.value)}
                leftIcon={<ImageIcon className="w-4 h-4" />}
                disabled={isLoading}
                helperText="Provide an image URL or leave blank to use placeholder"
              />

              {/* Image Live Preview */}
              {formData.thumbnail && !imagePreviewError && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl w-fit">
                  <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-700/60 overflow-hidden relative">
                    <Image
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      fill
                      className="object-contain"
                      onError={() => setImagePreviewError(true)}
                      unoptimized
                    />
                  </div>
                  <span className="text-xs text-slate-400">Live image preview</span>
                </div>
              )}
            </div>

            <div>
              <Input
                label="SKU Code"
                placeholder="e.g. WH-1000XM4"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Input
                label="Warranty Information"
                placeholder="e.g. 1 Year Limited Warranty"
                value={formData.warrantyInformation}
                onChange={(e) => handleChange('warrantyInformation', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
            className="shadow-lg shadow-indigo-600/30"
          >
            {submitButtonText}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
