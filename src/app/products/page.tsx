'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import ProductTable from '@/components/products/ProductTable';
import ProductCardGrid from '@/components/products/ProductCardGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/products/Pagination';
import DeleteModal from '@/components/products/DeleteModal';
import { TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/context/ToastContext';
import { useProductOverlay } from '@/context/ProductContext';
import { productService } from '@/services/productService';
import { Category, Product } from '@/types/product';

function ProductsDashboardContent() {
  const { params, updateParams, resetAllParams } = useUrlParams();
  const { success, error: toastError } = useToast();
  const { applyOverlayToList, deleteLocalProduct } = useProductOverlay();

  // Search input local state for smooth typing before debounce
  const [searchInput, setSearchInput] = useState(params.search);
  const debouncedSearch = useDebounce(searchInput, 350);

  // Product data state
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Keep a reference to the active AbortController to cancel stale search/query requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep input synchronized if URL search param changes externally (e.g. back/forward nav)
  useEffect(() => {
    setSearchInput(params.search);
  }, [params.search]);

  // When debounced search value changes, update URL state & reset to page 1
  useEffect(() => {
    if (debouncedSearch !== params.search) {
      updateParams({
        search: debouncedSearch || null,
        page: 1, // Automatically return to page 1 on search change
      });
    }
  }, [debouncedSearch, params.search, updateParams]);

  // Load Categories once on mount
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

  // Main Data Fetching with AbortController for Stale Request Cancellation
  const fetchProducts = useCallback(async () => {
    // 1. Cancel any in-flight request to ensure older responses never overwrite newer ones
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setFetchError(null);

    const skip = (params.page - 1) * params.limit;

    // Parse sort field and order
    let sortBy: string | undefined;
    let order: 'asc' | 'desc' | undefined;
    if (params.sort) {
      const parts = params.sort.split('-');
      if (parts.length === 2) {
        sortBy = parts[0];
        order = parts[1] as 'asc' | 'desc';
      }
    }

    try {
      let result;

      // Handle category vs search API routing
      if (params.category) {
        result = await productService.getProductsByCategory(
          params.category,
          {
            limit: params.limit,
            skip,
            sortBy,
            order,
          },
          controller.signal
        );

        // Client-side search filtering if both category and search query are present
        if (params.search) {
          const q = params.search.toLowerCase();
          result.products = result.products.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q) ||
              p.brand?.toLowerCase().includes(q)
          );
          result.total = result.products.length;
        }
      } else if (params.search) {
        result = await productService.searchProducts(
          params.search,
          {
            limit: params.limit,
            skip,
            sortBy,
            order,
          },
          controller.signal
        );
      } else {
        result = await productService.getProducts(
          {
            limit: params.limit,
            skip,
            sortBy,
            order,
          },
          controller.signal
        );
      }

      // 2. Apply local mutations overlay (persisting additions/edits/deletions in current session)
      const overlayed = applyOverlayToList(result.products, result.total, {
        page: params.page,
        category: params.category,
        query: params.search,
      });

      // 3. Fallback client-side sort if needed for custom local additions
      if (sortBy && order) {
        const factor = order === 'asc' ? 1 : -1;
        overlayed.products.sort((a: any, b: any) => {
          const valA = a[sortBy!];
          const valB = b[sortBy!];
          if (typeof valA === 'string') {
            return factor * valA.localeCompare(valB || '');
          }
          return factor * ((valA || 0) - (valB || 0));
        });
      }

      setProducts(overlayed.products);
      setTotalCount(overlayed.total);
    } catch (err: any) {
      // Don't treat deliberate cancellation as an error
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
        return;
      }
      console.error('Error loading products', err);
      setFetchError(err.message || 'Failed to fetch products. Please check your connection.');
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [params.page, params.limit, params.category, params.search, params.sort, applyOverlayToList]);

  // Trigger fetch on parameter changes
  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Handlers for Filters
  const handleCategoryChange = (cat: string) => {
    updateParams({
      category: cat || null,
      page: 1, // reset page on category change
    });
  };

  const handleSortChange = (sort: string) => {
    updateParams({
      sort: sort || null,
      page: 1,
    });
  };

  const handleSortToggle = (field: string) => {
    let nextSort = `${field}-asc`;
    if (params.sort === `${field}-asc`) {
      nextSort = `${field}-desc`;
    } else if (params.sort === `${field}-desc`) {
      nextSort = '';
    }
    handleSortChange(nextSort);
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateParams({ limit: newSize, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    resetAllParams();
  };

  // Delete Action Handlers
  const handleDeleteTrigger = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      // Call DummyJSON delete endpoint
      await productService.deleteProduct(productToDelete.id);

      // Immediately update local overlay and UI
      deleteLocalProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setTotalCount((prev) => Math.max(0, prev - 1));

      success('Product Deleted', `"${productToDelete.title}" was removed successfully.`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      toastError('Delete Failed', err.message || 'Unable to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Product Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, search, and monitor your catalog with live pagination and filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProducts()}
            isLoading={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh product list"
          >
            Refresh
          </Button>

          <Link href="/products/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-md shadow-indigo-600/30"
            >
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-lg shadow-black/20">
        <ProductFilters
          searchTerm={searchInput}
          onSearchChange={setSearchInput}
          selectedCategory={params.category}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          selectedSort={params.sort}
          onSortChange={handleSortChange}
          onReset={handleResetFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Error State */}
      {fetchError && !isLoading && (
        <EmptyState
          type="error"
          title="Failed to Load Products"
          description={fetchError}
          actionText="Retry Request"
          onAction={fetchProducts}
        />
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div>
          <div className="hidden md:block">
            <TableSkeleton rows={params.limit} />
          </div>
          <div className="md:hidden">
            <CardSkeleton count={Math.min(params.limit, 6)} />
          </div>
        </div>
      )}

      {/* Empty States */}
      {!isLoading && !fetchError && products.length === 0 && (
        <div>
          {params.search ? (
            <EmptyState
              type="search"
              title={`No products match "${params.search}"`}
              description="Try checking for typos or clear your search to browse all items."
              actionText="Clear Search"
              onAction={() => setSearchInput('')}
            />
          ) : params.category ? (
            <EmptyState
              type="category"
              title={`No products found in "${params.category}"`}
              description="There are currently no items in this category."
              actionText="View All Categories"
              onAction={() => handleCategoryChange('')}
            />
          ) : (
            <EmptyState
              type="products"
              title="Catalog is empty"
              description="No products were found. Start by creating a new product."
              actionText="Add First Product"
              onAction={() => {
                window.location.href = '/products/new';
              }}
            />
          )}
        </div>
      )}

      {/* Product Views: Desktop Table & Mobile Cards */}
      {!isLoading && !fetchError && products.length > 0 && (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ProductTable
              products={products}
              currentSort={params.sort}
              onSortToggle={handleSortToggle}
              onDeleteClick={handleDeleteTrigger}
            />
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden">
            <ProductCardGrid
              products={products}
              onDeleteClick={handleDeleteTrigger}
            />
          </div>

          {/* Manual Pagination */}
          <Pagination
            currentPage={params.page}
            pageSize={params.limit}
            totalItems={totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function ProductsDashboardPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-48 bg-slate-800 animate-pulse rounded-lg" />
            <TableSkeleton rows={10} />
          </div>
        }
      >
        <ProductsDashboardContent />
      </Suspense>
    </AppShell>
  );
}
