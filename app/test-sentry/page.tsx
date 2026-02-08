/**
 * Test Sentry Error Tracking Page
 *
 * This page helps you test if Sentry is working correctly
 * DO NOT use in production - remove this file after testing
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Sentry from "@sentry/nextjs";
import { getPostHog, trackEvent, identifyUser } from "@/lib/posthog";

export default function TestSentryPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [postHogStatus, setPostHogStatus] = useState<string>("");

  // Check PostHog status on mount
  useEffect(() => {
    const posthog = getPostHog();
    if (posthog) {
      // Check if PostHog is loaded (using has_opted_in_capturing or __loaded)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posthogAny = posthog as any;
      const isLoaded =
        posthogAny.__loaded || posthogAny.has_opted_in_capturing !== undefined;

      if (isLoaded) {
        setPostHogStatus("✅ PostHog is loaded and ready");
      } else {
        setPostHogStatus("⏳ PostHog is initializing...");
        // Check again after a delay
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const stillLoaded =
            posthogAny.__loaded ||
            posthogAny.has_opted_in_capturing !== undefined;
          if (stillLoaded) {
            setPostHogStatus("✅ PostHog is loaded and ready");
          } else {
            // Check for API errors in console
            setPostHogStatus(
              "❌ PostHog failed to load. Check console for 401 errors. Get Project API Key from Settings → Project Settings",
            );
          }
        }, 2000);
      }
    } else {
      setPostHogStatus("❌ PostHog not available (SSR)");
    }
  }, []);

  /**
   * Test 1: Capture a test exception
   */
  const testException = () => {
    try {
      throw new Error("This is a test error for Sentry!");
    } catch (error) {
      Sentry.captureException(error);
      setTestResult(
        "✅ Exception sent to Sentry! Check your Sentry dashboard.",
      );
    }
  };

  /**
   * Test 2: Capture a message
   */
  const testMessage = () => {
    Sentry.captureMessage("Test message from Recipe App", "info");
    setTestResult("✅ Message sent to Sentry! Check your Sentry dashboard.");
  };

  /**
   * Test 3: Trigger an unhandled error (will be caught by ErrorBoundary)
   */
  const testUnhandledError = () => {
    // This will trigger the ErrorBoundary
    throw new Error("Unhandled test error - should be caught by ErrorBoundary");
  };

  /**
   * Test 4: Test with user context
   */
  const testWithUserContext = () => {
    Sentry.setUser({
      id: "test-user-123",
      email: "test@example.com",
      username: "testuser",
    });
    Sentry.captureException(new Error("Test error with user context"));
    setTestResult("✅ Error with user context sent to Sentry!");
  };

  /**
   * Test 5: PostHog - Capture a test event
   */
  const testPostHogEvent = () => {
    try {
      trackEvent("test_event", {
        test_property: "test_value",
        page: "test-sentry",
        timestamp: new Date().toISOString(),
      });
      setTestResult(
        "✅ PostHog event sent! Check your PostHog dashboard (Events > Activity).",
      );
    } catch (error) {
      setTestResult(
        `❌ PostHog error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  /**
   * Test 6: PostHog - Identify user
   */
  const testPostHogIdentify = () => {
    try {
      identifyUser("test-user-123", {
        email: "test@example.com",
        name: "Test User",
      });
      trackEvent("user_identified", {
        source: "test-page",
      });
      setTestResult(
        "✅ PostHog user identified! Check your PostHog dashboard (Persons > test-user-123).",
      );
    } catch (error) {
      setTestResult(
        `❌ PostHog error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  /**
   * Test 7: Redis - Test connection and operations
   */
  const testRedis = async () => {
    try {
      setTestResult("⏳ Testing Redis connection...");
      const response = await fetch("/api/test/redis");
      const data = await response.json();

      if (data.success) {
        setTestResult(
          "✅ Redis is working! All operations successful. Check terminal for details.",
        );
        console.log("Redis Test Results:", data.results);
      } else {
        setTestResult(
          `❌ Redis test failed: ${data.message}. Check console for details.`,
        );
        console.error("Redis Test Error:", data);
      }
    } catch (error) {
      setTestResult(
        `❌ Redis test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-9xl mx-auto px-2 sm:px-4 md:px-6 xl:px-8 py-8">
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-2xl">
              Testing: Sentry, PostHog & Redis
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              Use these buttons to test Sentry and PostHog integration. Check
              your dashboards after each test.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Sentry Tests</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={testException} variant="default">
                  Test Exception
                </Button>
                <Button onClick={testMessage} variant="default">
                  Test Message
                </Button>
                <Button onClick={testWithUserContext} variant="default">
                  Test with User Context
                </Button>
                <Button onClick={testUnhandledError} variant="destructive">
                  Test Unhandled Error
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">PostHog Tests</h3>
              {postHogStatus && (
                <div
                  className="mb-3 p-2 text-sm rounded"
                  style={{
                    backgroundColor: postHogStatus.includes("✅")
                      ? "rgba(34, 197, 94, 0.1)"
                      : postHogStatus.includes("❌")
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(251, 191, 36, 0.1)",
                    border: `1px solid ${
                      postHogStatus.includes("✅")
                        ? "rgba(34, 197, 94, 0.3)"
                        : postHogStatus.includes("❌")
                          ? "rgba(239, 68, 68, 0.3)"
                          : "rgba(251, 191, 36, 0.3)"
                    }`,
                    color: postHogStatus.includes("✅")
                      ? "#4ade80"
                      : postHogStatus.includes("❌")
                        ? "#f87171"
                        : "#fbbf24",
                  }}
                >
                  {postHogStatus}
                  {postHogStatus.includes("401") && (
                    <div className="mt-2 text-xs">
                      <strong>Fix:</strong> Get your Project API Key from
                      PostHog → Settings → Project Settings (not Personal API
                      keys)
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={testPostHogEvent} variant="outline">
                  Test PostHog Event
                </Button>
                <Button onClick={testPostHogIdentify} variant="outline">
                  Test PostHog Identify
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Redis Tests</h3>
              <div className="grid grid-cols-1 gap-4">
                <Button onClick={testRedis} variant="secondary">
                  Test Redis Connection
                </Button>
              </div>
            </div>

            {testResult && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400">{testResult}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ <strong>Important:</strong> After testing, delete this file (
                <code>app/test-sentry/page.tsx</code>) to prevent accidental
                error triggers in production.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
