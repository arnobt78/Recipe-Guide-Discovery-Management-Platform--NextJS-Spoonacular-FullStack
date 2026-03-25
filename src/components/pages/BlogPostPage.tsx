/**
 * Blog Post Detail Page Client Component
 *
 * Features:
 * - Displays single blog post from Contentful CMS
 * - Wraps with auth and recipe providers
 * - Client-side rendering for interactive features
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */

"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AuthProvider } from "../../context/AuthContext";
import { RecipeProvider } from "../../context/RecipeContext";
import { useBlogPost } from "../../hooks/useBlogPosts";
import BlogPostDetail from "../blog/BlogPostDetail";
import Navbar from "../layout/Navbar";
import HeroHeader from "../layout/HeroHeader";
import { Badge } from "../ui/badge";
import { Calendar, User, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SafeImage } from "@/components/ui/safe-image";

/**
 * Blog Post Hero Content Component
 * Displays post metadata in the hero section
 */
function BlogPostHeroContent({ slug }: { slug: string }) {
  const { data: post, isLoading } = useBlogPost(slug, !!slug);

  if (isLoading || !post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="h-8 w-64 bg-white/10 animate-pulse rounded-lg" />
        <div className="h-4 w-48 bg-white/10 animate-pulse rounded-lg" />
      </motion.div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="flex flex-col items-center gap-4 w-full"
    >
      {/* Author, Date, and Category - Single responsive row */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Author Badge */}
        {post.author && (
          <Badge className="bg-teal-500/20 backdrop-blur-sm text-teal-200 border-teal-400/30 px-4 py-2 h-10 text-sm inline-flex items-center gap-2">
            {post.author.avatar ? (
              <SafeImage
                src={post.author.avatar}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span>{post.author.name}</span>
          </Badge>
        )}

        {/* Date Badge */}
        <Badge className="bg-purple-500/20 backdrop-blur-sm text-purple-300 border-purple-500/30 px-4 py-2 h-10 text-sm inline-flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{timeAgo}</span>
        </Badge>

        {/* Category Badge */}
        {post.category && (
          <Badge className="bg-pink-500/20 backdrop-blur-sm text-pink-300 border-pink-500/30 px-4 py-2 h-10 text-sm inline-flex items-center">
            {post.category}
          </Badge>
        )}
      </div>

      {/* CMS Badge */}
      <Badge className="bg-slate-500/20 backdrop-blur-sm text-slate-300 border-slate-500/30 px-4 py-2 h-10 text-sm inline-flex items-center gap-2 mt-2">
        <Sparkles className="h-4 w-4" />
        Powered by Contentful CMS
      </Badge>
    </motion.div>
  );
}

/**
 * Blog Post Detail Page Client Component
 * Contains all client-side logic and providers
 */
export default function BlogPostPageClient() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : null;
  const { data: post } = useBlogPost(slug || "", !!slug);

  return (
    <AuthProvider>
      <RecipeProvider>
        <div
          className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col"
          style={{
            backgroundImage: "url(/recipe-bg-4.avif)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <Navbar />
          <HeroHeader subtitle={post?.title || "Loading..."}>
            {slug && <BlogPostHeroContent slug={slug} />}
          </HeroHeader>
          <div className="w-full flex-1">
            <main className="max-w-9xl mx-auto px-2 sm:px-4 md:px-6 xl:px-8 py-8">
              {slug && <BlogPostDetail slug={slug} hideHeader />}
            </main>
          </div>
        </div>
      </RecipeProvider>
    </AuthProvider>
  );
}
