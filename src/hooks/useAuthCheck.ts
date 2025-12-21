/**
 * Reusable Hook for Authentication Checks
 * 
 * Centralized authentication check utility
 * SSR-safe and uses AuthContext instead of direct localStorage access
 * 
 * Following DEVELOPMENT_RULES.md: Centralized hooks, SSR safety
 */

import { useAuth } from "../context/AuthContext";

/**
 * Hook to check if user is authenticated
 * 
 * @returns boolean - true if user is authenticated
 */
export function useAuthCheck(): boolean {
  const { isAuthenticated, userId } = useAuth();
  return isAuthenticated && !!userId;
}

