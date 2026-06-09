import BlogPageClient from "@/components/pages/BlogPage";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  return <BlogPageClient />;
}

export const metadata = {
  title: "Recipe Blog & Articles | FlavorVerse",
  description:
    "Discover cooking tips, recipe stories, and culinary insights from our recipe blog.",
};
