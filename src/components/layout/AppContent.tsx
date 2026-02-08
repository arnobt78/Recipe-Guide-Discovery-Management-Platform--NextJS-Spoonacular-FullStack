/**
 * AppContent Component
 *
 * Main application content (extracted from App.tsx for Next.js migration)
 * This component contains all the main UI logic
 */

"use client";

import {
  FormEvent,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecipeContext } from "../../context/RecipeContext";
import { useAuth } from "../../context/AuthContext";
import TabNavigation from "./TabNavigation";
import RecipeGrid from "../recipes/RecipeGrid";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import ViewMoreButton from "../common/ViewMoreButton";
import HeroHeader from "./HeroHeader";
import HeroSearchSection from "../hero/HeroSearchSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import SkeletonRecipeGrid from "../skeletons/SkeletonRecipeGrid";
import SkeletonMealPlanner from "../skeletons/SkeletonMealPlanner";
import SkeletonShoppingList from "../skeletons/SkeletonShoppingList";
import {
  useSearchRecipes,
  useAISearchRecipes,
  useFavouriteRecipes,
  useAddFavouriteRecipe,
  useRemoveFavouriteRecipe,
} from "../../hooks/useRecipes";
import { usePostHog } from "../../hooks/usePostHog";
import {
  Recipe,
  SearchRecipesResponse,
  WeatherSuggestionsResponse,
} from "../../types";
import { toast } from "sonner";
import { ChefHat, Cloud } from "lucide-react";
import SearchResultsMetadata from "../search/SearchResultsMetadata";
import { Badge } from "../ui/badge";

// Code splitting: Lazy load large components that are conditionally rendered
const CollectionManager = lazy(
  () => import("../collections/CollectionManager"),
);
const CollectionDetailView = lazy(
  () => import("../collections/CollectionDetailView"),
);
const MealPlanner = lazy(() => import("../meal-planning/MealPlanner"));
const ShoppingListGenerator = lazy(
  () => import("../shopping/ShoppingListGenerator"),
);

/**
 * Main App Content (wrapped in RecipeProvider and AuthProvider)
 */
const AppContent = () => {
  // Track if component is mounted to prevent hydration mismatches
  // React Query cache can cause server/client mismatch, so we render search results only after mount
  const [isMounted, setIsMounted] = useState(false);

  // Weather state - stores weather data from WeatherWidget in hero section
  // Weather recipes are displayed in the tab content area
  const [weatherData, setWeatherData] =
    useState<WeatherSuggestionsResponse | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<Error | null>(null);
  const [searchMode, setSearchMode] = useState<"search" | "weather">("search");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle weather data changes from WeatherWidget
  const handleWeatherDataChange = useCallback(
    (
      data: WeatherSuggestionsResponse | null,
      isLoading: boolean,
      error: Error | null,
    ) => {
      setWeatherData(data);
      setIsWeatherLoading(isLoading);
      setWeatherError(error);
    },
    [],
  );

  // Handle search mode change from HeroSearchSection
  const handleSearchModeChange = useCallback((mode: "search" | "weather") => {
    setSearchMode(mode);
  }, []);

  const {
    selectedCollection,
    setSelectedCollection,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,
    currentPage,
    setCurrentPage,
    searchFilters,
    setSearchFilters,
  } = useRecipeContext();

  const { isAuthenticated } = useAuth();
  const { trackSearch } = usePostHog();

  // Detect if query is natural language (should use AI search)
  // Natural language queries: longer than 15 chars, contain common words like "for", "with", "healthy", "quick", etc.
  const shouldUseAISearch = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 3) return false;
    const trimmed = searchTerm.trim();
    const naturalLanguageIndicators = [
      " for ",
      " with ",
      " without ",
      " healthy ",
      " quick ",
      " easy ",
      " dinner ",
      " lunch ",
      " breakfast ",
      " snack ",
      " vegetarian ",
      " vegan ",
      " gluten-free ",
      " under ",
      " less than ",
      " minutes ",
    ];
    // Use AI search if query is longer than 15 chars OR contains natural language indicators
    return (
      trimmed.length > 15 ||
      naturalLanguageIndicators.some((indicator) =>
        trimmed.toLowerCase().includes(indicator),
      )
    );
  }, [searchTerm]);

  // Use AI search for natural language queries, regular search otherwise
  const {
    data: aiSearchResponse,
    isLoading: isAISearching,
    error: aiSearchError,
  } = useAISearchRecipes(
    searchTerm,
    !!searchTerm && selectedTab === "search" && shouldUseAISearch,
  );

  // Check if filters are applied (has any filter values)
  const hasActiveFilters = useMemo(() => {
    if (!searchFilters || Object.keys(searchFilters).length === 0) return false;
    // Check if any filter has a value (not empty/undefined)
    return Object.values(searchFilters).some(
      (value) => value !== undefined && value !== null && value !== "",
    );
  }, [searchFilters]);

  const {
    data: regularSearchResponse,
    isLoading: isRegularSearching,
    error: regularSearchError,
  } = useSearchRecipes(
    searchTerm || (hasActiveFilters ? "recipes" : ""), // Use "recipes" as fallback when only filters are applied
    currentPage,
    selectedTab === "search" &&
      !shouldUseAISearch &&
      (!!searchTerm || hasActiveFilters),
    searchFilters && Object.keys(searchFilters).length > 0
      ? searchFilters
      : undefined,
  );

  // Use AI search results if AI search was used, otherwise use regular search
  const searchResponse = shouldUseAISearch
    ? aiSearchResponse
    : regularSearchResponse;
  const isSearching = shouldUseAISearch ? isAISearching : isRegularSearching;
  const searchError = shouldUseAISearch ? aiSearchError : regularSearchError;

  // Track search results in PostHog when they arrive
  useEffect(() => {
    if (
      selectedTab === "search" &&
      searchTerm.trim() &&
      searchResponse &&
      !isSearching
    ) {
      if (shouldUseAISearch && aiSearchResponse?.results) {
        trackSearch(searchTerm.trim(), aiSearchResponse.results.length);
      } else if (
        !shouldUseAISearch &&
        (searchResponse as SearchRecipesResponse)?.totalResults
      ) {
        const totalResults =
          (searchResponse as SearchRecipesResponse).totalResults || 0;
        if (totalResults > 0) {
          trackSearch(searchTerm.trim(), totalResults);
        }
      }
    }
  }, [
    searchResponse,
    aiSearchResponse,
    searchTerm,
    selectedTab,
    shouldUseAISearch,
    isSearching,
    trackSearch,
  ]);

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
          "Daily API limit reached. Please try again later or upgrade your plan.",
        );
      } else if (
        error?.message?.includes("AI search") ||
        error?.message?.includes("OpenRouter")
      ) {
        // AI search failed, fallback to regular search is handled automatically
        toast.error("AI search unavailable. Using regular search instead.");
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
    if (
      selectedTab === "favourites" &&
      typeof window !== "undefined" &&
      window.innerWidth < 768
    ) {
      // Small delay to ensure DOM is ready and content is rendered
      const scrollTimer = setTimeout(() => {
        const favouritesContent = document.querySelector(
          "[data-favourites-content]",
        );
        if (favouritesContent) {
          favouritesContent.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
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
  const lastFiltersRef = useRef<string>("");

  // Reset accumulated recipes when search term or filters change
  useEffect(() => {
    const filtersKey = JSON.stringify(searchFilters || {});
    if (
      searchTerm !== lastSearchTermRef.current ||
      filtersKey !== lastFiltersRef.current
    ) {
      allRecipesRef.current = [];
      lastPageRef.current = 0;
      lastSearchTermRef.current = searchTerm;
      lastFiltersRef.current = filtersKey;
    }
  }, [searchTerm, searchFilters]);

  // Accumulate recipes from all pages (only for regular search, AI search returns page 1 only)
  const recipes = useMemo(() => {
    // If no search response yet, return empty array
    if (!searchResponse) {
      return [];
    }

    // If response has no results array, return empty array
    if (!Array.isArray(searchResponse.results)) {
      return [];
    }

    const currentPageResults = searchResponse.results;

    // For AI search, always use the results directly (no pagination accumulation)
    if (searchResponse.aiOptimized) {
      return currentPageResults;
    }

    // For regular search, accumulate results across pages
    // Check if filters or search term changed (indicates new search)
    const filtersKey = JSON.stringify(searchFilters || {});
    const isNewSearch =
      searchTerm !== lastSearchTermRef.current ||
      filtersKey !== lastFiltersRef.current;

    if (isNewSearch || currentPage === 1) {
      // Reset on new search (new search term or filters changed)
      allRecipesRef.current = currentPageResults;
      lastPageRef.current = currentPage;
    } else if (currentPage > lastPageRef.current) {
      // If this is a new page, add to accumulated results
      allRecipesRef.current = [...allRecipesRef.current, ...currentPageResults];
      lastPageRef.current = currentPage;
    }

    return allRecipesRef.current;
  }, [searchResponse, currentPage, searchTerm, searchFilters]) as Recipe[];

  const apiError = useMemo(
    () =>
      (searchResponse as SearchRecipesResponse)?.status === "failure" ||
      (searchResponse as SearchRecipesResponse)?.code === 402
        ? (searchResponse as SearchRecipesResponse)?.message ||
          "Daily API limit reached. Please try again later."
        : "",
    [searchResponse],
  );

  // Memoized event handlers
  const handleSearchSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!searchTerm.trim()) return;
      setCurrentPage(1);

      // Track search in PostHog
      trackSearch(searchTerm.trim());
    },
    [searchTerm, setCurrentPage, trackSearch],
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
          },
        );
        return;
      }

      if (isFavourite) {
        removeFavouriteMutation.mutate(recipe);
      } else {
        addFavouriteMutation.mutate(recipe);
      }
    },
    [isAuthenticated, addFavouriteMutation, removeFavouriteMutation],
  );

  return (
    <div
      className="min-h-screen min-w-0 w-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex flex-col"
      style={{
        backgroundImage: "url(/recipe-bg-4.avif)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Navbar - Sticky at top */}
      <Navbar />

      {/* Full-width Hero Section with Search Toggle */}
      <HeroHeader subtitle="Discover & Save Your Favourite Recipes">
        <HeroSearchSection
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          searchFilters={searchFilters}
          onFiltersChange={setSearchFilters}
          onApplyFilters={() => {
            if (searchTerm.trim()) {
              setCurrentPage(1);
            }
          }}
          isSearching={isSearching}
          onWeatherDataChange={handleWeatherDataChange}
          onSearchModeChange={handleSearchModeChange}
        />
      </HeroHeader>

      {/* Main Content - Flex grow to fill remaining space, full width with inner constraint */}
      <div className="w-full min-w-0 flex-1 overflow-hidden">
        <div className="max-w-9xl w-full mx-auto px-2 sm:px-4 md:px-6 xl:px-8 py-4 min-w-0">
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
                suppressHydrationWarning
              >
                {/* Content area - wrapped to prevent hydration mismatches */}
                <div suppressHydrationWarning>
                  {/* Weather-Based Recipe Suggestions - Show when weather mode is active */}
                  {isMounted && searchMode === "weather" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full mx-auto space-y-6"
                    >
                      {/* Loading State */}
                      {isWeatherLoading && <SkeletonRecipeGrid count={6} />}

                      {/* Error State */}
                      {weatherError && !isWeatherLoading && (
                        <Card className="bg-slate-800/50 border-red-500/30 p-4">
                          <CardContent className="p-6 text-center">
                            <p className="text-red-400 mb-2">
                              Failed to load weather suggestions
                            </p>
                            <p className="text-sm text-gray-400">
                              {weatherError.message || "Please try again later"}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Weather Recipe Suggestions */}
                      {weatherData && !isWeatherLoading && !weatherError && (
                        <>
                          {weatherData.suggestions &&
                          weatherData.suggestions.length > 0 ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                  Perfect Recipes for This Weather
                                </h3>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {weatherData.suggestions.length} recipes
                                </Badge>
                              </div>
                              <RecipeGrid
                                recipes={weatherData.suggestions}
                                favouriteRecipes={favouriteRecipes}
                                onFavouriteToggle={handleFavouriteToggle}
                              />
                            </div>
                          ) : weatherData.apiLimitReached ? (
                            <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
                              <CardContent className="p-4 sm:p-6 text-center">
                                <div className="space-y-3">
                                  <div className="p-3 bg-amber-500/20 rounded-lg inline-block mx-auto">
                                    <Cloud className="h-8 w-8 text-amber-400 mx-auto" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-white">
                                    API Limit Reached
                                  </h3>
                                  <p className="text-sm text-gray-300">
                                    {weatherData.message ||
                                      "Daily API limit reached. Recipe suggestions will be available tomorrow."}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    Weather data is still available above. You
                                    can still search for recipes manually using
                                    the search bar!
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ) : !weatherData.weather ? (
                            // No location set yet - show instructions
                            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 p-4 sm:p-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex-shrink-0 flex items-center">
                                    <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent text-start break-words mb-3">
                                      Weather-Based Recipe Suggestions
                                    </h3>
                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 break-words">
                                      Enter your city above or allow location
                                      access to get AI-powered recipe
                                      suggestions perfect for your current
                                      weather! Hot day? Get refreshing salads.
                                      Cold and rainy? Warm soups await!
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ) : (
                            // Weather loaded but no suggestions
                            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
                              <CardContent className="p-4 sm:p-6 text-center">
                                <div className="space-y-3">
                                  <div className="p-3 bg-blue-500/20 rounded-lg inline-block mx-auto">
                                    <Cloud className="h-8 w-8 text-blue-400 mx-auto" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-white">
                                    No Weather Suggestions Available
                                  </h3>
                                  <p className="text-sm text-gray-300">
                                    Try refreshing or check your location
                                    settings.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}

                      {/* No data yet - show placeholder */}
                      {!weatherData && !isWeatherLoading && !weatherError && (
                        <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 p-4 sm:p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex-shrink-0 flex items-center">
                                <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent text-start break-words mb-3">
                                  Weather-Based Recipe Suggestions
                                </h3>
                                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 break-words">
                                  Enter your city above or allow location access
                                  to get AI-powered recipe suggestions perfect
                                  for your current weather! Hot day? Get
                                  refreshing salads. Cold and rainy? Warm soups
                                  await!
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </motion.div>
                  )}

                  {/* Default Instructions - Show when search mode is active and no search term */}
                  {isMounted &&
                    searchMode === "search" &&
                    !searchTerm.trim() &&
                    !hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full mx-auto"
                      >
                        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 sm:p-6 min-w-0 overflow-hidden">
                          <div className="space-y-4">
                            {/* Icon inline beside title - same as Recipe Search */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex-shrink-0 flex items-center">
                                <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                              </div>
                              <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent text-start break-words">
                                Discover Amazing Recipes
                              </h3>
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 break-words">
                                  Use the search bar above to find your perfect
                                  recipe! Search through thousands of delicious
                                  recipes from around the world by ingredients,
                                  cuisine, dietary preferences, or simply type
                                  what you&apos;re craving! Use natural language
                                  for smarter AI-powered searches.
                              </p>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-purple-300 mb-2">
                                  Try searching for:
                                </p>
                                <ul className="space-y-1 text-sm text-gray-400">
                                  <li className="flex items-center gap-2">
                                    <span className="text-purple-400">•</span>
                                    <span>
                                      Recipe names (e.g., &quot;pasta&quot;,
                                      &quot;chicken curry&quot;)
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="text-purple-400">•</span>
                                    <span>
                                      Ingredients (e.g., &quot;tomatoes&quot;,
                                      &quot;chicken&quot;)
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="text-purple-400">•</span>
                                    <span>
                                      Natural language (e.g., &quot;quick
                                      healthy dinner&quot;, &quot;pasta with
                                      tomatoes for 2&quot;)
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}

                  {/* Error Message - Only show in search mode */}
                  {searchMode === "search" && (
                    <ErrorMessage message={apiError} />
                  )}

                  {/* API Limit Reached Message - Only show in search mode */}
                  {searchMode === "search" &&
                    searchResponse &&
                    "apiLimitReached" in searchResponse &&
                    searchResponse.apiLimitReached && (
                      <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
                        <CardContent className="p-4 sm:p-6 text-center">
                          <div className="space-y-3">
                            <div className="p-3 bg-amber-500/20 rounded-lg inline-block mx-auto">
                              <ChefHat className="h-8 w-8 text-amber-400 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                              API Limit Reached
                            </h3>
                            <p className="text-sm text-gray-300">
                              {searchResponse.message ||
                                "Daily API limit reached. Recipe search will be available tomorrow."}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              All API keys have reached their daily limit.
                              Please try again tomorrow or upgrade your
                              Spoonacular plan for more daily points.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Search Results Metadata - Only render after mount in search mode */}
                  {isMounted &&
                    searchMode === "search" &&
                    !isSearching &&
                    recipes.length > 0 &&
                    searchResponse &&
                    !(
                      "apiLimitReached" in searchResponse &&
                      searchResponse.apiLimitReached
                    ) && (
                      <SearchResultsMetadata
                        searchResponse={searchResponse}
                        currentResultsCount={recipes.length}
                        searchTerm={searchTerm}
                        className="mb-4"
                      />
                    )}

                  {/* Recipe Grid - Only render after mount in search mode */}
                  {searchMode === "search" && (
                    <>
                      {!isMounted ? (
                        // During SSR/initial hydration: always show skeleton to ensure server/client match
                        // This prevents React Query cache from causing hydration mismatches
                        // We show skeleton regardless of searchTerm to ensure consistent rendering
                        <SkeletonRecipeGrid count={8} />
                      ) : isSearching ? (
                        <SkeletonRecipeGrid count={8} />
                      ) : recipes.length > 0 &&
                        !(
                          searchResponse &&
                          "apiLimitReached" in searchResponse &&
                          searchResponse.apiLimitReached
                        ) ? (
                        <RecipeGrid
                          recipes={recipes}
                          favouriteRecipes={favouriteRecipes}
                          onFavouriteToggle={handleFavouriteToggle}
                        />
                      ) : isMounted &&
                        !isSearching &&
                        searchResponse &&
                        !(
                          "apiLimitReached" in searchResponse &&
                          searchResponse.apiLimitReached
                        ) &&
                        recipes.length === 0 ? (
                        // Empty state when no results found
                        <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border-purple-500/30">
                          <CardContent className="p-4 sm:p-8 text-center">
                            <div className="space-y-4">
                              <div className="p-4 bg-purple-500/20 rounded-full inline-block mx-auto">
                                <ChefHat className="h-8 w-8 text-purple-400 mx-auto" />
                              </div>
                              <h3 className="text-xl font-bold text-white">
                                {hasActiveFilters
                                  ? "No recipes found with these filters"
                                  : searchTerm.trim()
                                    ? `No recipes found for "${searchTerm}"`
                                    : "No recipes found"}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {hasActiveFilters
                                  ? "Try adjusting your filters or search for something else."
                                  : searchTerm.trim()
                                    ? "Try a different search term or browse our recipe collection."
                                    : "Start searching to discover amazing recipes!"}
                              </p>
                              {hasActiveFilters && (
                                <div className="pt-4">
                                  <Button
                                    onClick={() => {
                                      setSearchFilters({});
                                      setCurrentPage(1);
                                      toast.success(
                                        "Filters cleared. Showing all results.",
                                      );
                                    }}
                                    variant="outline"
                                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 hover:text-white"
                                  >
                                    Clear Filters
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ) : null}
                    </>
                  )}
                </div>

                {/* View More Button - Show if there are more results available (only for regular search, not AI search) */}
                {/* Only render after mount in search mode */}
                {isMounted &&
                  searchMode === "search" &&
                  recipes.length > 0 &&
                  searchResponse?.totalResults &&
                  recipes.length < searchResponse.totalResults &&
                  !searchResponse?.aiOptimized && (
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
                suppressHydrationWarning
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
                suppressHydrationWarning
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
                suppressHydrationWarning
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
                suppressHydrationWarning
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppContent;
