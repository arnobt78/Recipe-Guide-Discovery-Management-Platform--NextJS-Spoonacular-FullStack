import ApiDocsPageClient from "@/components/pages/ApiDocsPage";

export const dynamic = "force-dynamic";

export default function ApiDocsPage() {
  return <ApiDocsPageClient />;
}

export const metadata = {
  title: "API Docs | Recipe Guide",
  description: "API endpoint documentation grouped by category.",
};
