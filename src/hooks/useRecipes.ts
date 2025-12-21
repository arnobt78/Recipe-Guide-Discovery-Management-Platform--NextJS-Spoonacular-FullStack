/**
 * React Query hooks for recipe-related API calls
 *
 * Following REACT_QUERY_SETUP_GUIDE.md patterns:
 * - staleTime: Infinity = Data never becomes stale automatically
 * - refetchOnMount: true = Refetch ONLY when data is stale (invalidated)
 * - Result: Cache forever until manually invalidated, then refetch once
 * - Centralized error handling with toast notifications
 * - Proper TypeScript types for all queries and mutations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import * as api from "../api";
import { Recipe, SearchRecipesResponse, RecipeInformation, SimilarRecipe, AutocompleteRecipe, DishPairingForWine, WinePairing } from "../types";
import { toast } from "sonner";
import { invalidateFavouritesQueries } from "../utils/queryInvalidation";
import {
  getCachedSearchResults,
  saveSearchResults,
} from "../utils/cacheStorage";
import { isCacheOnlyMode } from "../utils/devMode";
import { shouldUseMockData, getMockSearchResults } from "../utils/mockData";
import { useAuthCheck } from "./useAuthCheck";

/**
 * Hook to search recipes
 *
 * Multi-layer Caching Strategy:
 * 1. React Query cache (in-memory, fastest) - staleTime: Infinity
 * 2. sessionStorage (session-only, cleared on tab close)
 * 3. localStorage (persistent, 7 days expiry)
 * 4. API call (fallback if all caches miss)
 *
 * Flow:
 * - First call: Check localStorage → sessionStorage → API → Save to all caches
 * - Subsequent calls: Use React Query cache (instant)
 * - After page refresh: Check localStorage/sessionStorage before API call
 * - After invalidation: Refetch from API once, then use cache again
 *
 * Note: Error handling is done in App.tsx via useEffect watching the error state
 * React Query v5 removed onError from useQuery - errors are handled via error state
 *
 * @param searchTerm - Search query string
 * @param page - Page number for pagination
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with data, isLoading, error, etc.
 */
export function useSearchRecipes(
  searchTerm: string,
  page: number = 1,
  enabled: boolean = true
) {
  return useQuery<SearchRecipesResponse, Error>({
    queryKey: ["recipes", "search", searchTerm, page],
    queryFn: async () => {
      // First, check localStorage/sessionStorage cache
      const cachedData = getCachedSearchResults(searchTerm, page);
      if (cachedData) {
        // Return cached data immediately (no API call)
        return cachedData;
      }

      // Check if cache-only mode is enabled (development only)
      if (isCacheOnlyMode()) {
        // Return mock data if available, otherwise return empty results
        if (shouldUseMockData()) {
          const mockData = getMockSearchResults(searchTerm, page);
          saveSearchResults(searchTerm, page, mockData);
          return mockData;
        }
        // Return empty results in cache-only mode
        toast.info("Cache-only mode: Using cached data only. No API calls made.");
        return { results: [], offset: 0, number: 0, totalResults: 0 };
      }

      // If no cache, fetch from API
      // Enable fillIngredients to get usedIngredients/missedIngredients for better UX
      // Enable addRecipeInformation to get ALL recipe properties for comprehensive display
      // Enable addRecipeNutrition to get nutrition data in search results
      const apiData = await api.searchRecipes(searchTerm, page, {
        fillIngredients: true, // Get ingredient match information (usedIngredients, missedIngredients, unusedIngredients)
        addRecipeInformation: true, // Get ALL recipe properties (readyInMinutes, servings, pricePerServing, spoonacularScore, healthScore, cuisines, diets, dishTypes, occasions, all dietary flags, etc.)
        addRecipeNutrition: true, // Get nutrition data in search results (calories, protein, etc.)
      });

      // Save to both localStorage and sessionStorage for future use
      // Only save if API call was successful
      if (apiData && !apiData.status && !apiData.code) {
        saveSearchResults(searchTerm, page, apiData);
      }

      return apiData;
    },
    enabled: enabled && !!searchTerm,
    staleTime: Infinity, // Cache forever until invalidated
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    // Use cached data as placeholder while checking storage/API
    placeholderData: (previousData) => {
      // If we have previous React Query cache, use it
      if (previousData) return previousData;

      // Otherwise, try to get from localStorage/sessionStorage
      return getCachedSearchResults(searchTerm, page) || undefined;
    },
  });
}

/**
 * Hook to get favourite recipes
 *
 * Caching Behavior:
 * - First call: Fetches from API
 * - Subsequent calls: Uses cache (no API call)
 * - After invalidation: Refetches from API once, then uses cache again
 *
 * Note: Error handling is done in App.tsx via useEffect watching the error state
 * React Query v5 removed onError from useQuery - errors are handled via error state
 *
 * @returns Query result with data, isLoading, error, etc.
 */
export function useFavouriteRecipes() {
  const isAuthenticated = useAuthCheck();
  
  return useQuery({
    queryKey: ["recipes", "favourites"],
    queryFn: async () => {
      const response = await api.getFavouriteRecipes();
      return Array.isArray(response.results) ? response.results : [];
    },
    enabled: isAuthenticated, // Only fetch if user is authenticated (SSR-safe)
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get recipe summary by ID
 *
 * Caching Behavior:
 * - First call: Fetches from API
 * - Subsequent calls: Uses cache (no API call)
 * - After invalidation: Refetches from API once, then uses cache again
 *
 * Note: Error handling is done in RecipeDetailCard component via useEffect watching the error state
 * React Query v5 removed onError from useQuery - errors are handled via error state
 *
 * @param recipeId - Recipe ID string
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with data, isLoading, error, etc.
 */
export function useRecipeSummary(
  recipeId: string | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["recipes", "summary", recipeId],
    queryFn: () => api.getRecipeSummary(recipeId!),
    enabled: enabled && !!recipeId,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get full recipe information by ID
 * Returns complete recipe data including sourceUrl, ingredients, nutrition, etc.
 *
 * Caching Behavior:
 * - First call: Fetches from API
 * - Subsequent calls: Uses cache (no API call)
 * - After invalidation: Refetches from API once, then uses cache again
 *
 * @param recipeId - Recipe ID string
 * @param options - Optional parameters for additional data
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with data, isLoading, error, etc.
 */
export function useRecipeInformation(
  recipeId: string | undefined,
  options?: {
    includeNutrition?: boolean;
    addWinePairing?: boolean;
    addTasteData?: boolean;
  },
  enabled: boolean = true
) {
  // Default: request wine pairing for better UX (shows wine recommendations)
  const requestOptions = {
    addWinePairing: true, // Always request wine pairing for better UX
    ...options,
  };

  return useQuery<RecipeInformation, Error>({
    queryKey: ["recipes", "information", recipeId, requestOptions],
    queryFn: () => api.getRecipeInformation(recipeId!, requestOptions),
    enabled: enabled && !!recipeId,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get similar recipes by recipe ID
 *
 * Caching Behavior:
 * - First call: Fetches from API
 * - Subsequent calls: Uses cache (no API call)
 * - After invalidation: Refetches from API once, then uses cache again
 *
 * @param recipeId - Recipe ID string
 * @param number - Number of similar recipes to return (1-100, default: 10)
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with data, isLoading, error, etc.
 */
export function useSimilarRecipes(
  recipeId: string | undefined,
  number: number = 10,
  enabled: boolean = true
) {
  return useQuery<SimilarRecipe[], Error>({
    queryKey: ["recipes", "similar", recipeId, number],
    queryFn: () => api.getSimilarRecipes(recipeId!, number),
    enabled: enabled && !!recipeId,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to add a recipe to favourites
 *
 * Flow:
 * 1. User calls mutate() with recipe data
 * 2. API call happens
 * 3. On success: Invalidate related queries → UI updates immediately
 * 4. On error: Show error toast
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useAddFavouriteRecipe(): UseMutationResult<void, Error, Recipe> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Recipe>({
    mutationFn: (recipe: Recipe) => api.addFavouriteRecipe(recipe),
    onSuccess: () => {
      // CRITICAL: Invalidate favourites query to refetch
      // This triggers refetch of favourites query
      // UI updates immediately without page refresh
      invalidateFavouritesQueries(queryClient);
      toast.success("Recipe added to favourites!");
    },
    onError: (error: Error) => {
      // Check if it's an authentication error
      if (error?.message?.includes("401") || error?.message?.includes("Authentication") || error?.message?.includes("Unauthorized")) {
        toast.info("🍳 Please login to add recipes to your favourites! 👋", {
          duration: 4000,
        });
      } else if (error?.message?.includes("already")) {
        toast.info("Recipe is already in favourites.");
      } else {
        toast.error("Failed to add recipe to favourites. Please try again.");
      }
    },
  });
}

/**
 * Hook to remove a recipe from favourites
 *
 * Flow:
 * 1. User calls mutate() with recipe data
 * 2. API call happens
 * 3. On success: Invalidate related queries → UI updates immediately
 * 4. On error: Show error toast
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useRemoveFavouriteRecipe(): UseMutationResult<void, Error, Recipe> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Recipe>({
    mutationFn: (recipe: Recipe) => api.removeFavouriteRecipe(recipe),
    onSuccess: () => {
      // CRITICAL: Invalidate favourites query to refetch
      // This triggers refetch of favourites query
      // UI updates immediately without page refresh
      invalidateFavouritesQueries(queryClient);
      toast.success("Recipe removed from favourites!");
    },
    onError: (error: Error) => {
      // Check if it's an authentication error
      if (error?.message?.includes("401") || error?.message?.includes("Authentication") || error?.message?.includes("Unauthorized")) {
        toast.info("🍳 Please login to manage your favourites! 👋", {
          duration: 4000,
        });
      } else {
        toast.error("Failed to remove recipe from favourites. Please try again.");
      }
      console.error("Remove favourite error:", error);
    },
  });
}

/**
 * Hook to autocomplete recipe search
 * Suggests possible recipe names based on partial input
 * 
 * Caching Behavior:
 * - Debounced to avoid excessive API calls
 * - Cache for 5 minutes (autocomplete results change frequently)
 * - Only enabled when query length >= 2
 *
 * @param query - Partial search query string
 * @param number - Number of results to return (1-25, default: 10)
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with autocomplete recipes array
 */
export function useAutocompleteRecipes(
  query: string,
  number: number = 10,
  enabled: boolean = true
) {
  return useQuery<AutocompleteRecipe[], Error>({
    queryKey: ["recipes", "autocomplete", query, number],
    queryFn: () => api.autocompleteRecipes(query, number),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes (autocomplete changes frequently)
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnMount: false, // Don't refetch on mount for autocomplete
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get dish pairing for wine
 * Finds dishes that go well with a given wine type
 * 
 * Caching Behavior:
 * - Cache forever until invalidated
 * - Wine pairings don't change frequently
 *
 * @param wine - Wine type (e.g., "merlot", "riesling", "malbec")
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with dish pairing information
 */
export function useDishPairingForWine(
  wine: string | undefined,
  enabled: boolean = true
) {
  return useQuery<DishPairingForWine, Error>({
    queryKey: ["wine", "dishes", wine],
    queryFn: () => api.getDishPairingForWine(wine!),
    enabled: enabled && !!wine && wine.trim().length > 0,
    staleTime: Infinity, // Cache forever (wine pairings don't change)
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get wine pairing for food
 * Finds wines that go well with a given food (dish, ingredient, or cuisine)
 * 
 * Caching Behavior:
 * - Cache forever until invalidated
 * - Wine pairings don't change frequently
 *
 * @param food - Food name (e.g., "steak", "salmon", "italian")
 * @param maxPrice - Optional maximum price for wine recommendation in USD
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with wine pairing information
 */
export function useWinePairing(
  food: string | undefined,
  maxPrice?: number,
  enabled: boolean = true
) {
  return useQuery<WinePairing, Error>({
    queryKey: ["wine", "pairing", food, maxPrice],
    queryFn: () => api.getWinePairing(food!, maxPrice),
    enabled: enabled && !!food && food.trim().length > 0,
    staleTime: Infinity, // Cache forever (wine pairings don't change)
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

