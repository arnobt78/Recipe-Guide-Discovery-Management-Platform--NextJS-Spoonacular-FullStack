/**
 * Blog Post Card Component
 *
 * Reusable card component for displaying blog post information
 * Features:
 * - ShadCN Card component
 * - Gradient glow effects
 * - Featured image support
 * - Hover animations
 * - Category badges
 * - Author and date metadata
 */

import { memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BlogPost } from "../../types";
import { Calendar, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
  onClick?: () => void;
}

/**
 * Blog Post Card Component (Memoized for performance)
 */
const BlogPostCard = memo(({ post, index = 0, onClick }: BlogPostCardProps) => {
  const router = useRouter();

  // Optimize loading: First 6 cards load eagerly
  const shouldLoadEagerly = index < 6;

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/blog/${post.slug}`);
    }
  };

  // Format published date
  const publishedDate = new Date(post.publishedAt);
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true });

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      <Card className="glow-card group h-full flex flex-col overflow-hidden min-h-[400px]">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative overflow-hidden rounded-t-lg h-48">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.title || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              priority={shouldLoadEagerly}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Category Badge */}
            {post.category && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-purple-500/80 backdrop-blur-sm text-white border-purple-400/30">
                  {post.category}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
          {/* Category Badge (if no image) */}
          {!post.featuredImage && post.category && (
            <div className="mb-3">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {post.category}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm sm:text-base text-gray-400 mb-4 flex-1 line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3">
              {post.author?.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-300" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-white font-medium">
                  {post.author?.name || "Unknown"}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {timeAgo}
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  className="bg-slate-700/50 text-slate-300 border-slate-600/30 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

BlogPostCard.displayName = "BlogPostCard";

export default BlogPostCard;
