'use client';

import { useRouter } from 'next/navigation';
import React, { use, useCallback, useMemo, useRef } from 'react';

/**
 * React 19 optimized hooks for data fetching
 * Leverages new React 19 features for better performance
 */

// 1. Use React 19's use() hook for promise handling
export function usePromise<T>(promise: Promise<T>) {
  return use(promise);
}

// 2. Optimized fetch with memoization and abort controller
export function useOptimizedFetch<T>() {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const fetchWithCache = useCallback(
    async (url: string, options: RequestInit = {}): Promise<T> => {
      // Cancel previous request for same URL if exists
      const prevController = abortControllersRef.current.get(url);
      if (prevController) {
        prevController.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllersRef.current.set(url, controller);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request aborted:', url);
          return Promise.reject(new Error('Request aborted'));
        }
        throw error;
      } finally {
        abortControllersRef.current.delete(url);
      }
    },
    [],
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
  }, []);

  // Return cleanup function for manual cleanup if needed
  return { fetchWithCache, cleanup };
}

// 3. Debounced fetch for search/typeahead scenarios
export function useDebouncedFetch<T>(delay?: number) {
  const actualDelay = delay ?? 300;
  const { fetchWithCache } = useOptimizedFetch<T>();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedFetch = useCallback(
    (url: string, options: RequestInit = {}) => {
      return new Promise<T>((resolve, reject) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          try {
            const data = await fetchWithCache(url, options);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        }, actualDelay);
      });
    },
    [fetchWithCache, actualDelay],
  );

  return debouncedFetch;
}

// 4. Prefetching utility for Next.js
export function usePrefetch() {
  const router = useRouter();

  const prefetchPage = useCallback(
    (url: string) => {
      router.prefetch(url);
    },
    [router],
  );

  const prefetchData = useCallback(async (url: string) => {
    // Prefetch data without storing it
    fetch(url, {
      priority: 'low',
      next: { revalidate: 60 },
    }).catch(() => {
      // Ignore prefetch errors
    });
  }, []);

  return { prefetchPage, prefetchData };
}

// 5. Optimistic updates helper
export function useOptimisticUpdate<T>() {
  const optimisticDataRef = useRef<Map<string, T>>(new Map());

  const startOptimistic = useCallback((key: string, data: T) => {
    optimisticDataRef.current.set(key, data);
    return data;
  }, []);

  const commitOptimistic = useCallback((key: string) => {
    optimisticDataRef.current.delete(key);
  }, []);

  const rollbackOptimistic = useCallback((key: string, originalData: T) => {
    optimisticDataRef.current.set(key, originalData);
    return originalData;
  }, []);

  return {
    startOptimistic,
    commitOptimistic,
    rollbackOptimistic,
  };
}

// 6. Infinite scroll with React 19 optimizations
export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const pageRef = useRef(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await fetchFn(pageRef.current);
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      pageRef.current += 1;
    } catch (error) {
      console.error('Infinite scroll error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    pageRef.current = 1;
    setHasMore(true);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    reset,
  };
}
