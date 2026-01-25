/**
 * Skeleton Loading Component for Blog Post List
 * 
 * Matches exact dimensions and layout of BlogPostList component
 * Displays multiple skeleton cards in grid layout
 */

import SkeletonBlogPostCard from "./SkeletonBlogPostCard";

interface SkeletonBlogPostListProps {
  count?: number;
}

const SkeletonBlogPostList = ({ count = 6 }: SkeletonBlogPostListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlogPostCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonBlogPostList;
