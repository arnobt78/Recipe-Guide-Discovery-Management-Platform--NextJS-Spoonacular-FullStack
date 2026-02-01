import HomePageClient from "@/components/pages/HomePage";

/**
 * Home Page (Server Component)
 *
 * Main landing page for the Recipe App
 * This is a Server Component that imports the Client Component
 * for faster initial page load and better SEO
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */
export default function HomePage() {
  return <HomePageClient />;
}

/**
 * Metadata for the page
 */
export const metadata = {
  title: "Recipe App | Discover & Save Your Favourite Recipes",
  description:
    "A modern full-stack recipe app to search, view, and save your favourite recipes. Built with React, Node.js, PostgreSQL, and Spoonacular API.",
};
