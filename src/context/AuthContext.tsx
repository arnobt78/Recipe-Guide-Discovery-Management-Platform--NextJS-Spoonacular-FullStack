/**
 * Auth Context - Centralized authentication state management
 *
 * Provides:
 * - Auth0 authentication state
 * - User information
 * - Login/logout functions
 * - Protected route helpers
 * - User ID storage for API calls
 *
 * Following DEVELOPMENT_RULES.md: Centralized context, reusable patterns
 */

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { identifyUser, resetUser } from "../lib/posthog";

interface AuthContextType {
  user: Auth0User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null; // Auth0 user ID (sub)
  loginWithRedirect: () => Promise<void>;
  logout: (options?: { returnTo?: string }) => void;
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Wraps app with Auth0Provider and provides auth context
 * Automatically stores user ID in localStorage for API calls
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const userId = user?.sub || null;

  // Store user ID in localStorage for API calls (SSR-safe)
  // Also identify user in PostHog
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (userId && user) {
      try {
        localStorage.setItem("auth0_user_id", userId);
        // Identify user in PostHog
        identifyUser(userId, {
          email: user.email,
          name: user.name,
          nickname: user.nickname,
        });
      } catch (error) {
        console.warn("Failed to store user ID:", error);
      }
    } else {
      try {
        localStorage.removeItem("auth0_user_id");
        localStorage.removeItem("auth0_access_token");
        // Reset PostHog user on logout
        resetUser();
      } catch (error) {
        console.warn("Failed to remove auth data:", error);
      }
    }
  }, [userId, user]);

  // Store access token for API calls (refresh periodically, SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated || !userId) return;
    
    // Get access token and store it
    getAccessTokenSilently()
      .then((token) => {
        try {
          localStorage.setItem("auth0_access_token", token);
        } catch (error) {
          console.warn("Failed to store access token:", error);
        }
      })
      .catch((error) => {
        console.warn("Failed to get access token:", error);
      });
  }, [isAuthenticated, userId, getAccessTokenSilently]);

  // Listen for manual cache updates (from custom login flow)
  // When tokens are manually stored, trigger Auth0 SDK to re-check the cache
  useEffect(() => {
    if (typeof window === "undefined") return;

    const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "";
    const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "";
    const cacheKey = auth0Domain && auth0ClientId 
      ? `@@auth0spajs@@::${auth0ClientId}@@::${auth0Domain}@@::cache`
      : null;

    const handleCacheUpdate = async () => {
      // Small delay to ensure localStorage is fully updated
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Check if cache exists in localStorage
      if (cacheKey) {
        try {
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            const cache = JSON.parse(cachedData);
            // Check if cache is still valid (not expired)
            if (cache.expiresAt && cache.expiresAt > Date.now()) {
              // Try to get access token - this will force Auth0 SDK to check the cache
              // If tokens are valid, Auth0 will update its internal state and user will be set
              try {
                // getAccessTokenSilently will check the cache and update Auth0's internal state
                // If tokens exist in cache, it will return them and Auth0 will recognize the session
                await getAccessTokenSilently();
                // If successful, Auth0 SDK will automatically update user and isAuthenticated state
                // The component will re-render with the new auth state
                console.log("Auth0 SDK successfully recognized cached tokens");
              } catch (error) {
                // If this fails, it means tokens might not be valid or Auth0 hasn't recognized them yet
                // This is okay - Auth0 will check on next interaction or page refresh
                // The tokens are still stored, so a manual refresh will work
                console.warn("Auth0 SDK cache check failed (this is normal if tokens were just stored):", error);
              }
            }
          }
        } catch (error) {
          console.warn("Failed to check Auth0 cache:", error);
        }
      }
    };

    // Listen for our custom cache update event
    window.addEventListener("auth0:cache-updated", handleCacheUpdate);
    
    // Also listen for storage events on Auth0 cache key (for cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (cacheKey && e.key === cacheKey && e.newValue) {
        // Auth0 cache was updated (from another tab or manually) - trigger re-check
        handleCacheUpdate();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check cache on mount to handle cases where tokens were stored before component mounted
    handleCacheUpdate();

    return () => {
      window.removeEventListener("auth0:cache-updated", handleCacheUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [getAccessTokenSilently]);

  const value: AuthContextType = {
    user,
    isAuthenticated: isAuthenticated ?? false,
    isLoading,
    userId,
    loginWithRedirect,
    logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
    getAccessTokenSilently,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use Auth Context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

