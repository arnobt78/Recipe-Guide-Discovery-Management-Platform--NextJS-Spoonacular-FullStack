import BlogPostPageClient from "@/components/pages/BlogPostPage";

export const dynamic = "force-dynamic";

export default function BlogPostPage() {
  return <BlogPostPageClient />;
}

export const metadata = {
  title: "Blog Post | FlavorVerse",
  description: "Read our latest recipe blog post and culinary insights.",
};
