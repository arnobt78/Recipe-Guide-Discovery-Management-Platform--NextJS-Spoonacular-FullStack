/**
 * React Query hooks for recipe notes
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
import { RecipeNote } from "../types";
import { toast } from "sonner";
import { useAuthCheck } from "./useAuthCheck";

/**
 * Hook to get recipe note for a specific recipe
 *
 * @param recipeId - Recipe ID
 * @param enabled - Whether to enable the query
 * @returns Query result with data, isLoading, error, etc.
 */
export function useRecipeNote(recipeId: number | undefined, enabled: boolean = true) {
  const isAuthenticated = useAuthCheck();
  
  return useQuery({
    queryKey: ["recipe-note", recipeId],
    queryFn: () => api.getRecipeNote(recipeId!),
    enabled: enabled && !!recipeId && isAuthenticated, // SSR-safe
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to save (create or update) recipe note
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useSaveRecipeNote(): UseMutationResult<
  RecipeNote,
  Error,
  {
    recipeId: number;
    title?: string;
    content: string;
    rating?: number;
    tags?: string[];
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId, title, content, rating, tags }) =>
      api.saveRecipeNote(recipeId, { title, content, rating, tags }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipe-note", data.recipeId] });
      toast.success("Note saved successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes("authenticated")) {
        toast.error("Please login to save notes.");
      } else {
        toast.error("Failed to save note.");
      }
    },
  });
}

/**
 * Hook to delete recipe note
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useDeleteRecipeNote(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: number) => api.deleteRecipeNote(recipeId),
    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ["recipe-note", recipeId] });
      toast.success("Note deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete note.");
      console.error("Delete note error:", error);
    },
  });
}

