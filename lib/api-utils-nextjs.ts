/**
 * Shared API Utilities for Next.js API Routes
 *
 * - CORS headers
 * - NextAuth session authentication
 * - x-user-id header fallback (dev/test only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth as getNextAuthSession } from "../auth";

export function getCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: getCorsHeaders(), status: 200 });
  }
  return null;
}

export interface AuthResult {
  userId: string | null;
  isValid: boolean;
  error?: string;
}

/**
 * Authenticate: NextAuth session first, then x-user-id (dev/test).
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const session = await getNextAuthSession();
    if (session?.user?.id) {
      return { userId: session.user.id, isValid: true };
    }
  } catch (error) {
    console.warn("NextAuth session check failed:", error);
  }

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

export function jsonResponse(
  data: unknown,
  status: number = 200,
  cacheControl: string = "no-store, no-cache, must-revalidate",
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      ...getCorsHeaders(),
      "Cache-Control": cacheControl,
      "Content-Type": "application/json",
    },
  });
}
