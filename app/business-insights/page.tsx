import BusinessInsightsPageClient from "@/components/pages/BusinessInsightsPage";
import { getBusinessInsightsStats } from "../../lib/business-insights";
import { getBusinessInsightsCached } from "../../lib/redis-cache";
import type { BusinessInsightsResponse } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Business Insights Page (Server Component)
 *
 * SSR-hydrates insights data to avoid client double-fetch on first paint (REQ-0020).
 */
export default async function BusinessInsightsPage() {
  let initialInsights: BusinessInsightsResponse | undefined;

  try {
    const insightsData = await getBusinessInsightsCached(() =>
      getBusinessInsightsStats(),
    );
    initialInsights = {
      success: true,
      data: insightsData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Business insights SSR fetch error:", error);
  }

  return <BusinessInsightsPageClient initialInsights={initialInsights} />;
}

export const metadata = {
  title: "Business Insights | FlavorVerse",
  description:
    "Real-time platform statistics, user engagement metrics, and business analytics for FlavorVerse recipe platform.",
};
