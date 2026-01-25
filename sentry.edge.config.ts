/**
 * Sentry Edge Configuration
 *
 * Error tracking for Edge runtime (middleware, edge functions)
 * Following DEVELOPMENT_RULES.md: Centralized configuration
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 1.0,
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
