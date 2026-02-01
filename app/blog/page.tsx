import BlogPageClient from "@/components/pages/BlogPage";

/**
 * Blog Page (Server Component)
 *
 * Displays blog posts list from Contentful CMS
 * This is a Server Component that imports the Client Component
 * for faster initial page load and better SEO
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */
export default function BlogPage() {
  return <BlogPageClient />;
}

/**
 * Metadata for the page
 */
export const metadata = {
  title: "Recipe Blog & Articles | FlavorVerse",
  description:
    "Discover cooking tips, recipe stories, and culinary insights from our recipe blog.",
};
