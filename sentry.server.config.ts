/**
 * Sentry Server Configuration
 *
 * Error tracking and performance monitoring for server-side
 * Following DEVELOPMENT_RULES.md: Centralized configuration
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking (can be set via environment variable)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Filter out common errors that aren't actionable
  ignoreErrors: [
    // Common API errors
    "ECONNREFUSED",
    "ETIMEDOUT",
    // Database connection errors
    "ConnectionError",
  ],
});
