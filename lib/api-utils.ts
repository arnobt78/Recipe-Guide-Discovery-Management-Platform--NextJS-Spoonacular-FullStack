/**
 * Shared API Utilities
 *
 * Centralized utilities for Vercel serverless functions:
 * - CORS headers management
 * - Auth0 JWT token validation (basic validation, can be enhanced with jsonwebtoken/jwks-rsa)
 * - User authentication helpers
 *
 * Following DEVELOPMENT_RULES.md: Reusable, centralized utilities
 *
 * Note: For production JWT verification, install:
 * npm install jsonwebtoken jwks-rsa @types/jsonwebtoken
 */

import { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * CORS headers configuration
 */
export function setCorsHeaders(response: VercelResponse): void {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id");
  response.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(
  request: VercelRequest,
  response: VercelResponse
): boolean {
  if (request.method === "OPTIONS") {
    setCorsHeaders(response);
    response.status(200).end();
    return true;
  }
  return false;
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
 * 
 * Basic JWT validation without full cryptographic verification.
 * For production, enhance with jsonwebtoken and jwks-rsa packages.
 *
 * @param token - JWT token from Authorization header
 * @returns AuthResult with userId and validation status
 */
export async function verifyAuth0Token(token: string | undefined): Promise<AuthResult> {
  if (!token) {
    return { userId: null, isValid: false, error: "No token provided" };
  }

  // Remove "Bearer " prefix if present
  const cleanToken = token.replace(/^Bearer\s+/i, "");

  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0Audience = process.env.AUTH0_AUDIENCE;

  if (!auth0Domain || !auth0Audience) {
    console.warn("Auth0 environment variables not configured, falling back to header-based auth");
    return { userId: null, isValid: false, error: "Auth0 not configured" };
  }

  try {
    // Basic JWT structure validation (without full cryptographic verification)
    // Split token into parts
    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      return { userId: null, isValid: false, error: "Invalid token format" };
    }

    // Decode payload (base64url decode)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    ) as { sub?: string; aud?: string; iss?: string; exp?: number };

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { userId: null, isValid: false, error: "Token expired" };
    }

    // Check audience and issuer (basic validation)
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

    // Note: For production, use full JWT verification with jwks-rsa
    // This is a basic validation - full verification requires installing jsonwebtoken and jwks-rsa
    return {
      userId,
      isValid: true,
    };
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
 *
 * @param request - Vercel request object
 * @returns AuthResult with userId and validation status
 */
export async function authenticateRequest(request: VercelRequest): Promise<AuthResult> {
  // Try JWT token first (preferred method)
  const authHeader = request.headers.authorization;
  if (authHeader) {
    const jwtResult = await verifyAuth0Token(authHeader);
    if (jwtResult.isValid) {
      return jwtResult;
    }
    // If JWT validation fails, fall back to header (for development)
    console.warn("JWT validation failed, falling back to header-based auth:", jwtResult.error);
  }

  // Fallback to x-user-id header (for development/backward compatibility)
  const userId = request.headers["x-user-id"] as string | undefined;
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
 * Require authentication middleware
 * Returns 401 if user is not authenticated
 *
 * @param request - Vercel request object
 * @param response - Vercel response object
 * @returns User ID if authenticated, null otherwise
 */
export async function requireAuth(
  request: VercelRequest,
  response: VercelResponse
): Promise<string | null> {
  const authResult = await authenticateRequest(request);

  if (!authResult.isValid || !authResult.userId) {
    response.status(401).json({
      error: "User not authenticated",
      message: authResult.error || "Authentication required",
    });
    return null;
  }

  return authResult.userId;
}
