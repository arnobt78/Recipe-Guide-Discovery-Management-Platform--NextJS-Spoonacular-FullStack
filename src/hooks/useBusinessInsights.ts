/**
 * React Query hook for business insights data
 *
 * SSR initialData + SSE/mutation invalidation (no polling).
 * refetchOnMount false when SSR data present — avoids duplicate fetch on hydrate.
 */

import { useQuery } from "@tanstack/react-query";
import * as api from "../api";
import { BusinessInsightsResponse } from "../types";

export interface UseBusinessInsightsOptions {
  enabled?: boolean;
  initialData?: BusinessInsightsResponse;
}

export function useBusinessInsights(options: UseBusinessInsightsOptions = {}) {
  const { enabled = true, initialData } = options;
  const hasSsrData = Boolean(initialData?.success && initialData.data);

  return useQuery<BusinessInsightsResponse, Error>({
    queryKey: ["business", "insights"],
    queryFn: () => api.getBusinessInsights(),
    enabled,
    initialData,
    initialDataUpdatedAt: hasSsrData ? Date.now() : undefined,
    staleTime: 60_000,
    refetchOnMount: hasSsrData ? false : true,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });
}
