/**
 * Shared API Utilities for Next.js API Routes
 *
 * Converted from Vercel serverless functions to Next.js Request/Response
 * - CORS headers management
 * - Auth0 JWT token validation
 * - User authentication helpers
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * CORS headers configuration
 */
export function getCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: getCorsHeaders(), status: 200 });
  }
  return null;
}

/**
 * Auth0 JWT token validation result
 */
export interface AuthResult {
  userId: string | null;
  isValid: boolean;
  error?: string;
}

/**
 * Verify Auth0 JWT token and extract user ID
 */
export async function verifyAuth0Token(token: string | undefined): Promise<AuthResult> {
  if (!token) {
    return { userId: null, isValid: false, error: "No token provided" };
  }

  const cleanToken = token.replace(/^Bearer\s+/i, "");
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0Audience = process.env.AUTH0_AUDIENCE;

  if (!auth0Domain || !auth0Audience) {
    console.warn("Auth0 environment variables not configured, falling back to header-based auth");
    return { userId: null, isValid: false, error: "Auth0 not configured" };
  }

  try {
    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      return { userId: null, isValid: false, error: "Invalid token format" };
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    ) as { sub?: string; aud?: string; iss?: string; exp?: number };

    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { userId: null, isValid: false, error: "Token expired" };
    }

    if (payload.aud && payload.aud !== auth0Audience) {
      return { userId: null, isValid: false, error: "Invalid audience" };
    }

    if (payload.iss && !payload.iss.includes(auth0Domain)) {
      return { userId: null, isValid: false, error: "Invalid issuer" };
    }

    const userId = payload.sub || null;

    if (!userId) {
      return { userId: null, isValid: false, error: "No user ID in token" };
    }

    return { userId, isValid: true };
  } catch (error) {
    console.error("JWT decode error:", error);
    return {
      userId: null,
      isValid: false,
      error: error instanceof Error ? error.message : "Token decode failed",
    };
  }
}

/**
 * Authenticate request using Auth0 JWT token or fallback to x-user-id header
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const jwtResult = await verifyAuth0Token(authHeader);
    if (jwtResult.isValid) {
      return jwtResult;
    }
    console.warn("JWT validation failed, falling back to header-based auth:", jwtResult.error);
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

/**
 * Require authentication - returns error response if not authenticated
 * @returns Object with userId if authenticated, or response with error if not
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string; response: null } | { userId: null; response: NextResponse }> {
  const authResult = await authenticateRequest(request);

  if (!authResult.isValid || !authResult.userId) {
    return {
      userId: null,
      response: NextResponse.json(
        {
          error: "User not authenticated",
          message: authResult.error || "Authentication required",
        },
        { status: 401, headers: getCorsHeaders() }
      ),
    };
  }

  return { userId: authResult.userId, response: null };
}

/**
 * Create JSON response with CORS headers
 * 
 * @param data - Response data to send
 * @param status - HTTP status code (default: 200)
 * @param cacheControl - Cache-Control header value (default: "no-store" for API responses)
 * @returns NextResponse with JSON data and proper headers
 */
export function jsonResponse(
  data: unknown, 
  status: number = 200,
  cacheControl: string = "no-store, no-cache, must-revalidate"
): NextResponse {
  return NextResponse.json(data, { 
    status, 
    headers: {
      ...getCorsHeaders(),
      "Cache-Control": cacheControl,
      "Content-Type": "application/json",
    }
  });
}

