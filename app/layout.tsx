import RootLayoutProviders from "@/components/providers/RootLayoutProviders";
import "@/global.css";

/**
 * Root Layout for Next.js App (Server Component)
 *
 * Provides the HTML structure and metadata for all pages.
 * Client-side providers are handled by RootLayoutProviders component.
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */

/**
 * Metadata for the application
 */
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: "Recipe App | Discover & Save Your Favourite Recipes",
  description:
    "A modern full-stack recipe app to search, view, and save your favourite recipes. Built with React, Node.js, PostgreSQL, and Spoonacular API.",
  keywords:
    "Recipe App, React, Node.js, PostgreSQL, Spoonacular, Food, Cooking, Favourites, Full Stack, Next.js, TypeScript",
  authors: [{ name: "Arnob Mahmud" }],
  openGraph: {
    title: "Recipe App | Discover & Save Your Favourite Recipes",
    description:
      "A modern full-stack recipe app to search, view, and save your favourite recipes.",
    images: ["/hero-image.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipe App | Discover & Save Your Favourite Recipes",
    description:
      "A modern full-stack recipe app to search, view, and save your favourite recipes.",
    images: ["/hero-image.webp"],
  },
  icons: {
    icon: [
      { url: "/vite.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ scrollbarGutter: "stable" }}
    >
      <body suppressHydrationWarning className="overflow-x-hidden min-w-0">
        <RootLayoutProviders>{children}</RootLayoutProviders>
      </body>
    </html>
  );
}
