'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { sanitizeNumberParam, sanitizePageSize } from '@/lib/utils';

export interface UrlParamsState {
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: string;
}

export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read and sanitize query parameters with safe fallback defaults
  const params: UrlParamsState = useMemo(() => {
    const rawPage = searchParams.get('page');
    const rawLimit = searchParams.get('limit');
    const rawSearch = searchParams.get('search') || '';
    const rawCategory = searchParams.get('category') || '';
    const rawSort = searchParams.get('sort') || '';

    return {
      page: sanitizeNumberParam(rawPage, 1, 1),
      limit: sanitizePageSize(rawLimit, 10),
      search: rawSearch.trim(),
      category: rawCategory.trim(),
      sort: rawSort.trim(),
    };
  }, [searchParams]);

  // Update query params in the URL cleanly
  const updateParams = useCallback(
    (newParams: Partial<Record<keyof UrlParamsState, string | number | null | undefined>>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          current.delete(key);
        } else {
          // Normalize page 1 or default limit if desirable, or keep explicit
          if (key === 'page' && Number(value) === 1) {
            current.delete('page');
          } else {
            current.set(key, String(value));
          }
        }
      });

      const queryString = current.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const resetAllParams = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    params,
    updateParams,
    resetAllParams,
  };
}

export default useUrlParams;
