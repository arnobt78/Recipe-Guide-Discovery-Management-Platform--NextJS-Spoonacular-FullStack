import BusinessInsightsPageClient from "@/components/pages/BusinessInsightsPage";

/**
 * Business Insights Page (Server Component)
 * 
 * Displays global platform statistics and analytics
 * URL: /business-insights (avoiding blocked keywords like /analytics, /metrics)
 * 
 * This is a Server Component that imports the Client Component
 * for faster initial page load and better SEO
 * 
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */
export default function BusinessInsightsPage() {
  return <BusinessInsightsPageClient />;
}

/**
 * Metadata for the page
 */
export const metadata = {
  title: "Business Insights | FlavorVerse",
  description: "Real-time platform statistics, user engagement metrics, and business analytics for FlavorVerse recipe platform.",
};
