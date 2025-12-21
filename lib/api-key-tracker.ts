/**
 * API Key Usage Tracker
 *
 * Tracks API key usage to proactively rotate before hitting limits
 * Prevents hitting 402 errors by switching keys before limit is reached
 *
 * Following DEVELOPMENT_RULES.md: Centralized utilities, optimized API usage
 */

/**
 * API Key usage tracking interface
 */
interface ApiKeyUsage {
  key: string;
  used: number;
  limit: number;
  lastUsed: number;
}

/**
 * Storage key for API key usage tracking
 * Note: In serverless environments, we use in-memory tracking
 * For persistent tracking, these would be used with a database
 */
// const USAGE_STORAGE_KEY = "recipe_app_api_key_usage";
// const CURRENT_KEY_INDEX_KEY = "recipe_app_current_key_index";

/**
 * Default API key limit (50 calls/day for free tier)
 */
const DEFAULT_LIMIT = 50;

/**
 * Get all API keys from environment
 */
function getAllApiKeys(): string[] {
  const keys: string[] = [];

  // Get primary API key
  const primaryKey = process.env.API_KEY;
  if (primaryKey) {
    keys.push(primaryKey.replace(/^["']|["']$/g, ""));
  }

  // Get fallback keys (API_KEY_2, API_KEY_3, etc.)
  let index = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const envKey = process.env[`API_KEY_${index}`];
    if (!envKey) break;
    keys.push(envKey.replace(/^["']|["']$/g, ""));
    index++;
  }

  return keys;
}

/**
 * Load usage tracking from memory (in serverless, this resets per invocation)
 * For persistent tracking, we'd need a database, but for now we track in-memory
 * and reset daily
 */
const usageCache: Map<string, ApiKeyUsage> = new Map();

/**
 * Initialize usage tracking for all keys
 */
function initializeUsageTracking(): void {
  const keys = getAllApiKeys();
  keys.forEach((key) => {
    if (!usageCache.has(key)) {
      usageCache.set(key, {
        key,
        used: 0,
        limit: DEFAULT_LIMIT,
        lastUsed: 0,
      });
    }
  });
}

// Note: getCurrentKeyIndex removed - we use getBestApiKey() instead

/**
 * Get the best available API key (one that hasn't hit its limit)
 *
 * @returns API key string or null if all keys are exhausted
 */
export function getBestApiKey(): string | null {
  initializeUsageTracking();
  const keys = getAllApiKeys();

  if (keys.length === 0) {
    return null;
  }

  // Find first key that hasn't reached its limit
  for (const key of keys) {
    const usage = usageCache.get(key);
    if (!usage || usage.used < usage.limit) {
      return key;
    }
  }

  // All keys exhausted - reset usage and use first key
  console.warn("⚠️ [API Key Tracker] All keys at limit - resetting usage");
  usageCache.forEach((usage) => {
    usage.used = 0;
  });
  return keys[0] || null;
}

/**
 * Mark API key as used (increment usage counter)
 *
 * @param apiKey - API key that was used
 */
export function markApiKeyUsed(apiKey: string): void {
  initializeUsageTracking();
  const usage = usageCache.get(apiKey);

  if (usage) {
    usage.used++;
    usage.lastUsed = Date.now();
    console.log(
      `📊 [API Key Tracker] Key usage: ${usage.used}/${usage.limit}`
    );
  }
}

/**
 * Handle API limit error (402 status) - mark key as exhausted
 *
 * @param apiKey - API key that hit the limit
 */
export function handleApiLimitError(apiKey: string): void {
  initializeUsageTracking();
  const usage = usageCache.get(apiKey);

  if (usage) {
    usage.used = usage.limit; // Mark as at limit
    usage.lastUsed = Date.now();
    console.warn(
      `⚠️ [API Key Tracker] Key reached limit: ${usage.used}/${usage.limit}`
    );
  }
}

/**
 * Get API key statistics (for debugging)
 *
 * @returns Array of key stats
 */
export function getApiKeyStats(): Array<{
  index: number;
  used: number;
  limit: number;
  remaining: number;
}> {
  initializeUsageTracking();
  const keys = getAllApiKeys();

  return keys.map((key, index) => {
    const usage = usageCache.get(key) || {
      key,
      used: 0,
      limit: DEFAULT_LIMIT,
      lastUsed: 0,
    };
    return {
      index: index + 1,
      used: usage.used,
      limit: usage.limit,
      remaining: Math.max(0, usage.limit - usage.used),
    };
  });
}

/**
 * Reset usage tracking (for testing or new day)
 */
export function resetApiKeyUsage(): void {
  usageCache.clear();
  initializeUsageTracking();
  console.log("🔄 [API Key Tracker] Usage reset");
}

