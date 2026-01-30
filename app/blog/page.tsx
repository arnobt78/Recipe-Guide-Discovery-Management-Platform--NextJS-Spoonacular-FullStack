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
          <main className=" max-w-9xl mx-auto px-2 sm:px-4 md:px-6 xl:px-8 py-8">
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
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
