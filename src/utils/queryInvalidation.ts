/**
 * React Query Cache Invalidation Utilities
 * 
 * Centralized functions for invalidating React Query caches when data changes.
 * This ensures all related queries update immediately after mutations.
 * 
 * Following the pattern from REACT_QUERY_SETUP_GUIDE.md
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Invalidate business insights query
 * Call this when any user data changes that affects global statistics:
 * - User registration/deletion
 * - Favourites added/removed
 * - Collections created/updated/deleted
 * - Collection items added/removed
 * - Meal plans created/updated/deleted
 * - Shopping lists created/updated/deleted
 * - Notes created/updated/deleted
 * - Filter presets created/updated/deleted
 * - Images added/removed
 * - Videos added/removed
 * 
 * @param queryClient - React Query client instance
 */
export function invalidateBusinessInsights(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    queryKey: ["business", "insights"],
  });
}

/**
 * Invalidate all recipe-related queries
 * Call this when:
 * - Recipe is added/removed from favourites
 * - Recipe data changes
 * 
 * @param queryClient - React Query client instance
 */
export function invalidateRecipeQueries(queryClient: QueryClient) {
  // Invalidate all recipe queries (search, favourites, summary)
  queryClient.invalidateQueries({
    queryKey: ["recipes"],
    exact: false, // Match all queries starting with ["recipes"]
  });
}

/**
 * Invalidate favourites queries only
 * Call this when:
 * - Recipe is added/removed from favourites
 * 
 * @param queryClient - React Query client instance
 */
export function invalidateFavouritesQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    queryKey: ["recipes", "favourites"],
  });
}

/**
 * Invalidate search queries
 * Call this when:
 * - Search results need to be refreshed
 * 
 * @param queryClient - React Query client instance
 * @param searchTerm - Optional search term to invalidate specific query
 */
export function invalidateSearchQueries(
  queryClient: QueryClient,
  searchTerm?: string
) {
  if (searchTerm) {
    // Invalidate specific search query
    queryClient.invalidateQueries({
      queryKey: ["recipes", "search", searchTerm],
    });
  } else {
    // Invalidate all search queries
    queryClient.invalidateQueries({
      queryKey: ["recipes", "search"],
      exact: false,
    });
  }
}

/**
 * Invalidate recipe summary query
 * Call this when:
 * - Recipe details need to be refreshed
 * 
 * @param queryClient - React Query client instance
 * @param recipeId - Recipe ID to invalidate
 */
export function invalidateRecipeSummary(
  queryClient: QueryClient,
  recipeId: string
) {
  queryClient.invalidateQueries({
    queryKey: ["recipes", "summary", recipeId],
  });
}

/**
 * Invalidate all collection queries
 * Call this when:
 * - Collection is created/updated/deleted
 * - Recipe is added/removed from collection
 * 
 * @param queryClient - React Query client instance
 */
export function invalidateCollectionsQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    queryKey: ["collections"],
    exact: false,
  });
}

