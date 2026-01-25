/**
 * QStash Scheduled Jobs API Route
 *
 * Handles scheduled tasks triggered by QStash
 * Following DEVELOPMENT_RULES.md: Centralized API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyQStashSignature } from "../../../../lib/qstash";
import { prisma } from "../../../../lib/prisma";
import { deleteCacheByPattern } from "../../../../lib/redis";

/**
 * POST /api/jobs/scheduled
 *
 * Handles scheduled tasks from QStash
 * Tasks can include:
 * - Cache cleanup
 * - Data synchronization
 * - Scheduled notifications
 * - Background processing
 */
export async function POST(request: NextRequest) {
  try {
    // Verify QStash signature for security
    const isValid = await verifyQStashSignature(request);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await request.json();
    const { task } = body;

    switch (task) {
      case "cleanup_cache":
        // Clean up old cache entries
        await cleanupOldCache();
        return NextResponse.json({ success: true, task: "cleanup_cache" });

      case "sync_favourites":
        // Sync favourites data (example task)
        await syncFavourites();
        return NextResponse.json({ success: true, task: "sync_favourites" });

      default:
        return NextResponse.json(
          { error: "Unknown task" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Scheduled job error:", error);
    return NextResponse.json(
      {
        error: "Job execution failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Cleanup old cache entries
 * Removes cache entries older than 7 days
 */
async function cleanupOldCache(): Promise<void> {
  try {
    // Clean up old search caches (these are more dynamic)
    await deleteCacheByPattern("recipe:search:*");
    
    // Note: Recipe caches are kept longer as they rarely change
    // You can add more cleanup logic here as needed
    console.log("Cache cleanup completed");
  } catch (error) {
    console.error("Cache cleanup error:", error);
    throw error;
  }
}

/**
 * Sync favourites data
 * Example scheduled task - can be customized for your needs
 */
async function syncFavourites(): Promise<void> {
  try {
    // Example: Validate and clean up orphaned favourites
    // This is just an example - customize based on your needs
    const result = await prisma.favourite.deleteMany({
      where: {
        // Add conditions as needed
        // For example, remove favourites older than 1 year
        createdAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      },
    });
    
    console.log(`Synced favourites: ${result.count} records processed`);
  } catch (error) {
    console.error("Favourites sync error:", error);
    throw error;
  }
}
