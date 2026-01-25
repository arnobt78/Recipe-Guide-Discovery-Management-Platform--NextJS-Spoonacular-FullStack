"use client";

import { useParams } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { RecipeProvider } from "@/context/RecipeContext";
import BlogPostDetail from "@/components/blog/BlogPostDetail";
import Navbar from "@/components/layout/Navbar";
import HeroHeader from "@/components/layout/HeroHeader";

/**
 * Blog Post Detail Page
 * Displays single blog post from Contentful CMS
 * Next.js App Router - Client Component
 */
export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : null;

  return (
    <AuthProvider>
      <RecipeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <HeroHeader />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
            {slug && <BlogPostDetail slug={slug} />}
          </main>
        </div>
      </RecipeProvider>
    </AuthProvider>
  );
}
