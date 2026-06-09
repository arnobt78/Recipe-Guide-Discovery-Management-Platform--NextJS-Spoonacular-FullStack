/**
 * React Query hook for business insights data
 *
 * Features:
 * - Fetches global statistics from database
 * - SSR initialData support (REQ-0020)
 * - Manual refresh + mutation invalidation (no polling)
 *
 * Following REACT_QUERY_SETUP_GUIDE.md patterns:
 * - staleTime: 60 seconds (aligns with Redis TTL)
 * - refetchOnWindowFocus for tab return refresh
 */

import { useQuery } from "@tanstack/react-query";
import * as api from "../api";
import { BusinessInsightsResponse } from "../types";

export interface UseBusinessInsightsOptions {
  enabled?: boolean;
  initialData?: BusinessInsightsResponse;
}

/**
 * Hook to get business insights and statistics
 */
export function useBusinessInsights(options: UseBusinessInsightsOptions = {}) {
  const { enabled = true, initialData } = options;

  return useQuery<BusinessInsightsResponse, Error>({
    queryKey: ["business", "insights"],
    queryFn: () => api.getBusinessInsights(),
    enabled,
    initialData,
    staleTime: 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });
}
