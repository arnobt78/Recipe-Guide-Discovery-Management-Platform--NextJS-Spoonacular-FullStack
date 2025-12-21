/**
 * Reusable Hook: Check if recipe is favourite
 * 
 * Features:
 * - Centralized favourite check logic
 * - Memoized for performance
 * - Reusable across components
 */

import { useMemo } from "react";
import { Recipe } from "../types";

/**
 * Hook to check if a recipe is in favourites list
 * 
 * @param recipe - Recipe to check
 * @param favouriteRecipes - Array of favourite recipes
 * @returns Boolean indicating if recipe is favourite
 */
export function useIsFavourite(
  recipe: Recipe | undefined,
  favouriteRecipes: Recipe[]
): boolean {
  return useMemo(() => {
    if (!recipe) return false;
    return favouriteRecipes.some((favRecipe) => favRecipe.id === recipe.id);
  }, [recipe, favouriteRecipes]);
}

