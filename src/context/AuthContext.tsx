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

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
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
  logout: (options?: { returnTo?: string }) => void;
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
  
  const user = session?.user as User | undefined;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const userId = user?.id || null;

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

  // Logout function
  const logout = async (options?: { returnTo?: string }) => {
    await nextAuthSignOut({
      callbackUrl: options?.returnTo || window.location.origin,
    });
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

