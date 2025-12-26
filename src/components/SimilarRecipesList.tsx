/**
 * Similar Recipes List Component
 *
 * Reusable component for displaying similar recipes
 * Features:
 * - Navigates to recipe page instead of external links
 * - Displays recipe images (constructed from imageType per SPOONACULAR_API_DOCS.md)
 * - Displays recipe metadata (time, servings, image type)
 * - Responsive design
 * - Consistent styling across app
 *
 * Following SPOONACULAR_API_DOCS.md:
 * - Similar recipes API returns imageType, not image URL
 * - Image URL format: https://img.spoonacular.com/recipes/{id}-312x231.{imageType}
 */

import { memo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SimilarRecipe } from "../types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { UtensilsCrossed, Clock, Users, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { getRecipeImageUrl } from "../utils/imageUtils";

interface SimilarRecipesListProps {
  similarRecipes: SimilarRecipe[];
  className?: string;
}

/**
 * Similar Recipes List Component (Memoized for performance)
 *
 * Displays a list of similar recipes with navigation to recipe pages
 */
const SimilarRecipesList = memo(
  ({ similarRecipes, className = "" }: SimilarRecipesListProps) => {
    const router = useRouter();

    // Memoized navigation handler for performance
    const handleRecipeClick = useCallback(
      (recipeId: number) => {
        router.push(`/recipe/${recipeId}`);
      },
      [router]
    );

    if (similarRecipes.length === 0) {
      return null;
    }

    return (
      <Card
        className={`bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30 p-4 sm:p-6 ${className}`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <UtensilsCrossed className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
              Similar Recipes
            </h3>
            <p className="text-sm text-gray-400">
              Explore related recipes you might enjoy
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {similarRecipes.map((similarRecipe) => {
            // Construct image URL from imageType (per SPOONACULAR_API_DOCS.md)
            const imageUrl = similarRecipe.imageType
              ? getRecipeImageUrl(similarRecipe.id, similarRecipe.imageType)
              : null;

            return (
              <div
                key={similarRecipe.id}
                onClick={() => handleRecipeClick(similarRecipe.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRecipeClick(similarRecipe.id);
                  }
                }}
                className="w-full flex gap-3 p-3 bg-slate-800/50 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-slate-800/70 transition-all group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {/* Recipe Image */}
                {imageUrl && (
                  <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-blue-500/20">
                    <Image
                      src={imageUrl}
                      alt={similarRecipe.title}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Recipe Info */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="flex-1 text-blue-300 group-hover:text-blue-200 font-medium break-words text-sm sm:text-base">
                      {similarRecipe.title}
                    </span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs flex-shrink-0">
                      View
                    </Badge>
                  </div>
                  {/* Display additional info from similar recipes API */}
                  <div className="flex flex-wrap gap-2">
                    {similarRecipe.readyInMinutes !== undefined && (
                      <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {similarRecipe.readyInMinutes} min
                      </Badge>
                    )}
                    {similarRecipe.servings !== undefined && (
                      <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {similarRecipe.servings} servings
                      </Badge>
                    )}
                    {similarRecipe.sourceUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            similarRecipe.sourceUrl,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Source
                      </Button>
                    )}
                    {similarRecipe.imageType && (
                      <Badge
                        variant="outline"
                        className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs"
                      >
                        {similarRecipe.imageType.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }
);

SimilarRecipesList.displayName = "SimilarRecipesList";

export default SimilarRecipesList;
