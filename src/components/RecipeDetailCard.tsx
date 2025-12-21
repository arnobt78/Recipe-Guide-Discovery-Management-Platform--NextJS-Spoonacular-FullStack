/**
 * Recipe Detail Card Component
 * 
 * Displays recipe details in a card format with:
 * - Fixed height modal for consistent UI across tabs
 * - Image on the left
 * - Enhanced tabs with badges, cards, and rich information
 * - Recipe summary/content
 * - Replaces the modal approach
 */

import { memo, useMemo, useEffect, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useRecipeSummary, useRecipeInformation, useSimilarRecipes } from "../hooks/useRecipes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import {
  X,
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
} from "lucide-react";
import { Recipe } from "../types";
import { 
  capitalizeWords, 
  addTargetBlankToLinks,
  removeSimilarRecipesFromSummary,
} from "../utils/stringUtils";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import SimilarRecipesList from "./SimilarRecipesList";

// Code splitting: Lazy load sub-components that are conditionally rendered
const RecipeNotes = lazy(() => import("./RecipeNotes"));
const RecipeImageGallery = lazy(() => import("./RecipeImageGallery"));
const AddToCollectionDialog = lazy(() => import("./AddToCollectionDialog"));

interface Props {
  recipe: Recipe;
  onClose: () => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}

/**
 * Recipe Detail Card Component (Memoized for performance)
 * 
 * Displays recipe details in a card format with:
 * - Fixed height modal (consistent across all tabs)
 * - Image on the left
 * - Enhanced tabs with badges, cards, and rich information
 * - Replaces the modal approach
 */
const RecipeDetailCard = memo(({ recipe, onClose, isFavourite, onToggleFavourite }: Props) => {
  // Use recipe information endpoint to get sourceUrl and full details
  // Request recipe information with nutrition, wine pairing and taste data for rich display
  const { 
    data: recipeInfo, 
    isLoading: isLoadingInfo, 
    error: infoError 
  } = useRecipeInformation(
    recipe.id.toString(), 
    {
      includeNutrition: true, // Always fetch nutrition data for accurate calories, protein, etc.
      addWinePairing: true, // Always get wine pairing
      addTasteData: true, // Get taste data for display
    },
    true
  );
  
  // Use similar recipes endpoint to get actual similar recipes
  const { 
    data: similarRecipes = [], 
    isLoading: isLoadingSimilar 
  } = useSimilarRecipes(recipe.id.toString(), 10, true);
  
  // Fallback to summary for summary text if needed
  const { data: recipeSummary } = useRecipeSummary(recipe.id.toString(), true);
  
  const { isAuthenticated } = useAuth();
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  // Handle errors
  useEffect(() => {
    if (infoError) {
      toast.error("Failed to load recipe details. Please try again.");
    }
  }, [infoError]);

  // Determine loading state
  const isLoading = isLoadingInfo || isLoadingSimilar;

  // Memoized computed values
  const capitalizedTitle = useMemo(
    () => capitalizeWords(recipeInfo?.title || recipeSummary?.title || recipe.title),
    [recipeInfo?.title, recipeSummary?.title, recipe.title]
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

  // Get source URL directly from API (much more reliable!)
  const sourceUrl = useMemo(
    () => recipeInfo?.sourceUrl || null,
    [recipeInfo?.sourceUrl]
  );

  // Debug: Log recipe information to verify data matches (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && recipeInfo) {
      // Find calories and protein from nutrition data
      const calories = recipeInfo.nutrition?.nutrients?.find(n => 
        n.name.toLowerCase().includes('calories')
      );
      const protein = recipeInfo.nutrition?.nutrients?.find(n => 
        n.name.toLowerCase().includes('protein')
      );
      
      console.log("🔍 [Recipe Debug] Recipe Information:", {
        id: recipeInfo.id,
        title: recipeInfo.title,
        sourceUrl: recipeInfo.sourceUrl,
        sourceName: recipeInfo.sourceName,
        spoonacularSourceUrl: recipeInfo.spoonacularSourceUrl,
        readyInMinutes: recipeInfo.readyInMinutes,
        servings: recipeInfo.servings,
        pricePerServing: recipeInfo.pricePerServing,
        pricePerServingFormatted: recipeInfo.pricePerServing ? `$${(recipeInfo.pricePerServing / 100).toFixed(2)}` : null,
        spoonacularScore: recipeInfo.spoonacularScore,
        healthScore: recipeInfo.healthScore,
        nutrition: {
          hasNutritionData: !!recipeInfo.nutrition,
          calories: calories ? `${Math.round(calories.amount)} ${calories.unit}` : null,
          protein: protein ? `${Math.round(protein.amount)} ${protein.unit}` : null,
        },
      });
      
      // Log full nutrition object for detailed inspection
      if (recipeInfo.nutrition) {
        // Find all relevant nutrients
        const allNutrients = recipeInfo.nutrition.nutrients || [];
        const caloriesNutrient = allNutrients.find(n => 
          n.name.toLowerCase().includes('calories') || n.name.toLowerCase() === 'calories'
        );
        const proteinNutrient = allNutrients.find(n => 
          n.name.toLowerCase().includes('protein') || n.name.toLowerCase() === 'protein'
        );
        
        console.log("🔍 [Recipe Debug] Full Nutrition Data:", {
          totalNutrients: allNutrients.length,
          caloriesNutrient: caloriesNutrient,
          proteinNutrient: proteinNutrient,
          allNutrientNames: allNutrients.map(n => n.name),
          caloricBreakdown: recipeInfo.nutrition.caloricBreakdown,
          weightPerServing: recipeInfo.nutrition.weightPerServing,
        });
      }
      
      console.log("🔍 [Recipe Debug] Recipe from props:", {
        id: recipe.id,
        title: recipe.title,
      });
      
      // Log the full API response for comparison
      console.log("🔍 [Recipe Debug] Full API Response (recipeInfo):", recipeInfo);
    }
  }, [recipeInfo, recipe]);


  // Extract key information from summary HTML for badges
  // Use recipeInfo summary if available, otherwise fallback to recipeSummary
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

    // Extract calories
    const caloriesMatch = summary.match(/(\d+)\s*calories/);
    if (caloriesMatch) info.calories = caloriesMatch[1];

    // Extract protein
    const proteinMatch = summary.match(/(\d+g)\s*of\s*protein/);
    if (proteinMatch) info.protein = proteinMatch[1];

    // Extract fat
    const fatMatch = summary.match(/(\d+g)\s*of\s*fat/);
    if (fatMatch) info.fat = fatMatch[1];

    // Extract servings
    const servingsMatch = summary.match(/serves\s*(\d+)/);
    if (servingsMatch) info.servings = servingsMatch[1];

    // Extract price
    const priceMatch = summary.match(/\$([\d.]+)\s*per\s*serving/);
    if (priceMatch) info.price = `$${priceMatch[1]}`;

    // Extract time
    const timeMatch = summary.match(/(\d+)\s*minutes/);
    if (timeMatch) info.time = `${timeMatch[1]} min`;

    // Extract spoonacular score
    const scoreMatch = summary.match(/(\d+)%[^%]*spoonacular/);
    if (scoreMatch) info.score = `${scoreMatch[1]}%`;

    return info;
  }, [summaryText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="w-full overflow-x-hidden"
    >
      <Card className="glow-card border-purple-500/30 overflow-hidden w-full">
        {/* Header with Close Button */}
        <CardHeader className="relative bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-500/30">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl md:text-3xl font-bold gradient-text flex-1 pr-4">
              {capitalizedTitle}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavourite}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddToCollection(true);
                  }}
                  className="hover:bg-purple-500/20 text-gray-400 hover:text-purple-400"
                  aria-label="Add to collection"
                  title="Add to collection"
                >
                  <FolderPlus className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-hidden">
          <div className="flex flex-col lg:flex-row w-full overflow-x-hidden">
            {/* Left Side - Recipe Image */}
            <div className="lg:w-1/3 relative overflow-hidden flex-shrink-0">
              <div className="aspect-square lg:aspect-auto lg:h-[600px] relative">
                <img
                  src={recipe.image || "/hero-image.webp"}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Decorative SVG Icons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <img
                    src="/chef.svg"
                    alt="Chef"
                    className="w-8 h-8 opacity-60 drop-shadow-lg"
                  />
                  <img
                    src="/cooking.svg"
                    alt="Cooking"
                    className="w-8 h-8 opacity-60 drop-shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Recipe Content with Fixed Height */}
            <div className="lg:w-2/3 flex flex-col flex-shrink-0 min-w-0 overflow-x-hidden">
              {/* Fixed height scrollable content area */}
              <div className="p-4 sm:p-6 custom-scrollbar overflow-y-auto overflow-x-hidden" style={{ height: "600px" }}>
                {isLoading ? (
                  <div className="space-y-6">
                    {/* Tabs Skeleton */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    {/* Content Skeleton */}
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ) : (recipeInfo || recipeSummary) ? (
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList
                      className={`grid w-full ${
                        isAuthenticated ? "grid-cols-5" : "grid-cols-3"
                      } mb-6 bg-slate-800/50`}
                    >
                      <TabsTrigger value="summary" className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="info" className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4" />
                        Info
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Details
                      </TabsTrigger>
                      {recipeInfo?.nutrition && (
                        <TabsTrigger value="nutrition" className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Nutrition
                        </TabsTrigger>
                      )}
                      {isAuthenticated && (
                        <>
                          <TabsTrigger value="notes" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Notes
                          </TabsTrigger>
                          <TabsTrigger value="images" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Images
                          </TabsTrigger>
                        </>
                      )}
                    </TabsList>

                    {/* Summary Tab - Enhanced with badges */}
                    <TabsContent value="summary" className="space-y-6 mt-0">
                      {/* Data Source Note */}
                      <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-300 leading-relaxed">
                            <span className="font-semibold">Note:</span> All nutritional information, pricing, and recipe details are fetched directly from the Spoonacular API and may differ from values shown on the Spoonacular website due to caching, calculation methods, or data synchronization timing.
                          </p>
                        </div>
                      </div>
                      
                      {/* Key Info Badges - Use data from recipeInfo API when available (prioritize API data over summary extraction) */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {/* Calories - Prioritize nutrition data if available, otherwise extract from summary */}
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
                        {/* Protein - Prioritize nutrition data if available, otherwise extract from summary */}
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
                        {/* Time - Use readyInMinutes from recipeInfo or extract from summary */}
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
                        {/* Servings - Use servings from recipeInfo or extract from summary */}
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

                      {/* Additional Info Cards - Use data from recipeInfo API when available */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Price - Use pricePerServing from recipeInfo or extract from summary */}
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
                        {/* Spoonacular Score - Use spoonacularScore from recipeInfo or extract from summary */}
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

                      {/* Main Recipe Source Link - Use sourceUrl from API */}
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
                              {/* Also show Spoonacular link for reference */}
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

                    {/* Info Tab - Enhanced with rich cards showing all API properties */}
                    <TabsContent value="info" className="space-y-6 mt-0">
                      {/* Health & Diet Information */}
                      {(recipeInfo?.healthScore || recipeInfo?.veryHealthy || recipeInfo?.diets?.length || 
                        recipeInfo?.vegan || recipeInfo?.vegetarian || recipeInfo?.glutenFree || 
                        recipeInfo?.dairyFree || recipeInfo?.ketogenic || recipeInfo?.whole30 || 
                        recipeInfo?.lowFodmap) && (
                        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                              <Leaf className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-4">Health & Dietary Information</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {recipeInfo?.healthScore && (
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                    <span className="text-sm text-gray-300">Health Score:</span>
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
                        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30 p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                              <ChefHat className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-4">Cuisine & Dish Types</h3>
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
                        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                              <Clock className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-4">Time Breakdown</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Details Tab - Enhanced with ingredients, instructions, and more */}
                    <TabsContent value="details" className="space-y-6 mt-0">
                      {/* Ingredients List */}
                      {recipeInfo?.extendedIngredients && recipeInfo.extendedIngredients.length > 0 && (
                        <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-orange-500/20 rounded-lg">
                              <ShoppingCart className="h-6 w-6 text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-4">Ingredients</h3>
                              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                                {recipeInfo.extendedIngredients.map((ingredient, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors"
                                  >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                      <span className="text-xs font-semibold text-orange-300">{idx + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
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
                                      {ingredient.aisle && (
                                        <p className="text-xs text-gray-400 mt-1">
                                          Aisle: {ingredient.aisle}
                                        </p>
                                      )}
                                      {/* Display measures if available */}
                                      {(ingredient.measures?.metric || ingredient.measures?.us) && (
                                        <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                          {ingredient.measures?.us && (
                                            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20">
                                              US: {ingredient.measures.us.amount} {ingredient.measures.us.unitShort}
                                            </Badge>
                                          )}
                                          {ingredient.measures?.metric && (
                                            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20">
                                              Metric: {Math.round(ingredient.measures.metric.amount * 100) / 100} {ingredient.measures.metric.unitShort}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                      {/* Display meta if available */}
                                      {ingredient.meta && ingredient.meta.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {ingredient.meta.map((meta, metaIdx) => (
                                            <Badge key={metaIdx} variant="outline" className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs">
                                              {meta}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                      {/* Display consistency if available */}
                                      {ingredient.consistency && (
                                        <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs mt-1">
                                          {ingredient.consistency}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Instructions */}
                      {recipeInfo?.analyzedInstructions && recipeInfo.analyzedInstructions.length > 0 && (
                        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30 p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                              <List className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-4">Instructions</h3>
                              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
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
                                                    <Badge
                                                      className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                                                      title={ing.localizedName && ing.localizedName !== ing.name ? `Localized: ${ing.localizedName}` : undefined}
                                                    >
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
                                                    <Badge
                                                      className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs"
                                                      title={eq.localizedName && eq.localizedName !== eq.name ? `Localized: ${eq.localizedName}` : undefined}
                                                    >
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
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Wine Pairing */}
                      {recipeInfo?.winePairing && (
                        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                              <Wine className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-4">Wine Pairing</h3>
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

                      {/* Recipe Title Card */}
                      <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-500/20 rounded-lg">
                            <UtensilsCrossed className="h-6 w-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-400 mb-2">Recipe Title</p>
                            <p className="text-xl font-bold text-white">{recipe.title}</p>
                          </div>
                        </div>
                      </Card>

                      {/* Status Card */}
                      <Card className="bg-slate-800/50 border-purple-500/20 p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-500/20 rounded-lg">
                            <Heart
                              className={`h-6 w-6 ${
                                isFavourite ? "text-red-400 fill-red-400" : "text-gray-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-400 mb-3">Favourite Status</p>
                            <Badge
                              className={
                                isFavourite
                                  ? "bg-red-500/20 text-red-300 border-red-500/30 text-base py-2 px-4"
                                  : "bg-purple-500/20 text-purple-300 border-purple-500/30 text-base py-2 px-4"
                              }
                            >
                              {isFavourite ? "In Favourites" : "Not in Favourites"}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-2">
                              {isFavourite
                                ? "This recipe is saved in your favourites"
                                : "Click the heart icon to add this recipe to your favourites"}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Recipe Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <ChefHat className="h-5 w-5 text-purple-400" />
                            <p className="text-sm text-gray-400">Recipe ID</p>
                          </div>
                          <p className="text-lg font-semibold text-white">{recipe.id}</p>
                        </Card>

                        <Card className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <ImageIcon className="h-5 w-5 text-pink-400" />
                            <p className="text-sm text-gray-400">Image Format</p>
                          </div>
                          <p className="text-lg font-semibold text-white">
                            {recipe.imageType || "JPG"}
                          </p>
                        </Card>
                      </div>

                      {/* Action Cards */}
                      {isAuthenticated && (
                        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowAddToCollection(true)}
                              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                            >
                              <FolderPlus className="h-4 w-4 mr-2" />
                              Add to Collection
                            </Button>
                            <Button
                              variant="outline"
                              onClick={onToggleFavourite}
                              className={`border-red-500/30 ${
                                isFavourite
                                  ? "text-red-300 bg-red-500/20"
                                  : "text-gray-300 hover:bg-red-500/20"
                              }`}
                            >
                              <Heart
                                className={`h-4 w-4 mr-2 ${isFavourite ? "fill-current" : ""}`}
                              />
                              {isFavourite ? "Remove from Favourites" : "Add to Favourites"}
                            </Button>
                          </div>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Notes Tab - Lazy loaded */}
                    {isAuthenticated && (
                      <TabsContent value="notes" className="space-y-4 mt-0">
                        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                          <RecipeNotes recipe={recipe} />
                        </Suspense>
                      </TabsContent>
                    )}

                    {/* Images Tab - Lazy loaded */}
                    {isAuthenticated && (
                      <TabsContent value="images" className="space-y-4 mt-0">
                        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                          <RecipeImageGallery recipe={recipe} />
                        </Suspense>
                      </TabsContent>
                    )}
                  </Tabs>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <p>Recipe details not available.</p>
                  </div>
                )}
              </div>

              {/* Footer Info - Fixed at bottom */}
              <div className="px-6 py-4 border-t border-purple-500/20 bg-slate-900/50">
                <div className="text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Click links to view full recipes. Scroll for more info.</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add to Collection Dialog */}
      {showAddToCollection && (
        <Suspense fallback={null}>
          <AddToCollectionDialog
            recipe={recipe}
            onClose={() => setShowAddToCollection(false)}
          />
        </Suspense>
      )}
    </motion.div>
  );
});

RecipeDetailCard.displayName = "RecipeDetailCard";

export default RecipeDetailCard;
