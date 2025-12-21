/**
 * React Query hooks for meal planning
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
import { MealPlanItem } from "../types";
import { toast } from "sonner";
import { useAuthCheck } from "./useAuthCheck";

/**
 * Hook to get meal plan for a week
 *
 * @param weekStart - Start date of the week (ISO string)
 * @param enabled - Whether to enable the query
 * @returns Query result with data, isLoading, error, etc.
 */
export function useMealPlan(weekStart: string | undefined, enabled: boolean = true) {
  const isAuthenticated = useAuthCheck();
  
  return useQuery({
    queryKey: ["meal-plan", weekStart],
    queryFn: () => api.getMealPlan(weekStart!),
    enabled: enabled && !!weekStart && isAuthenticated, // SSR-safe
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to add recipe to meal plan
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useAddMealPlanItem(): UseMutationResult<
  MealPlanItem,
  Error,
  {
    weekStart: string;
    recipeId: number;
    recipeTitle: string;
    recipeImage?: string;
    dayOfWeek: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    servings?: number;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.addMealPlanItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan", variables.weekStart] });
      toast.success("Recipe added to meal plan!");
    },
    onError: (error: Error) => {
      if (error.message.includes("authenticated")) {
        toast.error("Please login to add recipes to meal plan.");
      } else {
        toast.error("Failed to add recipe to meal plan.");
      }
    },
  });
}

/**
 * Hook to remove meal plan item
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useRemoveMealPlanItem(): UseMutationResult<void, Error, { itemId: string; weekStart?: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId }) => api.removeMealPlanItem(itemId),
    onSuccess: (_, variables) => {
      // Invalidate all meal-plan queries (will refetch current week)
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
      // Also invalidate specific week if provided
      if (variables.weekStart) {
        queryClient.invalidateQueries({ queryKey: ["meal-plan", variables.weekStart] });
      }
      toast.success("Recipe removed from meal plan!");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove recipe from meal plan.");
      console.error("Remove meal plan item error:", error);
    },
  });
}

