/**
 * Skeleton Loading Component for Search Input
 * 
 * Matches exact dimensions and layout of SearchInput component
 */

import { Skeleton } from "./ui/skeleton";

const SkeletonSearchInput = () => {
  return (
    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-2 border border-purple-500/30 shadow-glow">
      {/* Input Skeleton */}
      <Skeleton className="flex-1 h-14 px-4" />
      {/* Button Skeleton */}
      <Skeleton className="w-14 h-14 rounded-lg ml-2" />
    </div>
  );
};

export default SkeletonSearchInput;

