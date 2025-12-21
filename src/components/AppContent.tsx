/**
 * AppContent Component
 * 
 * Main application content (extracted from App.tsx for Next.js migration)
 * This component contains all the main UI logic
 */

import {
  FormEvent,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  Suspense,
  lazy,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeProvider, useRecipeContext } from "../context/RecipeContext";
import { useAuth } from "../context/AuthContext";
import SearchInput from "./SearchInput";
import TabNavigation from "./TabNavigation";
import RecipeGrid from "./RecipeGrid";
import ErrorMessage from "./ErrorMessage";
import EmptyState from "./EmptyState";
import ViewMoreButton from "./ViewMoreButton";
import HeroHeader from "./HeroHeader";
import Navbar from "./Navbar";
import SkeletonRecipeGrid from "./SkeletonRecipeGrid";
import SkeletonMealPlanner from "./SkeletonMealPlanner";
import SkeletonShoppingList from "./SkeletonShoppingList";
import {
  useSearchRecipes,
  useFavouriteRecipes,
  useAddFavouriteRecipe,
  useRemoveFavouriteRecipe,
} from "../hooks/useRecipes";
import { Recipe, SearchRecipesResponse } from "../types";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { ChefHat } from "lucide-react";
import SearchResultsMetadata from "./SearchResultsMetadata";

// Code splitting: Lazy load large components that are conditionally rendered
const CollectionManager = lazy(() => import("./CollectionManager"));
const CollectionDetailView = lazy(
  () => import("./CollectionDetailView")
);
const MealPlanner = lazy(() => import("./MealPlanner"));
const ShoppingListGenerator = lazy(
  () => import("./ShoppingListGenerator")
);

/**
 * Main App Content (wrapped in RecipeProvider and AuthProvider)
 */
const AppContent = () => {
  const {
    selectedCollection,
    setSelectedCollection,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,
    currentPage,
    setCurrentPage,
  } = useRecipeContext();

  const { isAuthenticated } = useAuth();

  // React Query hooks with infinite cache strategy
  const {
    data: searchResponse,
    isLoading: isSearching,
    error: searchError,
  } = useSearchRecipes(
    searchTerm,
    currentPage,
    !!searchTerm && selectedTab === "search"
  );

  const {
    data: favouriteRecipes = [],
    isLoading: isLoadingFavourites,
    error: favouritesError,
  } = useFavouriteRecipes();
  const addFavouriteMutation = useAddFavouriteRecipe();
  const removeFavouriteMutation = useRemoveFavouriteRecipe();

  // Handle search errors with toast
  useEffect(() => {
    if (searchError) {
      const error = searchError as Error & { code?: number };
      if (error?.code === 402 || error?.message?.includes("points limit")) {
        toast.error(
          "Daily API limit reached. Please try again later or upgrade your plan."
        );
      } else {
        toast.error("Failed to search recipes. Please try again.");
      }
    }
  }, [searchError]);

  // Handle favourites errors with toast
  useEffect(() => {
    if (favouritesError) {
      toast.error("Failed to load favourite recipes.");
    }
  }, [favouritesError]);

  // Smooth scroll to favourites content on responsive screens when tab is selected
  useEffect(() => {
    if (selectedTab === "favourites" && typeof window !== "undefined" && window.innerWidth < 768) {
      // Small delay to ensure DOM is ready and content is rendered
      const scrollTimer = setTimeout(() => {
        const favouritesContent = document.querySelector('[data-favourites-content]');
        if (favouritesContent) {
          favouritesContent.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 300); // Delay to allow animation to start

      return () => clearTimeout(scrollTimer);
    }
  }, [selectedTab]);

  // Accumulate recipes across all pages for better UX
  // Store all fetched pages in a ref to accumulate results
  const allRecipesRef = useRef<Recipe[]>([]);
  const lastPageRef = useRef<number>(0);
  const lastSearchTermRef = useRef<string>("");

  // Reset accumulated recipes when search term changes
  useEffect(() => {
    if (searchTerm !== lastSearchTermRef.current) {
      allRecipesRef.current = [];
      lastPageRef.current = 0;
      lastSearchTermRef.current = searchTerm;
    }
  }, [searchTerm]);

  // Accumulate recipes from all pages
  const recipes = useMemo(() => {
    if (!searchResponse?.results) {
      return allRecipesRef.current;
    }

    const currentPageResults = searchResponse.results;

    // If this is a new page, add to accumulated results
    if (currentPage > lastPageRef.current) {
      allRecipesRef.current = [...allRecipesRef.current, ...currentPageResults];
      lastPageRef.current = currentPage;
    } else if (currentPage === 1) {
      // Reset on new search (page 1 means new search)
      allRecipesRef.current = currentPageResults;
      lastPageRef.current = 1;
    }

    return allRecipesRef.current;
  }, [searchResponse, currentPage]) as Recipe[];

  const apiError = useMemo(
    () =>
      (searchResponse as SearchRecipesResponse)?.status === "failure" ||
      (searchResponse as SearchRecipesResponse)?.code === 402
        ? (searchResponse as SearchRecipesResponse)?.message ||
          "Daily API limit reached. Please try again later."
        : "",
    [searchResponse]
  );


  // Memoized event handlers
  const handleSearchSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!searchTerm.trim()) return;
      setCurrentPage(1);
    },
    [searchTerm, setCurrentPage]
  );

  const handleViewMoreClick = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, [setCurrentPage]);

  const handleFavouriteToggle = useCallback(
    (recipe: Recipe, isFavourite: boolean) => {
      // Check if user is authenticated before attempting to add/remove favourites
      if (!isAuthenticated) {
        toast.info(
          "🍳 Hey there, food explorer! 👋 To save your favourite recipes, please login first. It's quick and easy! Just click the Login button above and let's get cooking! 🚀",
          {
            duration: 5000,
          }
        );
        return;
      }

      if (isFavourite) {
        removeFavouriteMutation.mutate(recipe);
      } else {
        addFavouriteMutation.mutate(recipe);
      }
    },
    [isAuthenticated, addFavouriteMutation, removeFavouriteMutation]
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Navbar - Sticky at top */}
      <Navbar />

      {/* Full-width Hero Section */}
      <HeroHeader subtitle="Discover & Save Your Favourite Recipes" />

      {/* Main Content - Flex grow to fill remaining space, full width with inner constraint */}
      <div className="w-full flex-1">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-0 py-4">
          {/* Tab Navigation */}
          <TabNavigation value={selectedTab} onValueChange={setSelectedTab} />

          <AnimatePresence mode="wait">
            {selectedTab === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
                data-search-content
              >
                {/* Search Input - Always visible, never shows loading */}
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSubmit={handleSearchSubmit}
                />

                {/* Default Instructions - Show when no search term */}
                {!searchTerm.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-7xl mx-auto"
                  >
                    <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-6 sm:p-8">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-500/20 rounded-lg flex-shrink-0">
                            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                              Discover Amazing Recipes
                            </h3>
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                              Search through thousands of delicious recipes from around the world. 
                              Find recipes by ingredients, cuisine, dietary preferences, or simply 
                              type what you're craving!
                            </p>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-purple-300 mb-2">Try searching for:</p>
                              <ul className="space-y-1 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                  <span className="text-purple-400">•</span>
                                  <span>Recipe names (e.g., "pasta", "chicken curry")</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="text-purple-400">•</span>
                                  <span>Ingredients (e.g., "tomatoes", "chicken")</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="text-purple-400">•</span>
                                  <span>Cuisines (e.g., "italian", "chinese", "mexican")</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="text-purple-400">•</span>
                                  <span>Dietary preferences (e.g., "vegan", "gluten-free")</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Error Message */}
                <ErrorMessage message={apiError} />

                {/* Search Results Metadata */}
                {!isSearching && recipes.length > 0 && searchResponse && (
                  <SearchResultsMetadata
                    searchResponse={searchResponse}
                    currentResultsCount={recipes.length}
                    searchTerm={searchTerm}
                    className="mb-4"
                  />
                )}

                {/* Recipe Grid */}
                {isSearching ? (
                  <SkeletonRecipeGrid count={8} />
                ) : recipes.length > 0 ? (
                  <RecipeGrid
                    recipes={recipes}
                    favouriteRecipes={favouriteRecipes}
                    onFavouriteToggle={handleFavouriteToggle}
                  />
                ) : null}

                {/* View More Button - Show if there are more results available */}
                {recipes.length > 0 &&
                  searchResponse?.totalResults &&
                  recipes.length < searchResponse.totalResults && (
                    <ViewMoreButton
                      onClick={handleViewMoreClick}
                      isLoading={isSearching}
                    />
                  )}
              </motion.div>
            )}

            {selectedTab === "favourites" && (
              <motion.div
                key="favourites"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                data-favourites-content
              >
                {isLoadingFavourites ? (
                  <SkeletonRecipeGrid count={4} />
                ) : favouriteRecipes.length === 0 ? (
                  <EmptyState
                    message="No Favourite Recipes Yet"
                    subtitle={
                      isAuthenticated
                        ? "Start exploring and add recipes you love to your favourites! 🍳✨"
                        : "Hey there, food explorer! 👋 To see your favourite recipes, you'll need to login first. Don't worry, it's quick and easy! Once you're in, you can save all those delicious recipes that make your taste buds dance. 🎉 Just click the Login button above and let's get cooking! 🚀"
                    }
                    fullWidth={true}
                  />
                ) : (
                  <RecipeGrid
                    recipes={favouriteRecipes as Recipe[]}
                    favouriteRecipes={favouriteRecipes as Recipe[]}
                    onFavouriteToggle={handleFavouriteToggle}
                  />
                )}
              </motion.div>
            )}

            {selectedTab === "collections" && (
              <motion.div
                key="collections"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {isAuthenticated ? (
                  selectedCollection ? (
                    <Suspense fallback={<SkeletonRecipeGrid count={4} />}>
                      <CollectionDetailView
                        collection={selectedCollection}
                        onBack={() => setSelectedCollection(undefined)}
                        onDelete={() => {
                          setSelectedCollection(undefined);
                        }}
                      />
                    </Suspense>
                  ) : (
                    <Suspense fallback={<SkeletonRecipeGrid count={4} />}>
                      <CollectionManager
                        onCollectionSelect={(collection) =>
                          setSelectedCollection(collection)
                        }
                      />
                    </Suspense>
                  )
                ) : (
                  <EmptyState
                    message="Login Required"
                    subtitle="Please login to create and manage your recipe collections!"
                  />
                )}
              </motion.div>
            )}

            {selectedTab === "meal-plan" && (
              <motion.div
                key="meal-plan"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {isAuthenticated ? (
                  <Suspense fallback={<SkeletonMealPlanner />}>
                    <MealPlanner />
                  </Suspense>
                ) : (
                  <EmptyState
                    message="Login Required"
                    subtitle="Please login to create and manage your weekly meal plans!"
                  />
                )}
              </motion.div>
            )}

            {selectedTab === "shopping" && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {isAuthenticated ? (
                  <Suspense fallback={<SkeletonShoppingList />}>
                    <ShoppingListGenerator />
                  </Suspense>
                ) : (
                  <EmptyState
                    message="Login Required"
                    subtitle="Please login to generate and manage your shopping lists!"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default AppContent;

