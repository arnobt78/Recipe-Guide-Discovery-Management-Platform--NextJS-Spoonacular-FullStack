/**
 * Auth0 Password Login API Route
 *
 * Handles email/password authentication using Auth0's Resource Owner Password Grant
 * This allows test accounts to login directly without redirecting to Auth0's Universal Login
 *
 * Following DEVELOPMENT_RULES.md: Centralized API routes, proper error handling
 */

import { NextRequest } from "next/server";
import { jsonResponse, handleCorsPreflight } from "../../../../lib/api-utils-nextjs";
import * as Sentry from "@sentry/nextjs";

/**
 * POST /api/auth/login
 * Authenticate user with email and password using Auth0
 */
export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return jsonResponse(
        { error: "Email and password are required" },
        400
      );
    }

    const auth0Domain = process.env.AUTH0_DOMAIN;
    const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const auth0Audience = process.env.AUTH0_AUDIENCE;
    // Auth0 database connection name (defaults to standard connection name)
    // Can be configured via AUTH0_CONNECTION env var, otherwise uses default
    const auth0Connection = process.env.AUTH0_CONNECTION || "Username-Password-Authentication";

    if (!auth0Domain || !auth0ClientId || !auth0Audience) {
      console.error("Auth0 environment variables not configured");
      return jsonResponse(
        { error: "Authentication service not configured" },
        500
      );
    }

    // Use Auth0's OAuth Token endpoint for Resource Owner Password Grant
    // Note: This requires enabling "Password" grant type in Auth0 Application settings
    // and requires a database connection to be configured
    const tokenUrl = `https://${auth0Domain}/oauth/token`;

    // Use password-realm grant type which works even without default connection configured
    // This is more reliable than the basic "password" grant type
    // See: https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow
    const requestBody: Record<string, string> = {
      grant_type: "http://auth0.com/oauth/grant-type/password-realm", // Use password-realm grant type
      username: email,
      password: password,
      client_id: auth0ClientId,
      realm: auth0Connection, // Use "realm" parameter instead of "connection" for password-realm grant
      scope: "openid profile email",
    };

    // Only include audience if it's set (some Auth0 configurations don't require it)
    if (auth0Audience) {
      requestBody.audience = auth0Audience;
    }

    // Log request for debugging (without password)
    console.log("Auth0 login request:", {
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      username: email,
      client_id: auth0ClientId,
      realm: auth0Connection,
      audience: auth0Audience || "not set",
      scope: "openid profile email",
    });

    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        // Log the request payload (without password) for debugging
        // eslint-disable-next-line no-console
        // console.log("Auth0 login request:", { grant_type: "password", username: email, client_id: auth0ClientId, audience: auth0Audience, connection: auth0Connection }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        // Log the full error for debugging
        console.log("Auth0 login error details:", {
          status: tokenResponse.status,
          error: tokenData.error,
          error_description: tokenData.error_description,
          email: email,
        });

        // Capture Auth0 errors in Sentry
        Sentry.captureException(new Error(`Auth0 login failed: ${tokenData.error_description || tokenData.error}`), {
          tags: {
            api_route: "/api/auth/login",
            auth0_error: tokenData.error,
          },
          extra: {
            email: email,
            status: tokenResponse.status,
            error: tokenData.error,
            error_description: tokenData.error_description,
          },
        });

        // Provide helpful error messages for common Auth0 errors
        let errorMessage = tokenData.error_description || tokenData.error || "Invalid email or password";
        
        // Log the raw Auth0 response for debugging
        console.log("Raw Auth0 error response:", JSON.stringify(tokenData, null, 2));
        
        // Handle specific Auth0 error codes
        if (tokenData.error === "invalid_grant") {
          // Invalid credentials, email verification required, or connection not configured
          if (tokenData.error_description?.includes("connection") || 
              tokenData.error_description?.includes("default connection") ||
              errorMessage.includes("connection")) {
            errorMessage = "Authentication service configuration error. The connection may not be enabled for password authentication.";
          } else if (tokenData.error_description?.includes("verify") || tokenData.error_description?.includes("verification")) {
            errorMessage = "Please verify your email address before signing in. Check your inbox for a verification email.";
          } else if (tokenData.error_description?.includes("blocked") || tokenData.error_description?.includes("disabled")) {
            errorMessage = "Your account is currently disabled. Please contact support.";
          } else if (tokenData.error_description?.includes("Wrong email or password") || 
                     tokenData.error_description?.includes("Invalid user credentials")) {
            errorMessage = "Invalid email or password. If you just created your account, please wait a moment and try again.";
          } else {
            errorMessage = tokenData.error_description || "Invalid email or password. If you just created your account, please wait a moment and try again.";
          }
        } else if (tokenData.error === "unauthorized_client") {
          errorMessage = "Authentication service not properly configured. Password grant may not be enabled for this application.";
        } else if (tokenData.error === "access_denied") {
          errorMessage = "Access denied. Please contact support.";
        } else if (tokenData.error === "invalid_request") {
          if (tokenData.error_description?.includes("connection") || errorMessage.includes("connection")) {
            errorMessage = "Authentication service configuration error. Password grant may not be enabled or connection not configured.";
          } else {
            errorMessage = tokenData.error_description || "Invalid request. Please try again.";
          }
        }

        return jsonResponse(
          {
            error: "Authentication failed",
            message: errorMessage,
          },
          401
        );
      }

      // Return tokens (access token, id token, etc.)
      // The frontend will handle storing these and setting up the session
      return jsonResponse({
        success: true,
        access_token: tokenData.access_token,
        id_token: tokenData.id_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
      });
    } catch (fetchError) {
      // Capture network errors in Sentry
      Sentry.captureException(fetchError, {
        tags: {
          api_route: "/api/auth/login",
        },
        extra: {
          email: email,
        },
      });

      console.error("Auth0 token fetch error:", fetchError);
      return jsonResponse(
        {
          error: "Authentication service error",
          message: "Failed to connect to authentication service. Please try again.",
        },
        500
      );
    }
  } catch (error) {
    // Capture parsing errors in Sentry
    Sentry.captureException(error, {
      tags: {
        api_route: "/api/auth/login",
      },
    });

    console.error("Login API error:", error);
    return jsonResponse(
      {
        error: "Invalid request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      400
    );
  }
}
