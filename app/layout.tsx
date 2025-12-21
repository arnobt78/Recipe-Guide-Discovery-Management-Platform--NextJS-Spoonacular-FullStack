"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { setupCachePersistence } from "@/utils/queryCachePersistence";
import { setupDevConsole } from "@/utils/devConsole";
import "@/global.css";

/**
 * Root Layout for Next.js App
 *
 * Sets up:
 * - React Query with infinite cache strategy
 * - Auth0 authentication
 * - Toast notifications (Sonner)
 * - Global CSS (Tailwind + custom styles)
 * - Error boundary
 */

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
 * Auth0 Configuration
 * Uses environment variables (Next.js uses process.env.NEXT_PUBLIC_* for client-side)
 */
const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "";
const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "";
const auth0Audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "";

// Setup app utilities (only on client side)
// This will be called after component mounts

// Metadata moved to head section since this is a client component

export default function RootLayout({
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
    <html lang="en">
      <head>
        <title>Recipe App | Discover & Save Your Favourite Recipes</title>
        <meta
          name="description"
          content="A modern full-stack recipe app to search, view, and save your favourite recipes. Built with React, Node.js, PostgreSQL, and Spoonacular API."
        />
        <meta
          name="keywords"
          content="Recipe App, React, Node.js, PostgreSQL, Spoonacular, Food, Cooking, Favourites, Full Stack, Next.js, TypeScript"
        />
        <meta name="author" content="Arnob Mahmud" />
        <meta property="og:title" content="Recipe App | Discover & Save Your Favourite Recipes" />
        <meta
          property="og:description"
          content="A modern full-stack recipe app to search, view, and save your favourite recipes."
        />
        <meta property="og:image" content="/hero-image.webp" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Recipe App | Discover & Save Your Favourite Recipes" />
        <meta
          name="twitter:description"
          content="A modern full-stack recipe app to search, view, and save your favourite recipes."
        />
        <meta name="twitter:image" content="/hero-image.webp" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="preload"
          as="image"
          href="/hero-image.webp"
        />
      </head>
      <body>
        <ErrorBoundary>
          <Auth0Provider
            domain={auth0Domain}
            clientId={auth0ClientId}
            authorizationParams={{
              redirect_uri:
                typeof window !== "undefined" ? window.location.origin : "",
              audience: auth0Audience,
            }}
            cacheLocation="localstorage"
            useRefreshTokens={true}
          >
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
          </Auth0Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
