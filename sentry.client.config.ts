/**
 * Sentry Client Configuration
 *
 * Error tracking and performance monitoring for client-side
 * Following DEVELOPMENT_RULES.md: Centralized configuration
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Suppress Sentry console logs for network failures and ad blockers
 */
function suppressSentryConsoleErrors(): void {
  if (typeof window === "undefined") return;

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Override console.error to filter Sentry errors
  console.error = (...args: unknown[]) => {
    const errorMessage = String(args[0] || "");
    
    // Suppress Sentry transport errors
    if (
      errorMessage.includes("Sentry Logger") &&
      (errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("Encountered error running transport") ||
        errorMessage.includes("Error while sending envelope") ||
        errorMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
        errorMessage.includes("network_error"))
    ) {
      // Silently ignore - these are expected with ad blockers
      return;
    }
    
    // Call original console.error for other errors
    originalError.apply(console, args);
  };

  // Override console.warn to filter Sentry warnings
  console.warn = (...args: unknown[]) => {
    const warnMessage = String(args[0] || "");
    
    // Suppress Sentry warnings related to blocked requests
    if (
      warnMessage.includes("Sentry Logger") &&
      (warnMessage.includes("Failed to fetch") ||
        warnMessage.includes("Discarded session") ||
        warnMessage.includes("missing or non-string release"))
    ) {
      // Silently ignore - these are expected with ad blockers
      return;
    }
    
    // Call original console.warn for other warnings
    originalWarn.apply(console, args);
  };

  // Override console.log to filter Sentry debug logs (only in production)
  if (process.env.NODE_ENV === "production") {
    console.log = (...args: unknown[]) => {
      const logMessage = String(args[0] || "");
      
      // Suppress Sentry debug logs in production
      if (logMessage.includes("Sentry Logger")) {
        // Silently ignore Sentry debug logs in production
        return;
      }
      
      // Call original console.log for other logs
      originalLog.apply(console, args);
    };
  }
}

// Suppress Sentry console errors before initialization
suppressSentryConsoleErrors();

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Disable debug logging to reduce console noise
  debug: false,
  
  // Replay can be used to record user sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Filter out common errors that aren't actionable
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    // Network errors that are user-related (ad blockers, network issues)
    "NetworkError",
    "Failed to fetch",
    "TypeError: Failed to fetch",
    "ERR_BLOCKED_BY_CLIENT",
    "net::ERR_BLOCKED_BY_CLIENT",
    // PostHog errors (handled separately)
    "PostHog.js",
    "[PostHog.js]",
  ],
  
  // Filter out errors before sending to Sentry
  beforeSend(event, hint) {
    // Filter out network errors from ad blockers
    const error = hint.originalException;
    const errorMessage = error instanceof Error ? error.message : String(error || "");
    
    // Ignore network errors that are likely from ad blockers
    if (
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
      errorMessage.includes("net::ERR_BLOCKED_BY_CLIENT") ||
      errorMessage.includes("NetworkError") ||
      (event.exception?.values?.[0]?.value?.includes("Failed to fetch")) ||
      (event.exception?.values?.[0]?.type === "TypeError" && 
       errorMessage.includes("fetch"))
    ) {
      // Return null to prevent sending to Sentry
      return null;
    }
    
    // Filter out PostHog-related errors
    if (
      errorMessage.includes("PostHog") ||
      errorMessage.includes("[PostHog.js]") ||
      (event.tags?.posthog_error)
    ) {
      return null;
    }
    
    return event;
  },
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking (can be set via environment variable)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Suppress transport errors from showing in console
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
