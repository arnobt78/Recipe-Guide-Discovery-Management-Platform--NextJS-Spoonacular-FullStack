/**
 * Blog Post List Component
 *
 * Features:
 * - Display blog posts in grid layout
 * - Pagination support
 * - Category filtering
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo } from "react";
import { useBlogPosts } from "../../hooks/useBlogPosts";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import EmptyState from "../common/EmptyState";
import SkeletonBlogPostList from "../skeletons/SkeletonBlogPostList";
import BlogPostCard from "./BlogPostCard";

interface BlogPostListProps {
  category?: string;
  limit?: number;
  className?: string;
}

/**
 * Blog Post List Component (Memoized for performance)
 */
const BlogPostList = memo(({ category, limit = 12, className = "" }: BlogPostListProps) => {
  const { data, isLoading, error, refetch } = useBlogPosts(
    { skip: 0, limit, category },
    true
  );

  if (isLoading) {
    return <SkeletonBlogPostList count={limit} />;
  }

  if (error) {
    return (
      <Card className="glow-card border-red-500/30">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 mb-4">{error.message}</p>
          <Button
            onClick={() => refetch()}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <EmptyState
        message="No blog posts found"
        subtitle={category ? `No posts in category "${category}"` : "Check back later for new content"}
        icon="/food.svg"
      />
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.posts.map((post, index) => (
          <BlogPostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
});

BlogPostList.displayName = "BlogPostList";

export default BlogPostList;
