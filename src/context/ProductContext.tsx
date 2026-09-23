'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/types/product';

interface ProductContextType {
  localAddedProducts: Product[];
  localUpdatedProducts: Record<number, Partial<Product>>;
  localDeletedIds: number[];
  addLocalProduct: (product: Product) => void;
  updateLocalProduct: (id: number, updates: Partial<Product>) => void;
  deleteLocalProduct: (id: number) => void;
  isDeleted: (id: number) => boolean;
  applyOverlayToList: (
    apiProducts: Product[],
    apiTotal: number,
    options?: { page?: number; category?: string; query?: string }
  ) => { products: Product[]; total: number };
  getMergedProduct: (id: number, fetchedProduct?: Product | null) => Product | null;
}

const LOCAL_STORAGE_KEY = 'dashboard_local_mutations_v1';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localAddedProducts, setLocalAddedProducts] = useState<Product[]>([]);
  const [localUpdatedProducts, setLocalUpdatedProducts] = useState<Record<number, Partial<Product>>>({});
  const [localDeletedIds, setLocalDeletedIds] = useState<number[]>([]);

  // Restore mutations from session/localStorage on initial client load
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.added) setLocalAddedProducts(parsed.added);
        if (parsed.updated) setLocalUpdatedProducts(parsed.updated);
        if (parsed.deleted) setLocalDeletedIds(parsed.deleted);
      }
    } catch (e) {
      console.error('Failed to load local product mutations', e);
    }
  }, []);

  // Save mutations to sessionStorage on change
  const saveMutations = useCallback(
    (added: Product[], updated: Record<number, Partial<Product>>, deleted: number[]) => {
      try {
        sessionStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ added, updated, deleted })
        );
      } catch (e) {
        console.error('Failed to persist local mutations', e);
      }
    },
    []
  );

  const addLocalProduct = useCallback(
    (product: Product) => {
      setLocalAddedProducts((prev) => {
        const updated = [{ ...product, isLocalAdded: true }, ...prev.filter((p) => p.id !== product.id)];
        saveMutations(updated, localUpdatedProducts, localDeletedIds);
        return updated;
      });
    },
    [localUpdatedProducts, localDeletedIds, saveMutations]
  );

  const updateLocalProduct = useCallback(
    (id: number, updates: Partial<Product>) => {
      // Check if it was a locally added product
      setLocalAddedProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, isLocalEdited: true } : p))
      );

      setLocalUpdatedProducts((prev) => {
        const currentUpdates = prev[id] || {};
        const nextUpdated = {
          ...prev,
          [id]: { ...currentUpdates, ...updates, isLocalEdited: true },
        };
        saveMutations(localAddedProducts, nextUpdated, localDeletedIds);
        return nextUpdated;
      });
    },
    [localAddedProducts, localDeletedIds, saveMutations]
  );

  const deleteLocalProduct = useCallback(
    (id: number) => {
      setLocalAddedProducts((prev) => {
        const nextAdded = prev.filter((p) => p.id !== id);
        return nextAdded;
      });

      setLocalDeletedIds((prev) => {
        if (prev.includes(id)) return prev;
        const nextDeleted = [...prev, id];
        saveMutations(localAddedProducts, localUpdatedProducts, nextDeleted);
        return nextDeleted;
      });
    },
    [localAddedProducts, localUpdatedProducts, saveMutations]
  );

  const isDeleted = useCallback(
    (id: number) => {
      return localDeletedIds.includes(Number(id));
    },
    [localDeletedIds]
  );

  /**
   * Applies local mutations overlay to any API product list response.
   */
  const applyOverlayToList = useCallback(
    (
      apiProducts: Product[],
      apiTotal: number,
      options: { page?: number; category?: string; query?: string } = {}
    ) => {
      const { page = 1, category, query } = options;

      // 1. Filter out deleted products from API response
      let filtered = apiProducts.filter((p) => !localDeletedIds.includes(p.id));

      // 2. Apply updates to existing products
      filtered = filtered.map((p) => {
        const updates = localUpdatedProducts[p.id];
        return updates ? { ...p, ...updates } : p;
      });

      // 3. Filter locally added products matching current view filters
      let matchingLocalAdded = [...localAddedProducts];
      if (category) {
        matchingLocalAdded = matchingLocalAdded.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase()
        );
      }
      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        matchingLocalAdded = matchingLocalAdded.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q)
        );
      }

      // If on page 1, prepend matching locally added products
      if (page === 1) {
        // Ensure no duplicates
        const existingIds = new Set(filtered.map((p) => p.id));
        const newUniqueAdded = matchingLocalAdded.filter((p) => !existingIds.has(p.id));
        filtered = [...newUniqueAdded, ...filtered];
      }

      // Calculate adjusted total
      const totalAdjustment = matchingLocalAdded.length - localDeletedIds.length;
      const finalTotal = Math.max(0, apiTotal + totalAdjustment);

      return {
        products: filtered,
        total: finalTotal,
      };
    },
    [localDeletedIds, localUpdatedProducts, localAddedProducts]
  );

  /**
   * Returns merged product combining API response with local updates.
   */
  const getMergedProduct = useCallback(
    (id: number, fetchedProduct?: Product | null): Product | null => {
      const numericId = Number(id);
      if (localDeletedIds.includes(numericId)) return null;

      // Check if it's in locally added products
      const localAdded = localAddedProducts.find((p) => p.id === numericId);
      if (localAdded) {
        return localAdded;
      }

      if (!fetchedProduct) return null;

      const updates = localUpdatedProducts[numericId];
      if (updates) {
        return { ...fetchedProduct, ...updates };
      }

      return fetchedProduct;
    },
    [localDeletedIds, localAddedProducts, localUpdatedProducts]
  );

  return (
    <ProductContext.Provider
      value={{
        localAddedProducts,
        localUpdatedProducts,
        localDeletedIds,
        addLocalProduct,
        updateLocalProduct,
        deleteLocalProduct,
        isDeleted,
        applyOverlayToList,
        getMergedProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductOverlay = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductOverlay must be used within a ProductProvider');
  }
  return context;
};
