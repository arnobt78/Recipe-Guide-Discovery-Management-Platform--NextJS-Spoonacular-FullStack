/**
 * React Query Cache Persistence Utilities
 *
 * Persists React Query cache to localStorage for cross-session persistence
 * Restores cache on app initialization for instant data availability
 *
 * Following REACT_QUERY_SETUP_GUIDE.md: localStorage persistence for better caching
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Storage key for React Query cache
 */
const CACHE_STORAGE_KEY = "recipe_app_query_cache";
const CACHE_VERSION = "1.0.0";
const CACHE_VERSION_KEY = "recipe_app_cache_version";

/**
 * Cache entry interface
 */
interface PersistedCache {
  version: string;
  timestamp: number;
  cache: unknown;
}

/**
 * Save React Query cache to localStorage
 *
 * @param queryClient - React Query client instance
 */
export function persistQueryCache(queryClient: QueryClient): void {
  try {
    const cache = queryClient.getQueryCache().getAll();
    const cacheData = cache.map((query) => ({
      queryKey: query.queryKey,
      data: query.state.data,
      dataUpdatedAt: query.state.dataUpdatedAt,
      status: query.state.status,
    }));

    const persisted: PersistedCache = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      cache: cacheData,
    };

    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(persisted));
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
  } catch (error) {
    console.warn("Failed to persist query cache:", error);
  }
}

/**
 * Restore React Query cache from localStorage
 *
 * @param queryClient - React Query client instance
 */
export function restoreQueryCache(queryClient: QueryClient): void {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);

    if (!stored || storedVersion !== CACHE_VERSION) {
      // Clear old cache if version mismatch
      if (stored) {
        localStorage.removeItem(CACHE_STORAGE_KEY);
      }
      return;
    }

    const persisted: PersistedCache = JSON.parse(stored);

    // Restore each query to cache
    if (Array.isArray(persisted.cache)) {
      persisted.cache.forEach((item: { queryKey: unknown[]; data: unknown; dataUpdatedAt: number }) => {
        if (item.queryKey && item.data !== undefined) {
          queryClient.setQueryData(item.queryKey, item.data, {
            updatedAt: item.dataUpdatedAt || Date.now(),
          });
        }
      });
    }
  } catch (error) {
    console.warn("Failed to restore query cache:", error);
    // Clear corrupted cache
    localStorage.removeItem(CACHE_STORAGE_KEY);
  }
}

/**
 * Clear persisted React Query cache
 */
export function clearPersistedCache(): void {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
  } catch (error) {
    console.warn("Failed to clear persisted cache:", error);
  }
}

/**
 * Setup automatic cache persistence
 * Call this after creating QueryClient to auto-save cache on changes
 *
 * @param queryClient - React Query client instance
 */
export function setupCachePersistence(queryClient: QueryClient): () => void {
  // Restore cache on initialization
  restoreQueryCache(queryClient);

  // Subscribe to cache changes and persist
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    // Debounce persistence to avoid excessive writes
    const timeoutId = setTimeout(() => {
      persistQueryCache(queryClient);
    }, 1000);

    return () => clearTimeout(timeoutId);
  });

  // Also persist on visibility change (user switching tabs)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      persistQueryCache(queryClient);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function
  return () => {
    unsubscribe();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

