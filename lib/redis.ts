/**
 * Upstash Redis Client
 *
 * Centralized Redis client for caching and data storage
 * Following DEVELOPMENT_RULES.md: Centralized utilities, reusable functions
 */

import { Redis } from "@upstash/redis";

/**
 * Redis client instance
 * Uses environment variables for connection
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || "",
  token: process.env.UPSTASH_REDIS_TOKEN || "",
});

/**
 * Cache helper functions
 */

/**
 * Get cached value by key
 *
 * @param key - Cache key
 * @returns Cached value or null
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

/**
 * Set cached value with optional TTL
 *
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds (optional)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  try {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    console.error("Redis set error:", error);
  }
}

/**
 * Delete cached value by key
 *
 * @param key - Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete error:", error);
  }
}

/**
 * Delete multiple cached values by pattern
 *
 * @param pattern - Key pattern (e.g., "recipe:*")
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis delete pattern error:", error);
  }
}

/**
 * Check if key exists in cache
 *
 * @param key - Cache key
 * @returns True if key exists
 */
export async function existsCache(key: string): Promise<boolean> {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error("Redis exists error:", error);
    return false;
  }
}

/**
 * Get TTL (time to live) for a key
 *
 * @param key - Cache key
 * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
 */
export async function getTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error("Redis TTL error:", error);
    return -2;
  }
}

/**
 * Cache key generators for consistent naming
 */
export const cacheKeys = {
  recipe: (id: string | number) => `recipe:${id}`,
  recipeSearch: (term: string, page: number) => `recipe:search:${term}:${page}`,
  recipeSimilar: (id: string | number) => `recipe:similar:${id}`,
  recipeSummary: (id: string | number) => `recipe:summary:${id}`,
  favouriteRecipes: (userId: string) => `favourites:${userId}`,
  collections: (userId: string) => `collections:${userId}`,
  collection: (collectionId: string) => `collection:${collectionId}`,
  mealPlan: (userId: string, date: string) => `mealplan:${userId}:${date}`,
  shoppingList: (userId: string) => `shopping:${userId}`,
  blogPosts: (skip: number, limit: number) => `blog:posts:${skip}:${limit}`,
  blogPost: (slug: string) => `blog:post:${slug}`,
};
