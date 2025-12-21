/**
 * API Key Manager - Multiple API Key Fallback System
 *
 * Manages multiple Spoonacular API keys with automatic rotation and fallback
 * When one key reaches its limit, automatically switches to the next available key
 *
 * Following DEVELOPMENT_RULES.md: Centralized API key management
 */

/**
 * API Key configuration
 */
interface ApiKeyConfig {
  key: string;
  used: number;
  limit: number;
  lastUsed: number;
}

/**
 * Storage key for API key configurations
 */
const API_KEYS_STORAGE_KEY = "recipe_app_api_keys";
const CURRENT_KEY_INDEX_KEY = "recipe_app_current_key_index";

/**
 * Default API key limit (50 calls/day for free tier)
 */
const DEFAULT_LIMIT = 50;

/**
 * Get all API keys from environment and storage
 *
 * @returns Array of API key configurations
 */
function getAllApiKeys(): ApiKeyConfig[] {
  const keys: ApiKeyConfig[] = [];

  // Get primary API key from environment
  const primaryKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  if (primaryKey) {
    keys.push({
      key: primaryKey,
      used: 0,
      limit: DEFAULT_LIMIT,
      lastUsed: 0,
    });
  }

  // Get additional API keys from environment (NEXT_PUBLIC_SPOONACULAR_API_KEY_2, _3, etc.)
  let index = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const envKey = process.env[`NEXT_PUBLIC_SPOONACULAR_API_KEY_${index}`];
    if (!envKey) break;

    keys.push({
      key: envKey,
      used: 0,
      limit: DEFAULT_LIMIT,
      lastUsed: 0,
    });
    index++;
  }

  // Get stored API keys (from localStorage, set via UI or manually)
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (stored) {
      const storedKeys: ApiKeyConfig[] = JSON.parse(stored);
      storedKeys.forEach((storedKey) => {
        // Only add if not already in list (avoid duplicates)
        if (!keys.some((k) => k.key === storedKey.key)) {
          keys.push(storedKey);
        }
      });
    }
  } catch (error) {
    console.warn("Failed to load stored API keys:", error);
  }

  return keys;
}

/**
 * Save API key configurations to storage
 *
 * @param keys - Array of API key configurations
 */
function saveApiKeys(keys: ApiKeyConfig[]): void {
  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch (error) {
    console.warn("Failed to save API keys:", error);
  }
}

/**
 * Get current API key index
 *
 * @returns Current key index
 */
function getCurrentKeyIndex(): number {
  try {
    const stored = localStorage.getItem(CURRENT_KEY_INDEX_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Set current API key index
 *
 * @param index - Key index
 */
function setCurrentKeyIndex(index: number): void {
  try {
    localStorage.setItem(CURRENT_KEY_INDEX_KEY, String(index));
  } catch (error) {
    console.warn("Failed to save current key index:", error);
  }
}

/**
 * Get the next available API key
 *
 * @returns API key string or null if all keys are exhausted
 */
export function getNextApiKey(): string | null {
  const keys = getAllApiKeys();

  if (keys.length === 0) {
    console.warn("No API keys configured");
    return null;
  }

  let currentIndex = getCurrentKeyIndex();
  let attempts = 0;

  // Try to find an available key (not at limit)
  while (attempts < keys.length) {
    const keyConfig = keys[currentIndex];

    // Check if key is available (not at limit)
    if (keyConfig.used < keyConfig.limit) {
      return keyConfig.key;
    }

    // Try next key
    currentIndex = (currentIndex + 1) % keys.length;
    attempts++;
  }

  // All keys exhausted - reset usage and use first key
  console.warn("All API keys at limit - resetting usage counts");
  keys.forEach((key) => {
    key.used = 0;
  });
  saveApiKeys(keys);
  setCurrentKeyIndex(0);

  return keys[0]?.key || null;
}

/**
 * Mark API key as used (increment usage counter)
 *
 * @param apiKey - API key that was used
 */
export function markApiKeyUsed(apiKey: string): void {
  const keys = getAllApiKeys();
  const keyIndex = keys.findIndex((k) => k.key === apiKey);

  if (keyIndex === -1) {
    // Key not found - might be from environment, skip tracking
    return;
  }

  keys[keyIndex].used++;
  keys[keyIndex].lastUsed = Date.now();

  // If key reached limit, switch to next key
  if (keys[keyIndex].used >= keys[keyIndex].limit) {
    console.warn(`API key ${keyIndex + 1} reached limit - switching to next key`);
    const nextIndex = (keyIndex + 1) % keys.length;
    setCurrentKeyIndex(nextIndex);
  }

  saveApiKeys(keys);
}

/**
 * Handle API limit error (402 status) - switch to next key
 *
 * @param apiKey - API key that hit the limit
 */
export function handleApiLimitError(apiKey: string): void {
  const keys = getAllApiKeys();
  const keyIndex = keys.findIndex((k) => k.key === apiKey);

  if (keyIndex === -1) return;

  // Mark as at limit
  keys[keyIndex].used = keys[keyIndex].limit;
  keys[keyIndex].lastUsed = Date.now();

  // Switch to next key
  const nextIndex = (keyIndex + 1) % keys.length;
  setCurrentKeyIndex(nextIndex);

  saveApiKeys(keys);

  console.log(`Switched to API key ${nextIndex + 1} after limit reached`);
}

/**
 * Add a new API key manually
 *
 * @param apiKey - API key to add
 * @param limit - Daily limit (default: 50)
 */
export function addApiKey(apiKey: string, limit: number = DEFAULT_LIMIT): void {
  const keys = getAllApiKeys();

  // Check if key already exists
  if (keys.some((k) => k.key === apiKey)) {
    console.warn("API key already exists");
    return;
  }

  keys.push({
    key: apiKey,
    used: 0,
    limit,
    lastUsed: 0,
  });

  saveApiKeys(keys);
  console.log("API key added successfully");
}

/**
 * Get API key statistics
 *
 * @returns Array of key stats
 */
export function getApiKeyStats(): Array<{
  index: number;
  used: number;
  limit: number;
  remaining: number;
  isActive: boolean;
}> {
  const keys = getAllApiKeys();
  const currentIndex = getCurrentKeyIndex();

  return keys.map((key, index) => ({
    index: index + 1,
    used: key.used,
    limit: key.limit,
    remaining: Math.max(0, key.limit - key.used),
    isActive: index === currentIndex,
  }));
}

/**
 * Reset API key usage (for testing or new day)
 */
export function resetApiKeyUsage(): void {
  const keys = getAllApiKeys();
  keys.forEach((key) => {
    key.used = 0;
    key.lastUsed = 0;
  });
  saveApiKeys(keys);
  setCurrentKeyIndex(0);
  console.log("API key usage reset");
}

