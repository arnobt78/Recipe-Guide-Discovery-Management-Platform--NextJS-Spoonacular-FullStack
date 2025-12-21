/**
 * React Query hooks for recipe images
 *
 * Caching Strategy:
 * - staleTime: Infinity = Data never becomes stale automatically
 * - refetchOnMount: true = Refetch ONLY when data is stale (invalidated)
 * - Result: Cache forever until manually invalidated, then refetch once
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
import { RecipeImage } from "../types";
import { toast } from "sonner";
import { useAuthCheck } from "./useAuthCheck";

/**
 * Hook to get recipe images
 *
 * @param recipeId - Recipe ID
 * @param enabled - Whether to enable the query
 * @returns Query result with data, isLoading, error, etc.
 */
export function useRecipeImages(recipeId: number | undefined, enabled: boolean = true) {
  const isAuthenticated = useAuthCheck();
  
  return useQuery({
    queryKey: ["recipe-images", recipeId],
    queryFn: () => api.getRecipeImages(recipeId!),
    enabled: enabled && !!recipeId && isAuthenticated, // SSR-safe
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to upload image
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useUploadImage(): UseMutationResult<
  { imageUrl: string; publicId: string; width: number; height: number },
  Error,
  { imageFile: File | Blob; folder?: string }
> {
  return useMutation({
    mutationFn: ({ imageFile, folder }) => api.uploadImage(imageFile, folder),
    onSuccess: () => {
      toast.success("Image uploaded successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes("authenticated")) {
        toast.error("Please login to upload images.");
      } else {
        toast.error("Failed to upload image.");
      }
    },
  });
}

/**
 * Hook to add image to recipe
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useAddRecipeImage(): UseMutationResult<
  RecipeImage,
  Error,
  {
    recipeId: number;
    imageUrl: string;
    imageType: "step" | "final" | "ingredient" | "custom";
    order?: number;
    caption?: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.addRecipeImage(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipe-images", data.recipeId] });
      toast.success("Image added to recipe!");
    },
    onError: (error: Error) => {
      toast.error("Failed to add image to recipe.");
      console.error("Add recipe image error:", error);
    },
  });
}

/**
 * Hook to remove recipe image
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useRemoveRecipeImage(): UseMutationResult<void, Error, { id: string; recipeId: number }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => api.removeRecipeImage(id),
    onSuccess: (_, variables) => {
      // Invalidate both the specific recipe's images and all recipe images queries
      queryClient.invalidateQueries({ queryKey: ["recipe-images", variables.recipeId] });
      queryClient.invalidateQueries({ queryKey: ["recipe-images"] });
      toast.success("Image removed successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove image.");
      console.error("Remove recipe image error:", error);
    },
  });
}

