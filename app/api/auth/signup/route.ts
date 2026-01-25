/**
 * Auth0 Sign Up API Route
 *
 * Handles user registration using Auth0's Database Signup endpoint
 * This allows users to create accounts directly without redirecting to Auth0's Universal Login
 *
 * Following DEVELOPMENT_RULES.md: Centralized API routes, proper error handling
 */

import { NextRequest } from "next/server";
import { jsonResponse, handleCorsPreflight } from "../../../../lib/api-utils-nextjs";
import * as Sentry from "@sentry/nextjs";

/**
 * POST /api/auth/signup
 * Create new user account with email and password using Auth0
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

    // Validate password strength (min 8 characters)
    if (password.length < 8) {
      return jsonResponse(
        { error: "Password must be at least 8 characters long" },
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

    const auth0Domain = process.env.AUTH0_DOMAIN;
    const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    // Auth0 database connection name (defaults to standard connection name)
    const auth0Connection = process.env.AUTH0_CONNECTION || "Username-Password-Authentication";

    if (!auth0Domain || !auth0ClientId) {
      console.error("Auth0 environment variables not configured");
      return jsonResponse(
        { error: "Authentication service not configured" },
        500
      );
    }

    // Use Auth0's Database Signup endpoint
    // Note: This requires "Disable Sign Ups" to be OFF in Auth0 Database Connection settings
    const signupUrl = `https://${auth0Domain}/dbconnections/signup`;

    try {
      const signupResponse = await fetch(signupUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: auth0ClientId,
          email: email.trim(),
          password: password,
          connection: auth0Connection,
          name: name?.trim() || undefined, // Optional name field
          user_metadata: {
            // Optional metadata
            name: name?.trim() || undefined,
          },
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        // Helper to parse Auth0 password validation rules into human-readable message
        const parsePasswordValidationRules = (rulesObj: unknown): string => {
          try {
            // Handle stringified JSON
            let rules: unknown = rulesObj;
            if (typeof rulesObj === "string") {
              rules = JSON.parse(rulesObj);
            }

            if (typeof rules !== "object" || rules === null) {
              return "Password does not meet requirements.";
            }

            const rulesData = rules as { 
              rules?: Array<{
                message?: string;
                code?: string;
                verified?: boolean;
                format?: number[];
                items?: Array<{
                  message?: string;
                  code?: string;
                  verified?: boolean;
                }>;
              }> 
            };

            if (!rulesData.rules || !Array.isArray(rulesData.rules)) {
              return "Password does not meet requirements.";
            }

            const failedRules: string[] = [];
            
            for (const rule of rulesData.rules) {
              if (rule.verified === false) {
                if (rule.code === "lengthAtLeast" && rule.message && rule.format && rule.format[0]) {
                  failedRules.push(rule.message.replace("%d", String(rule.format[0])));
                } else if (rule.code === "containsAtLeast") {
                  // Parse character type requirements
                  const missingTypes: string[] = [];
                  if (rule.items && Array.isArray(rule.items)) {
                    for (const item of rule.items) {
                      if (item.verified === false && item.message) {
                        missingTypes.push(item.message.toLowerCase());
                      }
                    }
                  }
                  if (missingTypes.length > 0) {
                    failedRules.push(`Missing: ${missingTypes.join(", ")}`);
                  }
                } else if (rule.message) {
                  failedRules.push(rule.message);
                }
              }
            }

            if (failedRules.length > 0) {
              return `Password requirements not met. ${failedRules.join(" ")}`;
            }

            return "Password does not meet requirements.";
          } catch {
            return "Password does not meet requirements.";
          }
        };

        // Helper to safely extract error message string from Auth0 response
        const getErrorMessage = (value: unknown): string => {
          if (typeof value === "string") {
            // Check if it's a JSON stringified password validation object
            if (value.trim().startsWith("{")) {
              try {
                const parsed = JSON.parse(value);
                if (parsed.rules && Array.isArray(parsed.rules)) {
                  return parsePasswordValidationRules(parsed);
                }
              } catch {
                // Not JSON, return as-is
              }
            }
            return value;
          }
          if (typeof value === "object" && value !== null) {
            // Check if it's a password validation rules object
            const obj = value as { rules?: unknown };
            if (obj.rules && Array.isArray(obj.rules)) {
              return parsePasswordValidationRules(obj);
            }
            // If it's an object, try to extract a meaningful message
            if ("message" in value && typeof value.message === "string") {
              return value.message;
            }
            if ("description" in value && typeof value.description === "string") {
              return value.description;
            }
          }
          return String(value || "");
        };

        const errorCode = typeof signupData.error === "string" ? signupData.error : "";
        let errorDescription = getErrorMessage(signupData.description);
        let rawError = getErrorMessage(signupData.error);

        // If error description is still a JSON string, parse it
        if (errorDescription.trim().startsWith("{")) {
          errorDescription = parsePasswordValidationRules(errorDescription);
        }
        if (rawError.trim().startsWith("{")) {
          rawError = parsePasswordValidationRules(rawError);
        }

        // Capture Auth0 errors in Sentry
        Sentry.captureException(new Error(`Auth0 signup failed: ${errorDescription || rawError}`), {
          tags: {
            api_route: "/api/auth/signup",
            auth0_error: errorCode,
          },
          extra: {
            email: email,
            status: signupResponse.status,
            error: signupData.error,
            description: signupData.description,
          },
        });

        // Provide helpful error messages for common Auth0 errors
        let errorMessage = errorDescription || rawError || "Failed to create account";
        
        // Handle specific Auth0 error codes
        if (errorCode === "invalid_signup" || errorCode === "unauthorized") {
          if (errorDescription?.includes("signup disabled")) {
            errorMessage = "Sign up is currently disabled. Please contact support.";
          } else if (errorDescription?.includes("already exists")) {
            errorMessage = "An account with this email already exists. Please sign in instead.";
          } else if (errorDescription && !errorDescription.includes("Password requirements")) {
            errorMessage = "Failed to create account. Please try again.";
          }
        } else if (errorCode === "invalid_password") {
          if (!errorMessage.includes("Password requirements")) {
            errorMessage = "Password does not meet requirements. Please use a stronger password.";
          }
        } else if (errorCode === "invalid_email") {
          errorMessage = "Invalid email address. Please check and try again.";
        }

        return jsonResponse(
          {
            error: "Sign up failed",
            message: errorMessage,
          },
          signupResponse.status === 409 ? 409 : 400
        );
      }

      // Signup successful - return success response
      // Note: Auth0 signup doesn't return tokens immediately
      // User needs to sign in after signup
      return jsonResponse({
        success: true,
        message: "Account created successfully! Please sign in.",
        email: signupData.email,
      }, 201);
    } catch (fetchError) {
      // Capture network errors in Sentry
      Sentry.captureException(fetchError, {
        tags: {
          api_route: "/api/auth/signup",
        },
        extra: {
          email: email,
        },
      });

      console.error("Auth0 signup fetch error:", fetchError);
      return jsonResponse(
        {
          error: "Sign up service error",
          message: "Failed to connect to authentication service. Please try again.",
        },
        500
      );
    }
  } catch (error) {
    // Capture parsing errors in Sentry
    Sentry.captureException(error, {
      tags: {
        api_route: "/api/auth/signup",
      },
    });

    console.error("Signup API error:", error);
    return jsonResponse(
      {
        error: "Invalid request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      400
    );
  }
}
