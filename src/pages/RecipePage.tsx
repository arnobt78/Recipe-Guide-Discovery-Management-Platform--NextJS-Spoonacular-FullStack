/**
 * Recipe Page Component
 * 
 * Full-page view for displaying individual recipe details.
 * Features:
 * - Uses React Router for navigation
 * - Browser default scroll (no fixed heights)
 * - Responsive design (phone-screen and sm:screen)
 * - All recipe information displayed in an interesting, user-friendly way
 * - Reuses existing hooks and components
 */

import { memo, useMemo, useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useRecipeSummary, useRecipeInformation, useSimilarRecipes } from "../hooks/useRecipes";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  ChefHat,
  UtensilsCrossed,
  Heart,
  FileText,
  FolderPlus,
  Image as ImageIcon,
  Clock,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Info,
  ExternalLink,
  Leaf,
  Wheat,
  Droplet,
  Flame,
  CheckCircle,
  XCircle,
  Wine,
  ShoppingCart,
  List,
  Scale,
  FlaskConical,
  Flower2,
} from "lucide-react";
import { Recipe } from "../types";
import { 
  capitalizeWords, 
  addTargetBlankToLinks,
  removeSimilarRecipesFromSummary,
} from "../utils/stringUtils";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useIsFavourite } from "../hooks/useIsFavourite";
import { useFavouriteRecipes, useAddFavouriteRecipe, useRemoveFavouriteRecipe } from "../hooks/useRecipes";
import SkeletonRecipeDetail from "../components/SkeletonRecipeDetail";
import SimilarRecipesList from "../components/SimilarRecipesList";

// Code splitting: Lazy load sub-components that are conditionally rendered
const RecipeNotes = lazy(() => import("../components/RecipeNotes"));
const RecipeImageGallery = lazy(() => import("../components/RecipeImageGallery"));
const AddToCollectionDialog = lazy(() => import("../components/AddToCollectionDialog"));

/**
 * Recipe Page Component (Memoized for performance)
 * 
 * Displays recipe details in a full-page layout with:
 * - Browser default scroll (no fixed heights)
 * - Responsive design
 * - All recipe information from API
 */
const RecipePage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  // Get active tab from URL query params (for state persistence per REACT_QUERY_SETUP_GUIDE.md)
  const activeTab = searchParams.get("tab") || "summary";
  
  // Handle tab change with query params sync
  const handleTabChange = useCallback((value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  }, [setSearchParams]);

  // Fetch recipe data
  // First, we need basic recipe info to construct Recipe object
  // For now, we'll use the recipe ID to fetch full information
  const { 
    data: recipeInfo, 
    isLoading: isLoadingInfo, 
    error: infoError 
  } = useRecipeInformation(
    id || "", 
    {
      includeNutrition: true,
      addWinePairing: true,
      addTasteData: true,
    },
    !!id
  );

  // Use similar recipes endpoint
  const { 
    data: similarRecipes = [], 
    isLoading: isLoadingSimilar 
  } = useSimilarRecipes(id || "", 10, !!id);

  // Fallback to summary for summary text if needed
  const { data: recipeSummary } = useRecipeSummary(id || "", !!id);

  // Get favourite recipes to check if current recipe is favourite
  const { data: favouriteRecipes = [] } = useFavouriteRecipes();
  const addFavouriteMutation = useAddFavouriteRecipe();
  const removeFavouriteMutation = useRemoveFavouriteRecipe();

  // Construct Recipe object from recipeInfo for compatibility
  const recipe: Recipe | undefined = useMemo(() => {
    if (!recipeInfo) return undefined;
    return {
      id: recipeInfo.id,
      title: recipeInfo.title,
      image: recipeInfo.image || "/hero-image.webp",
      imageType: recipeInfo.imageType || "jpg",
    };
  }, [recipeInfo]);

  const isFavourite = useIsFavourite(recipe, favouriteRecipes);

  // Handle errors
  useEffect(() => {
    if (infoError) {
      toast.error("Failed to load recipe details. Please try again.");
    }
  }, [infoError]);

  // Redirect if no ID
  useEffect(() => {
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);

  // Determine loading state
  const isLoading = isLoadingInfo || isLoadingSimilar;

  // Memoized computed values
  const capitalizedTitle = useMemo(
    () => capitalizeWords(recipeInfo?.title || recipeSummary?.title || ""),
    [recipeInfo?.title, recipeSummary?.title]
  );

  // Use summary from recipeInfo if available, otherwise fallback to recipeSummary
  const summaryText = useMemo(
    () => recipeInfo?.summary || recipeSummary?.summary || "",
    [recipeInfo?.summary, recipeSummary?.summary]
  );

  // Remove similar recipes text from summary since we display them separately
  const cleanedSummary = useMemo(
    () => removeSimilarRecipesFromSummary(summaryText),
    [summaryText]
  );

  const summaryWithTargetBlank = useMemo(
    () => addTargetBlankToLinks(cleanedSummary),
    [cleanedSummary]
  );

  // Get source URL directly from API
  const sourceUrl = useMemo(
    () => recipeInfo?.sourceUrl || null,
    [recipeInfo?.sourceUrl]
  );

  // Extract key information from summary HTML for badges
  const extractSummaryInfo = useMemo(() => {
    if (!summaryText) return null;

    const summary = summaryText.toLowerCase();
    const info: {
      calories?: string;
      protein?: string;
      fat?: string;
      servings?: string;
      price?: string;
      time?: string;
      score?: string;
    } = {};

    const caloriesMatch = summary.match(/(\d+)\s*calories/);
    if (caloriesMatch) info.calories = caloriesMatch[1];

    const proteinMatch = summary.match(/(\d+g)\s*of\s*protein/);
    if (proteinMatch) info.protein = proteinMatch[1];

    const fatMatch = summary.match(/(\d+g)\s*of\s*fat/);
    if (fatMatch) info.fat = fatMatch[1];

    const servingsMatch = summary.match(/serves\s*(\d+)/);
    if (servingsMatch) info.servings = servingsMatch[1];

    const priceMatch = summary.match(/\$([\d.]+)\s*per\s*serving/);
    if (priceMatch) info.price = `$${priceMatch[1]}`;

    const timeMatch = summary.match(/(\d+)\s*minutes/);
    if (timeMatch) info.time = `${timeMatch[1]} min`;

    const scoreMatch = summary.match(/(\d+)%[^%]*spoonacular/);
    if (scoreMatch) info.score = `${scoreMatch[1]}%`;

    return info;
  }, [summaryText]);

  // Handle favourite toggle (memoized with useCallback for performance)
  const handleToggleFavourite = useCallback(() => {
    if (!recipe) return;
    
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
  }, [recipe, isAuthenticated, isFavourite, removeFavouriteMutation, addFavouriteMutation]);

  if (!recipe && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 mb-4">Recipe not found.</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-purple-500/20 text-gray-400 hover:text-purple-400"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text flex-1 truncate">
              {capitalizedTitle || "Recipe Details"}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavourite}
                className="hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
              >
                <Heart
                  className={`h-5 w-5 ${isFavourite ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddToCollection(true)}
                  className="hover:bg-purple-500/20 text-gray-400 hover:text-purple-400"
                  aria-label="Add to collection"
                  title="Add to collection"
                >
                  <FolderPlus className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Browser scroll, no fixed heights */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {isLoading ? (
          <SkeletonRecipeDetail />
        ) : (recipeInfo || recipeSummary) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="space-y-6"
          >
            {/* Hero Image Section */}
            <Card className="glow-card border-purple-500/30 overflow-hidden">
              <div className="relative aspect-video sm:aspect-[21/9]">
                <img
                  src={recipeInfo?.image || recipe?.image || "/hero-image.webp"}
                  alt={recipeInfo?.title || recipe?.title || "Recipe"}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Decorative SVG Icons Overlay */}
                {/* Chef icon - Top left */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <motion.img
                    src="/chef.svg"
                    alt="Chef"
                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 opacity-70 drop-shadow-2xl"
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 0.7, scale: 1, x: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeOut",
                      delay: 0.2
                    }}
                    whileHover={{ 
                      opacity: 0.9, 
                      scale: 1.1,
                      transition: { duration: 0.3 }
                    }}
                  />
                </div>
                
                {/* Cooking icon - Bottom right */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                  <motion.img
                    src="/cooking.svg"
                    alt="Cooking"
                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 opacity-70 drop-shadow-2xl"
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 0.7, scale: 1, x: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeOut",
                      delay: 0.4
                    }}
                    whileHover={{ 
                      opacity: 0.9, 
                      scale: 1.1,
                      transition: { duration: 0.3 }
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Tabs Section */}
            <Card className="glow-card border-purple-500/30">
              <CardContent className="p-4 sm:p-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList
                    className={`grid w-full mb-6 bg-slate-800/50 ${
                      // Dynamic grid columns based on available tabs
                      (() => {
                        let count = 3; // Summary, Info, Details (always present)
                        if (recipeInfo?.nutrition) count++;
                        if (recipeInfo?.taste) count++;
                        if (isAuthenticated) count += 2; // Notes, Images
                        // Responsive grid: 2 cols on mobile, 3-4 on sm, full on lg
                        if (count <= 3) return "grid-cols-2 sm:grid-cols-3";
                        if (count <= 4) return "grid-cols-2 sm:grid-cols-4";
                        if (count <= 5) return "grid-cols-3 sm:grid-cols-5";
                        return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-7";
                      })()
                    }`}
                  >
                    <TabsTrigger value="summary" className="flex items-center gap-2 text-xs sm:text-sm">
                      <UtensilsCrossed className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Summary</span>
                    </TabsTrigger>
                    <TabsTrigger value="info" className="flex items-center gap-2 text-xs sm:text-sm">
                      <ChefHat className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2 text-xs sm:text-sm">
                      <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Details</span>
                    </TabsTrigger>
                    {recipeInfo?.nutrition && (
                      <TabsTrigger value="nutrition" className="flex items-center gap-2 text-xs sm:text-sm">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Nutrition</span>
                      </TabsTrigger>
                    )}
                    {recipeInfo?.taste && (
                      <TabsTrigger value="taste" className="flex items-center gap-2 text-xs sm:text-sm">
                        <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Taste</span>
                      </TabsTrigger>
                    )}
                    {isAuthenticated && (
                      <>
                        <TabsTrigger value="notes" className="flex items-center gap-2 text-xs sm:text-sm">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Notes</span>
                        </TabsTrigger>
                        <TabsTrigger value="images" className="flex items-center gap-2 text-xs sm:text-sm">
                          <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Images</span>
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  {/* Summary Tab */}
                  <TabsContent value="summary" className="space-y-6 mt-0 transition-opacity duration-300">
                    {/* Data Source Note */}
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-300 leading-relaxed">
                          <span className="font-semibold">Note:</span> All nutritional information, pricing, and recipe details are fetched directly from the Spoonacular API and may differ from values shown on the Spoonacular website due to caching, calculation methods, or data synchronization timing.
                        </p>
                      </div>
                    </div>
                    
                    {/* Key Info Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {/* Calories */}
                      {(() => {
                        const caloriesNutrient = recipeInfo?.nutrition?.nutrients?.find(n => {
                          const name = n.name.toLowerCase();
                          return name === 'calories' || name.includes('calories');
                        });
                        const caloriesValue = caloriesNutrient?.amount 
                          ? Math.round(caloriesNutrient.amount)
                          : extractSummaryInfo?.calories;
                        return caloriesValue ? (
                          <Card className="bg-slate-800/50 border-purple-500/20 p-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-purple-400" />
                              <div>
                                <p className="text-xs text-gray-400">Calories</p>
                                <p className="text-sm font-semibold text-white">
                                  {caloriesValue}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ) : null;
                      })()}
                      {/* Protein */}
                      {(() => {
                        const proteinNutrient = recipeInfo?.nutrition?.nutrients?.find(n => {
                          const name = n.name.toLowerCase();
                          return name === 'protein' || name.includes('protein');
                        });
                        const proteinValue = proteinNutrient?.amount
                          ? `${Math.round(proteinNutrient.amount)}g`
                          : extractSummaryInfo?.protein;
                        return proteinValue ? (
                          <Card className="bg-slate-800/50 border-purple-500/20 p-3">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-pink-400" />
                              <div>
                                <p className="text-xs text-gray-400">Protein</p>
                                <p className="text-sm font-semibold text-white">
                                  {proteinValue}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ) : null;
                      })()}
                      {/* Time */}
                      {(recipeInfo?.readyInMinutes || extractSummaryInfo?.time) && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-400">Time</p>
                              <p className="text-sm font-semibold text-white">
                                {recipeInfo?.readyInMinutes 
                                  ? `${recipeInfo.readyInMinutes} min`
                                  : extractSummaryInfo?.time || "N/A"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {/* Servings */}
                      {(recipeInfo?.servings || extractSummaryInfo?.servings) && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-400" />
                            <div>
                              <p className="text-xs text-gray-400">Serves</p>
                              <p className="text-sm font-semibold text-white">
                                {recipeInfo?.servings || extractSummaryInfo?.servings || "N/A"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>

                    {/* Summary Content */}
                    <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-relaxed overflow-x-hidden break-words">
                      <div className="overflow-x-hidden break-words" dangerouslySetInnerHTML={{ __html: summaryWithTargetBlank }} />
                    </div>

                    {/* Additional Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      {/* Price */}
                      {(recipeInfo?.pricePerServing || extractSummaryInfo?.price) && (
                        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="text-sm text-gray-400">Price per Serving</p>
                              <p className="text-lg font-bold text-white">
                                {recipeInfo?.pricePerServing 
                                  ? `$${(recipeInfo.pricePerServing / 100).toFixed(2)}`
                                  : extractSummaryInfo?.price || "N/A"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {/* Spoonacular Score */}
                      {(recipeInfo?.spoonacularScore || extractSummaryInfo?.score) && (
                        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 p-4">
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <div>
                              <p className="text-sm text-gray-400">Spoonacular Score</p>
                              <p className="text-lg font-bold text-white">
                                {recipeInfo?.spoonacularScore 
                                  ? `${Math.round(recipeInfo.spoonacularScore)}%`
                                  : extractSummaryInfo?.score || "N/A"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>

                    {/* Main Recipe Source Link */}
                    {sourceUrl && (
                      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 p-4 mt-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                            <ExternalLink className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-400 mb-2">View Full Recipe on Original Source</p>
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 underline break-words block mb-2 font-semibold"
                            >
                              {recipeInfo?.sourceName || new URL(sourceUrl).hostname.replace('www.', '')}
                            </a>
                            <p className="text-xs text-gray-500 mb-2">
                              This is the original recipe source where this recipe was first published.
                            </p>
                            {recipeInfo?.spoonacularSourceUrl && (
                              <div className="mt-2 pt-2 border-t border-green-500/20">
                                <p className="text-xs text-gray-400 mb-1">Also available on:</p>
                                <a
                                  href={recipeInfo.spoonacularSourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 underline text-xs break-words"
                                >
                                  Spoonacular Recipe Page
                                </a>
                              </div>
                            )}
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs mt-2">
                              Original Source
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Similar Recipe Links - Reusable component */}
                    <SimilarRecipesList similarRecipes={similarRecipes} className="mt-6" />
                  </TabsContent>

                  {/* Info Tab - Reuse content from RecipeDetailCard */}
                  <TabsContent value="info" className="space-y-6 mt-0 transition-opacity duration-300">
                    {/* Health & Diet Information */}
                    {(recipeInfo?.healthScore || recipeInfo?.veryHealthy || recipeInfo?.diets?.length || 
                      recipeInfo?.vegan || recipeInfo?.vegetarian || recipeInfo?.glutenFree || 
                      recipeInfo?.dairyFree || recipeInfo?.ketogenic || recipeInfo?.whole30 || 
                      recipeInfo?.lowFodmap) && (
                      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-green-500/20 rounded-lg">
                            <Leaf className="h-6 w-6 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Health & Dietary Information</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {recipeInfo?.healthScore && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-green-400" />
                                  <span className="text-xs sm:text-sm text-gray-300">Health Score:</span>
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                    {Math.round(recipeInfo.healthScore)}
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.veryHealthy && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                    Very Healthy
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.vegan && (
                                <div className="flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-green-400" />
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                    Vegan
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.vegetarian && (
                                <div className="flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-green-400" />
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                    Vegetarian
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.glutenFree && (
                                <div className="flex items-center gap-2">
                                  <Wheat className="h-4 w-4 text-amber-400" />
                                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                                    Gluten Free
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.dairyFree && (
                                <div className="flex items-center gap-2">
                                  <Droplet className="h-4 w-4 text-blue-400" />
                                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    Dairy Free
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.ketogenic && (
                                <div className="flex items-center gap-2">
                                  <Flame className="h-4 w-4 text-orange-400" />
                                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                    Ketogenic
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.whole30 && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-purple-400" />
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    Whole30
                                  </Badge>
                                </div>
                              )}
                              {recipeInfo?.lowFodmap && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-indigo-400" />
                                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                    Low FODMAP
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {recipeInfo?.diets && recipeInfo.diets.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-2">Diets:</p>
                                <div className="flex flex-wrap gap-2">
                                  {recipeInfo.diets.map((diet, idx) => (
                                    <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                      {diet}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Cuisines & Dish Types */}
                    {((recipeInfo?.cuisines && recipeInfo.cuisines.length > 0) || 
                      (recipeInfo?.dishTypes && recipeInfo.dishTypes.length > 0)) && (
                      <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-500/20 rounded-lg">
                            <ChefHat className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Cuisine & Dish Types</h3>
                            {recipeInfo?.cuisines && recipeInfo.cuisines.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-400 mb-2">Cuisines:</p>
                                <div className="flex flex-wrap gap-2">
                                  {recipeInfo.cuisines.map((cuisine, idx) => (
                                    <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                      {cuisine}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {recipeInfo?.dishTypes && recipeInfo.dishTypes.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Dish Types:</p>
                                <div className="flex flex-wrap gap-2">
                                  {recipeInfo.dishTypes.map((dishType, idx) => (
                                    <Badge key={idx} className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                      {dishType}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Time Breakdown */}
                    {(recipeInfo?.cookingMinutes || recipeInfo?.preparationMinutes || recipeInfo?.readyInMinutes) && (
                      <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-500/20 rounded-lg">
                            <Clock className="h-6 w-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Time Breakdown</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {recipeInfo?.preparationMinutes && (
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Preparation</p>
                                  <p className="text-lg font-bold text-white">
                                    {recipeInfo.preparationMinutes} min
                                  </p>
                                </div>
                              )}
                              {recipeInfo?.cookingMinutes && (
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Cooking</p>
                                  <p className="text-lg font-bold text-white">
                                    {recipeInfo.cookingMinutes} min
                                  </p>
                                </div>
                              )}
                              {recipeInfo?.readyInMinutes && (
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Total Time</p>
                                  <p className="text-lg font-bold text-white">
                                    {recipeInfo.readyInMinutes} min
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Additional Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recipeInfo?.cheap !== undefined && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            {recipeInfo.cheap ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm text-gray-400">Budget Friendly</p>
                              <p className="text-lg font-semibold text-white">
                                {recipeInfo.cheap ? "Yes" : "No"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {recipeInfo?.sustainable !== undefined && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            {recipeInfo.sustainable ? (
                              <Leaf className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm text-gray-400">Sustainable</p>
                              <p className="text-lg font-semibold text-white">
                                {recipeInfo.sustainable ? "Yes" : "No"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {recipeInfo?.veryPopular !== undefined && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            {recipeInfo.veryPopular ? (
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            ) : (
                              <Star className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm text-gray-400">Very Popular</p>
                              <p className="text-lg font-semibold text-white">
                                {recipeInfo.veryPopular ? "Yes" : "No"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {recipeInfo?.weightWatcherSmartPoints && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-sm text-gray-400">Weight Watchers Points</p>
                              <p className="text-lg font-semibold text-white">
                                {recipeInfo.weightWatcherSmartPoints} points
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {recipeInfo?.creditsText && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            <ChefHat className="h-5 w-5 text-purple-400" />
                            <div>
                              <p className="text-sm text-gray-400">Credits</p>
                              <p className="text-lg font-semibold text-white">
                                {recipeInfo.creditsText}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {recipeInfo?.license && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-400">License</p>
                              <p className="text-lg font-semibold text-white">
                                {recipeInfo.license}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      {recipeInfo?.occasions && recipeInfo.occasions.length > 0 && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-purple-400" />
                            <div>
                              <p className="text-sm text-gray-400">Occasions</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {recipeInfo.occasions.map((occasion, idx) => (
                                  <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                    {occasion}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                      {recipeInfo?.gaps && (
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-sm text-gray-400">GAPS Diet</p>
                              <p className="text-lg font-semibold text-white">
                                {recipeInfo.gaps}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Details Tab - Ingredients, Instructions, Wine Pairing */}
                  <TabsContent value="details" className="space-y-6 mt-0 transition-opacity duration-300">
                    {/* Ingredients List - Enhanced with all API properties */}
                    {recipeInfo?.extendedIngredients && recipeInfo.extendedIngredients.length > 0 && (
                      <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-orange-500/20 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Ingredients</h3>
                            <div className="space-y-3">
                              {recipeInfo.extendedIngredients.map((ingredient, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors"
                                >
                                  {/* Ingredient Image */}
                                  {ingredient.image && (
                                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-orange-500/20">
                                      <img
                                        src={`https://img.spoonacular.com/ingredients_100x100/${ingredient.image}`}
                                        alt={ingredient.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                      />
                                    </div>
                                  )}
                                  
                                    <div className="flex-1 min-w-0">
                                    {/* Ingredient Number Badge */}
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-orange-300">{idx + 1}</span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-white font-medium break-words">
                                          {ingredient.original}
                                        </p>
                                        {/* Display originalName if different from name */}
                                        {ingredient.originalName && ingredient.originalName !== ingredient.name && (
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            ({ingredient.originalName})
                                          </p>
                                        )}
                                        {/* Display name if different from original */}
                                        {ingredient.name && ingredient.name !== ingredient.original && (
                                          <p className="text-xs text-gray-400 mt-0.5">
                                            Name: {ingredient.name}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Additional Ingredient Info */}
                                    <div className="mt-2 space-y-1">
                                      {ingredient.aisle && (
                                        <p className="text-xs text-gray-400">
                                          <span className="font-semibold">Aisle:</span> {ingredient.aisle}
                                        </p>
                                      )}
                                      
                                      {/* Metric/US Measures */}
                                      {(ingredient.measures?.metric || ingredient.measures?.us) && (
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          {ingredient.measures?.us && (
                                            <div className="flex flex-col gap-0.5">
                                              <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20">
                                                US: {ingredient.measures.us.amount} {ingredient.measures.us.unitShort}
                                              </Badge>
                                              {ingredient.measures.us.unitLong && ingredient.measures.us.unitLong !== ingredient.measures.us.unitShort && (
                                                <span className="text-gray-500 text-xs">{ingredient.measures.us.unitLong}</span>
                                              )}
                                            </div>
                                          )}
                                          {ingredient.measures?.metric && (
                                            <div className="flex flex-col gap-0.5">
                                              <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20">
                                                Metric: {Math.round(ingredient.measures.metric.amount * 100) / 100} {ingredient.measures.metric.unitShort}
                                              </Badge>
                                              {ingredient.measures.metric.unitLong && ingredient.measures.metric.unitLong !== ingredient.measures.metric.unitShort && (
                                                <span className="text-gray-500 text-xs">{ingredient.measures.metric.unitLong}</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Meta Information */}
                                      {ingredient.meta && ingredient.meta.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {ingredient.meta.map((meta, metaIdx) => (
                                            <Badge key={metaIdx} variant="outline" className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs">
                                              {meta}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {/* Consistency */}
                                      {ingredient.consistency && (
                                        <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs mt-1">
                                          {ingredient.consistency}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Instructions - Enhanced with ingredient/equipment images */}
                    {(recipeInfo?.analyzedInstructions && recipeInfo.analyzedInstructions.length > 0) || recipeInfo?.instructions ? (
                      <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-blue-500/20 rounded-lg">
                            <List className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Instructions</h3>
                            {recipeInfo.analyzedInstructions && recipeInfo.analyzedInstructions.length > 0 ? (
                              <div className="space-y-4">
                                {recipeInfo.analyzedInstructions.map((instruction, instIdx) => (
                                  <div key={instIdx} className="space-y-3">
                                    {instruction.name && (
                                      <h4 className="text-lg font-semibold text-blue-300">
                                        {instruction.name}
                                      </h4>
                                    )}
                                    {instruction.steps.map((step, stepIdx) => (
                                      <div
                                        key={stepIdx}
                                        className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-blue-500/20"
                                      >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                          <span className="text-sm font-semibold text-blue-300">
                                            {step.number}
                                          </span>
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-white leading-relaxed">{step.step}</p>
                                          
                                          {/* Ingredients with images */}
                                          {step.ingredients && step.ingredients.length > 0 && (
                                            <div className="mt-3">
                                              <p className="text-xs text-gray-400 mb-2">Ingredients used:</p>
                                              <div className="flex flex-wrap gap-2">
                                                {step.ingredients.map((ing, ingIdx) => (
                                                  <div key={ingIdx} className="flex items-center gap-1.5">
                                                    {ing.image && (
                                                      <img
                                                        src={`https://img.spoonacular.com/ingredients_100x100/${ing.image}`}
                                                        alt={ing.name}
                                                        className="w-6 h-6 rounded object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                      />
                                                    )}
                                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs" title={ing.localizedName && ing.localizedName !== ing.name ? `Localized: ${ing.localizedName}` : undefined}>
                                                      {ing.name}
                                                      {ing.localizedName && ing.localizedName !== ing.name && (
                                                        <span className="ml-1 text-blue-200/70">({ing.localizedName})</span>
                                                      )}
                                                    </Badge>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Equipment with images */}
                                          {step.equipment && step.equipment.length > 0 && (
                                            <div className="mt-3">
                                              <p className="text-xs text-gray-400 mb-2">Equipment needed:</p>
                                              <div className="flex flex-wrap gap-2">
                                                {step.equipment.map((eq, eqIdx) => (
                                                  <div key={eqIdx} className="flex items-center gap-1.5">
                                                    {eq.image && (
                                                      <img
                                                        src={`https://img.spoonacular.com/equipment_100x100/${eq.image}`}
                                                        alt={eq.name}
                                                        className="w-6 h-6 rounded object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                      />
                                                    )}
                                                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs" title={eq.localizedName && eq.localizedName !== eq.name ? `Localized: ${eq.localizedName}` : undefined}>
                                                      {eq.name}
                                                      {eq.localizedName && eq.localizedName !== eq.name && (
                                                        <span className="ml-1 text-indigo-200/70">({eq.localizedName})</span>
                                                      )}
                                                    </Badge>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : recipeInfo.instructions ? (
                              <div className="prose prose-invert max-w-none">
                                <div 
                                  className="text-white leading-relaxed whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{ __html: recipeInfo.instructions }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    ) : null}

                    {/* Wine Pairing */}
                    {recipeInfo?.winePairing && (
                      <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-500/20 rounded-lg">
                            <Wine className="h-6 w-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Wine Pairing</h3>
                            {recipeInfo.winePairing.pairedWines && recipeInfo.winePairing.pairedWines.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-400 mb-2">Recommended Wines:</p>
                                <div className="flex flex-wrap gap-2">
                                  {recipeInfo.winePairing.pairedWines.map((wine, idx) => (
                                    <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                      {wine}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {recipeInfo.winePairing.pairingText && (
                              <p className="text-gray-300 leading-relaxed mb-4">
                                {recipeInfo.winePairing.pairingText}
                              </p>
                            )}
                            {recipeInfo.winePairing.productMatches && recipeInfo.winePairing.productMatches.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-400 mb-2">Product Recommendations:</p>
                                {recipeInfo.winePairing.productMatches.map((product, idx) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                                  >
                                    <div className="flex gap-4">
                                      {/* Product Image */}
                                      {product.imageUrl && (
                                        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-purple-500/20">
                                          <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                          />
                                        </div>
                                      )}
                                      
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold mb-1">{product.title}</p>
                                        {product.description && (
                                          <p className="text-sm text-gray-300 mb-3">{product.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2">
                                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                            {product.price}
                                          </Badge>
                                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                            Rating: {product.averageRating.toFixed(1)}/5
                                            {product.ratingCount > 0 && (
                                              <span className="ml-1 text-xs">({product.ratingCount} reviews)</span>
                                            )}
                                          </Badge>
                                          {product.score && (
                                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                              Score: {(product.score * 100).toFixed(0)}%
                                            </Badge>
                                          )}
                                          {product.link && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                                              onClick={() => window.open(product.link, '_blank', 'noopener,noreferrer')}
                                            >
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              View on Amazon
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Nutrition Tab - Display full nutrition data */}
                  {recipeInfo?.nutrition && (
                    <TabsContent value="nutrition" className="space-y-6 mt-0 transition-opacity duration-300">
                      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-green-500/20 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Nutritional Information</h3>
                            <p className="text-sm text-gray-400 mb-4">
                              All values are per serving. Multiply by number of servings for total recipe nutrition.
                            </p>
                            
                            {/* Caloric Breakdown */}
                            {recipeInfo.nutrition.caloricBreakdown && (
                              <div className="mb-6">
                                <h4 className="text-md font-semibold text-white mb-3">Caloric Breakdown</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <Card className="bg-slate-800/50 border-green-500/20 p-3">
                                    <p className="text-xs text-gray-400 mb-1">Protein</p>
                                    <p className="text-lg font-bold text-white">
                                      {Math.round(recipeInfo.nutrition.caloricBreakdown.percentProtein)}%
                                    </p>
                                  </Card>
                                  <Card className="bg-slate-800/50 border-green-500/20 p-3">
                                    <p className="text-xs text-gray-400 mb-1">Fat</p>
                                    <p className="text-lg font-bold text-white">
                                      {Math.round(recipeInfo.nutrition.caloricBreakdown.percentFat)}%
                                    </p>
                                  </Card>
                                  <Card className="bg-slate-800/50 border-green-500/20 p-3">
                                    <p className="text-xs text-gray-400 mb-1">Carbs</p>
                                    <p className="text-lg font-bold text-white">
                                      {Math.round(recipeInfo.nutrition.caloricBreakdown.percentCarbs)}%
                                    </p>
                                  </Card>
                                </div>
                              </div>
                            )}

                            {/* Weight Per Serving */}
                            {recipeInfo.nutrition.weightPerServing && (
                              <div className="mb-6">
                                <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                  <Scale className="h-4 w-4 text-green-400" />
                                  Weight Per Serving
                                </h4>
                                <Card className="bg-slate-800/50 border-green-500/20 p-3 inline-flex items-center gap-2">
                                  <Scale className="h-4 w-4 text-green-400" />
                                  <p className="text-sm font-semibold text-white">
                                    {Math.round(recipeInfo.nutrition.weightPerServing.amount)} {recipeInfo.nutrition.weightPerServing.unit}
                                  </p>
                                </Card>
                              </div>
                            )}

                            {/* Key Nutrients */}
                            {recipeInfo.nutrition.nutrients && recipeInfo.nutrition.nutrients.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-md font-semibold text-white mb-3">Key Nutrients</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {recipeInfo.nutrition.nutrients.map((nutrient, idx) => (
                                    <Card key={idx} className="bg-slate-800/50 border-green-500/20 p-3">
                                      <p className="text-xs text-gray-400 mb-1">{nutrient.name}</p>
                                      <p className="text-sm font-semibold text-white">
                                        {Math.round(nutrient.amount * 100) / 100} {nutrient.unit}
                                        {nutrient.percentOfDailyNeeds && (
                                          <span className="text-xs text-gray-400 ml-2">
                                            ({Math.round(nutrient.percentOfDailyNeeds)}% DV)
                                          </span>
                                        )}
                                      </p>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Properties */}
                            {recipeInfo.nutrition.properties && recipeInfo.nutrition.properties.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                  <FlaskConical className="h-4 w-4 text-green-400" />
                                  Properties
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {recipeInfo.nutrition.properties.map((property, idx) => (
                                    <Card key={idx} className="bg-slate-800/50 border-green-500/20 p-3">
                                      <p className="text-xs text-gray-400 mb-1">{property.name}</p>
                                        <p className="text-sm font-semibold text-white">
                                          {property.amount.toFixed(1)} {property.unit}
                                        </p>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Flavonoids */}
                            {recipeInfo.nutrition.flavonoids && recipeInfo.nutrition.flavonoids.length > 0 && (
                              <div>
                                <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                  <Flower2 className="h-4 w-4 text-green-400" />
                                  Flavonoids
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {recipeInfo.nutrition.flavonoids.map((flavonoid, idx) => (
                                    <Card key={idx} className="bg-slate-800/50 border-green-500/20 p-3">
                                      <p className="text-xs text-gray-400 mb-1">{flavonoid.name}</p>
                                      <p className="text-sm font-semibold text-white">
                                        {Math.round(flavonoid.amount * 100) / 100} {flavonoid.unit}
                                      </p>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </TabsContent>
                  )}

                  {/* Taste Tab - Display taste data with progress bars */}
                  {recipeInfo?.taste && (
                    <TabsContent value="taste" className="space-y-6 mt-0 transition-opacity duration-300">
                      <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 p-4 sm:p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-orange-500/20 rounded-lg">
                            <Flame className="h-6 w-6 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Taste Profile</h3>
                            <p className="text-sm text-gray-400 mb-4">
                              A breakdown of the recipe's taste attributes. Values are normalized on a scale of 0-100.
                            </p>

                            <div className="space-y-4">
                              {Object.entries(recipeInfo.taste).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm sm:text-base text-gray-300 capitalize font-medium">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <span className="text-sm text-gray-400 w-12 text-right">
                                      {Math.round(value)}%
                                    </span>
                                  </div>
                                  <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
                                      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>
                  )}

                  {/* Notes Tab - Lazy loaded */}
                  {isAuthenticated && (
                    <TabsContent value="notes" className="space-y-4 mt-0 transition-opacity duration-300">
                      <Suspense fallback={<div className="h-64 w-full" />}>
                        {recipe && <RecipeNotes recipe={recipe} />}
                      </Suspense>
                    </TabsContent>
                  )}

                  {/* Images Tab - Lazy loaded */}
                  {isAuthenticated && (
                    <TabsContent value="images" className="space-y-4 mt-0 transition-opacity duration-300">
                      <Suspense fallback={<div className="h-64 w-full" />}>
                        {recipe && <RecipeImageGallery recipe={recipe} />}
                      </Suspense>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">Recipe details not available.</p>
            </CardContent>
          </Card>
        )}

        {/* Add to Collection Dialog */}
        {showAddToCollection && recipe && (
          <Suspense fallback={null}>
            <AddToCollectionDialog
              recipe={recipe}
              onClose={() => setShowAddToCollection(false)}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
});

RecipePage.displayName = "RecipePage";

export default RecipePage;

