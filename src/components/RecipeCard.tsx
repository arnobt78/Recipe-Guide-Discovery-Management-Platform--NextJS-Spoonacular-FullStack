/**
 * Recipe Card Component
 *
 * Reusable card component for displaying recipe information
 * Features:
 * - ShadCN Card component
 * - Gradient glow effects
 * - Favourite button (top left corner)
 * - Hover animations
 * - SVG icon integration
 * - Badges and additional info
 */

import { memo, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Recipe } from "../types";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  Trash2,
  Clock,
  Users,
  TrendingUp,
  Star,
  DollarSign,
  Leaf,
  Wheat,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import IngredientMatchBadges from "./IngredientMatchBadges";

interface Props {
  recipe: Recipe;
  isFavourite: boolean;
  onFavouriteButtonClick: (recipe: Recipe) => void;
  showRemoveButton?: boolean;
  index?: number; // Add index prop for loading optimization
  onClick?: () => void; // Optional: Override default navigation behavior
}

/**
 * Recipe Card Component (Memoized for performance)
 *
 * Reusable card component for displaying recipe information
 * Features:
 * - ShadCN Card component
 * - Gradient glow effects
 * - Favourite button in top left corner
 * - Hover animations
 * - SVG icon integration
 * - Badges and additional info
 */
const RecipeCard = memo(
  ({
    recipe,
    onClick,
    onFavouriteButtonClick,
    isFavourite,
    showRemoveButton = false,
    index = 0,
  }: Props) => {
    const router = useRouter();
    // Optimize loading: First 8 cards (visible on most screens) load eagerly
    // Rest load lazily for better initial page performance
    const shouldLoadEagerly = index < 8;

    // Extract basic info from summary if available
    // Also check for ingredient information from search results
    const cardInfo = useMemo(() => {
      const info: {
        time?: string;
        servings?: string;
        calories?: string;
        usedIngredients?: number;
        missedIngredients?: number;
        unusedIngredients?: number;
      } = {};

      if (recipe.summary) {
        const summary = recipe.summary.toLowerCase();

        // Extract time
        const timeMatch = summary.match(/(\d+)\s*minutes?/);
        if (timeMatch) info.time = `${timeMatch[1]} min`;

        // Extract servings
        const servingsMatch = summary.match(/serves?\s*(\d+)/);
        if (servingsMatch) info.servings = `${servingsMatch[1]} servings`;

        // Extract calories
        const caloriesMatch = summary.match(/(\d+)\s*calories?/);
        if (caloriesMatch) info.calories = `${caloriesMatch[1]} cal`;
      }

      // Get ingredient info from search results (when fillIngredients=true)
      if (recipe.usedIngredientCount !== undefined) {
        info.usedIngredients = recipe.usedIngredientCount;
      }
      if (recipe.missedIngredientCount !== undefined) {
        info.missedIngredients = recipe.missedIngredientCount;
      }
      // Also track unused ingredients count (for "what's in your fridge?" feature)
      if (recipe.unusedIngredients && recipe.unusedIngredients.length > 0) {
        info.unusedIngredients = recipe.unusedIngredients.length;
      }

      return Object.keys(info).length > 0 ? info : null;
    }, [
      recipe.summary,
      recipe.usedIngredientCount,
      recipe.missedIngredientCount,
      recipe.unusedIngredients,
    ]);

    // Handle card click: Use custom onClick if provided, otherwise navigate to recipe page
    const handleCardClick = () => {
      if (onClick) {
        onClick();
      } else {
        router.push(`/recipe/${recipe.id}`);
      }
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        className="cursor-pointer"
      >
        <Card className="glow-card group h-full flex flex-col overflow-hidden min-h-[320px]">
          {/* Recipe Image */}
          <div className="relative overflow-hidden rounded-t-lg h-48">
            <Image
              src={recipe.image || "/hero-image.webp"}
              alt={recipe.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              priority={shouldLoadEagerly}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Favourite Button - Top Left Corner */}
            <div className="absolute top-2 left-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onFavouriteButtonClick(recipe);
                }}
                className={`p-6 rounded-full transition-all backdrop-blur-sm bg-black/30 hover:bg-black/50 ${
                  showRemoveButton
                    ? "hover:bg-red-500/40"
                    : isFavourite
                    ? "bg-red-500/40 hover:bg-red-500/60"
                    : "hover:bg-purple-500/40"
                }`}
                aria-label={
                  showRemoveButton
                    ? "Remove from collection"
                    : isFavourite
                    ? "Remove from favourites"
                    : "Add to favourites"
                }
              >
                {showRemoveButton ? (
                  <Trash2 className="h-5 w-5 text-red-400" />
                ) : isFavourite ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <AiFillHeart
                      size={24}
                      className="text-red-500 drop-shadow-lg"
                    />
                  </motion.div>
                ) : (
                  <AiOutlineHeart
                    size={24}
                    className="text-white drop-shadow-lg group-hover:text-purple-300 transition-colors"
                  />
                )}
              </Button>
            </div>

            {/* Decorative SVG Icon Overlay - Top Right (Bigger) */}
            <div className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity z-10">
              <Image
                src="/hamburger.svg"
                alt="Recipe"
                width={48}
                height={48}
                className="drop-shadow-2xl"
              />
            </div>

            {/* Badges Overlay - Bottom of Image */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 z-10">
              {/* Time, Servings, Calories - Basic Info */}
              {cardInfo && (
                <>
                  {cardInfo.time && (
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {cardInfo.time}
                    </Badge>
                  )}
                  {cardInfo.servings && (
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                      <Users className="h-3 w-3 mr-1" />
                      {cardInfo.servings}
                    </Badge>
                  )}
                  {cardInfo.calories && (
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {cardInfo.calories}
                    </Badge>
                  )}
                </>
              )}

              {/* Display readyInMinutes and servings from API if available (when addRecipeInformation=true) */}
              {recipe.readyInMinutes !== undefined && (
                <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {recipe.readyInMinutes} min
                </Badge>
              )}
              {recipe.servings !== undefined && !cardInfo?.servings && (
                <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                  <Users className="h-3 w-3 mr-1" />
                  {recipe.servings} servings
                </Badge>
              )}

              {/* Ingredient Match Badges - Reusable component */}
              <IngredientMatchBadges recipe={recipe} variant="overlay" />
            </div>
          </div>

          <CardContent className="p-4 flex-1 flex flex-col min-h-[100px]">
            {/* Recipe Title - Full Width with Fixed Min Height for Consistency */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white w-full line-clamp-2 group-hover:text-purple-200 transition-colors min-h-[3.5rem] flex items-start">
                {recipe.title}
              </h3>
              {/* Display likes count if available from search results */}
              {recipe.likes !== undefined && recipe.likes > 0 && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs flex-shrink-0"
                >
                  <Star className="h-3 w-3 mr-1 fill-purple-400" />
                  {recipe.likes}
                </Badge>
              )}
            </div>

            {/* Additional Recipe Info Badges - Display dietary info, price, etc. when available */}
            <div className="flex flex-wrap gap-2 mt-2">
              {/* Dietary Information Badges */}
              {recipe.vegan && (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 border-green-500/30 text-green-300 text-xs"
                >
                  <Leaf className="h-3 w-3 mr-1" />
                  Vegan
                </Badge>
              )}
              {recipe.vegetarian && !recipe.vegan && (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 border-green-500/30 text-green-300 text-xs"
                >
                  <Leaf className="h-3 w-3 mr-1" />
                  Vegetarian
                </Badge>
              )}
              {recipe.glutenFree && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 border-amber-500/30 text-amber-300 text-xs"
                >
                  <Wheat className="h-3 w-3 mr-1" />
                  Gluten Free
                </Badge>
              )}
              {recipe.dairyFree && (
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs"
                >
                  Dairy Free
                </Badge>
              )}
              {recipe.ketogenic && (
                <Badge
                  variant="outline"
                  className="bg-orange-500/10 border-orange-500/30 text-orange-300 text-xs"
                >
                  Keto
                </Badge>
              )}
              {recipe.veryHealthy && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs"
                >
                  Very Healthy
                </Badge>
              )}
              {recipe.cheap && (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 border-green-500/30 text-green-300 text-xs"
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  Budget Friendly
                </Badge>
              )}
              {recipe.veryPopular && (
                <Badge
                  variant="outline"
                  className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300 text-xs"
                >
                  <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                  Popular
                </Badge>
              )}
              {/* Price per serving if available */}
              {recipe.pricePerServing !== undefined && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs"
                >
                  <DollarSign className="h-3 w-3 mr-1" />$
                  {(recipe.pricePerServing / 100).toFixed(2)}/serving
                </Badge>
              )}
              {/* Spoonacular Score if available */}
              {recipe.spoonacularScore !== undefined && (
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs"
                >
                  <Star className="h-3 w-3 mr-1 fill-blue-400" />
                  {Math.round(recipe.spoonacularScore)}%
                </Badge>
              )}
              {/* Health Score if available */}
              {recipe.healthScore !== undefined && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Health: {Math.round(recipe.healthScore)}
                </Badge>
              )}
              {/* Whole30 if available */}
              {recipe.whole30 && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs"
                >
                  Whole30
                </Badge>
              )}
              {/* Low FODMAP if available */}
              {recipe.lowFodmap && (
                <Badge
                  variant="outline"
                  className="bg-teal-500/10 border-teal-500/30 text-teal-300 text-xs"
                >
                  Low FODMAP
                </Badge>
              )}
              {/* Sustainable if available */}
              {recipe.sustainable && (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 border-green-500/30 text-green-300 text-xs"
                >
                  Sustainable
                </Badge>
              )}
              {/* Weight Watcher Points if available */}
              {recipe.weightWatcherSmartPoints !== undefined && (
                <Badge
                  variant="outline"
                  className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 text-xs"
                >
                  {recipe.weightWatcherSmartPoints} WW Points
                </Badge>
              )}
              {/* Cuisines if available */}
              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <>
                  {recipe.cuisines.slice(0, 2).map((cuisine, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 text-xs"
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </>
              )}
              {/* Diets if available */}
              {recipe.diets && recipe.diets.length > 0 && (
                <>
                  {recipe.diets.slice(0, 2).map((diet, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-pink-500/10 border-pink-500/30 text-pink-300 text-xs"
                    >
                      {diet}
                    </Badge>
                  ))}
                </>
              )}
              {/* Dish Types if available */}
              {recipe.dishTypes && recipe.dishTypes.length > 0 && (
                <>
                  {recipe.dishTypes.slice(0, 2).map((dishType, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-violet-500/10 border-violet-500/30 text-violet-300 text-xs"
                    >
                      {dishType}
                    </Badge>
                  ))}
                </>
              )}
              {/* Occasions if available */}
              {recipe.occasions && recipe.occasions.length > 0 && (
                <>
                  {recipe.occasions.slice(0, 1).map((occasion, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-rose-500/10 border-rose-500/30 text-rose-300 text-xs"
                    >
                      {occasion}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

RecipeCard.displayName = "RecipeCard";

export default RecipeCard;
