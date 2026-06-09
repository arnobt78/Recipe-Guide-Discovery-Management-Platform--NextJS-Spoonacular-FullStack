import HomePageClient from "@/components/pages/HomePage";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <HomePageClient />;
}

export const metadata = {
  title: "Recipe App | Discover & Save Your Favourite Recipes",
  description:
    "A modern full-stack recipe app to search, view, and save your favourite recipes. Built with React, Node.js, PostgreSQL, and Spoonacular API.",
};
