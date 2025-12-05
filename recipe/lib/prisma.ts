/// <reference types="node" />

/**
 * Prisma Client Singleton for Serverless
 *
 * This ensures we reuse the same Prisma client instance across
 * all serverless function invocations, preventing connection pool exhaustion.
 *
 * For serverless environments (Vercel), we need to:
 * 1. Reuse the same PrismaClient instance
 * 2. Use connection pooling (via NeonDB pooler in DATABASE_URL)
 * 3. Handle edge cases properly
 */

// Load environment variables
// Vercel dev automatically loads .env and .env.local files
// Import dotenv as fallback to ensure env vars are loaded
import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "fs";

// Load .env.local file (Vercel dev prioritizes this for local development)
const envLocalExists = existsSync(".env.local");
if (envLocalExists) {
  try {
    config({ path: ".env.local" });
  } catch (error) {
    console.error("❌ [Prisma] Error loading .env.local:", error);
  }
}

// Strip quotes from DATABASE_URL if present and ensure it's set
let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  databaseUrl = databaseUrl.replace(/^["']|["']$/g, "");
  process.env.DATABASE_URL = databaseUrl;
}

if (!databaseUrl) {
  console.error("❌ [Prisma] DATABASE_URL is NOT set!");
}

// Global variable to store PrismaClient instance
// In serverless, this persists across function invocations
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton instance
 * Reuses existing instance if available, otherwise creates new one
 *
 * Note: Prisma reads DATABASE_URL from process.env automatically via schema.prisma
 * We don't need to pass datasources - just ensure DATABASE_URL is in process.env
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, store in global to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
