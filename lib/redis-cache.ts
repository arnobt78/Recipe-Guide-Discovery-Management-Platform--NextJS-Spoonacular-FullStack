/**
 * Redis Cache Integration for API Routes
 *
 * Provides server-side caching layer for API responses
 * Works alongside React Query client-side caching
 * Following DEVELOPMENT_RULES.md: Centralized utilities, reusable functions
 */

import { getCache, setCache, deleteCache, cacheKeys } from "./redis";

// Re-export cacheKeys for use in API routes
export { cacheKeys };

/**
 * Cache configuration
 */
const _DEFAULT_TTL = 60 * 60; // 1 hour in seconds (unused - reserved for future use)
const RECIPE_TTL = 24 * 60 * 60; // 24 hours for recipe data (rarely changes)
const SEARCH_TTL = 30 * 60; // 30 minutes for search results (more dynamic)

/**
 * Get cached API response
 *
 * @param key - Cache key
 * @returns Cached data or null
 */
export async function getCachedResponse<T>(key: string): Promise<T | null> {
  try {
    return await getCache<T>(key);
  } catch (error) {
    console.error("Redis cache get error:", error);
    return null;
  }
}

/**
 * Set cached API response
 *
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlSeconds - Time to live in seconds (optional, uses defaults)
 */
export async function setCachedResponse<T>(
  key: string,
  data: T,
  ttlSeconds?: number
): Promise<void> {
  try {
    await setCache(key, data, ttlSeconds);
  } catch (error) {
    console.error("Redis cache set error:", error);
    // Don't throw - caching is optional, shouldn't break API
  }
}

/**
 * Cache recipe data with appropriate TTL
 */
export async function cacheRecipe<T>(
  recipeId: string | number,
  data: T
): Promise<void> {
  await setCachedResponse(cacheKeys.recipe(recipeId), data, RECIPE_TTL);
}

/**
 * Get cached recipe data
 */
export async function getCachedRecipe<T>(
  recipeId: string | number
): Promise<T | null> {
  return getCachedResponse<T>(cacheKeys.recipe(recipeId));
}

/**
 * Cache search results with shorter TTL
 */
export async function cacheSearchResults<T>(
  searchTerm: string,
  page: number,
  data: T
): Promise<void> {
  await setCachedResponse(
    cacheKeys.recipeSearch(searchTerm, page),
    data,
    SEARCH_TTL
  );
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults<T>(
  searchTerm: string,
  page: number
): Promise<T | null> {
  return getCachedResponse<T>(cacheKeys.recipeSearch(searchTerm, page));
}

/**
 * Invalidate recipe cache
 */
export async function invalidateRecipeCache(
  recipeId: string | number
): Promise<void> {
  try {
    await deleteCache(cacheKeys.recipe(recipeId));
    await deleteCache(cacheKeys.recipeSimilar(recipeId));
    await deleteCache(cacheKeys.recipeSummary(recipeId));
  } catch (error) {
    console.error("Redis cache invalidation error:", error);
  }
}

/**
 * Invalidate search cache for a term
 */
export async function invalidateSearchCache(searchTerm: string): Promise<void> {
  try {
    // Delete all pages for this search term
    // Note: This is a simple implementation - in production, you might want to track page numbers
    for (let page = 1; page <= 10; page++) {
      await deleteCache(cacheKeys.recipeSearch(searchTerm, page));
    }
  } catch (error) {
    console.error("Redis search cache invalidation error:", error);
  }
}

/**
 * Helper to wrap API handler with caching
 *
 * @param cacheKey - Cache key
 * @param handler - API handler function
 * @param ttlSeconds - Optional TTL override
 * @returns Cached or fresh response
 */
export async function withCache<T>(
  cacheKey: string,
  handler: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  // Try to get from cache first
  const cached = await getCachedResponse<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Execute handler and cache result
  const result = await handler();
  await setCachedResponse(cacheKey, result, ttlSeconds);
  return result;
}
