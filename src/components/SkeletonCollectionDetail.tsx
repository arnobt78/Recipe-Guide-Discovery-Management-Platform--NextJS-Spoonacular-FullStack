/**
 * Skeleton Loading Component for Collection Detail View
 *
 * Matches exact dimensions and layout of CollectionDetailView component
 * Used during loading states for consistent UI
 */

import { Card, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import SkeletonRecipeGrid from "./SkeletonRecipeGrid";

const SkeletonCollectionDetail = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Card className="glow-card border-purple-500/30 flex-1">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recipes Grid Skeleton */}
      <SkeletonRecipeGrid count={4} />
    </div>
  );
};

export default SkeletonCollectionDetail;

