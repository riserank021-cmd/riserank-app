/**
 * usePagination<T> — generic FlatList pagination state machine.
 *
 * Handles: first load, pull-to-refresh, infinite scroll, page tracking.
 *
 * Usage:
 *   const { items, isLoading, refreshing, loadingMore, hasMore,
 *           onRefresh, onEndReached, FlatListProps } = usePagination(fetcher);
 *
 *   The `fetcher` receives (page, limit) and must return { data: T[], hasNextPage: boolean }.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface PaginationFetchResult<T> {
  data: T[];
  hasNextPage: boolean;
}

type Fetcher<T> = (page: number, limit: number) => Promise<PaginationFetchResult<T>>;

interface UsePaginationOptions {
  limit?: number;
  /** Set to false to skip the automatic initial fetch. Default: true. */
  autoFetch?: boolean;
}

interface UsePaginationReturn<T> {
  items: T[];
  isLoading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onRefresh: () => void;
  onEndReached: () => void;
  /** Optimistically remove an item from the local list without refetching. */
  removeItem: (predicate: (item: T) => boolean) => void;
  /** Convenience spreads for FlatList */
  flatListProps: {
    refreshing: boolean;
    onRefresh: () => void;
    onEndReached: () => void;
    onEndReachedThreshold: number;
  };
}

export function usePagination<T>(
  fetcher: Fetcher<T>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { limit = 20, autoFetch = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent double-calls from React StrictMode / concurrent renders
  const isFetchingRef = useRef(false);

  const fetch = useCallback(
    async (pg: number, mode: 'initial' | 'refresh' | 'more') => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (mode === 'initial') setIsLoading(true);
      else if (mode === 'refresh') setRefreshing(true);
      else setLoadingMore(true);

      setError(null);

      try {
        const result = await fetcher(pg, limit);
        setItems((prev) => (pg === 1 ? result.data : [...prev, ...result.data]));
        setHasMore(result.hasNextPage);
        setPage(pg);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Something went wrong');
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [fetcher, limit]
  );

  // Initial load
  useEffect(() => {
    if (autoFetch) fetch(1, 'initial');
  }, [fetch, autoFetch]);

  const onRefresh = useCallback(() => {
    fetch(1, 'refresh');
  }, [fetch]);

  const onEndReached = useCallback(() => {
    if (!hasMore || loadingMore || isLoading) return;
    fetch(page + 1, 'more');
  }, [fetch, hasMore, loadingMore, isLoading, page]);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setItems((prev) => prev.filter((item) => !predicate(item)));
  }, []);

  return {
    items,
    isLoading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    onRefresh,
    onEndReached,
    removeItem,
    flatListProps: {
      refreshing,
      onRefresh,
      onEndReached,
      onEndReachedThreshold: 0.3,
    },
  };
}
