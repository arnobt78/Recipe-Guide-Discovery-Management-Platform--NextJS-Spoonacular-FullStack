/**
 * Redis Test API Route
 * 
 * Tests Redis connection and basic operations
 * DO NOT use in production - remove this file after testing
 */

import { NextRequest, NextResponse } from "next/server";
import { setCache, getCache, deleteCache, existsCache } from "../../../../lib/redis";

/**
 * GET /api/test/redis
 * 
 * Tests Redis connection and basic operations
 */
export async function GET(_request: NextRequest) {
  try {
    const testKey = "test:redis:connection";
    const testValue = {
      message: "Redis is working!",
      timestamp: new Date().toISOString(),
      random: Math.random(),
    };

    const results = {
      connection: "✅ Connected",
      set: "",
      get: "",
      exists: "",
      delete: "",
      error: null as string | null,
    };

    // Test 1: SET operation
    try {
      await setCache(testKey, testValue, 60); // 60 seconds TTL
      results.set = "✅ SET operation successful";
    } catch (error) {
      results.set = `❌ SET failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      results.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Test 2: GET operation
    try {
      const retrieved = await getCache<typeof testValue>(testKey);
      if (retrieved && retrieved.message === testValue.message) {
        results.get = "✅ GET operation successful - Value matches";
      } else {
        results.get = "❌ GET failed - Value mismatch or null";
      }
    } catch (error) {
      results.get = `❌ GET failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      results.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Test 3: EXISTS operation
    try {
      const exists = await existsCache(testKey);
      results.exists = exists ? "✅ EXISTS operation successful - Key exists" : "❌ EXISTS failed - Key not found";
    } catch (error) {
      results.exists = `❌ EXISTS failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      results.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Test 4: DELETE operation
    try {
      await deleteCache(testKey);
      const deleted = await existsCache(testKey);
      if (!deleted) {
        results.delete = "✅ DELETE operation successful - Key removed";
      } else {
        results.delete = "❌ DELETE failed - Key still exists";
      }
    } catch (error) {
      results.delete = `❌ DELETE failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      results.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Check if all tests passed
    const allPassed = 
      results.set.includes("✅") &&
      results.get.includes("✅") &&
      results.exists.includes("✅") &&
      results.delete.includes("✅");

    return NextResponse.json({
      success: allPassed,
      results,
      message: allPassed 
        ? "All Redis operations successful! ✅" 
        : "Some Redis operations failed. Check results above. ❌",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Redis test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
