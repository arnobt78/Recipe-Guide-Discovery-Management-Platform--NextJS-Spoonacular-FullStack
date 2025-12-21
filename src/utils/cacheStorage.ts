/**
 * Cache Storage Utilities
 *
 * Provides localStorage and sessionStorage caching for search results
 * Works alongside React Query cache for optimal performance
 *
 * Strategy:
 * - localStorage: Persistent cache across sessions (7 days expiry)
 * - sessionStorage: Session-only cache (cleared on tab close)
 * - React Query: In-memory cache (fastest, cleared on page refresh)
 *
 * Following DEVELOPMENT_RULES.md: Centralized utilities, optimized caching
 */

import { SearchRecipesResponse } from "../types";

/**
 * Cache key prefixes
 */
const CACHE_PREFIX = "recipe_app_";
const SEARCH_CACHE_KEY = `${CACHE_PREFIX}search_`;
const CACHE_EXPIRY_DAYS = 7;

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Get cache key for a search term
 */
function getSearchCacheKey(searchTerm: string, page: number): string {
  return `${SEARCH_CACHE_KEY}${searchTerm.toLowerCase().trim()}_${page}`;
}

/**
 * Check if cache entry is expired
 */
function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() > entry.expiry;
}

/**
 * Save search results to localStorage
 *
 * @param searchTerm - Search query string
 * @param page - Page number
 * @param data - Search results data
 */
export function saveSearchToLocalStorage(
  searchTerm: string,
  page: number,
  data: SearchRecipesResponse
): void {
  try {
    const cacheKey = getSearchCacheKey(searchTerm, page);
    const entry: CacheEntry<SearchRecipesResponse> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // localStorage might be full or disabled
    console.warn("Failed to save to localStorage:", error);
  }
}

/**
 * Get search results from localStorage
 *
 * @param searchTerm - Search query string
 * @param page - Page number
 * @returns Cached data or null if not found/expired
 */
export function getSearchFromLocalStorage(
  searchTerm: string,
  page: number
): SearchRecipesResponse | null {
  try {
    const cacheKey = getSearchCacheKey(searchTerm, page);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry<SearchRecipesResponse> = JSON.parse(cached);

    if (isExpired(entry)) {
      // Remove expired entry
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("Failed to read from localStorage:", error);
    return null;
  }
}

/**
 * Save search results to sessionStorage
 *
 * @param searchTerm - Search query string
 * @param page - Page number
 * @param data - Search results data
 */
export function saveSearchToSessionStorage(
  searchTerm: string,
  page: number,
  data: SearchRecipesResponse
): void {
  try {
    const cacheKey = getSearchCacheKey(searchTerm, page);
    const entry: CacheEntry<SearchRecipesResponse> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours for session
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to save to sessionStorage:", error);
  }
}

/**
 * Get search results from sessionStorage
 *
 * @param searchTerm - Search query string
 * @param page - Page number
 * @returns Cached data or null if not found/expired
 */
export function getSearchFromSessionStorage(
  searchTerm: string,
  page: number
): SearchRecipesResponse | null {
  try {
    const cacheKey = getSearchCacheKey(searchTerm, page);
    const cached = sessionStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry<SearchRecipesResponse> = JSON.parse(cached);

    if (isExpired(entry)) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("Failed to read from sessionStorage:", error);
    return null;
  }
}

/**
 * Get cached search results (checks both localStorage and sessionStorage)
 *
 * Priority: sessionStorage > localStorage
 *
 * @param searchTerm - Search query string
 * @param page - Page number
 * @returns Cached data or null if not found
 */
export function getCachedSearchResults(
  searchTerm: string,
  page: number
): SearchRecipesResponse | null {
  // Try sessionStorage first (fresher)
  const sessionData = getSearchFromSessionStorage(searchTerm, page);
  if (sessionData) return sessionData;

  // Fallback to localStorage
  return getSearchFromLocalStorage(searchTerm, page);
}

/**
 * Save search results to both caches
 *
 * @param searchTerm - Search query string
 * @param page - Page number
 * @param data - Search results data
 */
export function saveSearchResults(
  searchTerm: string,
  page: number,
  data: SearchRecipesResponse
): void {
  saveSearchToSessionStorage(searchTerm, page, data);
  saveSearchToLocalStorage(searchTerm, page, data);
}

/**
 * Clear all search caches
 */
export function clearSearchCaches(): void {
  try {
    // Clear localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(SEARCH_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(SEARCH_CACHE_KEY)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Failed to clear caches:", error);
  }
}

/**
 * Get all cached search terms (for suggestions/history)
 *
 * @returns Array of search terms that have cached results
 */
export function getCachedSearchTerms(): string[] {
  const terms = new Set<string>();

  try {
    // Check localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(SEARCH_CACHE_KEY)) {
        const searchTerm = key
          .replace(SEARCH_CACHE_KEY, "")
          .split("_")
          .slice(0, -1)
          .join(" ");
        if (searchTerm) terms.add(searchTerm);
      }
    });

    // Check sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(SEARCH_CACHE_KEY)) {
        const searchTerm = key
          .replace(SEARCH_CACHE_KEY, "")
          .split("_")
          .slice(0, -1)
          .join(" ");
        if (searchTerm) terms.add(searchTerm);
      }
    });
  } catch (error) {
    console.warn("Failed to get cached search terms:", error);
  }

  return Array.from(terms);
}

