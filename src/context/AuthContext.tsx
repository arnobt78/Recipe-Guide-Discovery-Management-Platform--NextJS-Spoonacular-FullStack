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
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (userId) {
      try {
        localStorage.setItem("auth0_user_id", userId);
      } catch (error) {
        console.warn("Failed to store user ID:", error);
      }
    } else {
      try {
        localStorage.removeItem("auth0_user_id");
        localStorage.removeItem("auth0_access_token");
      } catch (error) {
        console.warn("Failed to remove auth data:", error);
      }
    }
  }, [userId]);

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

