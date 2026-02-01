/**
 * React Query hooks for filter preset management
 *
 * Features:
 * - Get all filter presets
 * - Create, update, delete filter presets
 * - Automatic cache invalidation
 * - Centralized error handling with toast notifications
 *
 * Following REACT_QUERY_SETUP_GUIDE.md patterns
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import * as api from "../api";
import { FilterPreset, AdvancedFilterOptions } from "../types";
import { toast } from "sonner";
import { useAuthCheck } from "./useAuthCheck";
import { invalidateBusinessInsights } from "../utils/queryInvalidation";

/**
 * Hook to get all filter presets for the current user
 *
 * @returns Query result with filter presets array
 */
export function useFilterPresets() {
  const isAuthenticated = useAuthCheck();

  return useQuery<FilterPreset[], Error>({
    queryKey: ["filters", "presets"],
    queryFn: async () => {
      try {
        return await api.getFilterPresets();
      } catch (error: unknown) {
        // Handle 401/404 gracefully - return empty array if not authenticated
        const err = error as { status?: number; message?: string };
        if (err.status === 401 || err.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    retry: false, // Don't retry on auth errors
  });
}

/**
 * Hook to get a single filter preset by ID
 *
 * @param presetId - Filter preset ID
 * @param enabled - Whether to enable the query
 * @returns Query result with filter preset
 */
export function useFilterPreset(presetId: string | null, enabled: boolean = true) {
  const isAuthenticated = useAuthCheck();

  return useQuery<FilterPreset, Error>({
    queryKey: ["filters", "presets", presetId],
    queryFn: async () => {
      if (!presetId) throw new Error("Preset ID is required");
      return api.getFilterPreset(presetId);
    },
    enabled: enabled && isAuthenticated && presetId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    retry: 1,
  });
}

/**
 * Hook to create a new filter preset
 *
 * @returns Mutation result with create function
 */
export function useCreateFilterPreset(): UseMutationResult<
  FilterPreset,
  Error,
  { name: string; description?: string; filters: AdvancedFilterOptions }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      filters: AdvancedFilterOptions;
    }) => {
      return api.createFilterPreset(data);
    },
    onSuccess: () => {
      // Invalidate and refetch filter presets list
      queryClient.invalidateQueries({ queryKey: ["filters", "presets"] });
      invalidateBusinessInsights(queryClient);
      toast.success("Filter preset created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create filter preset: ${error.message}`);
    },
  });
}

/**
 * Hook to update an existing filter preset
 *
 * @returns Mutation result with update function
 */
export function useUpdateFilterPreset(): UseMutationResult<
  FilterPreset,
  Error,
  { presetId: string; name: string; description?: string; filters: AdvancedFilterOptions }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      presetId: string;
      name: string;
      description?: string;
      filters: AdvancedFilterOptions;
    }) => {
      return api.updateFilterPreset(data.presetId, {
        name: data.name,
        description: data.description,
        filters: data.filters,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and specific preset
      queryClient.invalidateQueries({ queryKey: ["filters", "presets"] });
      queryClient.invalidateQueries({ queryKey: ["filters", "presets", variables.presetId] });
      invalidateBusinessInsights(queryClient);
      toast.success("Filter preset updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update filter preset: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a filter preset
 *
 * @returns Mutation result with delete function
 */
export function useDeleteFilterPreset(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presetId: string) => {
      return api.deleteFilterPreset(presetId);
    },
    onSuccess: (_, presetId) => {
      // Invalidate both list and specific preset
      queryClient.invalidateQueries({ queryKey: ["filters", "presets"] });
      queryClient.removeQueries({ queryKey: ["filters", "presets", presetId] });
      invalidateBusinessInsights(queryClient);
      toast.success("Filter preset deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete filter preset: ${error.message}`);
    },
  });
}

