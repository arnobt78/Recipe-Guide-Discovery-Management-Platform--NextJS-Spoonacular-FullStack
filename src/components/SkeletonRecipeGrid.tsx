/**
 * Skeleton Loading Component for Recipe Grid
 * 
 * Matches exact dimensions and layout of RecipeGrid component
 * Displays multiple skeleton cards in grid layout
 */

import SkeletonRecipeCard from "./SkeletonRecipeCard";

interface SkeletonRecipeGridProps {
  count?: number;
}

const SkeletonRecipeGrid = ({ count = 8 }: SkeletonRecipeGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRecipeCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonRecipeGrid;

