# Authentication Implementation Guide

## Overview

This comprehensive guide covers multiple authentication implementation options for Next.js applications. Choose the approach that best fits your needs:

1. **NextAuth.js v5** (Recommended) - With dropdown test credentials + OAuth providers (Google, GitHub)
2. **Clerk** - Complete authentication platform with UI components
3. **Auth0** - Enterprise-grade authentication platform

**⚠️ Important**: Always implement proper user data isolation. See [Security & Data Isolation](#security--data-isolation) section.

---

## Option 1: NextAuth.js v5 with Dropdown Test Credentials + OAuth

### Overview

This implementation uses NextAuth.js v5 (Auth.js) with:

- ✅ Email/password authentication (Credentials Provider)
- ✅ Test credentials dropdown for development/testing
- ✅ OAuth providers (Google, GitHub)
- ✅ JWT session strategy with cookies
- ✅ Session management with `AUTH_SECRET`

### Features

- ✅ Dropdown selector for test accounts (only visible on sign-in page)
- ✅ Auto-fills email and password fields when a role is selected
- ✅ "Clear Selection" option appears after selection (faded style)
- ✅ Resets form fields when cleared
- ✅ Uses shadcn/ui Select component
- ✅ Dark theme compatible
- ✅ Google OAuth integration
- ✅ GitHub OAuth integration (optional)
- ✅ JWT-based sessions with secure cookies
- ✅ Type-safe with TypeScript

---

## NextAuth.js v5 Setup

### Prerequisites

1. **Install dependencies**:

```bash
npm install next-auth@beta bcryptjs @auth/prisma-adapter
npm install -D @types/bcryptjs
```

1. **Install shadcn Select component** (if not already installed):

```bash
npx shadcn@latest add select
```

1. **Required dependencies**:
   - `next-auth@^5.0.0-beta.25` (or latest beta)
   - `bcryptjs@^2.4.3`
   - `@auth/prisma-adapter@^2.7.3` (for database sessions, optional)
   - `@radix-ui/react-select` (via shadcn)
   - `react-hook-form`
   - `zod`

### Environment Variables

Create `.env` and `.env.local` files:

```env
# .env (Production)
DATABASE_URL="mongodb://..."
NEXTAUTH_URL=https://your-domain.com
AUTH_SECRET="your-random-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

```env
# .env.local (Local Development)
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET="your-random-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

Or use any secure random string generator. This secret is used to encrypt JWT tokens and session cookies.

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** (or Google Identity Services)
4. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure consent screen (if not done):
   - Choose User Type (External or Internal)
   - Fill in app information
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (for development)
6. Create OAuth client ID for **"Web application"**
7. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
8. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
9. Copy the **Client ID** and **Client Secret**

### Step 2: Configure NextAuth with Google Provider

**File: `src/lib/auth.ts`**

```typescript
import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authConfig: NextAuthConfig = {
  trustHost: true, // Required for NextAuth v5 in development
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) {
          return null;
        }
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!isValid) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt", // JWT sessions (no database adapter needed)
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // ⚠️ IMPORTANT: Handle OAuth providers to create users with MongoDB ObjectID
      // Without this, Google OAuth creates users with UUID format, causing database errors
      if (account?.provider === "google" && user.email) {
        try {
          const googleProfile = profile as
            | { name?: string; picture?: string; email_verified?: boolean }
            | undefined;

          // Check if user exists in database
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Create user with MongoDB ObjectID if doesn't exist
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || googleProfile?.name || null,
                image: user.image || googleProfile?.picture || null,
                emailVerified: googleProfile?.email_verified
                  ? new Date()
                  : null,
              },
            });
          } else {
            // Update user info if it changed
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || googleProfile?.name || dbUser.name,
                image: user.image || googleProfile?.picture || dbUser.image,
                emailVerified: googleProfile?.email_verified
                  ? new Date()
                  : dbUser.emailVerified,
              },
            });
          }

          // Replace user.id with database ObjectID (not UUID)
          user.id = dbUser.id;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false; // Block sign in on error
        }
      }
      return true; // Allow sign in
    },
    async jwt({ token, user }) {
      if (user) {
        // Use database ObjectID from user (set in signIn callback for OAuth)
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

**⚠️ Critical: Google OAuth MongoDB ObjectID Fix**

When using JWT sessions with OAuth providers (Google, GitHub), NextAuth doesn't automatically create users in the database. Without the `signIn` callback, Google OAuth creates users with UUID format IDs (e.g., `9d460988-cafd-44d4-a695-d9dc0ea91a2a`), which causes MongoDB errors like:

```
Malformed ObjectID: invalid character '-' was found at index 8
```

The `signIn` callback ensures:

- ✅ OAuth users are created in the database with MongoDB ObjectID format
- ✅ User data (name, email, image) is stored correctly
- ✅ Existing users are updated with latest info from OAuth provider
- ✅ `user.id` is replaced with database ObjectID before JWT token creation

---

## Alternative Approach: Test Accounts Without Database (Simpler Setup)

**Use this approach if you want:**

- ✅ Quick setup without database dependencies
- ✅ Hardcoded test accounts for development/testing
- ✅ No Prisma/bcryptjs required
- ✅ `auth.ts` in project root (not `src/lib/`)

### Alternative Step 2: Create NextAuth Configuration with Test Accounts

**File: `auth.ts`** (in project root, NOT in `src/lib/`)

```typescript
/**
 * NextAuth v5 Configuration - Test Accounts Approach
 *
 * Authentication configuration using NextAuth v5 (Auth.js)
 * Supports Google OAuth provider and Credentials (email/password) for test accounts
 *
 * This approach uses hardcoded test accounts - no database required
 * Following DEVELOPMENT_RULES.md: Centralized auth, TypeScript, proper types
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Test account credentials (for development/testing)
 * These match the test accounts defined in DROPDOWN_TEST_CREDENTIALS_DOCS.md
 */
const testAccounts: Record<
  string,
  { email: string; password: string; name: string }
> = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
    name: "Guest User",
  },
  "guest-admin": {
    email: "test@admin.com",
    password: "12345678",
    name: "Guest Admin",
  },
};

/**
 * NextAuth configuration
 * Uses Google OAuth provider and Credentials provider for authentication
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    /**
     * Credentials Provider - Email/Password authentication for test accounts
     * Only works with predefined test accounts (development/testing)
     */
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Type assertion for credentials
        const email = credentials.email as string;
        const password = credentials.password as string;

        // Check against test accounts
        const account = Object.values(testAccounts).find(
          (acc) => acc.email === email,
        );

        if (!account || account.password !== password) {
          return null;
        }

        // Return user object for test account
        // Use consistent ID based on email (not timestamp) so same user gets same ID
        return {
          id: `test_${email.split("@")[0]}`,
          email: account.email,
          name: account.name,
          image: undefined,
        };
      },
    }),
    /**
     * Google OAuth Provider
     */
    Google({
      clientId: process.env.GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret:
        process.env.GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback - runs whenever a JWT is accessed
     * Used to add custom claims to the token
     */
    async jwt({ token, user, account }) {
      // Initial sign in - add user info to token
      if (user) {
        // Use user.id if provided (from Credentials provider), otherwise generate one
        token.id =
          user.id ||
          user.email?.split("@")[0] + "_" + Date.now() ||
          `user_${Date.now()}`;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Add access token from OAuth provider (only for OAuth providers, not Credentials)
      if (account && account.provider !== "credentials") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      return token;
    },

    /**
     * Session callback - runs whenever a session is checked
     * Used to customize the session object returned to client
     */
    async session({ session, token }) {
      // Add user ID and access token to session
      if (session.user) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
      }

      return session;
    },
  },
  pages: {
    signIn: "/", // Custom sign-in page (we'll use our own dialog)
  },
  session: {
    strategy: "jwt", // Use JWT strategy for better Next.js App Router compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});
```

**Key Points for Test Accounts Approach:**

- ✅ File is `auth.ts` in project root (not `src/lib/auth.ts`)
- ✅ Test accounts are hardcoded (no database needed for test accounts)
- ✅ Consistent user IDs: `test_test` for `test@user.com`, `test_admin` for `test@admin.com`
- ✅ Google OAuth uses `GOOGLE_ID` and `GOOGLE_SECRET` environment variables
- ✅ Session includes `user.id` and `accessToken` (for OAuth providers)
- ✅ No Prisma or bcryptjs dependencies required

### Alternative Step 3: Create API Route Handler (Test Accounts Approach)

**File: `app/api/auth/[...nextauth]/route.ts`**

```typescript
/**
 * NextAuth API Route Handler
 *
 * Handles all NextAuth authentication routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - etc.
 *
 * Following DEVELOPMENT_RULES.md: Centralized API routes
 */

import { handlers } from "../../../../auth";

export const { GET, POST } = handlers;
```

**Note:** Adjust the import path based on your project structure. If `auth.ts` is in the root, use `../../../../auth`. If it's in `lib/auth.ts`, use `@/lib/auth`.

### Alternative Step 4: Create TypeScript Type Definitions

**File: `types/next-auth.d.ts`**

```typescript
/**
 * NextAuth Type Definitions
 *
 * Extends NextAuth types to include custom session and user properties
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      accessToken?: string;
    };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
```

### Alternative Step 5: Create AuthContext

**File: `src/context/AuthContext.tsx`**

```typescript
/**
 * Auth Context - Centralized authentication state management
 *
 * Provides:
 * - NextAuth authentication state
 * - User information
 * - Login/logout functions
 * - Protected route helpers
 * - User ID storage for API calls
 */

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

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
  userId: string | null;
  loginWithRedirect: () => Promise<void>;
  logout: (options?: { returnTo?: string }) => void;
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user = session?.user as User | undefined;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const userId = user?.id || null;

  // Store user ID in localStorage for API calls (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (userId && user) {
      try {
        localStorage.setItem("user_id", userId);
      } catch (error) {
        console.warn("Failed to store user ID:", error);
      }
    } else {
      try {
        localStorage.removeItem("user_id");
        localStorage.removeItem("access_token");
      } catch (error) {
        console.warn("Failed to remove auth data:", error);
      }
    }
  }, [userId, user]);

  // Store access token for API calls (from session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated || !userId) return;

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

  const loginWithRedirect = async () => {
    await nextAuthSignIn("google", {
      callbackUrl: window.location.origin,
    });
  };

  const logout = async (options?: { returnTo?: string }) => {
    await nextAuthSignOut({
      callbackUrl: options?.returnTo || window.location.origin,
    });
  };

  const getAccessTokenSilently = async (): Promise<string> => {
    if (session?.user && (session.user as { accessToken?: string }).accessToken) {
      return (session.user as { accessToken: string }).accessToken;
    }
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

### Alternative Step 6: Update Root Layout

**File: `app/layout.tsx`**

Wrap your app with `SessionProvider` and `AuthProvider`:

```typescript
"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Alternative Step 7: Setup Backend API Authentication

**File: `lib/api-utils-nextjs.ts`**

Update your API utilities to use NextAuth session authentication:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth as getNextAuthSession } from "../auth";

export interface AuthResult {
  userId: string | null;
  isValid: boolean;
  error?: string;
}

/**
 * Authenticate request using NextAuth session, Auth0 JWT token, or fallback to x-user-id header
 * Priority: NextAuth session > Auth0 JWT > x-user-id header
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthResult> {
  // First, try NextAuth session (most secure and recommended)
  try {
    const session = await getNextAuthSession();
    if (session?.user?.id) {
      return { userId: session.user.id, isValid: true };
    }
  } catch (error) {
    console.warn("NextAuth session check failed:", error);
  }

  // Fallback to x-user-id header (for development/testing)
  const userId = request.headers.get("x-user-id");
  if (userId) {
    return { userId, isValid: true };
  }

  return {
    userId: null,
    isValid: false,
    error: "No valid authentication provided",
  };
}

export async function requireAuth(
  request: NextRequest,
): Promise<
  { userId: string; response: null } | { userId: null; response: NextResponse }
> {
  const authResult = await authenticateRequest(request);

  if (!authResult.isValid || !authResult.userId) {
    return {
      userId: null,
      response: NextResponse.json(
        {
          error: "User not authenticated",
          message: authResult.error || "Authentication required",
        },
        { status: 401, headers: getCorsHeaders() },
      ),
    };
  }

  return { userId: authResult.userId, response: null };
}

export function getCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Max-Age": "86400",
  };
}
```

**Usage in API Routes:**

```typescript
import { requireAuth } from "@/lib/api-utils-nextjs";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;

  // Use auth.userId for authenticated requests
  const userId = auth.userId;
  // ... your API logic
}
```

### Alternative Step 8: Complete LoginDialog Component

**File: `src/components/auth/LoginDialog.tsx`**

See complete component code in [Complete LoginDialog Component with Test Account Dropdown](#complete-logindialog-component-with-test-account-dropdown) section below.

---

### Step 3: Create API Route Handler

**File: `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

### Step 4: Add Google OAuth Button to Auth Form

**File: `src/components/auth/auth-form.tsx`**

```typescript
// Add to AuthFormProps interface
interface AuthFormProps {
  // ... existing props
  onOAuthSignIn?: (provider: "google" | "github") => void;
}

// In the component JSX, add OAuth buttons:
{
  onOAuthSignIn && (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-white/60">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
        onClick={() => onOAuthSignIn("google")}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          {/* Google icon SVG paths */}
        </svg>
        Continue with Google
      </Button>
    </>
  );
}
```

### Step 5: Handle OAuth Sign-In in Page Component

**File: `src/app/auth/signin/page.tsx`**

```typescript
"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  const handleOAuthSignIn = async (provider: "google" | "github") => {
    await signIn(provider, {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <AuthForm
      isSignIn={true}
      onSubmit={handleEmailSignIn}
      onOAuthSignIn={handleOAuthSignIn}
    />
  );
}
```

---

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click **"New OAuth App"**
3. Fill in the form:
   - **Application name**: Your app name
   - **Homepage URL**: `https://your-domain.com` (or `http://localhost:3000` for dev)
   - **Authorization callback URL**:
     - Development: `http://localhost:3000/api/auth/callback/github`
     - Production: `https://your-domain.com/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Generate a **Client Secret** and copy it

### Step 2: Add GitHub Provider to NextAuth Config

**File: `src/lib/auth.ts`**

```typescript
import GitHubProvider from "next-auth/providers/github";

const authConfig: NextAuthConfig = {
  // ... existing config
  providers: [
    // ... existing providers
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  // ... rest of config
};
```

### Step 3: Add GitHub Button to Auth Form

**File: `src/components/auth/auth-form.tsx`**

```typescript
// Add GitHub button after Google button:
<Button
  type="button"
  variant="outline"
  className="w-full border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
  onClick={() => onOAuthSignIn("github")}
  disabled={isLoading}
>
  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
  Continue with GitHub
</Button>
```

---

## Complete LoginDialog Component with Test Account Dropdown

**File: `src/components/auth/LoginDialog.tsx`**

This is the complete, production-ready LoginDialog component with test account dropdown, email/password form, and Google OAuth. Works with both database-based and test account approaches:

```typescript
/**
 * Login Dialog Component
 *
 * Custom NextAuth login dialog with test account dropdown and Google OAuth
 * Features:
 * - ShadCN UI Dialog component
 * - Test account dropdown (auto-fills email/password)
 * - Email/password authentication (Credentials provider)
 * - Google OAuth sign-in
 * - Dark theme compatible
 * - No page refresh - UI updates automatically
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, ShadCN UI, TypeScript
 */

"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LoginDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Callback to switch to register dialog */
  onSwitchToRegister?: () => void;
}

/**
 * Test account credentials
 * Matches DROPDOWN_TEST_CREDENTIALS_DOCS.md
 */
const testAccounts: Record<string, { email: string; password: string }> = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
  },
  "guest-admin": {
    email: "test@admin.com",
    password: "12345678",
  },
};

/**
 * Form validation schema
 */
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Dialog Component
 * Displays test account dropdown, email/password form, and Google OAuth button
 */
export function LoginDialog({
  open,
  onOpenChange,
  onSwitchToRegister,
}: LoginDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  /**
   * Form setup with react-hook-form
   */
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Handle test account selection from dropdown
   * Auto-fills email and password fields
   */
  const handleRoleSelect = useCallback(
    (value: string) => {
      if (value === "clear") {
        setSelectedRole("");
        setValue("email", "");
        setValue("password", "");
        reset();
      } else {
        setSelectedRole(value);
        const account = testAccounts[value];
        if (account) {
          setValue("email", account.email);
          setValue("password", account.password);
        }
      }
    },
    [setValue, reset],
  );

  /**
   * Handle email/password sign-in (Credentials provider)
   */
  const handleCredentialsSignIn = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Invalid email or password. Please try again.");
          setIsLoading(false);
        } else if (result?.ok) {
          // Success - close dialog and refresh session
          toast.success("Signed in successfully!");
          onOpenChange(false);

          // Refresh router to update session
          router.refresh();

          // Small delay to ensure session is propagated and localStorage is updated
          // This ensures API calls have the userId available
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        }
      } catch (error) {
        console.error("Credentials sign-in error:", error);
        toast.error("Failed to sign in. Please try again.");
        setIsLoading(false);
      }
    },
    [router, onOpenChange],
  );

  /**
   * Handle Google OAuth sign-in
   */
  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: window.location.origin,
        redirect: true,
      });
      // Note: signIn will redirect, so we won't reach here on success
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-md border-emerald-500/50 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleCredentialsSignIn)}
          className="space-y-6 mt-4"
        >
          {/* Test Account Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="test-account-select" className="text-white">
              Test Accounts To Login With
            </Label>
            <Select
              key={`select-${selectedRole || "empty"}`}
              value={selectedRole || undefined}
              onValueChange={handleRoleSelect}
            >
              <SelectTrigger
                id="test-account-select"
                className="border-emerald-500/50 bg-slate-800/50 text-white focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg"
              >
                <SelectValue placeholder="Select Role Based Test Account" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800">
                <SelectItem
                  value="guest-user"
                  className="cursor-pointer text-white focus:bg-gray-700 focus:text-white"
                >
                  Guest User
                </SelectItem>
                <SelectItem
                  value="guest-admin"
                  className="cursor-pointer text-white focus:bg-gray-700 focus:text-white"
                >
                  Guest Admin
                </SelectItem>
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

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="border-emerald-500/50 bg-slate-800/50 text-white placeholder:text-gray-500 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="border-emerald-500/50 bg-slate-800/50 text-white placeholder:text-gray-500 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/60">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 transition-all duration-200"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                if (onSwitchToRegister) {
                  onSwitchToRegister();
                }
              }}
              className="text-emerald-400 hover:text-emerald-300 underline transition-colors"
            >
              Sign up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Dropdown Test Credentials Implementation

### Step 1: Add State Management

In your sign-in form component, add state to track the selected role:

```tsx
import { useState } from "react";

const [selectedRole, setSelectedRole] = useState<string>("");
```

### Step 2: Define Test Account Credentials

Create an object mapping role values to credentials:

```tsx
const testAccounts = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
  },
  "guest-admin": {
    email: "test@admin.com",
    password: "12345678",
  },
};
```

**Customize these values** based on your test accounts.

### Step 3: Create Handler Function

Add a function to handle role selection and form field updates:

```tsx
const handleRoleSelect = (value: string) => {
  if (value === "clear") {
    setSelectedRole("");
    form.setValue("email", "");
    form.setValue("password", "");
  } else {
    setSelectedRole(value);
    const account = testAccounts[value as keyof typeof testAccounts];
    if (account) {
      form.setValue("email", account.email);
      form.setValue("password", account.password);
    }
  }
};
```

### Step 4: Add Dropdown Component

Add the Select dropdown above your email field (only for sign-in):

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Inside your form, before the email field:
{
  isSignIn && (
    <div className="space-y-2">
      <FormLabel className="text-white">Test Accounts To Login With</FormLabel>
      <Select
        key={`select-${selectedRole || "empty"}`}
        value={selectedRole || undefined}
        onValueChange={handleRoleSelect}
      >
        <SelectTrigger className="form-input border-gray-600 bg-transparent text-white">
          <SelectValue placeholder="Select Role Based Test Account" />
        </SelectTrigger>
        <SelectContent className="border-gray-600 bg-gray-800">
          <SelectItem
            value="guest-user"
            className="cursor-pointer text-white focus:bg-gray-700 focus:text-white"
          >
            Guest User
          </SelectItem>
          <SelectItem
            value="guest-admin"
            className="cursor-pointer text-white focus:bg-gray-700 focus:text-white"
          >
            Guest Admin
          </SelectItem>
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
  );
}
```

### Complete Example: Auth Form with Dropdown + OAuth

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SignInForm = ({
  onOAuthSignIn,
}: {
  onOAuthSignIn?: (provider: "google" | "github") => void;
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Test account credentials
  const testAccounts = {
    "guest-user": {
      email: "test@user.com",
      password: "12345678",
    },
  };

  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      form.setValue("email", "");
      form.setValue("password", "");
    } else {
      setSelectedRole(value);
      const account = testAccounts[value as keyof typeof testAccounts];
      if (account) {
        form.setValue("email", account.email);
        form.setValue("password", account.password);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* Test Account Dropdown */}
        <div className="space-y-2">
          <FormLabel className="text-white">
            Test Accounts To Login With
          </FormLabel>
          <Select
            key={`select-${selectedRole || "empty"}`}
            value={selectedRole || undefined}
            onValueChange={handleRoleSelect}
          >
            <SelectTrigger className="form-input border-gray-600 bg-transparent text-white">
              <SelectValue placeholder="Select Role Based Test Account" />
            </SelectTrigger>
            <SelectContent className="border-gray-600 bg-gray-800">
              <SelectItem
                value="guest-user"
                className="cursor-pointer text-white focus:bg-gray-700 focus:text-white"
              >
                Guest User
              </SelectItem>
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

        {/* Email and Password Fields */}
        {/* ... */}

        {/* OAuth Buttons */}
        {onOAuthSignIn && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/60">
                  Or continue with
                </span>
              </div>
            </div>
            <Button type="button" onClick={() => onOAuthSignIn("google")}>
              Continue with Google
            </Button>
            <Button type="button" onClick={() => onOAuthSignIn("github")}>
              Continue with GitHub
            </Button>
          </>
        )}
      </form>
    </Form>
  );
};
```

---

## Prisma Schema (NextAuth Models)

**File: `prisma/schema.prisma`**

```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?   // Hashed password (only for email/password users)
  image         String?   // Profile image URL (from OAuth or uploaded)
  accounts      Account[]
  sessions      Session[]
  projects      Project[] // Your custom relations
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

After updating the schema, run:

```bash
npx prisma db push  # For MongoDB (or migrate dev for SQL databases)
npx prisma generate
```

---

## Middleware Protection

**File: `src/middleware.ts`**

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const session = await auth();
    if (!session) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## How It Works

### Email/Password Authentication Flow

1. User enters email/password (or selects from dropdown)
2. Form submits to NextAuth credentials provider
3. NextAuth calls `authorize` function
4. Password is verified using `bcrypt.compare`
5. If valid, user object is returned and stored in JWT token
6. Session cookie is set in browser
7. User is redirected to callback URL (usually `/dashboard`)

### OAuth Authentication Flow (Google/GitHub)

1. User clicks "Continue with Google/GitHub"
2. `signIn(provider)` is called from `next-auth/react`
3. User is redirected to OAuth provider's consent screen
4. User grants permission
5. OAuth provider redirects back to `/api/auth/callback/[provider]`
6. NextAuth handles the callback, creates/updates user in database
7. Session is created and cookie is set
8. User is redirected to callback URL

### Session Management

- Sessions use **JWT strategy** (tokens stored in cookies, not database)
- `AUTH_SECRET` is used to encrypt/decrypt JWT tokens
- Session cookies are httpOnly and secure (in production)
- Session data includes: `id`, `email`, `name`, `image`

### Dropdown Test Credentials

1. **Initial State**: Dropdown shows placeholder "Select Role Based Test Account"
2. **Selection**: User selects a role (e.g., "Guest User")
3. **Auto-fill**: `handleRoleSelect` function:
   - Sets the selected role in state
   - Finds matching credentials from `testAccounts`
   - Updates form fields using `form.setValue()`
4. **Clear Option**: After selection, "Clear Selection" appears in the dropdown (faded)
5. **Reset**: Clicking "Clear Selection":
   - Resets `selectedRole` to empty string
   - Clears email and password fields
   - The `key` prop forces Select to remount, showing placeholder again

---

## Key Implementation Details

### Why the `key` prop?

```tsx
key={`select-${selectedRole || "empty"}`}
```

The `key` prop changes when `selectedRole` changes from a value to empty. This forces React to remount the Select component, ensuring the placeholder displays correctly after clearing.

### Form Field Updates

```tsx
form.setValue("email", account.email);
form.setValue("password", account.password);
```

Uses react-hook-form's `setValue` method to programmatically update form fields. This ensures the form state stays in sync.

### JWT vs Database Sessions

- **JWT Sessions** (Current Implementation):
  - No database queries for session validation
  - Stateless (scales better)
  - Token stored in cookie
  - Cannot revoke sessions server-side (must wait for expiry)

- **Database Sessions** (Alternative):
  - Requires `@auth/prisma-adapter`
  - Can revoke sessions server-side
  - Requires database query on each request
  - Better for sensitive applications

### OAuth Provider Selection

You can enable/disable providers by:

1. Adding/removing providers from `authConfig.providers`
2. Adding/removing environment variables
3. Adding/removing buttons from the auth form

---

## Customization

### Add More Test Accounts

Simply add more entries to the `testAccounts` object:

```tsx
const testAccounts = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
  },
  "guest-admin": {
    email: "test@admin.com",
    password: "12345678",
  },
  "guest-moderator": {
    email: "test@moderator.com",
    password: "12345678",
  },
};
```

And add corresponding `SelectItem`:

```tsx
<SelectItem value="guest-moderator">Guest Moderator</SelectItem>
```

### Change Styling

Update the className props to match your theme:

```tsx
// Light theme example
<SelectTrigger className="border border-gray-300 bg-white text-gray-900">
<SelectContent className="border-gray-300 bg-white">
  <SelectItem className="text-gray-900 focus:bg-gray-100">
```

### Change Labels

Update the FormLabel and placeholder text:

```tsx
<FormLabel>Quick Test Login</FormLabel>
<SelectValue placeholder="Choose a test account" />
```

---

## Troubleshooting

### Placeholder not showing after clear

- Ensure the `key` prop is present and changes when clearing
- Verify `selectedRole` is set to empty string `""` when clearing
- Check that `value={selectedRole || undefined}` is used

### Form fields not updating

- Verify `form.setValue()` is being called correctly
- Ensure field names match your form schema
- Check that form is properly initialized with `useForm()`

### Dropdown not visible

- Ensure `isSignIn` condition is correct
- Check that Select component is imported correctly
- Verify shadcn Select component is installed

### OAuth callback errors

- Verify redirect URIs match exactly (including http/https, trailing slashes)
- Check environment variables are set correctly
- Ensure `NEXTAUTH_URL` matches your domain
- Check browser console and server logs for detailed errors

### Session is null

- Verify `AUTH_SECRET` is set in environment variables
- Check that `trustHost: true` is set in development
- Ensure cookies are enabled in browser
- Verify middleware is not blocking session cookies

### Logout not clearing session properly

**Problem**: After logout, user can still access dashboard or sees another user's data.

**Solution**: Use `window.location.href` for full page reload to clear all cached data:

```typescript
const handleLogout = async () => {
  await signOut({
    redirect: false,
  });
  // Force full page reload to clear all cached data, React Query cache, and ensure fresh session
  window.location.href = "/auth/signin";
};
```

**Why**: `router.push()` and `router.refresh()` don't always clear React Query cache and browser cache. `window.location.href` forces a complete page reload, ensuring:

- ✅ JWT session cookie is cleared
- ✅ React Query cache is cleared
- ✅ Browser cache is cleared
- ✅ Fresh session on next login

### Google OAuth MongoDB ObjectID error

**Problem**: Creating projects after Google OAuth login fails with:

```bash
Malformed ObjectID: invalid character '-' was found at index 8
```

**Solution**: Add `signIn` callback to create/update users in database with MongoDB ObjectID (see Step 2 in Google OAuth Setup section above).

**Why**: Without the callback, OAuth users get UUID format IDs instead of MongoDB ObjectID format (24-character hex string).

---

## File Structure

```bash
src/
  ├── lib/
  │   ├── auth.ts                    # NextAuth configuration
  │   └── prisma.ts                  # Prisma client
  ├── app/
  │   ├── api/
  │   │   └── auth/
  │   │       └── [...nextauth]/
  │   │           └── route.ts       # NextAuth API route handler
  │   ├── auth/
  │   │   ├── signin/
  │   │   │   └── page.tsx           # Sign-in page
  │   │   └── signup/
  │   │       └── page.tsx           # Sign-up page
  │   └── dashboard/                 # Protected routes
  ├── components/
  │   ├── ui/
  │   │   └── select.tsx             # shadcn Select component
  │   └── auth/
  │       └── auth-form.tsx          # Auth form with dropdown + OAuth
  └── middleware.ts                  # Route protection middleware
```

---

## Dependencies

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",
    "bcryptjs": "^2.4.3",
    "@auth/prisma-adapter": "^2.7.3",
    "@radix-ui/react-select": "^latest",
    "react-hook-form": "^latest",
    "zod": "^latest"
  },
  "devDependencies": {
    "@types/bcryptjs": "^latest"
  }
}
```

---

## Notes

- This feature is designed for **development/testing** purposes
- Consider hiding the test credentials dropdown in production or behind a feature flag
- Test accounts should have limited permissions in production
- The dropdown only appears on sign-in forms (controlled by `isSignIn` condition)
- OAuth providers require HTTPS in production (except localhost)
- Always use strong, unique `AUTH_SECRET` values in production
- Keep OAuth client secrets secure and never commit them to version control

---

# Option 2: Clerk Authentication

## Overview (Clerk Authentication)

Clerk is a complete authentication platform that provides:

- Pre-built UI components (sign-in, sign-up, user profile)
- Multiple authentication methods (email, OAuth, magic links, SMS)
- User management dashboard
- Session management
- Webhooks for user events

**Best for**: Projects that want authentication implemented quickly with minimal code.

---

## Clerk Setup

### Step 1: Install Clerk

```bash
npm install @clerk/nextjs
```

### Step 2: Create Clerk Account

1. Go to [clerk.com](https://clerk.com/)
2. Sign up for a free account
3. Create a new application
4. Copy your API keys from the dashboard

### Step 3: Environment Variables

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step 4: Wrap App with ClerkProvider

**File: `src/app/layout.tsx`**

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Step 5: Create Sign-In Page

**File: `src/app/auth/signin/[[...sign-in]]/page.tsx`**

```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### Step 6: Create Sign-Up Page

**File: `src/app/auth/signup/[[...sign-up]]/page.tsx`**

```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

### Step 7: Protect Routes with Middleware

**File: `src/middleware.ts`**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Step 8: Access User Data in Components

```typescript
import { useUser } from "@clerk/nextjs";

export function MyComponent() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Hello, {user.emailAddresses[0].emailAddress}!</div>;
}
```

### Step 9: Using Test Credentials Dropdown with Clerk

Since Clerk uses its own UI components, you can:

1. **Use Clerk's test mode**: Clerk provides a test mode where you can create test users in the dashboard
2. **Custom implementation**: Build a custom sign-in page that uses Clerk's authentication methods but includes your dropdown:

```typescript
"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const testAccounts = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
  },
};

export default function CustomSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRoleSelect = (value: string) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Redirect to dashboard
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Test Account Dropdown */}
      <Select
        value={selectedRole || undefined}
        onValueChange={handleRoleSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Test Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="guest-user">Guest User</SelectItem>
          {selectedRole && (
            <SelectItem value="clear">Clear Selection</SelectItem>
          )}
        </SelectContent>
      </Select>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

---

## Clerk Advantages

- ✅ Pre-built UI components (save development time)
- ✅ User management dashboard
- ✅ Multiple authentication methods out of the box
- ✅ Webhooks for user events
- ✅ Email verification, password reset built-in
- ✅ Session management handled automatically

## Clerk Disadvantages

- ❌ Less customization compared to NextAuth
- ❌ Requires external service (vendor lock-in)
- ❌ Free tier has limitations
- ❌ Test credentials dropdown requires custom implementation

---

# Option 3: Auth0 Authentication

## Overview (Auth0 Authentication)

Auth0 is an enterprise-grade authentication platform that provides:

- Multiple authentication methods
- Fine-grained authorization
- User management APIs
- Customizable login UI (Lock.js, Auth0.js, or custom)
- Extensive documentation and SDKs

**Best for**: Enterprise applications requiring advanced authorization and compliance features.

---

## Auth0 Setup

### Step 1: Install Auth0

```bash
npm install @auth0/nextjs-auth0
```

### Step 2: Create Auth0 Account

1. Go to [auth0.com](https://auth0.com/)
2. Sign up for a free account
3. Create a new Application (Regular Web Application)
4. Configure Allowed Callback URLs:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-domain.com/api/auth/callback`
5. Configure Allowed Logout URLs:
   - `http://localhost:3000`
   - `https://your-domain.com`
6. Copy Domain, Client ID, and Client Secret

### Step 3: Environment Variables (Auth0 Authentication)

```env
# .env.local
AUTH0_SECRET="use-openssl-rand-hex-32-to-generate"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://YOUR_AUTH0_DOMAIN.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
```

Generate `AUTH0_SECRET`:

```bash
openssl rand -hex 32
```

### Step 4: Create API Route Handler

**File: `src/app/api/auth/[...auth0]/route.ts`**

```typescript
import { handleAuth } from "@auth0/nextjs-auth0";

export const GET = handleAuth();
```

This creates the following routes:

- `/api/auth/login` - Login
- `/api/auth/logout` - Logout
- `/api/auth/callback` - Callback
- `/api/auth/me` - User profile

### Step 5: Create Sign-In Page (Auth0 Authentication)

**File: `src/app/auth/signin/page.tsx`**

```typescript
"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;

  if (user) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <a
        href="/api/auth/login"
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Log In with Auth0
      </a>
    </div>
  );
}
```

### Step 6: Protect Routes with Middleware

**File: `src/middleware.ts`**

```typescript
import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";

export default withMiddlewareAuthRequired();

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Step 7: Access User Data in Components

```typescript
import { useUser } from "@auth0/nextjs-auth0/client";

export function MyComponent() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? <div>Hello, {user.email}!</div> : <div>Not logged in</div>;
}
```

### Step 8: Using Test Credentials Dropdown with Auth0

Auth0 uses redirect-based authentication, so you'll need to use Auth0's test users or implement a custom login form:

**Option A: Use Auth0 Test Users**

1. Create test users in Auth0 Dashboard → Users
2. Use those credentials for testing

**Option B: Custom Login Form (requires Auth0 Universal Login customization)**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const testAccounts = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
  },
};

export default function CustomAuth0SignIn() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRoleSelect = (value: string) => {
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
  };

  // Note: Auth0 requires Universal Login customization for custom forms
  // This is a simplified example - you'd need to configure Auth0's Universal Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Auth0 custom login requires additional setup
    // Redirect to Auth0 login with pre-filled email
    router.push(
      `/api/auth/login?screen_hint=login&login_hint=${encodeURIComponent(
        email
      )}`
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Test Account Dropdown */}
      <Select
        value={selectedRole || undefined}
        onValueChange={handleRoleSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Test Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="guest-user">Guest User</SelectItem>
          {selectedRole && (
            <SelectItem value="clear">Clear Selection</SelectItem>
          )}
        </SelectContent>
      </Select>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

**Note**: Auth0's custom login forms require Universal Login customization, which is more complex than NextAuth or Clerk. For test credentials with Auth0, it's recommended to use Auth0's test users feature.

---

## Auth0 Advantages

- ✅ Enterprise-grade security and compliance
- ✅ Fine-grained authorization (RBAC, ABAC)
- ✅ Extensive customization options
- ✅ Multiple authentication methods
- ✅ Good documentation and SDKs

## Auth0 Disadvantages

- ❌ More complex setup than NextAuth or Clerk
- ❌ Requires external service (vendor lock-in)
- ❌ Free tier has limitations
- ❌ Test credentials dropdown requires Universal Login customization (complex)
- ❌ Steeper learning curve

---

## Comparison Table

| Feature                       | NextAuth.js v5     | Clerk                    | Auth0                        |
| ----------------------------- | ------------------ | ------------------------ | ---------------------------- |
| **Setup Complexity**          | Medium             | Easy                     | Medium-Hard                  |
| **Customization**             | High               | Medium                   | High                         |
| **Pre-built UI**              | No                 | Yes                      | Yes (Universal Login)        |
| **Cost**                      | Free (self-hosted) | Free tier + Paid         | Free tier + Paid             |
| **Test Credentials Dropdown** | ✅ Native support  | ⚠️ Custom implementation | ⚠️ Complex (Universal Login) |
| **OAuth Providers**           | Many (via plugins) | Many (built-in)          | Many (built-in)              |
| **Database Sessions**         | Optional           | Built-in                 | Built-in                     |
| **Self-hosted**               | ✅ Yes             | ❌ No                    | ❌ No                        |
| **TypeScript Support**        | ✅ Excellent       | ✅ Excellent             | ✅ Good                      |
| **Best For**                  | Custom auth needs  | Quick implementation     | Enterprise apps              |

---

## Recommendations

1. **Use NextAuth.js v5** if:
   - You want full control over authentication flow
   - You need custom UI/UX
   - You want to self-host everything
   - You need the test credentials dropdown feature
   - You're building a custom authentication experience

2. **Use Clerk** if:
   - You want authentication implemented quickly
   - You're okay with pre-built UI components
   - You need user management features out of the box
   - You don't mind vendor lock-in
   - Test credentials dropdown is not critical

3. **Use Auth0** if:
   - You need enterprise-grade features
   - You require fine-grained authorization
   - You need compliance features (SOC2, HIPAA, etc.)
   - You have a large team and budget
   - Test credentials can use Auth0's test users feature

---

## Security & Data Isolation

### Database Schema Requirements

**Important**: Ensure proper user isolation in your database schema:

```prisma
model User {
  id       String    @id @default(auto())
  email    String    @unique
  projects Project[]
}

model Project {
  id     String  @id @default(auto())
  userId String  // ✅ REQUIRED - Foreign key to User
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

### API Route Security

**All API routes must**:

1. ✅ Check authentication: `const session = await auth(); if (!session?.user?.id) return 401;`
2. ✅ Filter by userId: `const projects = allProjects.filter(p => p.userId === session.user.id);`
3. ✅ Verify ownership before update/delete: `if (project.userId !== session.user.id) return 403;`

### Registration Flow Best Practice

**Do NOT auto sign-in after registration** to prevent session conflicts:

```typescript
// ❌ BAD: Auto sign-in after registration
await signIn("credentials", {...});
router.push("/dashboard");

// ✅ GOOD: Redirect to sign-in page
toast.success("Account created! Please sign in.");
router.push("/auth/signin");
```

### Session Management (Auth0 Authentication)

- Use JWT sessions with `AUTH_SECRET` for secure token encryption
- Ensure `session.user.id` is available in all protected routes
- Clear sessions properly on logout: Use `window.location.href` after `signOut()` for full page reload (clears React Query cache and browser cache)
- Manual sign-in ensures fresh sessions (prevents cookie conflicts)
- OAuth providers require `signIn` callback to create users with MongoDB ObjectID format (prevents UUID format errors)

### Data Isolation Checklist

- ✅ User model has unique email constraint
- ✅ All user-owned resources have `userId` foreign key (required, non-nullable)
- ✅ API routes filter by `session.user.id`
- ✅ Ownership verified before update/delete operations
- ✅ Cascade delete configured: `onDelete: Cascade`
- ✅ Indexes on foreign keys for performance
- ✅ No auto sign-in after registration

---

## License

This implementation guide is provided as-is for use in your projects.
