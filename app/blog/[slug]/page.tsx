import BlogPostPageClient from "@/components/pages/BlogPostPage";

/**
 * Blog Post Detail Page (Server Component)
 *
 * Displays single blog post from Contentful CMS
 * This is a Server Component that imports the Client Component
 * for faster initial page load and better SEO
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */
export default function BlogPostPage() {
  return <BlogPostPageClient />;
}

/**
 * Metadata for the page
 * Note: Dynamic metadata would require generateMetadata function
 */
export const metadata = {
  title: "Blog Post | FlavorVerse",
  description: "Read our latest recipe blog post and culinary insights.",
};
