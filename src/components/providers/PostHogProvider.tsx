/**
 * PostHog Provider Component
 *
 * Initializes PostHog analytics on client-side mount
 * Following DEVELOPMENT_RULES.md: Reusable provider component
 */

"use client";

import { useEffect } from "react";
import { initPostHog } from "../../lib/posthog";

interface PostHogProviderProps {
  children: React.ReactNode;
}

/**
 * PostHog Provider Component
 *
 * Initializes PostHog analytics when component mounts
 * Errors are handled gracefully - won't break the app if PostHog is blocked
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    try {
      // Initialize PostHog only on client-side
      // Errors are handled internally (ad blockers, network issues)
      initPostHog();
    } catch (_error) {
      // Silently handle any initialization errors
      // PostHog failures should never break the app
      // This is expected behavior when ad blockers are active
    }
  }, []);

  return <>{children}</>;
}
