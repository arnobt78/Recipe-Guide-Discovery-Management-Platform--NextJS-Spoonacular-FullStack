/**
 * PostHog Analytics Client
 *
 * Centralized PostHog initialization and utilities
 * Following DEVELOPMENT_RULES.md: Centralized utilities, reusable functions
 */

import posthog from "posthog-js";

/**
 * Suppress PostHog console errors for network failures and ad blockers
 * These errors are expected when ad blockers are active
 */
function suppressPostHogConsoleErrors(): void {
  if (typeof window === "undefined") return;

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error to filter PostHog errors
  console.error = (...args: unknown[]) => {
    const errorMessage = String(args[0] || "");
    
    // Suppress PostHog network errors
    if (
      errorMessage.includes("PostHog.js") &&
      (errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("TypeError") ||
        errorMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
        errorMessage.includes("net::ERR_BLOCKED_BY_CLIENT") ||
        errorMessage.includes("RemoteConfig") ||
        errorMessage.includes("Enqueued failed request"))
    ) {
      // Silently ignore - these are expected with ad blockers
      return;
    }
    
    // Call original console.error for other errors
    originalError.apply(console, args);
  };

  // Override console.warn to filter PostHog warnings
  console.warn = (...args: unknown[]) => {
    const warnMessage = String(args[0] || "");
    
    // Suppress PostHog warnings related to blocked requests
    if (
      warnMessage.includes("PostHog.js") &&
      (warnMessage.includes("Failed to fetch") ||
        warnMessage.includes("Enqueued failed request") ||
        warnMessage.includes("Flags not loaded") ||
        warnMessage.includes("older version"))
    ) {
      // Silently ignore - these are expected with ad blockers
      return;
    }
    
    // Call original console.warn for other warnings
    originalWarn.apply(console, args);
  };
}

/**
 * Initialize PostHog analytics
 * Only runs on client-side
 */
export function initPostHog(): void {
  if (typeof window === "undefined") return;

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!posthogKey || !posthogHost) {
    console.warn("PostHog not configured - missing API key or host");
    return;
  }

  // Suppress console errors before initialization
  suppressPostHogConsoleErrors();

  try {
    // Initialize PostHog with error handling
    posthog.init(posthogKey, {
      api_host: posthogHost,
      loaded: (posthogInstance) => {
        // Override PostHog's internal error handling
        if (posthogInstance && typeof posthogInstance === "object") {
          // Suppress PostHog's own error logging
          const originalCapture = posthogInstance.capture;
          if (originalCapture && typeof originalCapture === "function") {
            // Wrap capture to silently handle errors
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            posthogInstance.capture = function(eventName: string, properties?: Record<string, unknown>, options?: any) {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (originalCapture as any).call(this, eventName, properties, options);
              } catch (_error) {
                // Silently ignore capture errors (likely from ad blockers)
                return;
              }
            };
          }
        }
        
        if (process.env.NODE_ENV === "development") {
          console.log("PostHog initialized successfully");
        }
      },
      capture_pageview: true, // Automatically capture page views
      capture_pageleave: true, // Capture page leave events
      autocapture: true, // Automatically capture clicks and form submissions
      disable_session_recording: false, // Enable session recording
      // Handle API errors gracefully
      request_batching: true,
      persistence: "localStorage+cookie",
      // Debug mode OFF to reduce console noise
      debug: false,
    });

    // Log feature flags only in development (if not blocked)
    if (process.env.NODE_ENV === "development") {
      try {
        posthog.onFeatureFlags((flags) => {
          console.log("PostHog feature flags loaded:", flags);
        });
      } catch (_error) {
        // Silently ignore - expected if PostHog is blocked
      }
    }
  } catch (_error) {
    // Silently handle initialization errors (likely from ad blockers)
    // PostHog will work if not blocked, but won't break the app if blocked
    if (process.env.NODE_ENV === "development") {
      console.warn("PostHog initialization completed with warnings (ad blocker may be active)");
    }
  }
}

/**
 * Track custom event
 *
 * @param eventName - Name of the event
 * @param properties - Optional event properties
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  
  try {
    // PostHog automatically queues events if not loaded yet, so we can safely call capture
    posthog.capture(eventName, properties);
  } catch (_error) {
    // Silently ignore capture errors (likely from ad blockers or network issues)
    // Don't log to console or throw - these are expected failures
  }
}

/**
 * Identify user
 *
 * @param userId - User ID
 * @param properties - Optional user properties
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  
  try {
    posthog.identify(userId, properties);
  } catch (_error) {
    // Silently ignore identify errors (likely from ad blockers or network issues)
    // Don't log to console or throw - these are expected failures
  }
}

/**
 * Reset user (on logout)
 */
export function resetUser(): void {
  if (typeof window === "undefined") return;
  posthog.reset();
}

/**
 * Get PostHog instance (for advanced usage)
 */
export function getPostHog() {
  if (typeof window === "undefined") return null;
  return posthog;
}
