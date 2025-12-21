/**
 * Ingredient Match Badges Component
 * 
 * Reusable component for displaying ingredient match information
 * Shows used, missed, and unused ingredients from search results
 * Used in RecipeCard and other recipe display components
 * 
 * @see https://spoonacular.com/food-api/docs#Search-Recipes - fillIngredients parameter
 */

import { memo } from "react";
import { Badge } from "./ui/badge";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Recipe } from "../types";

interface IngredientMatchBadgesProps {
  recipe: Recipe;
  className?: string;
  variant?: "overlay" | "inline"; // overlay = on image, inline = in content area
}

/**
 * Ingredient Match Badges Component (Memoized for performance)
 * 
 * Displays badges for:
 * - Used ingredients (green) - ingredients from query that are in recipe
 * - Missed ingredients (orange) - ingredients needed but not in query
 * - Unused ingredients (blue) - ingredients in query but not used in recipe
 */
const IngredientMatchBadges = memo(({ 
  recipe, 
  className = "",
  variant = "overlay"
}: IngredientMatchBadgesProps) => {
  // Build tooltip text with ingredient names
  const getUsedIngredientsTooltip = (): string => {
    if (recipe.usedIngredients && recipe.usedIngredients.length > 0) {
      return `Used: ${recipe.usedIngredients.map(ing => ing.name).join(', ')}`;
    }
    return recipe.usedIngredientCount 
      ? `${recipe.usedIngredientCount} ingredients used from your search`
      : "";
  };

  const getMissedIngredientsTooltip = (): string => {
    if (recipe.missedIngredients && recipe.missedIngredients.length > 0) {
      return `Missing: ${recipe.missedIngredients.map(ing => ing.name).join(', ')}`;
    }
    return recipe.missedIngredientCount 
      ? `${recipe.missedIngredientCount} ingredients missing`
      : "";
  };

  const getUnusedIngredientsTooltip = (): string => {
    if (recipe.unusedIngredients && recipe.unusedIngredients.length > 0) {
      return `Unused: ${recipe.unusedIngredients.map(ing => ing.name).join(', ')}`;
    }
    return recipe.unusedIngredients && recipe.unusedIngredients.length > 0
      ? `${recipe.unusedIngredients.length} unused ingredients`
      : "";
  };

  // Determine badge styling based on variant
  const badgeBaseClass = variant === "overlay" 
    ? "bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1"
    : "bg-slate-800/50 text-gray-200 border-slate-600/50 text-xs px-2 py-1";

  // Only render if we have ingredient match data
  if (
    recipe.usedIngredientCount === undefined &&
    recipe.missedIngredientCount === undefined &&
    (!recipe.unusedIngredients || recipe.unusedIngredients.length === 0)
  ) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Used Ingredients Badge */}
      {recipe.usedIngredientCount !== undefined && recipe.usedIngredientCount > 0 && (
        <Badge 
          className={`${badgeBaseClass} border-green-400/30`}
          title={getUsedIngredientsTooltip()}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {recipe.usedIngredientCount} used
        </Badge>
      )}

      {/* Missed Ingredients Badge */}
      {recipe.missedIngredientCount !== undefined && recipe.missedIngredientCount > 0 && (
        <Badge 
          className={`${badgeBaseClass} border-orange-400/30`}
          title={getMissedIngredientsTooltip()}
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {recipe.missedIngredientCount} missing
        </Badge>
      )}

      {/* Unused Ingredients Badge */}
      {recipe.unusedIngredients && recipe.unusedIngredients.length > 0 && (
        <Badge 
          className={`${badgeBaseClass} border-blue-400/30`}
          title={getUnusedIngredientsTooltip()}
        >
          <Info className="h-3 w-3 mr-1" />
          {recipe.unusedIngredients.length} unused
        </Badge>
      )}
    </div>
  );
});

IngredientMatchBadges.displayName = "IngredientMatchBadges";

export default IngredientMatchBadges;

