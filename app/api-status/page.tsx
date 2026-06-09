import ApiStatusPageClient from "@/components/pages/ApiStatusPage";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type StatusResponse = {
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
    status: number;
    ok: boolean;
    latency: number;
    error?: string;
  }>;
  timestamp: string;
};

/** Server-side status fetch — avoids client skeleton on first paint */
async function fetchApiStatus(): Promise<StatusResponse | undefined> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const res = await fetch(`${protocol}://${host}/api/status`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    return (await res.json()) as StatusResponse;
  } catch {
    return undefined;
  }
}

export default async function ApiStatusPage() {
  const initialStatus = await fetchApiStatus();
  return <ApiStatusPageClient initialStatus={initialStatus} />;
}

export const metadata = {
  title: "API Status | Recipe Guide",
  description: "Real-time API endpoint status and health monitoring.",
};
