"use client";

import { AuthProvider } from "@/context/AuthContext";
import { RecipeProvider } from "@/context/RecipeContext";
import BlogPostList from "@/components/blog/BlogPostList";
import Navbar from "@/components/layout/Navbar";
import HeroHeader from "@/components/layout/HeroHeader";

/**
 * Blog Page
 * Displays blog posts list from Contentful CMS
 * Next.js App Router - Client Component
 */
export default function BlogPage() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <HeroHeader />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Recipe Blog & Articles
              </h1>
              <p className="text-gray-400 text-lg">
                Discover cooking tips, recipe stories, and culinary insights
              </p>
            </div>
            <BlogPostList limit={12} />
          </main>
        </div>
      </RecipeProvider>
    </AuthProvider>
  );
}
