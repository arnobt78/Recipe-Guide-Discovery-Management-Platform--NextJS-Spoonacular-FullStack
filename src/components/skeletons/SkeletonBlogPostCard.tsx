/**
 * Skeleton Loading Component for Blog Post Card
 * 
 * Matches exact dimensions and layout of BlogPostCard component
 * Displays skeleton card with image, title, excerpt, and metadata
 */

import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const SkeletonBlogPostCard = () => {
  return (
    <Card className="glow-card group h-full flex flex-col overflow-hidden min-h-[400px]">
      {/* Image Skeleton */}
      <div className="relative overflow-hidden rounded-t-lg h-48">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content Skeleton */}
      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
        {/* Category Badge Skeleton */}
        <div className="mb-3">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Title Skeleton */}
        <div className="mb-3">
          <Skeleton className="h-7 w-full mb-2" />
          <Skeleton className="h-7 w-3/4" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="mb-4 flex-1">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Metadata Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonBlogPostCard;
