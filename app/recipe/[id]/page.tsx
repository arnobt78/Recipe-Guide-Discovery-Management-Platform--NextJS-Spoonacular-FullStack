import RecipePageClient from "@/components/pages/RecipePage";

/**
 * Recipe Detail Page (Server Component)
 *
 * Displays individual recipe details
 * This is a Server Component that imports the Client Component
 * for faster initial page load and better SEO
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */
export default function RecipePage() {
  return <RecipePageClient />;
}

/**
 * Metadata for the page
 * Note: Dynamic metadata would require generateMetadata function
 */
export const metadata = {
  title: "Recipe Details | FlavorVerse",
  description:
    "View detailed recipe information including ingredients, instructions, nutrition, and more.",
};
