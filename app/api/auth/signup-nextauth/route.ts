/**
 * NextAuth Sign Up API Route
 * Creates users in PostgreSQL via shared lib/user-registration.ts
 */

import { NextRequest } from "next/server";
import { jsonResponse, handleCorsPreflight } from "../../../../lib/api-utils-nextjs";
import { prisma } from "../../../../lib/prisma";
import { createLocalUser } from "../../../../lib/user-registration";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return jsonResponse({ error: "Email and password are required" }, 400);
    }

    if (password.length < 6) {
      return jsonResponse(
        { error: "Password must be at least 6 characters long" },
        400,
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ error: "Invalid email format" }, 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return jsonResponse(
        {
          error: "User already exists",
          message:
            "An account with this email already exists. Please sign in instead.",
        },
        409,
      );
    }

    const newUser = await createLocalUser({
      email,
      password,
      name: name?.trim() || null,
      provider: "credentials",
    });

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
      201,
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api_route: "/api/auth/signup-nextauth" },
    });

    console.error("Signup API error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("Unique constraint") ||
        error.message.includes("Unique")
      ) {
        return jsonResponse(
          {
            error: "User already exists",
            message:
              "An account with this email already exists. Please sign in instead.",
          },
          409,
        );
      }

      if (
        error.message.includes("connect") ||
        error.message.includes("timeout")
      ) {
        return jsonResponse(
          {
            error: "Database error",
            message: "Failed to connect to database. Please try again.",
          },
          500,
        );
      }
    }

    return jsonResponse(
      {
        error: "Sign up failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      500,
    );
  }
}
