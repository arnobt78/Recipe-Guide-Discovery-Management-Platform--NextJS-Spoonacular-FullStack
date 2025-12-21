/**
 * Ingredient Match Details Component
 * 
 * Displays detailed information about used, missed, and unused ingredients
 * Shows ALL properties from the ingredient arrays: amount, unit, aisle, image, meta, etc.
 * 
 * Used in RecipeCard detail view or expandable section
 * 
 * @see https://spoonacular.com/food-api/docs#Search-Recipes - fillIngredients parameter
 */

import { memo } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, AlertCircle, Info, ShoppingCart } from "lucide-react";
import { Recipe } from "../types";

interface IngredientMatchDetailsProps {
  recipe: Recipe;
  className?: string;
}

/**
 * Ingredient Match Details Component (Memoized for performance)
 * 
 * Displays full details for:
 * - Used ingredients (green) - with images, amounts, units, aisles
 * - Missed ingredients (orange) - with images, amounts, units, aisles
 * - Unused ingredients (blue) - with images, amounts, units, aisles
 */
const IngredientMatchDetails = memo(({ 
  recipe, 
  className = ""
}: IngredientMatchDetailsProps) => {
  // Helper to get ingredient image URL
  const getIngredientImageUrl = (imageName: string): string => {
    if (!imageName) return "";
    return `https://img.spoonacular.com/ingredients_100x100/${imageName}`;
  };

  // Only render if we have ingredient arrays (not just counts)
  const hasIngredientData = 
    (recipe.usedIngredients && recipe.usedIngredients.length > 0) ||
    (recipe.missedIngredients && recipe.missedIngredients.length > 0) ||
    (recipe.unusedIngredients && recipe.unusedIngredients.length > 0);

  if (!hasIngredientData) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Used Ingredients Section */}
      {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
        <Card className="bg-green-900/20 border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <h4 className="text-sm font-semibold text-green-300">
              Used Ingredients ({recipe.usedIngredients.length})
            </h4>
          </div>
          <div className="space-y-2">
            {recipe.usedIngredients.map((ingredient, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-lg border border-green-500/20"
              >
                {/* Ingredient Image */}
                {ingredient.image && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-green-500/20">
                    <img
                      src={getIngredientImageUrl(ingredient.image)}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                
                {/* Ingredient Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white font-medium text-sm break-words">
                      {ingredient.name}
                    </p>
                    {ingredient.amount && ingredient.unit && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs flex-shrink-0">
                        {ingredient.amount} {ingredient.unitShort || ingredient.unit}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Original Text */}
                  {ingredient.original && (
                    <p className="text-xs text-gray-400 mb-1">{ingredient.original}</p>
                  )}
                  
                  {/* Meta Information */}
                  {ingredient.meta && ingredient.meta.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ingredient.meta.map((meta, metaIdx) => (
                        <Badge
                          key={metaIdx}
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs"
                        >
                          {meta}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Aisle Information */}
                  {ingredient.aisle && (
                    <div className="flex items-center gap-1 mt-1">
                      <ShoppingCart className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Aisle: {ingredient.aisle}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Missed Ingredients Section */}
      {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
        <Card className="bg-orange-900/20 border-orange-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <h4 className="text-sm font-semibold text-orange-300">
              Missing Ingredients ({recipe.missedIngredients.length})
            </h4>
          </div>
          <div className="space-y-2">
            {recipe.missedIngredients.map((ingredient, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-lg border border-orange-500/20"
              >
                {/* Ingredient Image */}
                {ingredient.image && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-orange-500/20">
                    <img
                      src={getIngredientImageUrl(ingredient.image)}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                
                {/* Ingredient Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white font-medium text-sm break-words">
                      {ingredient.name}
                      {ingredient.extendedName && (
                        <span className="text-gray-400 ml-1">({ingredient.extendedName})</span>
                      )}
                    </p>
                    {ingredient.amount && ingredient.unit && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs flex-shrink-0">
                        {ingredient.amount} {ingredient.unitShort || ingredient.unit}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Original Text */}
                  {ingredient.original && (
                    <p className="text-xs text-gray-400 mb-1">{ingredient.original}</p>
                  )}
                  
                  {/* Meta Information */}
                  {ingredient.meta && ingredient.meta.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ingredient.meta.map((meta, metaIdx) => (
                        <Badge
                          key={metaIdx}
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs"
                        >
                          {meta}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Aisle Information */}
                  {ingredient.aisle && (
                    <div className="flex items-center gap-1 mt-1">
                      <ShoppingCart className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Aisle: {ingredient.aisle}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Unused Ingredients Section */}
      {recipe.unusedIngredients && recipe.unusedIngredients.length > 0 && (
        <Card className="bg-blue-900/20 border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-blue-400" />
            <h4 className="text-sm font-semibold text-blue-300">
              Unused Ingredients ({recipe.unusedIngredients.length})
            </h4>
          </div>
          <div className="space-y-2">
            {recipe.unusedIngredients.map((ingredient, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-lg border border-blue-500/20"
              >
                {/* Ingredient Image */}
                {ingredient.image && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-blue-500/20">
                    <img
                      src={getIngredientImageUrl(ingredient.image)}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                
                {/* Ingredient Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white font-medium text-sm break-words">
                      {ingredient.name}
                    </p>
                    {ingredient.amount && ingredient.unit && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs flex-shrink-0">
                        {ingredient.amount} {ingredient.unitShort || ingredient.unit}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Original Text */}
                  {ingredient.original && (
                    <p className="text-xs text-gray-400 mb-1">{ingredient.original}</p>
                  )}
                  
                  {/* Meta Information */}
                  {ingredient.meta && ingredient.meta.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ingredient.meta.map((meta, metaIdx) => (
                        <Badge
                          key={metaIdx}
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs"
                        >
                          {meta}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Aisle Information */}
                  {ingredient.aisle && (
                    <div className="flex items-center gap-1 mt-1">
                      <ShoppingCart className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Aisle: {ingredient.aisle}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
});

IngredientMatchDetails.displayName = "IngredientMatchDetails";

export default IngredientMatchDetails;

