/**
 * Reusable Recipe Grid Component
 * 
 * Features:
 * - Displays recipes in a responsive grid
 * - Handles favourite state
 * - Animated entry/exit
 * - Reusable across search and favourites tabs
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Recipe } from "../types";
import RecipeCard from "./RecipeCard";

interface RecipeGridProps {
  recipes: Recipe[];
  favouriteRecipes: Recipe[];
  onFavouriteToggle: (recipe: Recipe, isFavourite: boolean) => void;
  showRemoveFromCollection?: boolean;
  // Note: onRecipeClick removed - RecipeCard handles navigation internally via useNavigate
}

/**
 * Reusable Recipe Grid Component (Memoized for performance)
 * 
 * Features:
 * - Displays recipes in a responsive grid
 * - Handles favourite state
 * - Animated entry/exit
 * - Reusable across search and favourites tabs
 */
const RecipeGrid = memo(({
  recipes,
  favouriteRecipes,
  onFavouriteToggle,
  showRemoveFromCollection = false,
}: RecipeGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {recipes.map((recipe, index) => {
          const isFavourite = favouriteRecipes.some(
            (favRecipe) => recipe.id === favRecipe.id
          );

          return (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <RecipeCard
                recipe={recipe}
                onFavouriteButtonClick={(recipe) =>
                  onFavouriteToggle(recipe, showRemoveFromCollection ? true : isFavourite)
                }
                isFavourite={showRemoveFromCollection ? true : isFavourite}
                showRemoveButton={showRemoveFromCollection}
                index={index}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

RecipeGrid.displayName = "RecipeGrid";

export default RecipeGrid;

