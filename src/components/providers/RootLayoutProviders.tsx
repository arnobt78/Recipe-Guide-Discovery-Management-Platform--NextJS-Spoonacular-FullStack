/**
 * Root Layout Providers Component (Client-Side)
 *
 * Contains all client-side providers for the application:
 * - React Query with infinite cache strategy
 * - NextAuth SessionProvider
 * - PostHog analytics
 * - Toast notifications (Sonner)
 * - Error boundary
 * - Sentry error tracking
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */

"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import ErrorBoundary from "../common/ErrorBoundary";
import { PostHogProvider } from "./PostHogProvider";
import { setupCachePersistence } from "../../utils/queryCachePersistence";
import { setupDevConsole } from "../../utils/devConsole";

// Initialize Sentry client-side
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../../../sentry.client.config");

  // Suppress Next.js error overlay for expected errors (ad blockers, network failures)
  // These errors are not real application errors and shouldn't break the UI
  const originalErrorHandler: OnErrorEventHandler | null = window.onerror;
  const originalRejectionHandler:
    | ((this: Window, ev: PromiseRejectionEvent) => unknown)
    | null = window.onunhandledrejection;

  window.onerror = function (message, source, lineno, colno, error) {
    const errorMessage = String(message || "");
    const errorType = error?.name || "";
    const errorStack = error?.stack || "";

    // Suppress network errors from PostHog and Sentry (likely from ad blockers)
    if (
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
      errorMessage.includes("net::ERR_BLOCKED_BY_CLIENT") ||
      errorMessage.includes("TypeError: Failed to fetch") ||
      errorMessage.includes("PostHog") ||
      errorMessage.includes("Sentry") ||
      (errorType === "TypeError" && errorStack.includes("fetch")) ||
      (errorStack &&
        (errorStack.includes("posthog") ||
          errorStack.includes("sentry") ||
          errorStack.includes("PostHog") ||
          errorStack.includes("Sentry")))
    ) {
      // Silently suppress - return true to prevent default error handling
      return true;
    }

    // Call original error handler for other errors
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };

  window.onunhandledrejection = function (event: PromiseRejectionEvent) {
    const errorMessage = String(event.reason?.message || event.reason || "");
    const errorStack = String(event.reason?.stack || "");

    // Suppress network errors from PostHog and Sentry (likely from ad blockers)
    if (
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
      errorMessage.includes("TypeError: Failed to fetch") ||
      errorMessage.includes("PostHog") ||
      errorMessage.includes("Sentry") ||
      errorStack.includes("posthog") ||
      errorStack.includes("sentry") ||
      errorStack.includes("PostHog") ||
      errorStack.includes("Sentry")
    ) {
      // Silently suppress - prevent default error handling
      event.preventDefault();
      return;
    }

    // Call original rejection handler for other errors
    if (originalRejectionHandler) {
      originalRejectionHandler.call(window, event);
    }
  };
}

/**
 * React Query Client Configuration
 *
 * Production-ready setup:
 * - staleTime: Infinity = Data never becomes stale automatically
 * - refetchOnMount: true = Refetch ONLY when data is stale (invalidated)
 * - Result: Cache forever until manually invalidated, then refetch once
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 50 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Root Layout Providers Component
 * Wraps children with all necessary client-side providers
 */
export default function RootLayoutProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Setup utilities on mount (client-side only)
  React.useEffect(() => {
    setupCachePersistence(queryClient);
    setupDevConsole();
  }, []);

  return (
    <ErrorBoundary>
      <PostHogProvider>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                },
              }}
            />
          </QueryClientProvider>
        </SessionProvider>
      </PostHogProvider>
    </ErrorBoundary>
  );
}
