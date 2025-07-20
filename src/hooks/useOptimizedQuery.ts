import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedQueryOptions<T> {
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
}

interface UseOptimizedQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

export function useOptimizedQuery<T>({
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  retry = 3,
  retryDelay = 1000,
}: UseOptimizedQueryOptions<T>): UseOptimizedQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const lastFetchTime = useRef<number>(0);
  const retryCount = useRef<number>(0);
  const abortController = useRef<AbortController | null>(null);

  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request if still pending
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      
      if (!abortController.current.signal.aborted) {
        setData(result);
        lastFetchTime.current = Date.now();
        setIsStale(false);
        retryCount.current = 0;
      }
    } catch (err) {
      if (!abortController.current.signal.aborted) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        
        if (retryCount.current < retry) {
          retryCount.current++;
          setTimeout(() => {
            executeQuery();
          }, retryDelay);
          return;
        }
        
        setError(error);
      }
    } finally {
      if (!abortController.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [queryFn, enabled, retry, retryDelay]);

  const refetch = useCallback(async () => {
    await executeQuery();
  }, [executeQuery]);

  // Check if data is stale
  useEffect(() => {
    if (data && lastFetchTime.current > 0) {
      const timeSinceLastFetch = Date.now() - lastFetchTime.current;
      setIsStale(timeSinceLastFetch > staleTime);
    }
  }, [data, staleTime]);

  // Initial fetch
  useEffect(() => {
    if (enabled && (!data || isStale)) {
      executeQuery();
    }
  }, [enabled, executeQuery, data, isStale]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
  };
} 