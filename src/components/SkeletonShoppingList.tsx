/**
 * Skeleton Loading Component for Shopping List Generator
 *
 * Matches exact dimensions of ShoppingListGenerator component
 * Following DEVELOPMENT_RULES.md: Skeleton loading with exact dimensions
 */

import { memo } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

/**
 * Skeleton Shopping List Component (Memoized for performance)
 *
 * Exact dimension matching for ShoppingListGenerator loading state
 */
const SkeletonShoppingList = memo(() => {
  return (
    <div className="space-y-6">
      {/* Create List Card Skeleton */}
      <Card className="glow-card border-purple-500/30">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lists Grid Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glow-card border-purple-500/30">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-3 w-full" />
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
});

SkeletonShoppingList.displayName = "SkeletonShoppingList";

export default SkeletonShoppingList;

