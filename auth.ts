/**
 * NextAuth v5 Configuration
 * 
 * Authentication configuration using NextAuth v5 (Auth.js)
 * Supports Google OAuth provider and Credentials (email/password) for database-backed authentication
 * 
 * Following DEVELOPMENT_RULES.md: Centralized auth, TypeScript, proper types
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

/**
 * NextAuth configuration
 * Uses Google OAuth provider and Credentials provider for authentication
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    /**
     * Credentials Provider - Email/Password authentication
     * Only authenticates users that exist in the database with matching credentials
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

        // Check database for user with password
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
          });

          if (!dbUser || !dbUser.password) {
            // User doesn't exist or has no password set
            return null;
          }

          // User exists in database - verify password
          const isValidPassword = await bcrypt.compare(password, dbUser.password);
          if (isValidPassword) {
            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name || undefined,
              image: dbUser.picture || undefined,
            };
          }

          // Password doesn't match
          return null;
        } catch (error) {
          console.error("Database authentication error:", error);
          // Return null on database errors - don't allow authentication
          return null;
        }
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
     * SignIn callback - runs on every sign in
     * Used to create database records for OAuth users (Google, etc.)
     */
    async signIn({ user, account, profile }) {
      // Only handle OAuth providers (not Credentials - those are handled by signup API)
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email.trim().toLowerCase() },
          });

          if (!existingUser) {
            // Create new user for OAuth sign-in
            const userId = `google_${user.email.split("@")[0]}_${Date.now()}`;
            await prisma.user.create({
              data: {
                id: userId,
                email: user.email.trim().toLowerCase(),
                name: user.name || profile?.name || null,
                picture: user.image || (profile as { picture?: string })?.picture || null,
                password: null, // OAuth users don't have passwords
              },
            });
            console.log(`✅ Google OAuth user created: ${user.email} (ID: ${userId})`);
            
            // Update the user object with the new ID for JWT
            user.id = userId;
          } else {
            // User exists - update their info and use existing ID
            await prisma.user.update({
              where: { email: user.email.trim().toLowerCase() },
              data: {
                name: user.name || profile?.name || existingUser.name,
                picture: user.image || (profile as { picture?: string })?.picture || existingUser.picture,
                updatedAt: new Date(),
              },
            });
            console.log(`✅ Google OAuth user updated: ${user.email} (ID: ${existingUser.id})`);
            
            // Use existing user ID for JWT
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error creating/updating OAuth user:", error);
          // Still allow sign-in even if database operation fails
          // The user will just not have a database record until next sign-in
        }
      }
      
      // Return true to allow sign-in
      return true;
    },

    /**
     * JWT callback - runs whenever a JWT is accessed
     * Used to add custom claims to the token
     */
    async jwt({ token, user, account, profile }) {
      // Initial sign in - add user info to token
      if (user) {
        // Use user.id if provided (from Credentials provider), otherwise generate one
        token.id = user.id || user.email?.split("@")[0] + "_" + Date.now() || `user_${Date.now()}`;
        token.email = user.email;
        token.name = user.name;
        // Set picture from user.image (OAuth providers set this from profile)
        if (user.image) {
          token.picture = user.image;
        }
      }
      
      // For Google OAuth, also check the profile for picture (backup)
      if (profile && account?.provider === "google") {
        const googleProfile = profile as { picture?: string };
        if (googleProfile.picture) {
          token.picture = googleProfile.picture;
        }
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
      // Add user ID, image, and access token to session
      if (session.user) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        // Pass the picture from token to session (for Google OAuth profile image)
        if (token.picture) {
          session.user.image = token.picture as string;
        }
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
