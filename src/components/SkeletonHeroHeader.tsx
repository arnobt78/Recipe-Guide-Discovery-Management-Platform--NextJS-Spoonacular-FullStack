/**
 * Skeleton Loading Component for Hero Header
 * 
 * Matches exact dimensions and layout of HeroHeader component
 */

import { Skeleton } from "./ui/skeleton";

const SkeletonHeroHeader = () => {
  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden">
      {/* Image Skeleton - matches HeroHeader height (h-[500px]) */}
      <Skeleton className="w-full h-[500px]" />
      
      {/* Content Skeleton */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Icons Skeleton */}
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
            <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
            <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
          </div>
          {/* Title Skeleton */}
          <Skeleton className="h-16 w-64 mx-auto" />
          {/* Subtitle Skeleton */}
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonHeroHeader;

