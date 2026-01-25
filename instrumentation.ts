/**
 * Next.js Instrumentation Hook
 *
 * This file is required for Sentry to initialize in Next.js
 * Following Sentry Next.js SDK requirements
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side initialization
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime initialization
    await import("./sentry.edge.config");
  }
}
