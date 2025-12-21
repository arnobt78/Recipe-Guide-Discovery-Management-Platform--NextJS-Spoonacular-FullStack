/**
 * Development Mode Utilities
 *
 * Provides development-only features:
 * - "Use cached data only" mode (prevents API calls)
 * - Development mode detection
 * - Mock data helpers
 *
 * Following DEVELOPMENT_RULES.md: Development utilities for testing
 */

/**
 * Check if app is in development mode
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if "cached data only" mode is enabled
 * This prevents API calls and only uses cached data
 *
 * Set via localStorage: recipe_app_cache_only_mode = "true"
 */
export function isCacheOnlyMode(): boolean {
  if (!isDevelopmentMode()) {
    return false; // Only available in development
  }

  try {
    return localStorage.getItem("recipe_app_cache_only_mode") === "true";
  } catch {
    return false;
  }
}

/**
 * Enable/disable cache-only mode
 *
 * @param enabled - Whether to enable cache-only mode
 */
export function setCacheOnlyMode(enabled: boolean): void {
  if (!isDevelopmentMode()) {
    console.warn("Cache-only mode is only available in development");
    return;
  }

  try {
    if (enabled) {
      localStorage.setItem("recipe_app_cache_only_mode", "true");
      console.log("🔒 Cache-only mode enabled - API calls will be blocked");
    } else {
      localStorage.removeItem("recipe_app_cache_only_mode");
      console.log("🔓 Cache-only mode disabled - API calls enabled");
    }
  } catch (error) {
    console.warn("Failed to set cache-only mode:", error);
  }
}

/**
 * Get development mode settings
 */
export function getDevSettings(): {
  isDev: boolean;
  cacheOnly: boolean;
} {
  return {
    isDev: isDevelopmentMode(),
    cacheOnly: isCacheOnlyMode(),
  };
}

