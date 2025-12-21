/**
 * React Query hooks for shopping lists
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
import { ShoppingList, ShoppingListItem } from "../types";
import { toast } from "sonner";
import { useAuthCheck } from "./useAuthCheck";

/**
 * Hook to get all shopping lists for authenticated user
 *
 * @returns Query result with data, isLoading, error, etc.
 */
export function useShoppingLists() {
  const isAuthenticated = useAuthCheck();
  
  return useQuery({
    queryKey: ["shopping-lists"],
    queryFn: () => api.getShoppingLists(),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    enabled: isAuthenticated, // SSR-safe
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to create shopping list from recipes
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useCreateShoppingList(): UseMutationResult<
  ShoppingList,
  Error,
  {
    name: string;
    recipeIds: number[];
    items: ShoppingListItem[];
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.createShoppingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Shopping list created successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes("authenticated")) {
        toast.error("Please login to create shopping lists.");
      } else {
        toast.error("Failed to create shopping list.");
      }
    },
  });
}

/**
 * Hook to update shopping list
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useUpdateShoppingList(): UseMutationResult<
  ShoppingList,
  Error,
  {
    id: string;
    updates: {
      name?: string;
      items?: ShoppingListItem[];
      isCompleted?: boolean;
    };
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => api.updateShoppingList(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-list", data.id] });
      toast.success("Shopping list updated successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to update shopping list.");
      console.error("Update shopping list error:", error);
    },
  });
}

/**
 * Hook to delete shopping list
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useDeleteShoppingList(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteShoppingList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Shopping list deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete shopping list.");
      console.error("Delete shopping list error:", error);
    },
  });
}

