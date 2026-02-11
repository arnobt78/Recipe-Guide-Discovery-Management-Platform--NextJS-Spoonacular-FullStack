"use client";

/**
 * Recipe Page Client Component
 *
 * Full-page view for displaying individual recipe details.
 * Client component with all providers and interactive features.
 *
 * Features:
 * - Uses Next.js navigation
 * - Browser default scroll (no fixed heights)
 * - Responsive design (phone-screen and sm:screen)
 * - All recipe information displayed in an interesting, user-friendly way
 * - Reuses existing hooks and components
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */

import {
  memo,
  useMemo,
  useEffect,
  useState,
  lazy,
  Suspense,
  useCallback,
} from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  useRecipeSummary,
  useRecipeInformation,
  useSimilarRecipes,
} from "@/hooks/useRecipes";
import { usePostHog } from "@/hooks/usePostHog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChefHat,
  Heart,
  FileText,
  FolderPlus,
  Clock,
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
  Share2,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Recipe } from "@/types";
import {
  capitalizeWords,
  addTargetBlankToLinks,
  removeSimilarRecipesFromSummary,
} from "@/utils/stringUtils";
import {
  getIngredientImageUrl,
  getEquipmentImageUrl,
} from "@/utils/imageUtils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useIsFavourite } from "@/hooks/useIsFavourite";
import {
  useFavouriteRecipes,
  useAddFavouriteRecipe,
  useRemoveFavouriteRecipe,
} from "@/hooks/useRecipes";
import SkeletonRecipeDetail from "@/components/skeletons/SkeletonRecipeDetail";
import SimilarRecipesList from "@/components/recipes/SimilarRecipesList";
import RecipeDetailSidebar from "@/components/layout/RecipeDetailSidebar";
import { AuthProvider } from "@/context/AuthContext";
import { RecipeProvider } from "@/context/RecipeContext";

// Code splitting: Lazy load sub-components that are conditionally rendered
const RecipeNotes = lazy(() => import("@/components/recipes/RecipeNotes"));
const RecipeImageGallery = lazy(
  () => import("@/components/recipes/RecipeImageGallery"),
);
const RecipeVideoPlayer = lazy(
  () => import("@/components/videos/RecipeVideoPlayer"),
);
const AddToCollectionDialog = lazy(
  () => import("@/components/collections/AddToCollectionDialog"),
);
const ShareRecipeDialog = lazy(
  () => import("@/components/recipes/ShareRecipeDialog"),
);
const RecipeAnalysis = lazy(
  () => import("@/components/analysis/RecipeAnalysis"),
);
const RecipeModifications = lazy(
  () => import("@/components/recipes/RecipeModifications"),
);

/**
 * Recipe Page Component (Memoized for performance)
 *
 * Displays recipe details in a full-page layout with:
 * - Browser default scroll (no fixed heights)
 * - Responsive design
 * - All recipe information from API
 */
const RecipePageContent = memo(() => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { trackRecipe } = usePostHog();
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const id = params?.id as string;

  // Get active tab from URL query params (for state persistence per REACT_QUERY_SETUP_GUIDE.md)
  const activeTab = searchParams.get("tab") || "summary";
  // Get active sub-tab, default based on main tab
  const currentTab = searchParams.get("tab") || "summary";
  const activeSubTab =
    searchParams.get("subTab") ||
    (currentTab === "modifications"
      ? "scale"
      : currentTab === "details"
        ? "ingredients"
        : "");

  // Handle tab change with query params sync
  const handleTabChange = useCallback(
    (value: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("tab", value);
      // Reset subTab when switching tabs, set default if needed
      if (value === "modifications") {
        if (!newSearchParams.get("subTab")) {
          newSearchParams.set("subTab", "scale");
        }
      } else if (value === "details") {
        if (!newSearchParams.get("subTab")) {
          newSearchParams.set("subTab", "ingredients");
        }
      } else {
        newSearchParams.delete("subTab");
      }
      router.replace(`/recipe/${id}?${newSearchParams.toString()}`);
    },
    [searchParams, router, id],
  );

  // Handle sub-tab change with query params sync
  const handleSubTabChange = useCallback(
    (value: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      const currentTab = searchParams.get("tab") || "summary";
      newSearchParams.set("tab", currentTab);
      newSearchParams.set("subTab", value);
      router.replace(`/recipe/${id}?${newSearchParams.toString()}`);
    },
    [searchParams, router, id],
  );

  // Fetch recipe data
  // First, we need basic recipe info to construct Recipe object
  // For now, we'll use the recipe ID to fetch full information
  const {
    data: recipeInfo,
    isLoading: isLoadingInfo,
    error: infoError,
  } = useRecipeInformation(
    id || "",
    {
      includeNutrition: true,
      addWinePairing: true,
      addTasteData: true,
    },
    !!id,
  );

  // Use similar recipes endpoint
  const { data: similarRecipes = [], isLoading: isLoadingSimilar } =
    useSimilarRecipes(id || "", 10, !!id);

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

  // Track recipe view in PostHog when recipe loads
  useEffect(() => {
    if (recipeInfo && recipeInfo.id && recipeInfo.title) {
      trackRecipe("view", recipeInfo.id, recipeInfo.title);
    }
  }, [recipeInfo, trackRecipe]);

  // Handle errors
  useEffect(() => {
    if (infoError) {
      toast.error("Failed to load recipe details. Please try again.");
    }
  }, [infoError]);

  // Redirect if no ID
  useEffect(() => {
    if (!id) {
      router.push("/");
    }
  }, [id, router]);

  // Determine loading state
  const isLoading = isLoadingInfo || isLoadingSimilar;

  // Memoized computed values
  const capitalizedTitle = useMemo(
    () => capitalizeWords(recipeInfo?.title || recipeSummary?.title || ""),
    [recipeInfo?.title, recipeSummary?.title],
  );

  // Use summary from recipeInfo if available, otherwise fallback to recipeSummary
  const summaryText = useMemo(
    () => recipeInfo?.summary || recipeSummary?.summary || "",
    [recipeInfo?.summary, recipeSummary?.summary],
  );

  // Remove similar recipes text from summary since we display them separately
  const cleanedSummary = useMemo(
    () => removeSimilarRecipesFromSummary(summaryText),
    [summaryText],
  );

  const summaryWithTargetBlank = useMemo(
    () => addTargetBlankToLinks(cleanedSummary),
    [cleanedSummary],
  );

  // Get source URL directly from API
  const sourceUrl = useMemo(
    () => recipeInfo?.sourceUrl || null,
    [recipeInfo?.sourceUrl],
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
        },
      );
      return;
    }

    if (isFavourite) {
      removeFavouriteMutation.mutate(recipe);
    } else {
      addFavouriteMutation.mutate(recipe);
    }
  }, [
    recipe,
    isAuthenticated,
    isFavourite,
    removeFavouriteMutation,
    addFavouriteMutation,
  ]);

  if (!recipe && !isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: "url(/recipe-bg-5.avif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 mb-4">Recipe not found.</p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex overflow-x-hidden"
      style={{
        backgroundImage: "url(/recipe-bg-5.avif)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Sidebar Navigation - desktop only; on phone use Sheet (below) */}
      <div className="hidden sm:block flex-shrink-0">
        <RecipeDetailSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeSubTab={
            activeTab === "modifications" || activeTab === "details"
              ? activeSubTab
              : undefined
          }
          onSubTabChange={
            activeTab === "modifications" || activeTab === "details"
              ? handleSubTabChange
              : undefined
          }
          hasNutrition={!!recipeInfo?.nutrition}
          hasTaste={!!recipeInfo?.taste}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Mobile: tabs in Sheet from right */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[280px] sm:max-w-sm p-0 border-l border-green-500/20 bg-slate-900/95 backdrop-blur-sm overflow-hidden flex flex-col"
        >
          <SheetTitle className="sr-only">Recipe tabs</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate between recipe summary, details, analysis, and more.
          </SheetDescription>
          <div className="flex-1 overflow-y-auto min-h-0">
            <RecipeDetailSidebar
              embedded
              activeTab={activeTab}
              onTabChange={handleTabChange}
              activeSubTab={
                activeTab === "modifications" || activeTab === "details"
                  ? activeSubTab
                  : undefined
              }
              onSubTabChange={
                activeTab === "modifications" || activeTab === "details"
                  ? handleSubTabChange
                  : undefined
              }
              hasNutrition={!!recipeInfo?.nutrition}
              hasTaste={!!recipeInfo?.taste}
              isAuthenticated={isAuthenticated}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area - full width on phone, offset on sm+; content below navbar */}
      <div className="flex-1 min-w-0 ml-0 sm:ml-64 min-h-screen overflow-x-hidden flex flex-col">
        {/* 1. Navbar: phone = icons only (left arrow, fav, collection, share, burger); sm+ = title inline with icons */}
        <div className="sticky top-0 z-40 flex-shrink-0 bg-slate-900/50 backdrop-blur-sm border-b border-green-500/30">
          <div className="px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 hover:bg-green-500/20 text-gray-400 hover:text-green-400 rounded-xl border border-white/10"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-green-400" />
              </Button>
              {/* Title in navbar on sm+ only; on phone title is in its own row below */}
              <h1 className="hidden sm:block text-lg sm:text-xl md:text-2xl font-bold text-white flex-1 min-w-0 truncate">
                {capitalizedTitle || "Recipe Details"}
              </h1>
              <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2 flex-shrink-0 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavourite}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/10 bg-gradient-to-r from-rose-500/70 via-rose-500/50 to-rose-500/30 backdrop-blur-sm shadow-[0_15px_35px_rgba(225,29,72,0.45)] transition duration-200 hover:border-rose-300/40 hover:from-rose-500/80 hover:via-rose-500/60 hover:to-rose-500/40 text-white"
                  aria-label={
                    isFavourite ? "Remove from favourites" : "Add to favourites"
                  }
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavourite ? "fill-white text-white" : ""
                    }`}
                  />
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddToCollection(true)}
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/10 bg-gradient-to-r from-green-500/70 via-green-500/50 to-green-500/30 backdrop-blur-sm shadow-[0_15px_35px_rgba(34,197,94,0.45)] transition duration-200 hover:border-green-300/40 hover:from-green-500/80 hover:via-green-500/60 hover:to-green-500/40 text-white"
                    aria-label="Add to collection"
                    title="Add to collection"
                  >
                    <FolderPlus className="h-5 w-5" />
                  </Button>
                )}
                {recipe && (
                  <Suspense fallback={null}>
                    <ShareRecipeDialog
                      recipe={recipe}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/10 bg-gradient-to-r from-blue-500/70 via-blue-500/50 to-blue-500/30 backdrop-blur-sm shadow-[0_15px_35px_rgba(59,130,246,0.45)] transition duration-200 hover:border-blue-300/40 hover:from-blue-500/80 hover:via-blue-500/60 hover:to-blue-500/40 text-white"
                          aria-label="Share recipe"
                          title="Share recipe"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      }
                    />
                  </Suspense>
                )}
                {/* Burger menu: distinct bg/icon for visibility; phone only */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="sm:hidden h-9 w-9 flex-shrink-0 rounded-xl border border-green-500/40 bg-green-500/30 text-green-300 hover:bg-green-500/50 hover:text-green-200"
                  aria-label="Open recipe tabs"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Recipe title row - below navbar; phone only, wrapping (text-md sm:text-lg) */}
        <div className="sm:hidden flex-shrink-0 px-2 sm:px-4 pt-3 pb-2">
          <h1 className="text-base sm:text-lg font-bold text-white min-w-0 break-words leading-snug">
            {capitalizedTitle || "Recipe Details"}
          </h1>
        </div>

        {/* 3. Main content: image then rest; scrollable */}
        <div className="px-2 sm:px-4 py-4 sm:py-6 min-w-0 flex-1 min-h-0">
          {isLoading ? (
            <SkeletonRecipeDetail />
          ) : recipeInfo || recipeSummary ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="space-y-6 min-w-0"
            >
              {/* 3. Hero image - below title row on phone, below navbar on sm+ */}
              <div className="relative w-full min-w-0 aspect-video sm:aspect-[21/9] mb-4 sm:mb-6 overflow-hidden rounded-xl">
                <Image
                  src={recipeInfo?.image || recipe?.image || "/hero-image.webp"}
                  alt={recipeInfo?.title || recipe?.title || "Recipe"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>

              {/* 4. Rest: tab content - headers text-md sm:text-lg, body text-sm sm:text-base */}
              <Card className="recipe-detail-content group rounded-[28px] border border-slate-400/30 bg-gradient-to-br from-slate-500/25 via-slate-500/10 to-slate-500/5 backdrop-blur-sm shadow-[0_30px_80px_rgba(71,85,105,0.35)] transition hover:border-slate-300/50 min-w-0 overflow-hidden">
                <CardContent className="p-4 sm:p-6 bg-transparent min-w-0 text-sm sm:text-base [&_.recipe-detail-header]:text-base sm:[&_.recipe-detail-header]:text-lg [&_.recipe-detail-header]:font-semibold">
                  <div className="w-full min-w-0">
                    {/* Summary Tab */}
                    {activeTab === "summary" && (
                      <div className="space-y-6 mt-0 transition-opacity duration-300">
                        {/* Data Source Note - icon + text inline (icon minimal, like Discover); wrapped lines align with text */}
                        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg min-w-0">
                          <div className="flex items-start gap-2 min-w-0">
                            <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-blue-300 leading-relaxed min-w-0 break-words">
                              <span className="font-semibold">Note:</span> All
                              nutritional information, pricing, and recipe
                              details are fetched directly from the Spoonacular
                              API and may differ from values shown on the
                              Spoonacular website due to caching, calculation
                              methods, or data synchronization timing.
                            </p>
                          </div>
                        </div>

                        {/* Key Info Badges - stack on phone (grid-cols-1), text-sm label / text-base value on phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 sm:mb-6">
                          {/* Calories */}
                          {(() => {
                            const caloriesNutrient =
                              recipeInfo?.nutrition?.nutrients?.find((n) => {
                                const name = n.name.toLowerCase();
                                return (
                                  name === "calories" ||
                                  name.includes("calories")
                                );
                              });
                            const caloriesValue = caloriesNutrient?.amount
                              ? Math.round(caloriesNutrient.amount)
                              : extractSummaryInfo?.calories;
                            return caloriesValue ? (
                              <Card className="group rounded-[28px] border border-purple-400/30 bg-gradient-to-br from-purple-500/25 via-purple-500/10 to-purple-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(168,85,247,0.35)] transition hover:border-purple-300/50 backdrop-blur-sm min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                      Calories
                                    </p>
                                    <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white">
                                      {caloriesValue}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            ) : null;
                          })()}
                          {/* Protein */}
                          {(() => {
                            const proteinNutrient =
                              recipeInfo?.nutrition?.nutrients?.find((n) => {
                                const name = n.name.toLowerCase();
                                return (
                                  name === "protein" || name.includes("protein")
                                );
                              });
                            const proteinValue = proteinNutrient?.amount
                              ? `${Math.round(proteinNutrient.amount)}g`
                              : extractSummaryInfo?.protein;
                            return proteinValue ? (
                              <Card className="group rounded-[28px] border border-pink-400/30 bg-gradient-to-br from-pink-500/25 via-pink-500/10 to-pink-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(236,72,153,0.35)] transition hover:border-pink-300/50 backdrop-blur-sm min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                      Protein
                                    </p>
                                    <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white">
                                      {proteinValue}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            ) : null;
                          })()}
                          {/* Time */}
                          {(recipeInfo?.readyInMinutes ||
                            extractSummaryInfo?.time) && (
                            <Card className="group rounded-[28px] border border-sky-400/30 bg-gradient-to-br from-sky-500/25 via-sky-500/10 to-sky-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(14,165,233,0.35)] transition hover:border-sky-300/50 backdrop-blur-sm min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Time
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white">
                                    {recipeInfo?.readyInMinutes
                                      ? `${recipeInfo.readyInMinutes} min`
                                      : extractSummaryInfo?.time || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          )}
                          {/* Servings */}
                          {(recipeInfo?.servings ||
                            extractSummaryInfo?.servings) && (
                            <Card className="group rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/50 backdrop-blur-sm min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Serves
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white">
                                    {recipeInfo?.servings ||
                                      extractSummaryInfo?.servings ||
                                      "N/A"}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>

                        {/* Summary Content */}
                        <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed overflow-x-hidden break-words text-sm sm:text-base prose-p:text-sm sm:prose-p:text-base prose-headings:recipe-detail-header">
                          <div
                            className="overflow-x-hidden break-words"
                            dangerouslySetInnerHTML={{
                              __html: summaryWithTargetBlank,
                            }}
                          />
                        </div>

                        {/* Additional Info Cards - stack on phone, text-sm label / text-base value on phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                          {/* Price */}
                          {(recipeInfo?.pricePerServing ||
                            extractSummaryInfo?.price) && (
                            <Card className="group rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/50 backdrop-blur-sm min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Price per Serving
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white">
                                    {recipeInfo?.pricePerServing
                                      ? `$${(
                                          recipeInfo.pricePerServing / 100
                                        ).toFixed(2)}`
                                      : extractSummaryInfo?.price || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          )}
                          {/* Spoonacular Score */}
                          {(recipeInfo?.spoonacularScore ||
                            extractSummaryInfo?.score) && (
                            <Card className="group rounded-[28px] border border-amber-400/30 bg-gradient-to-br from-amber-500/30 via-amber-500/15 to-amber-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(245,158,11,0.35)] transition hover:border-amber-300/60 backdrop-blur-sm min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Spoonacular Score
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white">
                                    {recipeInfo?.spoonacularScore
                                      ? `${Math.round(
                                          recipeInfo.spoonacularScore,
                                        )}%`
                                      : extractSummaryInfo?.score || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>

                        {/* Main Recipe Source Link - icon + title inline; body from start (same as Discover Amazing Recipes) */}
                        {sourceUrl && (
                          <Card className="rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-6 mt-6 shadow-[0_30px_80px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/50 min-w-0 overflow-hidden">
                            <div className="space-y-4 min-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                </div>
                                <p className="text-sm sm:text-base font-semibold text-white break-words">
                                  View Full Recipe on Original Source
                                </p>
                              </div>
                              <div className="min-w-0">
                                <a
                                  href={sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300 underline break-words block mb-2 font-semibold text-sm sm:text-base"
                                >
                                  {recipeInfo?.sourceName ||
                                    new URL(sourceUrl).hostname.replace(
                                      "www.",
                                      "",
                                    )}
                                </a>
                                <p className="text-xs sm:text-sm text-gray-400 mb-2 break-words">
                                  This is the original recipe source where this
                                  recipe was first published.
                                </p>
                                {recipeInfo?.spoonacularSourceUrl && (
                                  <div className="mt-2 pt-2 border-t border-green-500/20">
                                    <p className="text-xs text-gray-400 mb-1">
                                      Also available on:
                                    </p>
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
                                <Badge className="bg-green-500/20 backdrop-blur-sm text-green-300 border-green-500/30 text-xs mt-2">
                                  Original Source
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        )}

                        {/* Similar Recipe Links - Reusable component */}
                        <SimilarRecipesList
                          similarRecipes={similarRecipes}
                          className="mt-6"
                        />
                      </div>
                    )}

                    {/* Info Tab - Reuse content from RecipeDetailCard */}
                    {activeTab === "info" && (
                      <div className="space-y-6 mt-0 transition-opacity duration-300">
                        {/* Health & Diet Information - icon+title inline; content from start (same as Summary) */}
                        {(recipeInfo?.healthScore ||
                          recipeInfo?.veryHealthy ||
                          recipeInfo?.diets?.length ||
                          recipeInfo?.vegan ||
                          recipeInfo?.vegetarian ||
                          recipeInfo?.glutenFree ||
                          recipeInfo?.dairyFree ||
                          recipeInfo?.ketogenic ||
                          recipeInfo?.whole30 ||
                          recipeInfo?.lowFodmap) && (
                          <Card className="group rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                            <div className="space-y-4 min-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                  <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300" />
                                </div>
                                <h3 className="recipe-detail-header text-white leading-tight break-words">
                                  Health & Dietary Information
                                </h3>
                              </div>
                              <div className="min-w-0">
                                {/* Health score: one badge "Health Score: 51" so it stays on one line on phone */}
                                {recipeInfo?.healthScore && (
                                  <div className="mb-3">
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-500/20 backdrop-blur-sm text-green-300 border-green-500/30 w-fit">
                                      <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                                      Health Score:{" "}
                                      {Math.round(recipeInfo.healthScore)}
                                    </Badge>
                                  </div>
                                )}
                                {/* Dietary badges: one row, dynamic width, wrap like Diets */}
                                <div className="flex flex-wrap gap-2 min-w-0">
                                  {recipeInfo?.veryHealthy && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-500/20 backdrop-blur-sm text-green-300 border-green-500/30 w-fit">
                                      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                      Very Healthy
                                    </Badge>
                                  )}
                                  {recipeInfo?.vegan && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-500/20 backdrop-blur-sm text-green-300 border-green-500/30 w-fit">
                                      <Leaf className="h-3.5 w-3.5 flex-shrink-0" />
                                      Vegan
                                    </Badge>
                                  )}
                                  {recipeInfo?.vegetarian && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-500/20 backdrop-blur-sm text-green-300 border-green-500/30 w-fit">
                                      <Leaf className="h-3.5 w-3.5 flex-shrink-0" />
                                      Vegetarian
                                    </Badge>
                                  )}
                                  {recipeInfo?.glutenFree && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-amber-500/20 backdrop-blur-sm text-amber-300 border-amber-500/30 w-fit">
                                      <Wheat className="h-3.5 w-3.5 flex-shrink-0" />
                                      Gluten Free
                                    </Badge>
                                  )}
                                  {recipeInfo?.dairyFree && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-blue-500/20 backdrop-blur-sm text-blue-300 border-blue-500/30 w-fit">
                                      <Droplet className="h-3.5 w-3.5 flex-shrink-0" />
                                      Dairy Free
                                    </Badge>
                                  )}
                                  {recipeInfo?.ketogenic && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-orange-500/20 backdrop-blur-sm text-orange-300 border-orange-500/30 w-fit">
                                      <Flame className="h-3.5 w-3.5 flex-shrink-0" />
                                      Ketogenic
                                    </Badge>
                                  )}
                                  {recipeInfo?.whole30 && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-purple-500/20 backdrop-blur-sm text-purple-300 border-purple-500/30 w-fit">
                                      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                      Whole30
                                    </Badge>
                                  )}
                                  {recipeInfo?.lowFodmap && (
                                    <Badge className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-indigo-500/20 backdrop-blur-sm text-indigo-300 border-indigo-500/30 w-fit">
                                      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                      Low FODMAP
                                    </Badge>
                                  )}
                                </div>
                                {recipeInfo?.diets &&
                                  recipeInfo.diets.length > 0 && (
                                    <div className="mt-4">
                                      <p className="text-sm text-gray-400 mb-2">
                                        Diets:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {recipeInfo.diets.map((diet, idx) => (
                                          <Badge
                                            key={idx}
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-500/20 backdrop-blur-sm text-purple-300 border-purple-500/30 w-fit"
                                          >
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

                        {/* Cuisine & Dish Types - icon+title inline; content from start */}
                        {((recipeInfo?.cuisines &&
                          recipeInfo.cuisines.length > 0) ||
                          (recipeInfo?.dishTypes &&
                            recipeInfo.dishTypes.length > 0)) && (
                          <Card className="group rounded-[28px] border border-indigo-400/30 bg-gradient-to-br from-indigo-500/25 via-indigo-500/10 to-indigo-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(99,102,241,0.35)] transition hover:border-indigo-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                            <div className="space-y-4 min-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                  <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-300" />
                                </div>
                                <h3 className="recipe-detail-header text-white leading-tight break-words">
                                  Cuisine & Dish Types
                                </h3>
                              </div>
                              <div className="min-w-0">
                                {recipeInfo?.cuisines &&
                                  recipeInfo.cuisines.length > 0 && (
                                    <div className="mb-4">
                                      <p className="text-sm text-gray-400 mb-2">
                                        Cuisines:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {recipeInfo.cuisines.map(
                                          (cuisine, idx) => (
                                            <Badge
                                              key={idx}
                                              className="bg-blue-500/20 backdrop-blur-sm text-blue-300 border-blue-500/30 text-xs"
                                            >
                                              {cuisine}
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {recipeInfo?.dishTypes &&
                                  recipeInfo.dishTypes.length > 0 && (
                                    <div>
                                      <p className="text-sm text-gray-400 mb-2">
                                        Dish Types:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {recipeInfo.dishTypes.map(
                                          (dishType, idx) => (
                                            <Badge
                                              key={idx}
                                              className="bg-indigo-500/20 backdrop-blur-sm text-indigo-300 border-indigo-500/30 text-xs"
                                            >
                                              {dishType}
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </Card>
                        )}

                        {/* Time Breakdown - icon+title inline; content from start; same text sizes as Summary */}
                        {(recipeInfo?.cookingMinutes ||
                          recipeInfo?.preparationMinutes ||
                          recipeInfo?.readyInMinutes) && (
                          <Card className="rounded-[28px] border border-purple-400/30 bg-gradient-to-br from-purple-900/30 to-pink-900/30 shadow-[0_30px_80px_rgba(168,85,247,0.25)] p-4 sm:p-6 backdrop-blur-sm min-w-0 overflow-hidden transition hover:border-purple-300/50">
                            <div className="space-y-4 min-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                                </div>
                                <h3 className="recipe-detail-header text-white leading-tight break-words">
                                  Time Breakdown
                                </h3>
                              </div>
                              <div className="min-w-0">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {recipeInfo?.preparationMinutes && (
                                    <div className="min-w-0">
                                      <p className="text-sm text-gray-400 mb-1">
                                        Preparation
                                      </p>
                                      <p className="text-base sm:text-lg font-bold text-white">
                                        {recipeInfo.preparationMinutes} min
                                      </p>
                                    </div>
                                  )}
                                  {recipeInfo?.cookingMinutes && (
                                    <div className="min-w-0">
                                      <p className="text-sm text-gray-400 mb-1">
                                        Cooking
                                      </p>
                                      <p className="text-base sm:text-lg font-bold text-white">
                                        {recipeInfo.cookingMinutes} min
                                      </p>
                                    </div>
                                  )}
                                  {recipeInfo?.readyInMinutes && (
                                    <div className="min-w-0">
                                      <p className="text-sm text-gray-400 mb-1">
                                        Total Time
                                      </p>
                                      <p className="text-base sm:text-lg font-bold text-white">
                                        {recipeInfo.readyInMinutes} min
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}

                        {/* Additional Metadata - same card/style as Summary (text-sm label, text-xl value on phone) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {recipeInfo?.cheap !== undefined && (
                            <Card className="group rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Budget Friendly
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white break-words">
                                    {recipeInfo.cheap ? "Yes" : "No"}
                                  </p>
                                </div>
                                {recipeInfo.cheap ? (
                                  <CheckCircle className="h-5 w-5 text-emerald-300 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </Card>
                          )}
                          {recipeInfo?.sustainable !== undefined && (
                            <Card className="group rounded-[28px] border border-green-400/30 bg-gradient-to-br from-green-500/25 via-green-500/10 to-green-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(34,197,94,0.35)] transition hover:border-green-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Sustainable
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white break-words">
                                    {recipeInfo.sustainable ? "Yes" : "No"}
                                  </p>
                                </div>
                                {recipeInfo.sustainable ? (
                                  <Leaf className="h-5 w-5 text-green-300 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </Card>
                          )}
                          {recipeInfo?.veryPopular !== undefined && (
                            <Card className="group rounded-[28px] border border-amber-400/30 bg-gradient-to-br from-amber-500/30 via-amber-500/15 to-amber-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(245,158,11,0.35)] transition hover:border-amber-300/60 backdrop-blur-sm min-w-0 overflow-hidden">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Very Popular
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white break-words">
                                    {recipeInfo.veryPopular ? "Yes" : "No"}
                                  </p>
                                </div>
                                {recipeInfo.veryPopular ? (
                                  <Star className="h-5 w-5 text-amber-300 fill-amber-300 flex-shrink-0" />
                                ) : (
                                  <Star className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </Card>
                          )}
                          {recipeInfo?.weightWatcherSmartPoints && (
                            <Card className="group rounded-[28px] border border-blue-400/30 bg-gradient-to-br from-blue-500/25 via-blue-500/10 to-blue-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(59,130,246,0.35)] transition hover:border-blue-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60 break-words">
                                    Weight Watchers Points
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white break-words">
                                    {recipeInfo.weightWatcherSmartPoints} points
                                  </p>
                                </div>
                                <Star className="h-5 w-5 text-blue-300 flex-shrink-0" />
                              </div>
                            </Card>
                          )}
                          {recipeInfo?.creditsText && (
                            <Card className="group rounded-[28px] border border-purple-400/30 bg-gradient-to-br from-purple-500/25 via-purple-500/10 to-purple-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(168,85,247,0.35)] transition hover:border-purple-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    Credits
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white break-words">
                                    {recipeInfo.creditsText}
                                  </p>
                                </div>
                                <ChefHat className="h-5 w-5 text-purple-300 flex-shrink-0" />
                              </div>
                            </Card>
                          )}
                          {recipeInfo?.license && (
                            <Card className="group rounded-[28px] border border-slate-400/30 bg-gradient-to-br from-slate-500/25 via-slate-500/10 to-slate-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(71,85,105,0.35)] transition hover:border-slate-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.45em] text-white/60">
                                    License
                                  </p>
                                  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-semibold text-white break-words">
                                    {recipeInfo.license}
                                  </p>
                                </div>
                                <FileText className="h-5 w-5 text-slate-300 flex-shrink-0" />
                              </div>
                            </Card>
                          )}
                          {recipeInfo?.occasions &&
                            recipeInfo.occasions.length > 0 && (
                              <Card className="rounded-[28px] border border-pink-400/30 bg-gradient-to-br from-pink-500/25 via-pink-500/10 to-pink-500/5 p-4 sm:p-6 shadow-[0_20px_60px_rgba(236,72,153,0.3)] transition hover:border-pink-300/50 min-w-0 overflow-hidden">
                                <div className="space-y-3 min-w-0">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-pink-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9">
                                      <Star className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <p className="recipe-detail-header text-white">
                                      Occasions
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2 min-w-0">
                                    {recipeInfo.occasions.map(
                                      (occasion, idx) => (
                                        <Badge
                                          key={idx}
                                          className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                                        >
                                          {occasion}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </Card>
                            )}
                          {recipeInfo?.gaps && (
                            <Card className="rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-4 sm:p-6 shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition hover:border-emerald-300/50 min-w-0 overflow-hidden">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9">
                                  <Info className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-400">
                                    GAPS Diet
                                  </p>
                                  <p className="text-base sm:text-lg font-semibold text-white break-words">
                                    {recipeInfo.gaps}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Details Tab - Ingredients, Instructions, Wine Pairing */}
                    {activeTab === "details" && (
                      <div className="space-y-6 mt-0 transition-opacity duration-300">
                        {/* Ingredients List - Enhanced with all API properties */}
                        {activeSubTab === "ingredients" &&
                          recipeInfo?.extendedIngredients &&
                          recipeInfo.extendedIngredients.length > 0 && (
                            <Card className="group rounded-[28px] border border-orange-400/30 bg-gradient-to-br from-orange-500/30 via-orange-500/15 to-orange-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(249,115,22,0.35)] transition hover:border-orange-300/60 backdrop-blur-sm min-w-0 overflow-hidden">
                              {/* Header: icon + title inline (same as Summary/Info) */}
                              <div className="space-y-4 min-w-0 mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-orange-300" />
                                  </div>
                                  <h3 className="recipe-detail-header text-white leading-tight break-words">
                                    Ingredients
                                  </h3>
                                </div>
                                <div className="min-w-0">
                                  <div className="space-y-3">
                                    {recipeInfo.extendedIngredients.map(
                                      (ingredient, idx) => (
                                        <div
                                          key={idx}
                                          className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors min-w-0"
                                        >
                                          {/* Image: full-width thumb on phone, small left on sm+ */}
                                          {ingredient.image && (
                                            <div className="relative flex-shrink-0 w-full sm:w-16 aspect-video sm:aspect-square sm:h-16 rounded-lg overflow-hidden border border-orange-500/20">
                                              <Image
                                                src={getIngredientImageUrl(
                                                  ingredient.image,
                                                )}
                                                alt={ingredient.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 64px"
                                                className="object-cover"
                                                unoptimized={true}
                                                onError={(e) => {
                                                  e.currentTarget.style.display =
                                                    "none";
                                                }}
                                              />
                                            </div>
                                          )}

                                          <div className="flex-1 min-w-0">
                                            {/* Number + title row */}
                                            <div className="flex items-start gap-2 mb-1 min-w-0">
                                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                                                <span className="text-xs font-semibold text-orange-300">
                                                  {idx + 1}
                                                </span>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm sm:text-base text-white font-medium break-words">
                                                  {ingredient.original}
                                                </p>
                                                {ingredient.originalName &&
                                                  ingredient.originalName !==
                                                    ingredient.name && (
                                                    <p className="text-xs text-gray-400 mt-0.5 break-words">
                                                      ({ingredient.originalName}
                                                      )
                                                    </p>
                                                  )}
                                                {ingredient.name &&
                                                  ingredient.name !==
                                                    ingredient.original && (
                                                    <p className="text-xs text-gray-400 mt-0.5 break-words">
                                                      Name: {ingredient.name}
                                                    </p>
                                                  )}
                                              </div>
                                            </div>

                                            {/* Aisle */}
                                            {ingredient.aisle && (
                                              <p className="text-xs text-gray-400 break-words mt-1">
                                                <span className="font-semibold">
                                                  Aisle:
                                                </span>{" "}
                                                {ingredient.aisle}
                                              </p>
                                            )}

                                            {/* Badges: one row, dynamic width, wrap (like Diets) */}
                                            <div className="flex flex-wrap gap-2 mt-2 min-w-0">
                                              {ingredient.measures?.us && (
                                                <Badge className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-500/10 text-orange-300 border-orange-500/20 w-fit">
                                                  US:{" "}
                                                  {
                                                    ingredient.measures.us
                                                      .amount
                                                  }{" "}
                                                  {
                                                    ingredient.measures.us
                                                      .unitShort
                                                  }
                                                </Badge>
                                              )}
                                              {ingredient.measures?.metric && (
                                                <Badge className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-500/10 text-orange-300 border-orange-500/20 w-fit">
                                                  Metric:{" "}
                                                  {Math.round(
                                                    ingredient.measures.metric
                                                      .amount * 100,
                                                  ) / 100}{" "}
                                                  {
                                                    ingredient.measures.metric
                                                      .unitShort
                                                  }
                                                </Badge>
                                              )}
                                              {ingredient.meta?.map(
                                                (meta, metaIdx) => (
                                                  <Badge
                                                    key={metaIdx}
                                                    variant="outline"
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-700/50 border-slate-600 text-gray-300 w-fit"
                                                  >
                                                    {meta}
                                                  </Badge>
                                                ),
                                              )}
                                              {ingredient.consistency && (
                                                <Badge
                                                  variant="outline"
                                                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-700/50 border-slate-600 text-gray-300 w-fit"
                                                >
                                                  {ingredient.consistency}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}

                        {/* Instructions - same layout as Summary/Ingredients: icon+title inline, stack, badges dynamic wrap */}
                        {activeSubTab === "instructions" &&
                        ((recipeInfo?.analyzedInstructions &&
                          recipeInfo.analyzedInstructions.length > 0) ||
                          recipeInfo?.instructions) ? (
                          <Card className="group rounded-[28px] border border-indigo-400/30 bg-gradient-to-br from-indigo-500/25 via-indigo-500/10 to-indigo-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(99,102,241,0.35)] transition hover:border-indigo-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                            {/* Header: icon + title inline (same as Summary/Info/Ingredients) */}
                            <div className="space-y-4 min-w-0 mb-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                  <List className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-300" />
                                </div>
                                <h3 className="recipe-detail-header text-white leading-tight break-words">
                                  Instructions
                                </h3>
                              </div>
                              <div className="min-w-0">
                                {recipeInfo.analyzedInstructions &&
                                recipeInfo.analyzedInstructions.length > 0 ? (
                                  <div className="space-y-4">
                                    {recipeInfo.analyzedInstructions.map(
                                      (instruction, instIdx) => (
                                        <div
                                          key={instIdx}
                                          className="space-y-3 min-w-0"
                                        >
                                          {instruction.name && (
                                            <h4 className="text-base sm:text-lg font-semibold text-blue-300 break-words">
                                              {instruction.name}
                                            </h4>
                                          )}
                                          {instruction.steps.map(
                                            (step, stepIdx) => (
                                              <div
                                                key={stepIdx}
                                                className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-[20px] border border-sky-400/30 bg-gradient-to-br from-sky-500/20 via-sky-500/8 to-sky-500/3 shadow-[0_15px_40px_rgba(14,165,233,0.25)] hover:border-sky-300/50 transition-all min-w-0"
                                              >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                  <span className="text-sm font-semibold text-blue-300">
                                                    {step.number}
                                                  </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-sm sm:text-base text-white leading-relaxed break-words">
                                                    {step.step}
                                                  </p>

                                                  {/* Ingredients used: badges dynamic, wrap in rows */}
                                                  {step.ingredients &&
                                                    step.ingredients.length >
                                                      0 && (
                                                      <div className="mt-3 min-w-0">
                                                        <p className="text-xs text-gray-400 mb-2">
                                                          Ingredients used:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 min-w-0">
                                                          {step.ingredients.map(
                                                            (ing, ingIdx) => (
                                                              <Badge
                                                                key={ingIdx}
                                                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 border-blue-500/30 w-fit"
                                                                title={
                                                                  ing.localizedName &&
                                                                  ing.localizedName !==
                                                                    ing.name
                                                                    ? `Localized: ${ing.localizedName}`
                                                                    : undefined
                                                                }
                                                              >
                                                                {ing.image && (
                                                                  <span className="relative inline-block w-4 h-4 rounded overflow-hidden flex-shrink-0">
                                                                    <Image
                                                                      src={getIngredientImageUrl(
                                                                        ing.image,
                                                                      )}
                                                                      alt=""
                                                                      fill
                                                                      sizes="16px"
                                                                      className="object-cover rounded"
                                                                      unoptimized={
                                                                        true
                                                                      }
                                                                      onError={(
                                                                        e,
                                                                      ) => {
                                                                        e.currentTarget.style.display =
                                                                          "none";
                                                                      }}
                                                                    />
                                                                  </span>
                                                                )}
                                                                <span className="break-words">
                                                                  {ing.name}
                                                                  {ing.localizedName &&
                                                                    ing.localizedName !==
                                                                      ing.name && (
                                                                      <span className="ml-1 text-blue-200/70">
                                                                        (
                                                                        {
                                                                          ing.localizedName
                                                                        }
                                                                        )
                                                                      </span>
                                                                    )}
                                                                </span>
                                                              </Badge>
                                                            ),
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}

                                                  {/* Equipment needed: badges dynamic, wrap in rows */}
                                                  {step.equipment &&
                                                    step.equipment.length >
                                                      0 && (
                                                      <div className="mt-3 min-w-0">
                                                        <p className="text-xs text-gray-400 mb-2">
                                                          Equipment needed:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 min-w-0">
                                                          {step.equipment.map(
                                                            (eq, eqIdx) => (
                                                              <Badge
                                                                key={eqIdx}
                                                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 border-indigo-500/30 w-fit"
                                                                title={
                                                                  eq.localizedName &&
                                                                  eq.localizedName !==
                                                                    eq.name
                                                                    ? `Localized: ${eq.localizedName}`
                                                                    : undefined
                                                                }
                                                              >
                                                                {eq.image && (
                                                                  <span className="relative inline-block w-4 h-4 rounded overflow-hidden flex-shrink-0">
                                                                    <Image
                                                                      src={getEquipmentImageUrl(
                                                                        eq.image,
                                                                      )}
                                                                      alt=""
                                                                      fill
                                                                      sizes="16px"
                                                                      className="object-cover rounded"
                                                                      unoptimized={
                                                                        true
                                                                      }
                                                                      onError={(
                                                                        e,
                                                                      ) => {
                                                                        e.currentTarget.style.display =
                                                                          "none";
                                                                      }}
                                                                    />
                                                                  </span>
                                                                )}
                                                                <span className="break-words">
                                                                  {eq.name}
                                                                  {eq.localizedName &&
                                                                    eq.localizedName !==
                                                                      eq.name && (
                                                                      <span className="ml-1 text-indigo-200/70">
                                                                        (
                                                                        {
                                                                          eq.localizedName
                                                                        }
                                                                        )
                                                                      </span>
                                                                    )}
                                                                </span>
                                                              </Badge>
                                                            ),
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : recipeInfo.instructions ? (
                                  <div className="prose prose-invert max-w-none text-sm sm:text-base">
                                    <div
                                      className="text-white leading-relaxed whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{
                                        __html: recipeInfo.instructions,
                                      }}
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </Card>
                        ) : null}

                        {/* Wine Pairing - same layout as Summary/Ingredients: icon+title inline, stack, badges dynamic wrap */}
                        {activeSubTab === "wine" && recipeInfo?.winePairing && (
                          <Card className="rounded-[28px] border border-purple-400/30 bg-gradient-to-br from-purple-900/30 to-pink-900/30 shadow-[0_30px_80px_rgba(168,85,247,0.25)] p-4 sm:p-6 backdrop-blur-sm min-w-0 overflow-hidden transition hover:border-purple-300/50">
                            {/* Header: icon + title inline (same as other tabs) */}
                            <div className="space-y-4 min-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                  <Wine className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                                </div>
                                <h3 className="recipe-detail-header text-white leading-tight break-words">
                                  Wine Pairing
                                </h3>
                              </div>
                              <div className="min-w-0">
                                {/* Recommended Wines: badges dynamic, wrap in rows */}
                                {recipeInfo.winePairing.pairedWines &&
                                  recipeInfo.winePairing.pairedWines.length >
                                    0 && (
                                    <div className="mb-4 min-w-0">
                                      <p className="text-sm text-gray-400 mb-2">
                                        Recommended Wines:
                                      </p>
                                      <div className="flex flex-wrap gap-2 min-w-0">
                                        {recipeInfo.winePairing.pairedWines.map(
                                          (wine, idx) => (
                                            <Badge
                                              key={idx}
                                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-500/20 backdrop-blur-sm text-purple-300 border-purple-500/30 w-fit break-words"
                                            >
                                              {wine}
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {/* Pairing description: wrap, no truncation */}
                                {recipeInfo.winePairing.pairingText && (
                                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4 break-words min-w-0">
                                    {recipeInfo.winePairing.pairingText}
                                  </p>
                                )}
                                {/* Product recommendations: stack on phone, badges dynamic */}
                                {recipeInfo.winePairing.productMatches &&
                                  recipeInfo.winePairing.productMatches.length >
                                    0 && (
                                    <div className="space-y-3 min-w-0">
                                      <p className="text-sm text-gray-400 mb-2">
                                        Product Recommendations:
                                      </p>
                                      {recipeInfo.winePairing.productMatches.map(
                                        (product, idx) => (
                                          <div
                                            key={idx}
                                            className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors min-w-0 overflow-hidden"
                                          >
                                            {product.imageUrl && (
                                              <div className="relative flex-shrink-0 w-full sm:w-24 aspect-video sm:aspect-square sm:h-24 rounded-lg overflow-hidden border border-purple-500/20">
                                                <Image
                                                  src={product.imageUrl}
                                                  alt={product.title}
                                                  fill
                                                  sizes="(max-width: 640px) 100vw, 96px"
                                                  className="object-cover"
                                                />
                                              </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm sm:text-base text-white font-semibold mb-1 break-words">
                                                {product.title}
                                              </p>
                                              {product.description && (
                                                <p className="text-xs sm:text-sm text-gray-300 mb-3 break-words">
                                                  {product.description}
                                                </p>
                                              )}
                                              <div className="flex flex-wrap items-center gap-2 min-w-0">
                                                <Badge className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 border-purple-500/30 w-fit">
                                                  {product.price}
                                                </Badge>
                                                <Badge className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-300 border-yellow-500/30 w-fit">
                                                  Rating:{" "}
                                                  {product.averageRating.toFixed(
                                                    1,
                                                  )}
                                                  /5
                                                  {product.ratingCount > 0 && (
                                                    <span className="ml-1">
                                                      ({product.ratingCount}{" "}
                                                      reviews)
                                                    </span>
                                                  )}
                                                </Badge>
                                                {product.score != null && (
                                                  <Badge className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 border-green-500/30 w-fit">
                                                    Score:{" "}
                                                    {(
                                                      product.score * 100
                                                    ).toFixed(0)}
                                                    %
                                                  </Badge>
                                                )}
                                                {product.link && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="inline-flex items-center gap-1 px-2 py-1 h-auto text-xs bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                                                    onClick={() =>
                                                      window.open(
                                                        product.link,
                                                        "_blank",
                                                        "noopener,noreferrer",
                                                      )
                                                    }
                                                  >
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                    View on Amazon
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Analysis Tab */}
                    {activeTab === "analysis" && (
                      <div className="space-y-6 mt-0 transition-opacity duration-300">
                        <Suspense
                          fallback={
                            <div className="text-gray-400 p-6">
                              Loading analysis...
                            </div>
                          }
                        >
                          <RecipeAnalysis recipeId={id} />
                        </Suspense>
                      </div>
                    )}

                    {/* Modifications Tab */}
                    {activeTab === "modifications" && recipeInfo && (
                      <div className="space-y-6 mt-0 transition-opacity duration-300">
                        <Suspense
                          fallback={
                            <div className="text-gray-400 p-6">
                              Loading modifications...
                            </div>
                          }
                        >
                          <RecipeModifications
                            recipeInfo={recipeInfo}
                            activeSubTab={activeSubTab}
                          />
                        </Suspense>
                      </div>
                    )}

                    {/* Nutrition Tab - Display full nutrition data; icon+title inline, content from start */}
                    {activeTab === "nutrition" && recipeInfo?.nutrition && (
                      <div className="space-y-6 mt-0 transition-opacity duration-300 min-w-0">
                        <Card className="group rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/50 backdrop-blur-sm min-w-0 overflow-hidden">
                          <div className="space-y-4 min-w-0">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-white leading-tight break-words min-w-0 flex-1">
                                Nutritional Information
                              </h3>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base text-gray-400 mb-4 break-words">
                                All values are per serving. Multiply by number
                                of servings for total recipe nutrition.
                              </p>

                              {/* Caloric Breakdown */}
                              {recipeInfo.nutrition.caloricBreakdown && (
                                <div className="mb-4 sm:mb-6 min-w-0">
                                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3">
                                    Caloric Breakdown
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                                    <Card className="group rounded-[28px] border border-pink-400/30 bg-gradient-to-br from-pink-500/25 via-pink-500/10 to-pink-500/5 p-6 shadow-[0_30px_80px_rgba(236,72,153,0.35)] transition hover:border-pink-300/50 backdrop-blur-sm">
                                      <div className="flex items-start justify-between gap-4">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                                            Protein
                                          </p>
                                          <p className="mt-3 text-lg sm:text-3xl font-semibold text-white">
                                            {Math.round(
                                              recipeInfo.nutrition
                                                .caloricBreakdown
                                                .percentProtein,
                                            )}
                                            %
                                          </p>
                                        </div>
                                      </div>
                                    </Card>
                                    <Card className="group rounded-[28px] border border-amber-400/30 bg-gradient-to-br from-amber-500/30 via-amber-500/15 to-amber-500/5 p-6 shadow-[0_30px_80px_rgba(245,158,11,0.35)] transition hover:border-amber-300/60 backdrop-blur-sm">
                                      <div className="flex items-start justify-between gap-4">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                                            Fat
                                          </p>
                                          <p className="mt-3 text-lg sm:text-3xl font-semibold text-white">
                                            {Math.round(
                                              recipeInfo.nutrition
                                                .caloricBreakdown.percentFat,
                                            )}
                                            %
                                          </p>
                                        </div>
                                      </div>
                                    </Card>
                                    <Card className="group rounded-[28px] border border-sky-400/30 bg-gradient-to-br from-sky-500/25 via-sky-500/10 to-sky-500/5 p-6 shadow-[0_30px_80px_rgba(14,165,233,0.35)] transition hover:border-sky-300/50 backdrop-blur-sm">
                                      <div className="flex items-start justify-between gap-4">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                                            Carbs
                                          </p>
                                          <p className="mt-3 text-lg sm:text-3xl font-semibold text-white">
                                            {Math.round(
                                              recipeInfo.nutrition
                                                .caloricBreakdown.percentCarbs,
                                            )}
                                            %
                                          </p>
                                        </div>
                                      </div>
                                    </Card>
                                  </div>
                                </div>
                              )}

                              {/* Weight Per Serving */}
                              {recipeInfo.nutrition.weightPerServing && (
                                <div className="mb-4 sm:mb-6 min-w-0">
                                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2 min-w-0">
                                    <Scale className="h-4 w-4 text-green-400 flex-shrink-0" />
                                    <span className="break-words">
                                      Weight Per Serving
                                    </span>
                                  </h4>
                                  <div className="inline-flex items-center gap-2 rounded-[20px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 via-emerald-500/8 to-emerald-500/3 px-4 py-3 shadow-[0_15px_40px_rgba(16,185,129,0.25)] w-fit">
                                    <Scale className="h-4 w-4 text-emerald-300" />
                                    <p className="text-sm font-semibold text-white">
                                      {Math.round(
                                        recipeInfo.nutrition.weightPerServing
                                          .amount,
                                      )}{" "}
                                      {
                                        recipeInfo.nutrition.weightPerServing
                                          .unit
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Key Nutrients */}
                              {recipeInfo.nutrition.nutrients &&
                                recipeInfo.nutrition.nutrients.length > 0 && (
                                  <div className="mb-4 sm:mb-6 min-w-0">
                                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3">
                                      Key Nutrients
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
                                      {recipeInfo.nutrition.nutrients.map(
                                        (nutrient, idx) => (
                                          <Card
                                            key={idx}
                                            className="group rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-6 shadow-[0_30px_80px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/50 backdrop-blur-sm"
                                          >
                                            <div className="flex items-start justify-between gap-4">
                                              <div>
                                                <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                                                  {nutrient.name}
                                                </p>
                                                <p className="mt-3 text-lg sm:text-3xl font-semibold text-white">
                                                  {Math.round(
                                                    nutrient.amount * 100,
                                                  ) / 100}{" "}
                                                  {nutrient.unit}
                                                  {nutrient.percentOfDailyNeeds && (
                                                    <span className="text-xs text-gray-400 ml-2">
                                                      (
                                                      {Math.round(
                                                        nutrient.percentOfDailyNeeds,
                                                      )}
                                                      % DV)
                                                    </span>
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </Card>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Properties */}
                              {recipeInfo.nutrition.properties &&
                                recipeInfo.nutrition.properties.length > 0 && (
                                  <div className="mb-4 sm:mb-6 min-w-0">
                                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2 min-w-0">
                                      <FlaskConical className="h-4 w-4 text-green-400 flex-shrink-0" />
                                      <span className="break-words">
                                        Properties
                                      </span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
                                      {recipeInfo.nutrition.properties.map(
                                        (property, idx) => (
                                          <Card
                                            key={idx}
                                            className="group rounded-[28px] border border-violet-400/30 bg-gradient-to-br from-violet-500/25 via-violet-500/10 to-violet-500/5 p-6 shadow-[0_30px_80px_rgba(139,92,246,0.35)] transition hover:border-violet-300/50 backdrop-blur-sm"
                                          >
                                            <div className="flex items-start justify-between gap-4">
                                              <div>
                                                <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                                                  {property.name}
                                                </p>
                                                <p className="mt-3 text-lg sm:text-3xl font-semibold text-white">
                                                  {property.amount.toFixed(1)}{" "}
                                                  {property.unit}
                                                </p>
                                              </div>
                                            </div>
                                          </Card>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Flavonoids */}
                              {recipeInfo.nutrition.flavonoids &&
                                recipeInfo.nutrition.flavonoids.length > 0 && (
                                  <div className="min-w-0">
                                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2 min-w-0">
                                      <Flower2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                                      <span className="break-words">
                                        Flavonoids
                                      </span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
                                      {recipeInfo.nutrition.flavonoids.map(
                                        (flavonoid, idx) => (
                                          <Card
                                            key={idx}
                                            className="group rounded-[28px] border border-purple-400/30 bg-gradient-to-br from-purple-500/25 via-purple-500/10 to-purple-500/5 p-6 shadow-[0_30px_80px_rgba(168,85,247,0.35)] transition hover:border-purple-300/50 backdrop-blur-sm"
                                          >
                                            <div className="flex items-start justify-between gap-4">
                                              <div>
                                                <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                                                  {flavonoid.name}
                                                </p>
                                                <p className="mt-3 text-lg sm:text-3xl font-semibold text-white">
                                                  {Math.round(
                                                    flavonoid.amount * 100,
                                                  ) / 100}{" "}
                                                  {flavonoid.unit}
                                                </p>
                                              </div>
                                            </div>
                                          </Card>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Taste Tab - icon+title inline, content from start */}
                    {activeTab === "taste" && recipeInfo?.taste && (
                      <div className="space-y-6 mt-0 transition-opacity duration-300 min-w-0">
                        <Card className="group rounded-[28px] border border-orange-400/30 bg-gradient-to-br from-orange-500/30 via-orange-500/15 to-orange-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(249,115,22,0.35)] transition hover:border-orange-300/60 backdrop-blur-sm min-w-0 overflow-hidden">
                          <div className="space-y-4 min-w-0">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-300" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-white leading-tight break-words min-w-0 flex-1">
                                Taste Profile
                              </h3>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base text-gray-400 mb-4 break-words">
                                A breakdown of the recipe&apos;s taste
                                attributes. Values are normalized on a scale of
                                0-100.
                              </p>

                              <div className="space-y-4 min-w-0">
                                {Object.entries(recipeInfo.taste).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="space-y-2 min-w-0"
                                    >
                                      <div className="flex items-center justify-between gap-2 min-w-0">
                                        <p className="text-sm sm:text-base text-gray-300 capitalize font-medium break-words min-w-0">
                                          {key
                                            .replace(/([A-Z])/g, " $1")
                                            .trim()}
                                        </p>
                                        <span className="text-sm text-gray-400 w-12 text-right flex-shrink-0">
                                          {Math.round(value)}%
                                        </span>
                                      </div>
                                      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              Math.max(0, value),
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Notes Tab - Lazy loaded */}
                    {activeTab === "notes" && isAuthenticated && (
                      <div className="space-y-4 mt-0 transition-opacity duration-300">
                        <Suspense fallback={<div className="h-64 w-full" />}>
                          {recipe && <RecipeNotes recipe={recipe} />}
                        </Suspense>
                      </div>
                    )}

                    {/* Images Tab - Lazy loaded */}
                    {activeTab === "images" && isAuthenticated && (
                      <div className="space-y-4 mt-0 transition-opacity duration-300">
                        <Suspense fallback={<div className="h-64 w-full" />}>
                          {recipe && <RecipeImageGallery recipe={recipe} />}
                        </Suspense>
                      </div>
                    )}

                    {/* Videos Tab - Lazy loaded */}
                    {activeTab === "videos" && isAuthenticated && (
                      <div className="space-y-4 mt-0 transition-opacity duration-300">
                        <Suspense fallback={<div className="h-64 w-full" />}>
                          {recipeInfo && (
                            <RecipeVideoPlayer recipeId={recipeInfo.id} />
                          )}
                        </Suspense>
                      </div>
                    )}
                  </div>
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
    </div>
  );
});

RecipePageContent.displayName = "RecipePageContent";

/**
 * Recipe Page Client Component
 * Contains all client-side logic and providers
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */
export default function RecipePageClient() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <RecipePageContent />
      </RecipeProvider>
    </AuthProvider>
  );
}
