/**
 * React Query hooks for recipe video management
 *
 * Features:
 * - Get all videos for a recipe
 * - Add, delete recipe videos
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
import { RecipeVideo } from "../types";
import { toast } from "sonner";
import { useAuthCheck } from "./useAuthCheck";
import { invalidateBusinessInsights } from "../utils/queryInvalidation";

/**
 * Hook to get all videos for a recipe
 *
 * @param recipeId - Recipe ID
 * @param enabled - Whether to enable the query
 * @returns Query result with videos array
 */
export function useRecipeVideos(recipeId: number | null, enabled: boolean = true) {
  const isAuthenticated = useAuthCheck();

  return useQuery<RecipeVideo[], Error>({
    queryKey: ["recipes", "videos", recipeId],
    queryFn: async () => {
      if (!recipeId) throw new Error("Recipe ID is required");
      return api.getRecipeVideos(recipeId);
    },
    enabled: enabled && isAuthenticated && recipeId !== null,
    staleTime: 0, // Always refetch fresh data for user-specific content
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * Hook to add a video to a recipe
 *
 * @returns Mutation result with add function
 */
export function useAddRecipeVideo(): UseMutationResult<
  RecipeVideo,
  Error,
  {
    recipeId: number;
    videoUrl: string;
    videoType: "youtube" | "vimeo" | "custom";
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: number;
    order?: number;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      recipeId: number;
      videoUrl: string;
      videoType: "youtube" | "vimeo" | "custom";
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      duration?: number;
      order?: number;
    }) => {
      return api.addRecipeVideo(data);
    },
    onSuccess: (_, variables) => {
      // Invalidate videos list for this recipe
      queryClient.invalidateQueries({ queryKey: ["recipes", "videos", variables.recipeId] });
      invalidateBusinessInsights(queryClient);
      toast.success("Video added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add video: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a recipe video
 *
 * @returns Mutation result with delete function
 */
export function useRemoveRecipeVideo(): UseMutationResult<void, Error, { videoId: string; recipeId: number }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId }: { videoId: string; recipeId: number }) => {
      return api.deleteRecipeVideo(videoId);
    },
    onSuccess: (_, variables) => {
      // Invalidate videos list for this recipe
      queryClient.invalidateQueries({ queryKey: ["recipes", "videos", variables.recipeId] });
      invalidateBusinessInsights(queryClient);
      toast.success("Video deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete video: ${error.message}`);
    },
  });
}

