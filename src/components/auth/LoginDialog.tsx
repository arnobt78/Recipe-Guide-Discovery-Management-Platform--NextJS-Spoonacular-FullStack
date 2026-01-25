/**
 * Login Dialog Component
 *
 * Custom Auth0 login dialog with test account dropdown
 * Features:
 * - ShadCN UI Dialog component
 * - Test account dropdown with auto-fill
 * - Email and password input fields
 * - Auth0 login integration
 * - Dark theme compatible
 * - Auto-fills email/password when test account is selected
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, ShadCN UI, TypeScript
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/**
 * Helper to decode base64url (used in JWT tokens)
 * Browser-safe implementation (no Node.js Buffer)
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters with standard base64 characters
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  while (str.length % 4) {
    str += "=";
  }
  // Decode base64 (browser atob)
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch (_error) {
    // Fallback to simple atob if decodeURIComponent fails
    return atob(str);
  }
}

/**
 * Test account credentials
 * Based on DROPDOWN_TEST_CREDENTIALS_DOCS.md specifications
 * 
 * Note: Password must meet Auth0 requirements:
 * - At least 8 characters
 * - At least 3 of 4 character types: lowercase, uppercase, numbers, special characters
 */
const testAccounts = {
  "guest-user": {
    email: "test@user.com",
    password: "Test123!", // Updated to meet Auth0 password requirements (lowercase, uppercase, numbers, special)
    label: "Guest User",
  },
};

interface LoginDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
}

/**
 * Login Dialog Component
 * Displays custom login/signup form with test account dropdown
 */
export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const router = useRouter();
  const { loginWithRedirect } = useAuth0();
  const [mode, setMode] = useState<"login" | "signup">("login"); // Track login vs signup mode
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>(""); // Name field for signup
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Handle test account selection
   * Auto-fills email and password fields when test account is selected
   */
  const handleRoleSelect = useCallback((value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
    } else {
      setSelectedRole(value);
      const account = testAccounts[value as keyof typeof testAccounts];
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
      }
    }
  }, []);

  /**
   * Reset form when dialog closes
   */
  useEffect(() => {
    if (!open) {
      // Reset form state when dialog closes
      setMode("login");
      setSelectedRole("");
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [open]);

  /**
   * Handle login submission (shared function)
   * Uses backend API route for password authentication (Resource Owner Password Grant)
   * This allows direct login without redirecting to Auth0's Universal Login
   */
  const performLogin = useCallback(
    async (loginEmail: string, loginPassword: string) => {
      setIsLoading(true);

      try {
        // Call backend API route for password authentication
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail.trim(),
            password: loginPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Safely extract error message - ensure it's always a string
          let errorMessage = "Invalid email or password";
          if (data.message && typeof data.message === "string") {
            errorMessage = data.message;
          } else if (data.error) {
            if (typeof data.error === "string") {
              errorMessage = data.error;
            } else if (typeof data.error === "object" && data.error !== null) {
              // If error is an object, try to extract a message or stringify it safely
              errorMessage = (data.error as { message?: string; description?: string }).message || 
                            (data.error as { message?: string; description?: string }).description || 
                            "Invalid email or password";
            }
          }
          
          // Check if this might be a verification issue (common after signup)
          if (errorMessage.includes("verify") || errorMessage.includes("verification") || 
              errorMessage.includes("email")) {
            errorMessage = "Please verify your email address. Check your inbox for a verification link.";
          }
          
          // Only show error toast if not attempting auto-login after signup
          // (We'll handle signup auto-login failures silently)
          if (!response.status || response.status !== 401) {
            toast.error(errorMessage);
          }
          setIsLoading(false);
          return false;
        }

        // Store tokens in Auth0 SDK's cache format
        // Auth0 SDK uses localStorage with specific key format: @@auth0spajs@@::<client_id>@@::<domain>@@::cache
        const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "";
        const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "";
        
        // Decode ID token to get user info
        let userId: string | null = null;
        let userEmail: string | null = null;
        let userName: string | null = null;
        let userPicture: string | null = null;

        try {
          if (data.id_token) {
            const idTokenParts = data.id_token.split(".");
            if (idTokenParts.length === 3) {
              const payload = JSON.parse(
                base64UrlDecode(idTokenParts[1])
              ) as { sub?: string; email?: string; name?: string; picture?: string };

              userId = payload.sub || null;
              userEmail = payload.email || null;
              userName = payload.name || null;
              userPicture = payload.picture || null;

              // Store user ID for API calls
              if (userId) {
                localStorage.setItem("auth0_user_id", userId);
              }
            }
          }
        } catch (decodeError) {
          console.warn("Failed to decode ID token:", decodeError);
        }

        // Store tokens in Auth0 SDK cache format
        // Auth0 SDK cache key: @@auth0spajs@@::<client_id>@@::<domain>@@::cache
        let cacheKey: string | null = null;
        if (auth0Domain && auth0ClientId && data.access_token && data.id_token) {
          try {
            cacheKey = `@@auth0spajs@@::${auth0ClientId}@@::${auth0Domain}@@::cache`;
            const now = Date.now();
            const expiresIn = data.expires_in || 86400; // Default 24 hours
            const expiresAt = now + expiresIn * 1000;

            // Auth0 SDK cache format - must match exactly what SDK expects
            // The SDK expects: { body: {...}, expiresAt: number, decodedToken: {...} }
            const auth0Cache = {
              body: {
                access_token: data.access_token,
                id_token: data.id_token,
                expires_in: expiresIn,
                token_type: data.token_type || "Bearer",
                scope: "openid profile email",
              },
              expiresAt: expiresAt,
              decodedToken: {
                user: {
                  sub: userId,
                  email: userEmail,
                  name: userName,
                  picture: userPicture,
                },
              },
            };

            // Store in localStorage with exact cache key format
            localStorage.setItem(cacheKey, JSON.stringify(auth0Cache));
            
            // Also store access token directly for API calls
            localStorage.setItem("auth0_access_token", data.access_token);
            
            // Store user ID for API calls
            if (userId) {
              localStorage.setItem("auth0_user_id", userId);
            }
            
            // Trigger Auth0 SDK to check for tokens without page reload
            // Dispatch storage event to notify Auth0 SDK that cache was updated
            if (typeof window !== "undefined") {
              try {
                // Dispatch a storage event to trigger Auth0 SDK cache check
                // Note: StorageEvent only works for cross-tab communication
                // For same-tab updates, we use a custom event
                window.dispatchEvent(new StorageEvent("storage", {
                  key: cacheKey,
                  newValue: JSON.stringify(auth0Cache),
                  storageArea: localStorage,
                }));
                
                // Trigger custom event that AuthContext listens to
                // This will force Auth0 SDK to re-check the cache
                window.dispatchEvent(new Event("auth0:cache-updated"));
              } catch (error) {
                console.warn("Failed to trigger Auth0 cache update:", error);
              }
            }
          } catch (cacheError) {
            console.warn("Failed to store Auth0 cache:", cacheError);
            // Fallback: Store tokens directly
            localStorage.setItem("auth0_access_token", data.access_token);
            if (data.id_token) {
              localStorage.setItem("auth0_id_token", data.id_token);
            }
            if (userId) {
              localStorage.setItem("auth0_user_id", userId);
            }
          }
        } else {
          // Fallback: Store tokens directly if cache format fails
          if (data.access_token) {
            localStorage.setItem("auth0_access_token", data.access_token);
          }
          if (data.id_token) {
            localStorage.setItem("auth0_id_token", data.id_token);
          }
          if (userId) {
            localStorage.setItem("auth0_user_id", userId);
          }
        }

        // Close dialog
        onOpenChange(false);
        
        // Show success message
        toast.success("Successfully signed in!");

        // Force Auth0 SDK to re-check the cache by triggering a state update
        // First, dispatch the cache update event
        // Then use router.refresh() to trigger a soft re-render
        // The AuthContext will listen for the event and call getAccessTokenSilently()
        setTimeout(() => {
          // Trigger another cache update event to ensure Auth0 SDK picks it up
          if (typeof window !== "undefined" && cacheKey) {
            window.dispatchEvent(new Event("auth0:cache-updated"));
          }
          // Trigger router refresh to re-render components
          router.refresh();
        }, 500); // Increased delay to ensure localStorage is fully written
        
        return true;
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Failed to login. Please try again.");
        setIsLoading(false);
        return false;
      }
    },
    [onOpenChange, router]
  );

  /**
   * Handle login submission
   * Uses backend API route for password authentication (Resource Owner Password Grant)
   * This allows direct login without redirecting to Auth0's Universal Login
   */
  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (!email.trim() || !password.trim()) {
        toast.error("Please enter email and password");
        return;
      }

      await performLogin(email, password);
    },
    [email, password, performLogin]
  );

  /**
   * Handle signup submission
   * Creates new user account using Auth0's Database Signup endpoint
   * After successful signup, automatically signs in the user
   */
  const handleSignup = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (!email.trim() || !password.trim()) {
        toast.error("Please enter email and password");
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }

      setIsLoading(true);

      try {
        // Call backend API route for signup
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            name: name.trim() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Safely extract error message - ensure it's always a string
          let errorMessage = "Failed to create account";
          if (data.message && typeof data.message === "string") {
            errorMessage = data.message;
          } else if (data.error) {
            if (typeof data.error === "string") {
              errorMessage = data.error;
            } else if (typeof data.error === "object") {
              // If error is an object, try to extract a message or stringify it safely
              errorMessage = data.error.message || data.error.description || JSON.stringify(data.error);
            }
          }
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }

        // Signup successful - show success message and switch to login mode
        toast.success("Account created successfully! Please sign in with your credentials.");
        
        // Switch to login mode so user can sign in
        setMode("login");
        setIsLoading(false);
        
        // Try auto-login after signup (works if email verification is not required)
        // If it fails, user can manually sign in - no error shown for auto-login failures
        setTimeout(async () => {
          try {
            const loginResponse = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email.trim(),
                password: password,
              }),
            });

            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              
              // Use the same token storage logic as performLogin
              const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "";
              const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "";
              
              if (auth0Domain && auth0ClientId && loginData.access_token && loginData.id_token) {
                try {
                  const cacheKey = `@@auth0spajs@@::${auth0ClientId}@@::${auth0Domain}@@::cache`;
                  const now = Date.now();
                  const expiresIn = loginData.expires_in || 86400;
                  const expiresAt = now + expiresIn * 1000;

                  // Decode ID token to get user info
                  let userId: string | null = null;
                  let userEmail: string | null = null;
                  let userName: string | null = null;
                  let userPicture: string | null = null;
                  
                  if (loginData.id_token) {
                    const idTokenParts = loginData.id_token.split(".");
                    if (idTokenParts.length === 3) {
                      try {
                        const payload = JSON.parse(
                          base64UrlDecode(idTokenParts[1])
                        ) as { sub?: string; email?: string; name?: string; picture?: string };
                        userId = payload.sub || null;
                        userEmail = payload.email || null;
                        userName = payload.name || null;
                        userPicture = payload.picture || null;
                      } catch {
                        // Ignore decode errors
                      }
                    }
                  }

                  // Auth0 SDK cache format - must match exactly what SDK expects
                  const auth0Cache = {
                    body: {
                      access_token: loginData.access_token,
                      id_token: loginData.id_token,
                      expires_in: expiresIn,
                      token_type: loginData.token_type || "Bearer",
                      scope: "openid profile email",
                    },
                    expiresAt: expiresAt,
                    decodedToken: {
                      user: {
                        sub: userId,
                        email: userEmail,
                        name: userName,
                        picture: userPicture,
                      },
                    },
                  };

                  localStorage.setItem(cacheKey, JSON.stringify(auth0Cache));
                  
                  // Also store access token directly for API calls
                  localStorage.setItem("auth0_access_token", loginData.access_token);
                  
                  if (userId) {
                    localStorage.setItem("auth0_user_id", userId);
                  }

                  // Trigger Auth0 SDK to check for tokens without page reload
                  if (typeof window !== "undefined") {
                    try {
                      // Dispatch storage event to notify Auth0 SDK that cache was updated
                      window.dispatchEvent(new StorageEvent("storage", {
                        key: cacheKey,
                        newValue: JSON.stringify(auth0Cache),
                        storageArea: localStorage,
                      }));
                      
                      // Also trigger a custom event
                      window.dispatchEvent(new Event("auth0:cache-updated"));
                    } catch (error) {
                      console.warn("Failed to trigger Auth0 cache update:", error);
                    }
                  }

                  // Success - trigger soft refresh to recognize session
                  toast.success("Successfully signed in!");
                  onOpenChange(false);
                  
                  // Force Auth0 SDK to re-check the cache by triggering a state update
                  setTimeout(() => {
                    // Trigger another cache update event to ensure Auth0 SDK picks it up
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("auth0:cache-updated"));
                    }
                    // Trigger router refresh to re-render components
                    router.refresh();
                  }, 500); // Increased delay to ensure localStorage is fully written
                } catch {
                  // Cache storage failed, user can manually sign in
                }
              }
            } else {
              // Login failed - check the actual error from Auth0
              const errorData = await loginResponse.json().catch(() => ({}));
              console.log("Auto-login after signup failed:", {
                status: loginResponse.status,
                error: errorData.error,
                message: errorData.message,
                description: errorData.error_description,
              });
              
              // If the error is specifically about verification or blocked account, show helpful message
              if (errorData.message?.includes("verify") || 
                  errorData.error_description?.includes("verify") ||
                  errorData.message?.includes("blocked") ||
                  errorData.error_description?.includes("blocked")) {
                toast.info("Please sign in manually. Your account may need a moment to be ready.");
              }
            }
          } catch (_error) {
            // Silently fail - user can manually sign in
            console.log("Auto-login after signup failed (this is normal if email verification is required)");
          }
        }, 2000); // Increased delay to 2s to allow Auth0 to process the new account
      } catch (error) {
        console.error("Signup error:", error);
        toast.error("Failed to create account. Please try again.");
        setIsLoading(false);
      }
    },
    [email, password, name, onOpenChange, router]
  );

  /**
   * Handle form submission (routes to login or signup based on mode)
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      if (mode === "signup") {
        await handleSignup(e);
      } else {
        await handleLogin(e);
      }
    },
    [mode, handleSignup, handleLogin]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-800/95 backdrop-blur-md border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === "signup" 
              ? "Create a new account to get started" 
              : "Sign in to your account to continue"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name Input (only for signup) */}
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm font-medium">
                Name (Optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="border-gray-600 bg-transparent text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          )}
          {/* Test Account Dropdown (only for login mode) */}
          {mode === "login" && (
            <div className="space-y-2">
              <Label htmlFor="test-account" className="text-white text-sm font-medium">
                Test Accounts To Login With
              </Label>
            <Select
              key={`select-${selectedRole || "empty"}`}
              value={selectedRole || undefined}
              onValueChange={handleRoleSelect}
            >
              <SelectTrigger
                id="test-account"
                className="border-gray-600 bg-transparent text-white hover:border-purple-500/50 focus:border-purple-500"
              >
                <SelectValue placeholder="Select Role Based Test Account" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800">
                {Object.entries(testAccounts).map(([key, account]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="cursor-pointer text-white focus:bg-gray-700 focus:text-white"
                  >
                    {account.label}
                  </SelectItem>
                ))}
                {selectedRole && (
                  <SelectItem
                    value="clear"
                    className="cursor-pointer text-gray-400 opacity-60 focus:bg-gray-700 focus:text-gray-400"
                  >
                    Clear Selection
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-600 bg-transparent text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-600 bg-transparent text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          {/* Submit Button (Sign In / Sign Up) */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white border-white/20 shadow-lg shadow-purple-500/20"
          >
            {isLoading 
              ? (mode === "signup" ? "Creating account..." : "Signing in...") 
              : (mode === "signup" ? "Sign Up" : "Sign In")}
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-white/60">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                await loginWithRedirect({
                  authorizationParams: {
                    connection: "google-oauth2",
                  },
                  appState: {
                    returnTo: window.location.pathname,
                  },
                });
              } catch (error) {
                console.error("Google login error:", error);
                toast.error("Failed to initiate Google login. Please try again.");
                setIsLoading(false);
              }
            }}
            className="w-full border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Toggle between Login and Sign Up */}
          <p className="text-center text-sm text-gray-400">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setSelectedRole("");
                    setName("");
                  }}
                  className="text-purple-400 hover:text-purple-300 underline"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setSelectedRole("");
                  }}
                  className="text-purple-400 hover:text-purple-300 underline"
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
