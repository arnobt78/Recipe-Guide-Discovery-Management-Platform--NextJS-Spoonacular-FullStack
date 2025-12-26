/**
 * React Query Cache Persistence Utilities
 *
 * Persists React Query cache to localStorage for cross-session persistence
 * Restores cache on app initialization for instant data availability
 *
 * Following REACT_QUERY_SETUP_GUIDE.md: localStorage persistence for better caching
 * 
 * Implements cache size limits and selective persistence to avoid QuotaExceededError
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Storage key for React Query cache
 */
const CACHE_STORAGE_KEY = "recipe_app_query_cache";
const CACHE_VERSION = "1.0.0";
const CACHE_VERSION_KEY = "recipe_app_cache_version";

/**
 * Maximum cache size in bytes (5MB limit to stay well below localStorage quota)
 * Most browsers have 5-10MB localStorage limit
 */
const MAX_CACHE_SIZE = 4 * 1024 * 1024; // 4MB

/**
 * Query keys that should be prioritized for persistence (important queries)
 * These are typically user data, favourites, etc.
 */
const PRIORITY_QUERY_PREFIXES = [
  ["recipes", "favourite"],
  ["recipes", "collection"],
  ["meal-plan"],
  ["shopping-list"],
];

/**
 * Cache entry interface
 */
interface PersistedCache {
  version: string;
  timestamp: number;
  cache: unknown;
}

/**
 * Estimate the size of an object in bytes (rough estimate)
 */
function estimateSize(obj: unknown): number {
  const str = JSON.stringify(obj);
  return new Blob([str]).size;
}

/**
 * Check if a query key matches any priority prefix
 */
function isPriorityQuery(queryKey: unknown[]): boolean {
  return PRIORITY_QUERY_PREFIXES.some((prefix) => {
    if (queryKey.length < prefix.length) return false;
    return prefix.every((part, index) => queryKey[index] === part);
  });
}

/**
 * Save React Query cache to localStorage with size limits
 *
 * @param queryClient - React Query client instance
 */
export function persistQueryCache(queryClient: QueryClient): void {
  // Only access localStorage in browser environment (not during SSR)
  if (typeof window === "undefined") return;
  
  try {
    const cache = queryClient.getQueryCache().getAll();
    
    // Separate priority and regular queries
    const priorityQueries: Array<{
      queryKey: unknown[];
      data: unknown;
      dataUpdatedAt: number;
      status: string;
      size: number;
    }> = [];
    
    const regularQueries: Array<{
      queryKey: unknown[];
      data: unknown;
      dataUpdatedAt: number;
      status: string;
      size: number;
    }> = [];

    // Process all queries and calculate sizes
    cache.forEach((query) => {
      const queryData = {
        queryKey: query.queryKey,
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt,
        status: query.state.status,
      };
      
      const size = estimateSize(queryData);
      const queryEntry = { ...queryData, size };

      // Check if it's a priority query
      if (Array.isArray(query.queryKey) && isPriorityQuery(query.queryKey)) {
        priorityQueries.push(queryEntry);
      } else {
        regularQueries.push(queryEntry);
      }
    });

    // Sort regular queries by recency (most recently updated first)
    regularQueries.sort((a, b) => b.dataUpdatedAt - a.dataUpdatedAt);

    // Start with priority queries (always include these)
    let selectedQueries: typeof priorityQueries = [...priorityQueries];
    let totalSize = estimateSize(selectedQueries);

    // Add regular queries until we hit the size limit
    for (const query of regularQueries) {
      const newSize = totalSize + query.size;
      if (newSize > MAX_CACHE_SIZE) {
        break; // Stop adding if we'd exceed the limit
      }
      selectedQueries.push(query);
      totalSize = newSize;
    }

    // Remove size estimates before persisting
    const cacheData = selectedQueries.map(({ size: _, ...query }) => query);

    const persisted: PersistedCache = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      cache: cacheData,
    };

    const serialized = JSON.stringify(persisted);
    const finalSize = new Blob([serialized]).size;

    // Double-check size before storing
    if (finalSize > MAX_CACHE_SIZE) {
      console.warn(
        `Cache size (${Math.round(finalSize / 1024)}KB) exceeds limit, truncating...`
      );
      // Keep only priority queries if still too large
      const priorityOnly = priorityQueries.map(({ size: _, ...query }) => query);
      const minimalCache: PersistedCache = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        cache: priorityOnly,
      };
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(minimalCache));
    } else {
      localStorage.setItem(CACHE_STORAGE_KEY, serialized);
    }
    
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
  } catch (error) {
    // Handle QuotaExceededError specifically
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn(
        "localStorage quota exceeded. Clearing old cache and retrying with minimal data..."
      );
      try {
        // Clear old cache and try again with only priority queries
        localStorage.removeItem(CACHE_STORAGE_KEY);
        const cache = queryClient.getQueryCache().getAll();
        const priorityCache = cache
          .filter((query) =>
            Array.isArray(query.queryKey) && isPriorityQuery(query.queryKey)
          )
          .map((query) => ({
            queryKey: query.queryKey,
            data: query.state.data,
            dataUpdatedAt: query.state.dataUpdatedAt,
            status: query.state.status,
          }));

        const minimalCache: PersistedCache = {
          version: CACHE_VERSION,
          timestamp: Date.now(),
          cache: priorityCache,
        };

        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(minimalCache));
        localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      } catch (retryError) {
        console.warn("Failed to persist query cache even with minimal data:", retryError);
        // Clear cache to prevent repeated errors
        localStorage.removeItem(CACHE_STORAGE_KEY);
      }
    } else {
      console.warn("Failed to persist query cache:", error);
    }
  }
}

/**
 * Restore React Query cache from localStorage
 *
 * @param queryClient - React Query client instance
 */
export function restoreQueryCache(queryClient: QueryClient): void {
  // Only access localStorage in browser environment (not during SSR)
  if (typeof window === "undefined") return;
  
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
  // Only access localStorage in browser environment (not during SSR)
  if (typeof window === "undefined") return;
  
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
  // Only setup in browser environment (not during SSR)
  if (typeof window === "undefined") {
    return () => {}; // Return no-op cleanup function
  }
  
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

