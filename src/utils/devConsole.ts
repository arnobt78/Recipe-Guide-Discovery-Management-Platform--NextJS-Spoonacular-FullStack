/**
 * Development Console Utilities
 *
 * Exposes development utilities to browser console for easy testing
 * Usage: window.recipeDev.setCacheOnlyMode(true)
 *
 * Following DEVELOPMENT_RULES.md: Development utilities
 */

import { setCacheOnlyMode, isCacheOnlyMode, getDevSettings } from "./devMode";
import { setUseMockData, shouldUseMockData } from "./mockData";
import { getApiKeyStats, resetApiKeyUsage, addApiKey } from "./apiKeyManager";
import { clearPersistedCache } from "./queryCachePersistence";
import { clearSearchCaches } from "./cacheStorage";

/**
 * Development utilities exposed to window object
 * Only available in development mode
 */
export function setupDevConsole(): void {
  if (typeof window === "undefined") return;

  // Only expose in development
  if (process.env.NODE_ENV === "development") {
    (window as unknown as { recipeDev: unknown }).recipeDev = {
      // Cache-only mode
      setCacheOnlyMode,
      isCacheOnlyMode,
      
      // Mock data
      setUseMockData,
      shouldUseMockData,
      
      // API key management
      getApiKeyStats,
      resetApiKeyUsage,
      addApiKey,
      
      // Cache management
      clearPersistedCache,
      clearSearchCaches,
      
      // Get all settings
      getDevSettings,
      
      // Help
      help: () => {
        console.log(`
🔧 Recipe App Development Utilities

Cache Management:
  recipeDev.setCacheOnlyMode(true)  - Enable cache-only mode (no API calls)
  recipeDev.setCacheOnlyMode(false) - Disable cache-only mode
  recipeDev.isCacheOnlyMode()       - Check if cache-only mode is enabled
  recipeDev.clearPersistedCache()   - Clear React Query persisted cache
  recipeDev.clearSearchCaches()     - Clear search result caches

Mock Data:
  recipeDev.setUseMockData(true)    - Enable mock data mode
  recipeDev.setUseMockData(false)   - Disable mock data mode
  recipeDev.shouldUseMockData()    - Check if mock data is enabled

API Key Management:
  recipeDev.getApiKeyStats()        - Get API key usage statistics
  recipeDev.resetApiKeyUsage()      - Reset API key usage counters
  recipeDev.addApiKey("key", 50)   - Add a new API key manually

Settings:
  recipeDev.getDevSettings()        - Get all development settings
        `);
      },
    };

    console.log(
      "%c🔧 Recipe Dev Utilities Loaded",
      "color: #a855f7; font-weight: bold; font-size: 14px"
    );
    console.log("Type recipeDev.help() for available commands");
  }
}

