import RecipePageClient from "@/components/pages/RecipePage";

export const dynamic = "force-dynamic";

export default function RecipePage() {
  return <RecipePageClient />;
}

export const metadata = {
  title: "Recipe Details | FlavorVerse",
  description:
    "View detailed recipe information including ingredients, instructions, nutrition, and more.",
};
