/**
 * React Query hook for business insights data
 *
 * Features:
 * - Fetches global statistics from database
 * - Auto-refresh every 30 seconds for live data
 * - Centralized error handling
 *
 * Following REACT_QUERY_SETUP_GUIDE.md patterns:
 * - staleTime: 30 seconds (live data needs frequent updates)
 * - refetchInterval: 30 seconds (auto-refresh for live feel)
 * - refetchOnMount: true
 */

import { useQuery } from "@tanstack/react-query";
import * as api from "../api";
import { BusinessInsightsResponse } from "../types";

/**
 * Hook to get business insights and statistics
 *
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with business insights data
 */
export function useBusinessInsights(enabled: boolean = true) {
  return useQuery<BusinessInsightsResponse, Error>({
    queryKey: ["business", "insights"],
    queryFn: () => api.getBusinessInsights(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds - live data needs frequent updates
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Refresh when user comes back to tab
    retry: 2,
    retryDelay: 1000,
  });
}
