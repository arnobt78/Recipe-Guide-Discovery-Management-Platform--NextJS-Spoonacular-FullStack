/**
 * NextAuth Sign Up API Route
 *
 * Handles user registration using NextAuth Credentials provider
 * Creates users in PostgreSQL database with hashed passwords
 *
 * Following DEVELOPMENT_RULES.md: Centralized API routes, proper error handling
 */

import { NextRequest } from "next/server";
import { jsonResponse, handleCorsPreflight } from "../../../../lib/api-utils-nextjs";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import * as Sentry from "@sentry/nextjs";

/**
 * POST /api/auth/signup
 * Create new user account with email and password
 */
export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return jsonResponse(
        { error: "Email and password are required" },
        400
      );
    }

    // Validate password strength (min 6 characters to match login validation)
    if (password.length < 6) {
      return jsonResponse(
        { error: "Password must be at least 6 characters long" },
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse(
        { error: "Invalid email format" },
        400
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return jsonResponse(
        {
          error: "User already exists",
          message: "An account with this email already exists. Please sign in instead.",
        },
        409
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user ID (use email prefix + timestamp for uniqueness)
    const userId = `user_${email.split("@")[0]}_${Date.now()}`;

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        password: hashedPassword,
        picture: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Log successful signup (don't log password)
    console.log(`✅ User created: ${newUser.email} (ID: ${newUser.id})`);

    const { invalidateBusinessInsightsCache } = await import(
      "../../../../lib/redis-cache"
    );
    await invalidateBusinessInsightsCache();

    // Return success response
    return jsonResponse(
      {
        success: true,
        message: "Account created successfully! Please sign in.",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      201
    );
  } catch (error) {
    // Capture errors in Sentry
    Sentry.captureException(error, {
      tags: {
        api_route: "/api/auth/signup",
      },
    });

    console.error("Signup API error:", error);

    // Handle Prisma errors
    if (error instanceof Error) {
      // Unique constraint violation (email already exists)
      if (error.message.includes("Unique constraint") || error.message.includes("Unique")) {
        return jsonResponse(
          {
            error: "User already exists",
            message: "An account with this email already exists. Please sign in instead.",
          },
          409
        );
      }

      // Database connection errors
      if (error.message.includes("connect") || error.message.includes("timeout")) {
        return jsonResponse(
          {
            error: "Database error",
            message: "Failed to connect to database. Please try again.",
          },
          500
        );
      }
    }

    return jsonResponse(
      {
        error: "Sign up failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      500
    );
  }
}
