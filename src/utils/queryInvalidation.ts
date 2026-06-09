/**
 * React Query Cache Invalidation Utilities
 *
 * Centralized invalidation for mutations + SSE realtime sync (invalidateByAppEvent).
 */

import { QueryClient } from "@tanstack/react-query";

/** Mirrors lib/realtime/types.ts — client-safe duplicate */
export type AppEventType =
  | "insights"
  | "favourites"
  | "collections"
  | "mealPlan"
  | "shoppingList"
  | "notes"
  | "images"
  | "videos"
  | "filterPresets"
  | "user"
  | "recipes";

export function invalidateBusinessInsights(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["business", "insights"] });
}

export function invalidateRecipeQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["recipes"], exact: false });
}

export function invalidateFavouritesQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["recipes", "favourites"] });
}

export function invalidateSearchQueries(
  queryClient: QueryClient,
  searchTerm?: string,
) {
  if (searchTerm) {
    queryClient.invalidateQueries({
      queryKey: ["recipes", "search", searchTerm],
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: ["recipes", "search"],
      exact: false,
    });
  }
}

export function invalidateRecipeSummary(
  queryClient: QueryClient,
  recipeId: string,
) {
  queryClient.invalidateQueries({
    queryKey: ["recipes", "summary", recipeId],
  });
}

export function invalidateCollectionsQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["collections"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["collection"], exact: false });
}

export function invalidateMealPlanQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["meal-plan"], exact: false });
}

export function invalidateShoppingListQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
  queryClient.invalidateQueries({ queryKey: ["shopping-list"], exact: false });
}

export function invalidateNotesQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["recipe-note"], exact: false });
}

export function invalidateImagesQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["recipe-images"], exact: false });
}

export function invalidateVideosQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["recipes", "videos"], exact: false });
}

export function invalidateFilterPresetsQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["filters", "presets"], exact: false });
}

/**
 * SSE + cross-tab sync — maps server AppEventType to React Query keys.
 */
export function invalidateByAppEvent(
  queryClient: QueryClient,
  type: AppEventType,
): void {
  switch (type) {
    case "insights":
    case "user":
      invalidateBusinessInsights(queryClient);
      break;
    case "favourites":
      invalidateFavouritesQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "collections":
      invalidateCollectionsQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "mealPlan":
      invalidateMealPlanQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "shoppingList":
      invalidateShoppingListQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "notes":
      invalidateNotesQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "images":
      invalidateImagesQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "videos":
      invalidateVideosQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "filterPresets":
      invalidateFilterPresetsQueries(queryClient);
      invalidateBusinessInsights(queryClient);
      break;
    case "recipes":
      invalidateRecipeQueries(queryClient);
      break;
    default:
      break;
  }
}
