/**
 * Skeleton Loading Component for Recipe Card
 * 
 * Matches exact dimensions and layout of RecipeCard component
 * Used during loading states for consistent UI
 */

import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const SkeletonRecipeCard = () => {
  return (
    <Card className="glow-card h-full flex flex-col">
      {/* Image Skeleton - matches RecipeCard image height (h-48) */}
      <div className="relative overflow-hidden rounded-t-lg">
        <Skeleton className="w-full h-48" />
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title and Favourite Button Skeleton */}
        <div className="flex items-start gap-3 flex-1">
          {/* Favourite Button Skeleton */}
          <Skeleton className="w-[33px] h-[33px] rounded-full flex-shrink-0" />
          
          {/* Title Skeleton - matches RecipeCard title */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonRecipeCard;

