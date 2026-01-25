/**
 * NextAuth v5 Configuration
 * 
 * Authentication configuration using NextAuth v5 (Auth.js)
 * Supports Google OAuth provider and Credentials (email/password) for test accounts
 * 
 * Following DEVELOPMENT_RULES.md: Centralized auth, TypeScript, proper types
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Test account credentials (for development/testing)
 * These match the test accounts defined in DROPDOWN_TEST_CREDENTIALS_DOCS.md
 */
const testAccounts: Record<string, { email: string; password: string; name: string }> = {
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
          (acc) => acc.email === email
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
      clientSecret: process.env.GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
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
        token.id = user.id || user.email?.split("@")[0] + "_" + Date.now() || `user_${Date.now()}`;
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
