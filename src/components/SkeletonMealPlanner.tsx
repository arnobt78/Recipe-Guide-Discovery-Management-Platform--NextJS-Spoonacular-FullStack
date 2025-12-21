/**
 * Skeleton Loading Component for Meal Planner
 *
 * Matches exact dimensions of MealPlanner component
 * Following DEVELOPMENT_RULES.md: Skeleton loading with exact dimensions
 */

import { memo } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

/**
 * Skeleton Meal Planner Component (Memoized for performance)
 *
 * Exact dimension matching for MealPlanner loading state
 */
const SkeletonMealPlanner = memo(() => {
  return (
    <div className="space-y-6">
      {/* Week Navigation Skeleton */}
      <Card className="glow-card border-purple-500/30">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
      </Card>

      {/* Week Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="glow-card border-purple-500/30">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-16 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

SkeletonMealPlanner.displayName = "SkeletonMealPlanner";

export default SkeletonMealPlanner;

