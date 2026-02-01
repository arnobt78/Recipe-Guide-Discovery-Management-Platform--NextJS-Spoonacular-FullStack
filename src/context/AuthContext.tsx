/**
 * Auth Context - Centralized authentication state management
 *
 * Provides:
 * - NextAuth authentication state
 * - User information
 * - Login/logout functions
 * - Protected route helpers
 * - User ID storage for API calls
 *
 * Following DEVELOPMENT_RULES.md: Centralized context, reusable patterns
 */

import { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { identifyUser, resetUser } from "../lib/posthog";

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null; // User ID
  loginWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Provides NextAuth session context
 * Automatically stores user ID in localStorage for API calls
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  const user = session?.user as User | undefined;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const userId = user?.id || null;

  // Track previous auth state to detect changes
  const prevAuthState = useRef<{ isAuthenticated: boolean; userId: string | null }>({
    isAuthenticated: false,
    userId: null,
  });

  // Invalidate business insights when auth state changes (login/logout)
  useEffect(() => {
    const prevState = prevAuthState.current;
    const authChanged = prevState.isAuthenticated !== isAuthenticated || prevState.userId !== userId;
    
    if (authChanged && !isLoading) {
      // Auth state changed - invalidate business insights to refetch with new user data
      queryClient.invalidateQueries({ queryKey: ["business", "insights"] });
      
      // Update previous state
      prevAuthState.current = { isAuthenticated, userId };
    }
  }, [isAuthenticated, userId, isLoading, queryClient]);

  // Store user ID in localStorage for API calls (SSR-safe)
  // Also identify user in PostHog
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (userId && user) {
      try {
        localStorage.setItem("user_id", userId);
        // Identify user in PostHog
        identifyUser(userId, {
          email: user.email || undefined,
          name: user.name || undefined,
        });
      } catch (error) {
        console.warn("Failed to store user ID:", error);
      }
    } else {
      try {
        localStorage.removeItem("user_id");
        localStorage.removeItem("access_token");
        // Reset PostHog user on logout
        resetUser();
      } catch (error) {
        console.warn("Failed to remove auth data:", error);
      }
    }
  }, [userId, user]);

  // Store access token for API calls (from session)
  // Note: Credentials provider doesn't provide accessToken, only OAuth does
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated || !userId) return;
    
    // Get access token from session (only for OAuth providers)
    const accessToken = (session?.user as { accessToken?: string })?.accessToken;
    if (accessToken) {
      try {
        localStorage.setItem("access_token", accessToken);
      } catch (error) {
        console.warn("Failed to store access token:", error);
      }
    } else {
      // For Credentials provider, remove any stale access token
      // Backend will use x-user-id header instead
      try {
        localStorage.removeItem("access_token");
      } catch (error) {
        console.warn("Failed to remove access token:", error);
      }
    }
  }, [isAuthenticated, userId, session]);

  // Login function - redirects to Google OAuth
  const loginWithRedirect = async () => {
    await nextAuthSignIn("google", {
      callbackUrl: window.location.origin,
    });
  };

  // Logout function - uses redirect: false for smooth UI transition without page refresh
  const logout = async () => {
    // Clear local storage immediately
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
    }
    // Reset PostHog user
    resetUser();
    // Sign out without redirect for smooth UI transition
    await nextAuthSignOut({ redirect: false });
    // Invalidate business insights to update stats (user count may change)
    queryClient.invalidateQueries({ queryKey: ["business", "insights"] });
  };

  // Get access token (for API calls)
  const getAccessTokenSilently = async (): Promise<string> => {
    if (session?.user && (session.user as { accessToken?: string }).accessToken) {
      return (session.user as { accessToken: string }).accessToken;
    }
    // If no access token in session, try localStorage
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (storedToken) {
      return storedToken;
    }
    throw new Error("No access token available");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    userId,
    loginWithRedirect,
    logout,
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

