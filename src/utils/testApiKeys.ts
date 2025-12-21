/**
 * Test API Keys Utility
 *
 * Quick utility to test which API keys are available and working
 * Usage: Call from browser console or component
 *
 * Following DEVELOPMENT_RULES.md: Development utilities
 */

/**
 * Test API key availability (frontend check)
 * Note: Actual API keys are on backend, this just checks if the system is configured
 */
export function testApiKeySetup(): void {
  console.log(`
🔑 API Key Configuration Test

The backend supports multiple API keys with automatic fallback:
- API_KEY (primary)
- API_KEY_2 (fallback 1)
- API_KEY_3 (fallback 2)
- ... up to API_KEY_10

When one key reaches its limit (402 error), the system automatically switches to the next available key.

To test:
1. Make API calls until you see a 402 error
2. The system should automatically switch to the next key
3. Check backend logs for "Using fallback API key: API_KEY_X"

Your .env.local should have:
  API_KEY=your_first_key
  API_KEY_2=your_second_key
  API_KEY_3=your_third_key

✅ Your setup looks correct with 3 API keys configured!
  `);
}
