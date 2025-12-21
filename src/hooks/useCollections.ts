/**
 * React Query hooks for recipe collections
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
import { RecipeCollection, CollectionItem, Recipe } from "../types";
import { toast } from "sonner";
import { invalidateCollectionsQueries } from "../utils/queryInvalidation";
import { useAuthCheck } from "./useAuthCheck";

/**
 * Hook to get all collections for authenticated user
 *
 * @returns Query result with data, isLoading, error, etc.
 */
export function useCollections() {
  const isAuthenticated = useAuthCheck();
  
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => api.getCollections(),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    enabled: isAuthenticated, // Only fetch if user is authenticated (SSR-safe)
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get a specific collection with items
 *
 * @param collectionId - Collection ID
 * @param enabled - Whether to enable the query
 * @returns Query result with data, isLoading, error, etc.
 */
export function useCollection(collectionId: string | undefined, enabled: boolean = true) {
  const isAuthenticated = useAuthCheck();
  
  return useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => api.getCollection(collectionId!),
    enabled: enabled && !!collectionId && isAuthenticated, // SSR-safe
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to create a new collection
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useCreateCollection(): UseMutationResult<
  RecipeCollection,
  Error,
  { name: string; description?: string; color?: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description, color }) =>
      api.createCollection(name, description, color),
    onSuccess: () => {
      invalidateCollectionsQueries(queryClient);
      toast.success("Collection created successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes("authenticated")) {
        toast.error("Please login to create collections.");
      } else {
        toast.error("Failed to create collection.");
      }
    },
  });
}

/**
 * Hook to update a collection
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useUpdateCollection(): UseMutationResult<
  RecipeCollection,
  Error,
  { collectionId: string; updates: { name?: string; description?: string; color?: string } }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, updates }) => api.updateCollection(collectionId, updates),
    onSuccess: (data) => {
      invalidateCollectionsQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["collection", data.id] });
      toast.success("Collection updated successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to update collection.");
      console.error("Update collection error:", error);
    },
  });
}

/**
 * Hook to delete a collection
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useDeleteCollection(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => api.deleteCollection(collectionId),
    onSuccess: () => {
      invalidateCollectionsQueries(queryClient);
      toast.success("Collection deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete collection.");
      console.error("Delete collection error:", error);
    },
  });
}

/**
 * Hook to add recipe to collection
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useAddRecipeToCollection(): UseMutationResult<
  CollectionItem,
  Error,
  { collectionId: string; recipe: Recipe; order?: number }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, recipe, order }) =>
      api.addRecipeToCollection(collectionId, recipe, order),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection", variables.collectionId] });
      invalidateCollectionsQueries(queryClient);
      toast.success("Recipe added to collection!");
    },
    onError: (error: Error) => {
      if (error.message.includes("already")) {
        toast.info("Recipe is already in this collection.");
      } else {
        toast.error("Failed to add recipe to collection.");
      }
    },
  });
}

/**
 * Hook to remove recipe from collection
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useRemoveRecipeFromCollection(): UseMutationResult<
  void,
  Error,
  { collectionId: string; recipeId: number }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, recipeId }) =>
      api.removeRecipeFromCollection(collectionId, recipeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection", variables.collectionId] });
      invalidateCollectionsQueries(queryClient);
      toast.success("Recipe removed from collection!");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove recipe from collection.");
      console.error("Remove recipe from collection error:", error);
    },
  });
}

