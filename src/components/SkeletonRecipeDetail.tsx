/**
 * Skeleton Loading Component for Recipe Detail Card/Page
 * 
 * Matches exact dimensions and layout of RecipeDetailCard and RecipePage components
 * Used during loading states for consistent UI
 * 
 * Features:
 * - Exact dimension matching for hero image, badges, tabs, and content
 * - Responsive design (phone-screen and sm:screen)
 * - Reusable across RecipeDetailCard and RecipePage
 */

import { memo } from "react";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

/**
 * Skeleton Recipe Detail Component (Memoized for performance)
 * 
 * Exact dimension matching for recipe detail loading state
 */
const SkeletonRecipeDetail = memo(() => {
  return (
    <div className="space-y-6">
      {/* Hero Image Skeleton - matches RecipePage hero image (aspect-video sm:aspect-[21/9]) */}
      <Card className="glow-card border-purple-500/30 overflow-hidden">
        <div className="relative aspect-video sm:aspect-[21/9]">
          <Skeleton className="w-full h-full" />
        </div>
      </Card>

      {/* Tabs Section Skeleton */}
      <Card className="glow-card border-purple-500/30">
        <CardContent className="p-4 sm:p-6">
          {/* Tabs Skeleton - Responsive grid (matches RecipePage dynamic grid) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full hidden sm:block" />
            <Skeleton className="h-10 w-full hidden lg:block" />
            <Skeleton className="h-10 w-full hidden lg:block" />
            <Skeleton className="h-10 w-full hidden lg:block" />
          </div>

          {/* Data Source Note Skeleton */}
          <Skeleton className="h-20 w-full mb-6 rounded-lg" />

          {/* Key Info Badges Skeleton - Responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Summary Content Skeleton */}
          <div className="space-y-4 mb-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Additional Info Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Source Link Card Skeleton */}
          <Skeleton className="h-32 w-full mb-6 rounded-lg" />

          {/* Similar Recipes Skeleton */}
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
});

SkeletonRecipeDetail.displayName = "SkeletonRecipeDetail";

export default SkeletonRecipeDetail;

