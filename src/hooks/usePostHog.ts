/**
 * PostHog Analytics Hook
 *
 * React hook for tracking events with PostHog
 * Following DEVELOPMENT_RULES.md: Centralized hooks, reusable patterns
 */

import { useCallback } from "react";
import { trackEvent } from "../lib/posthog";
import { useAuth } from "../context/AuthContext";

/**
 * Hook to track PostHog events
 *
 * @returns Object with tracking functions
 */
export function usePostHog() {
  const { isAuthenticated, userId } = useAuth();

  /**
   * Track a custom event
   *
   * @param eventName - Name of the event
   * @param properties - Optional event properties
   */
  const track = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      trackEvent(eventName, {
        ...properties,
        userId: userId || undefined,
        isAuthenticated,
      });
    },
    [userId, isAuthenticated]
  );

  /**
   * Track recipe-related events
   */
  const trackRecipe = useCallback(
    (action: string, recipeId: number, recipeTitle?: string) => {
      track("recipe_action", {
        action,
        recipeId,
        recipeTitle,
      });
    },
    [track]
  );

  /**
   * Track search events
   */
  const trackSearch = useCallback(
    (searchTerm: string, resultCount?: number) => {
      track("search", {
        searchTerm,
        resultCount,
      });
    },
    [track]
  );

  /**
   * Track collection events
   */
  const trackCollection = useCallback(
    (action: string, collectionId?: string, collectionName?: string) => {
      track("collection_action", {
        action,
        collectionId,
        collectionName,
      });
    },
    [track]
  );

  /**
   * Track page view (usually handled automatically, but can be used for custom tracking)
   */
  const trackPageView = useCallback(
    (pageName: string, properties?: Record<string, unknown>) => {
      track("$pageview", {
        page: pageName,
        ...properties,
      });
    },
    [track]
  );

  return {
    track,
    trackRecipe,
    trackSearch,
    trackCollection,
    trackPageView,
  };
}
