/// <reference types="node" />

/**
 * Recipe API Service
 *
 * Pure API functions for Spoonacular API integration.
 * These are pure functions that make API calls - no React Query logic here.
 */

// Load environment variables
import "dotenv/config";
import { config } from "dotenv";
import { existsSync } from "fs";
import {
  getBestApiKey,
  markApiKeyUsed,
  handleApiLimitError,
} from "./api-key-tracker.js";

// Explicitly load .env.local for Vercel dev
if (existsSync(".env.local")) {
  config({ path: ".env.local" });
}

/**
 * Get API key with fallback support
 * Supports multiple API keys: API_KEY, API_KEY_2, API_KEY_3, etc.
 * Automatically rotates when a key reaches its limit
 */
function getApiKey(): string | null {
  // Get primary API key
  let apiKey = process.env.API_KEY;
  if (apiKey) {
    apiKey = apiKey.replace(/^["']|["']$/g, "");
  }

  // If primary key exists, use it
  if (apiKey) {
    return apiKey;
  }

  // Try fallback keys (API_KEY_2, API_KEY_3, etc.)
  let index = 2;
  while (index <= 10) {
    const fallbackKey = process.env[`API_KEY_${index}`];
    if (fallbackKey) {
      const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
      if (cleanKey) {
        console.log(`Using fallback API key: API_KEY_${index}`);
        return cleanKey;
      }
    }
    index++;
  }

  console.error("❌ [Recipe API] No API_KEY found (checked API_KEY, API_KEY_2-10)!");
  return null;
}

// Get current API key
let apiKey = getApiKey();

/**
 * Search recipes using Spoonacular API
 * Supports all complexSearch parameters for advanced filtering
 * @param searchTerm - Search query string
 * @param page - Page number for pagination
 * @param options - Optional search filters and parameters
 * @returns Promise with search results
 * @throws Error if API key is not found
 */
export const searchRecipes = async (
  searchTerm: string,
  page: number,
  options?: {
    fillIngredients?: boolean; // Get usedIngredients, missedIngredients, unusedIngredients
    addRecipeInformation?: boolean; // Get more recipe info in search results
    addRecipeInstructions?: boolean; // Get analyzed instructions in search results
    addRecipeNutrition?: boolean; // Get nutrition info in search results
    cuisine?: string;
    excludeCuisine?: string;
    diet?: string;
    intolerances?: string;
    equipment?: string;
    includeIngredients?: string;
    excludeIngredients?: string;
    type?: string;
    instructionsRequired?: boolean;
    maxReadyTime?: number;
    minServings?: number;
    maxServings?: number;
    ignorePantry?: boolean;
    sort?: string;
    sortDirection?: "asc" | "desc";
    // Nutrition filters
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
    minCarbs?: number;
    maxCarbs?: number;
    minFat?: number;
    maxFat?: number;
    // Additional nutrition filters (comprehensive API support per SPOONACULAR_API_DOCS.md)
    minAlcohol?: number;
    maxAlcohol?: number;
    minCaffeine?: number;
    maxCaffeine?: number;
    minCopper?: number;
    maxCopper?: number;
    minCalcium?: number;
    maxCalcium?: number;
    minCholine?: number;
    maxCholine?: number;
    minCholesterol?: number;
    maxCholesterol?: number;
    minFluoride?: number;
    maxFluoride?: number;
    minSaturatedFat?: number;
    maxSaturatedFat?: number;
    minVitaminA?: number;
    maxVitaminA?: number;
    minVitaminC?: number;
    maxVitaminC?: number;
    minVitaminD?: number;
    maxVitaminD?: number;
    minVitaminE?: number;
    maxVitaminE?: number;
    minVitaminK?: number;
    maxVitaminK?: number;
    minVitaminB1?: number;
    maxVitaminB1?: number;
    minVitaminB2?: number;
    maxVitaminB2?: number;
    minVitaminB5?: number;
    maxVitaminB5?: number;
    minVitaminB3?: number;
    maxVitaminB3?: number;
    minVitaminB6?: number;
    maxVitaminB6?: number;
    minVitaminB12?: number;
    maxVitaminB12?: number;
    minFiber?: number;
    maxFiber?: number;
    minFolate?: number;
    maxFolate?: number;
    minFolicAcid?: number;
    maxFolicAcid?: number;
    minIodine?: number;
    maxIodine?: number;
    minIron?: number;
    maxIron?: number;
    minMagnesium?: number;
    maxMagnesium?: number;
    minManganese?: number;
    maxManganese?: number;
    minPhosphorus?: number;
    maxPhosphorus?: number;
    minPotassium?: number;
    maxPotassium?: number;
    minSelenium?: number;
    maxSelenium?: number;
    minSodium?: number;
    maxSodium?: number;
    minSugar?: number;
    maxSugar?: number;
    minZinc?: number;
    maxZinc?: number;
    // Additional search parameters
    author?: string;
    tags?: string;
    recipeBoxId?: number;
    titleMatch?: string;
  }
) => {
  // Get best available API key (one that hasn't hit limit)
  // Falls back to primary key if tracker not available
  const currentKey = getBestApiKey() || apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");

  // Fetch 24 recipes per page (6 rows of 4 cards on desktop, or 2-3 rows on mobile)
  // This reduces the number of "View More" clicks needed for better UX
  const recipesPerPage = 24;
  const queryParams: Record<string, string> = {
    apiKey: currentKey,
    query: searchTerm,
    number: recipesPerPage.toString(),
    offset: ((page - 1) * recipesPerPage).toString(), // page 1 = offset 0, page 2 = offset 24, etc.
  };

  // Add optional parameters if provided
  if (options) {
    if (options.fillIngredients !== undefined) {
      queryParams.fillIngredients = options.fillIngredients.toString();
    }
    if (options.addRecipeInformation !== undefined) {
      queryParams.addRecipeInformation = options.addRecipeInformation.toString();
    }
    if (options.addRecipeInstructions !== undefined) {
      queryParams.addRecipeInstructions = options.addRecipeInstructions.toString();
    }
    if (options.addRecipeNutrition !== undefined) {
      queryParams.addRecipeNutrition = options.addRecipeNutrition.toString();
    }
    if (options.cuisine) {
      queryParams.cuisine = options.cuisine;
    }
    if (options.excludeCuisine) {
      queryParams.excludeCuisine = options.excludeCuisine;
    }
    if (options.diet) {
      queryParams.diet = options.diet;
    }
    if (options.intolerances) {
      queryParams.intolerances = options.intolerances;
    }
    if (options.equipment) {
      queryParams.equipment = options.equipment;
    }
    if (options.includeIngredients) {
      queryParams.includeIngredients = options.includeIngredients;
    }
    if (options.excludeIngredients) {
      queryParams.excludeIngredients = options.excludeIngredients;
    }
    if (options.type) {
      queryParams.type = options.type;
    }
    if (options.instructionsRequired !== undefined) {
      queryParams.instructionsRequired = options.instructionsRequired.toString();
    }
    if (options.maxReadyTime !== undefined) {
      queryParams.maxReadyTime = options.maxReadyTime.toString();
    }
    if (options.minServings !== undefined) {
      queryParams.minServings = options.minServings.toString();
    }
    if (options.maxServings !== undefined) {
      queryParams.maxServings = options.maxServings.toString();
    }
    if (options.ignorePantry !== undefined) {
      queryParams.ignorePantry = options.ignorePantry.toString();
    }
    if (options.sort) {
      queryParams.sort = options.sort;
    }
    if (options.sortDirection) {
      queryParams.sortDirection = options.sortDirection;
    }
    // Nutrition filters (for advanced filtering)
    if (options.minCalories !== undefined) {
      queryParams.minCalories = options.minCalories.toString();
    }
    if (options.maxCalories !== undefined) {
      queryParams.maxCalories = options.maxCalories.toString();
    }
    if (options.minProtein !== undefined) {
      queryParams.minProtein = options.minProtein.toString();
    }
    if (options.maxProtein !== undefined) {
      queryParams.maxProtein = options.maxProtein.toString();
    }
    if (options.minCarbs !== undefined) {
      queryParams.minCarbs = options.minCarbs.toString();
    }
    if (options.maxCarbs !== undefined) {
      queryParams.maxCarbs = options.maxCarbs.toString();
    }
    if (options.minFat !== undefined) {
      queryParams.minFat = options.minFat.toString();
    }
    if (options.maxFat !== undefined) {
      queryParams.maxFat = options.maxFat.toString();
    }
    // Additional nutrition filters (comprehensive support per SPOONACULAR_API_DOCS.md)
    if (options.minAlcohol !== undefined) {
      queryParams.minAlcohol = options.minAlcohol.toString();
    }
    if (options.maxAlcohol !== undefined) {
      queryParams.maxAlcohol = options.maxAlcohol.toString();
    }
    if (options.minCaffeine !== undefined) {
      queryParams.minCaffeine = options.minCaffeine.toString();
    }
    if (options.maxCaffeine !== undefined) {
      queryParams.maxCaffeine = options.maxCaffeine.toString();
    }
    if (options.minCopper !== undefined) {
      queryParams.minCopper = options.minCopper.toString();
    }
    if (options.maxCopper !== undefined) {
      queryParams.maxCopper = options.maxCopper.toString();
    }
    if (options.minCalcium !== undefined) {
      queryParams.minCalcium = options.minCalcium.toString();
    }
    if (options.maxCalcium !== undefined) {
      queryParams.maxCalcium = options.maxCalcium.toString();
    }
    if (options.minCholine !== undefined) {
      queryParams.minCholine = options.minCholine.toString();
    }
    if (options.maxCholine !== undefined) {
      queryParams.maxCholine = options.maxCholine.toString();
    }
    if (options.minCholesterol !== undefined) {
      queryParams.minCholesterol = options.minCholesterol.toString();
    }
    if (options.maxCholesterol !== undefined) {
      queryParams.maxCholesterol = options.maxCholesterol.toString();
    }
    if (options.minFluoride !== undefined) {
      queryParams.minFluoride = options.minFluoride.toString();
    }
    if (options.maxFluoride !== undefined) {
      queryParams.maxFluoride = options.maxFluoride.toString();
    }
    if (options.minSaturatedFat !== undefined) {
      queryParams.minSaturatedFat = options.minSaturatedFat.toString();
    }
    if (options.maxSaturatedFat !== undefined) {
      queryParams.maxSaturatedFat = options.maxSaturatedFat.toString();
    }
    if (options.minVitaminA !== undefined) {
      queryParams.minVitaminA = options.minVitaminA.toString();
    }
    if (options.maxVitaminA !== undefined) {
      queryParams.maxVitaminA = options.maxVitaminA.toString();
    }
    if (options.minVitaminC !== undefined) {
      queryParams.minVitaminC = options.minVitaminC.toString();
    }
    if (options.maxVitaminC !== undefined) {
      queryParams.maxVitaminC = options.maxVitaminC.toString();
    }
    if (options.minVitaminD !== undefined) {
      queryParams.minVitaminD = options.minVitaminD.toString();
    }
    if (options.maxVitaminD !== undefined) {
      queryParams.maxVitaminD = options.maxVitaminD.toString();
    }
    if (options.minVitaminE !== undefined) {
      queryParams.minVitaminE = options.minVitaminE.toString();
    }
    if (options.maxVitaminE !== undefined) {
      queryParams.maxVitaminE = options.maxVitaminE.toString();
    }
    if (options.minVitaminK !== undefined) {
      queryParams.minVitaminK = options.minVitaminK.toString();
    }
    if (options.maxVitaminK !== undefined) {
      queryParams.maxVitaminK = options.maxVitaminK.toString();
    }
    if (options.minVitaminB1 !== undefined) {
      queryParams.minVitaminB1 = options.minVitaminB1.toString();
    }
    if (options.maxVitaminB1 !== undefined) {
      queryParams.maxVitaminB1 = options.maxVitaminB1.toString();
    }
    if (options.minVitaminB2 !== undefined) {
      queryParams.minVitaminB2 = options.minVitaminB2.toString();
    }
    if (options.maxVitaminB2 !== undefined) {
      queryParams.maxVitaminB2 = options.maxVitaminB2.toString();
    }
    if (options.minVitaminB5 !== undefined) {
      queryParams.minVitaminB5 = options.minVitaminB5.toString();
    }
    if (options.maxVitaminB5 !== undefined) {
      queryParams.maxVitaminB5 = options.maxVitaminB5.toString();
    }
    if (options.minVitaminB3 !== undefined) {
      queryParams.minVitaminB3 = options.minVitaminB3.toString();
    }
    if (options.maxVitaminB3 !== undefined) {
      queryParams.maxVitaminB3 = options.maxVitaminB3.toString();
    }
    if (options.minVitaminB6 !== undefined) {
      queryParams.minVitaminB6 = options.minVitaminB6.toString();
    }
    if (options.maxVitaminB6 !== undefined) {
      queryParams.maxVitaminB6 = options.maxVitaminB6.toString();
    }
    if (options.minVitaminB12 !== undefined) {
      queryParams.minVitaminB12 = options.minVitaminB12.toString();
    }
    if (options.maxVitaminB12 !== undefined) {
      queryParams.maxVitaminB12 = options.maxVitaminB12.toString();
    }
    if (options.minFiber !== undefined) {
      queryParams.minFiber = options.minFiber.toString();
    }
    if (options.maxFiber !== undefined) {
      queryParams.maxFiber = options.maxFiber.toString();
    }
    if (options.minFolate !== undefined) {
      queryParams.minFolate = options.minFolate.toString();
    }
    if (options.maxFolate !== undefined) {
      queryParams.maxFolate = options.maxFolate.toString();
    }
    if (options.minFolicAcid !== undefined) {
      queryParams.minFolicAcid = options.minFolicAcid.toString();
    }
    if (options.maxFolicAcid !== undefined) {
      queryParams.maxFolicAcid = options.maxFolicAcid.toString();
    }
    if (options.minIodine !== undefined) {
      queryParams.minIodine = options.minIodine.toString();
    }
    if (options.maxIodine !== undefined) {
      queryParams.maxIodine = options.maxIodine.toString();
    }
    if (options.minIron !== undefined) {
      queryParams.minIron = options.minIron.toString();
    }
    if (options.maxIron !== undefined) {
      queryParams.maxIron = options.maxIron.toString();
    }
    if (options.minMagnesium !== undefined) {
      queryParams.minMagnesium = options.minMagnesium.toString();
    }
    if (options.maxMagnesium !== undefined) {
      queryParams.maxMagnesium = options.maxMagnesium.toString();
    }
    if (options.minManganese !== undefined) {
      queryParams.minManganese = options.minManganese.toString();
    }
    if (options.maxManganese !== undefined) {
      queryParams.maxManganese = options.maxManganese.toString();
    }
    if (options.minPhosphorus !== undefined) {
      queryParams.minPhosphorus = options.minPhosphorus.toString();
    }
    if (options.maxPhosphorus !== undefined) {
      queryParams.maxPhosphorus = options.maxPhosphorus.toString();
    }
    if (options.minPotassium !== undefined) {
      queryParams.minPotassium = options.minPotassium.toString();
    }
    if (options.maxPotassium !== undefined) {
      queryParams.maxPotassium = options.maxPotassium.toString();
    }
    if (options.minSelenium !== undefined) {
      queryParams.minSelenium = options.minSelenium.toString();
    }
    if (options.maxSelenium !== undefined) {
      queryParams.maxSelenium = options.maxSelenium.toString();
    }
    if (options.minSodium !== undefined) {
      queryParams.minSodium = options.minSodium.toString();
    }
    if (options.maxSodium !== undefined) {
      queryParams.maxSodium = options.maxSodium.toString();
    }
    if (options.minSugar !== undefined) {
      queryParams.minSugar = options.minSugar.toString();
    }
    if (options.maxSugar !== undefined) {
      queryParams.maxSugar = options.maxSugar.toString();
    }
    if (options.minZinc !== undefined) {
      queryParams.minZinc = options.minZinc.toString();
    }
    if (options.maxZinc !== undefined) {
      queryParams.maxZinc = options.maxZinc.toString();
    }
    // Additional search parameters
    if (options.author) {
      queryParams.author = options.author;
    }
    if (options.tags) {
      queryParams.tags = options.tags;
    }
    if (options.recipeBoxId !== undefined) {
      queryParams.recipeBoxId = options.recipeBoxId.toString();
    }
    if (options.titleMatch) {
      queryParams.titleMatch = options.titleMatch;
    }
  }

  url.search = new URLSearchParams(queryParams).toString();

  try {
    const searchResponse = await fetch(url);
    const resultsJson = await searchResponse.json();

    // Check if API limit reached (402 status)
    if (searchResponse.status === 402 || resultsJson.code === 402) {
      // Mark current key as exhausted
      handleApiLimitError(currentKey);
      console.warn("⚠️ [Recipe API] API limit reached, trying fallback key...");
      
      // Try fallback keys in sequence
      let fallbackIndex = 2;
      while (fallbackIndex <= 10) {
        const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
        if (fallbackKey) {
          const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
          if (cleanKey && cleanKey !== currentKey) {
            console.log(`🔄 [Recipe API] Switching to API_KEY_${fallbackIndex}`);
            
            // Retry with fallback key
            const fallbackUrl = new URL("https://api.spoonacular.com/recipes/complexSearch");
            fallbackUrl.search = new URLSearchParams({
              ...queryParams,
              apiKey: cleanKey,
            }).toString();
            
            const fallbackResponse = await fetch(fallbackUrl);
            const fallbackJson = await fallbackResponse.json();
            
            if (fallbackResponse.ok && fallbackJson.code !== 402) {
              // Success with fallback key - mark as used and return
              markApiKeyUsed(cleanKey);
              apiKey = cleanKey;
              process.env.API_KEY = cleanKey;
              return fallbackJson;
            } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
              // This fallback key also hit limit
              handleApiLimitError(cleanKey);
            }
          }
        }
        fallbackIndex++;
      }
      
      // All keys exhausted
      throw new Error("All API keys have reached their daily limit");
    }

    // Success - mark key as used
    markApiKeyUsed(currentKey);
    return resultsJson;
  } catch (error) {
    console.error("❌ [Recipe API] Search error:", error);
    throw error;
  }
};

/**
 * Get recipe summary by ID
 * @param recipeId - Recipe ID string
 * @returns Promise with recipe summary
 * @throws Error if API key is not found
 */
export const getRecipeSummary = async (recipeId: string) => {
  const currentKey = apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  const url = new URL(
    `https://api.spoonacular.com/recipes/${recipeId}/summary`
  );
  const params = {
    apiKey: currentKey,
  };
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const json = await response.json();

  // Handle API limit error
  if (response.status === 402 || json.code === 402) {
    handleApiLimitError(currentKey);
    // Try fallback keys (same logic as searchRecipes)
    let fallbackIndex = 2;
    while (fallbackIndex <= 10) {
      const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
      if (fallbackKey) {
        const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
        if (cleanKey && cleanKey !== currentKey) {
          const fallbackUrl = new URL(
            `https://api.spoonacular.com/recipes/${recipeId}/summary`
          );
          fallbackUrl.search = new URLSearchParams({ apiKey: cleanKey }).toString();
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackJson.code !== 402) {
            markApiKeyUsed(cleanKey);
            apiKey = cleanKey;
            process.env.API_KEY = cleanKey;
            return fallbackJson;
          } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
            handleApiLimitError(cleanKey);
          }
        }
      }
      fallbackIndex++;
    }
    
    throw new Error("All API keys have reached their daily limit");
  }

  markApiKeyUsed(currentKey);
  return json;
};

/**
 * Get full recipe information by ID
 * Returns complete recipe data including sourceUrl, ingredients, nutrition, etc.
 * @param recipeId - Recipe ID string
 * @param options - Optional parameters for additional data
 * @returns Promise with full recipe information
 * @throws Error if API key is not found
 */
export const getRecipeInformation = async (
  recipeId: string,
  options?: {
    includeNutrition?: boolean; // Include nutrition data (default: false)
    addWinePairing?: boolean; // Add wine pairing recommendations (default: false)
    addTasteData?: boolean; // Add taste data (default: false)
  }
) => {
  const currentKey = getBestApiKey() || apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  const url = new URL(
    `https://api.spoonacular.com/recipes/${recipeId}/information`
  );
  const params: Record<string, string> = {
    apiKey: currentKey,
  };
  
  if (options?.includeNutrition) {
    params.includeNutrition = "true";
  }
  if (options?.addWinePairing) {
    params.addWinePairing = "true";
  }
  if (options?.addTasteData) {
    params.addTasteData = "true";
  }
  
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const json = await response.json();

  // Handle API limit error
  if (response.status === 402 || json.code === 402) {
    handleApiLimitError(currentKey);
    // Try fallback keys
    let fallbackIndex = 2;
    while (fallbackIndex <= 10) {
      const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
      if (fallbackKey) {
        const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
        if (cleanKey && cleanKey !== currentKey) {
          const fallbackUrl = new URL(
            `https://api.spoonacular.com/recipes/${recipeId}/information`
          );
          const fallbackParams: Record<string, string> = {
            apiKey: cleanKey,
          };
          if (options?.includeNutrition) {
            fallbackParams.includeNutrition = "true";
          }
          if (options?.addWinePairing) {
            fallbackParams.addWinePairing = "true";
          }
          if (options?.addTasteData) {
            fallbackParams.addTasteData = "true";
          }
          fallbackUrl.search = new URLSearchParams(fallbackParams).toString();
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackJson.code !== 402) {
            markApiKeyUsed(cleanKey);
            apiKey = cleanKey;
            process.env.API_KEY = cleanKey;
            return fallbackJson;
          } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
            handleApiLimitError(cleanKey);
          }
        }
      }
      fallbackIndex++;
    }
    
    throw new Error("All API keys have reached their daily limit");
  }

  markApiKeyUsed(currentKey);
  return json;
};

/**
 * Get similar recipes by recipe ID
 * @param recipeId - Recipe ID string
 * @param number - Number of similar recipes to return (1-100, default: 10)
 * @returns Promise with similar recipes array
 * @throws Error if API key is not found
 */
export const getSimilarRecipes = async (
  recipeId: string,
  number: number = 10
) => {
  const currentKey = getBestApiKey() || apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  // Validate number parameter
  const validNumber = Math.max(1, Math.min(100, number));

  const url = new URL(
    `https://api.spoonacular.com/recipes/${recipeId}/similar`
  );
  const params = {
    apiKey: currentKey,
    number: validNumber.toString(),
  };
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const json = await response.json();

  // Handle API limit error
  if (response.status === 402 || json.code === 402) {
    handleApiLimitError(currentKey);
    // Try fallback keys
    let fallbackIndex = 2;
    while (fallbackIndex <= 10) {
      const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
      if (fallbackKey) {
        const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
        if (cleanKey && cleanKey !== currentKey) {
          const fallbackUrl = new URL(
            `https://api.spoonacular.com/recipes/${recipeId}/similar`
          );
          fallbackUrl.search = new URLSearchParams({
            apiKey: cleanKey,
            number: validNumber.toString(),
          }).toString();
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackJson.code !== 402) {
            markApiKeyUsed(cleanKey);
            apiKey = cleanKey;
            process.env.API_KEY = cleanKey;
            return fallbackJson;
          } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
            handleApiLimitError(cleanKey);
          }
        }
      }
      fallbackIndex++;
    }
    
    throw new Error("All API keys have reached their daily limit");
  }

  markApiKeyUsed(currentKey);
  return json;
};

/**
 * Autocomplete recipe search
 * Suggests possible recipe names based on partial input
 * @param query - Partial search query string
 * @param number - Number of results to return (1-25, default: 10)
 * @returns Promise with autocomplete recipes array
 * @throws Error if API key is not found
 */
export const autocompleteRecipes = async (
  query: string,
  number: number = 10
) => {
  const currentKey = getBestApiKey() || apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  if (!query || query.trim().length < 2) {
    return [];
  }

  // Validate number parameter
  const validNumber = Math.max(1, Math.min(25, number));

  const url = new URL("https://api.spoonacular.com/recipes/autocomplete");
  const params = {
    apiKey: currentKey,
    query: query.trim(),
    number: validNumber.toString(),
  };
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const json = await response.json();

  // Handle API limit error
  if (response.status === 402 || json.code === 402) {
    handleApiLimitError(currentKey);
    // Try fallback keys
    let fallbackIndex = 2;
    while (fallbackIndex <= 10) {
      const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
      if (fallbackKey) {
        const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
        if (cleanKey && cleanKey !== currentKey) {
          const fallbackUrl = new URL("https://api.spoonacular.com/recipes/autocomplete");
          fallbackUrl.search = new URLSearchParams({
            apiKey: cleanKey,
            query: query.trim(),
            number: validNumber.toString(),
          }).toString();
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackJson.code !== 402) {
            markApiKeyUsed(cleanKey);
            apiKey = cleanKey;
            process.env.API_KEY = cleanKey;
            return fallbackJson;
          } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
            handleApiLimitError(cleanKey);
          }
        }
      }
      fallbackIndex++;
    }
    
    throw new Error("All API keys have reached their daily limit");
  }

  markApiKeyUsed(currentKey);
  return json;
};

/**
 * Get dish pairing for wine
 * Finds dishes that go well with a given wine type
 * @param wine - Wine type (e.g., "merlot", "riesling", "malbec")
 * @returns Promise with dish pairing information
 * @throws Error if API key is not found
 */
export const getDishPairingForWine = async (wine: string) => {
  const currentKey = getBestApiKey() || apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  if (!wine || wine.trim().length === 0) {
    throw new Error("Wine type is required");
  }

  const url = new URL("https://api.spoonacular.com/food/wine/dishes");
  const params = {
    apiKey: currentKey,
    wine: wine.trim(),
  };
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const json = await response.json();

  // Handle API limit error
  if (response.status === 402 || json.code === 402) {
    handleApiLimitError(currentKey);
    // Try fallback keys
    let fallbackIndex = 2;
    while (fallbackIndex <= 10) {
      const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
      if (fallbackKey) {
        const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
        if (cleanKey && cleanKey !== currentKey) {
          const fallbackUrl = new URL("https://api.spoonacular.com/food/wine/dishes");
          fallbackUrl.search = new URLSearchParams({
            apiKey: cleanKey,
            wine: wine.trim(),
          }).toString();
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackJson.code !== 402) {
            markApiKeyUsed(cleanKey);
            apiKey = cleanKey;
            process.env.API_KEY = cleanKey;
            return fallbackJson;
          } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
            handleApiLimitError(cleanKey);
          }
        }
      }
      fallbackIndex++;
    }
    
    throw new Error("All API keys have reached their daily limit");
  }

  markApiKeyUsed(currentKey);
  return json;
};

/**
 * Get wine pairing for food
 * Finds wines that go well with a given food (dish, ingredient, or cuisine)
 * @param food - Food name (e.g., "steak", "salmon", "italian")
 * @param maxPrice - Optional maximum price for wine recommendation in USD
 * @returns Promise with wine pairing information
 * @throws Error if API key is not found
 */
export const getWinePairing = async (food: string, maxPrice?: number) => {
  const currentKey = getBestApiKey() || apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  if (!food || food.trim().length === 0) {
    throw new Error("Food name is required");
  }

  const url = new URL("https://api.spoonacular.com/food/wine/pairing");
  const params: Record<string, string> = {
    apiKey: currentKey,
    food: food.trim(),
  };
  
  if (maxPrice !== undefined) {
    params.maxPrice = maxPrice.toString();
  }
  
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const json = await response.json();

  // Handle API limit error
  if (response.status === 402 || json.code === 402) {
    handleApiLimitError(currentKey);
    // Try fallback keys
    let fallbackIndex = 2;
    while (fallbackIndex <= 10) {
      const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
      if (fallbackKey) {
        const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
        if (cleanKey && cleanKey !== currentKey) {
          const fallbackUrl = new URL("https://api.spoonacular.com/food/wine/pairing");
          const fallbackParams: Record<string, string> = {
            apiKey: cleanKey,
            food: food.trim(),
          };
          if (maxPrice !== undefined) {
            fallbackParams.maxPrice = maxPrice.toString();
          }
          fallbackUrl.search = new URLSearchParams(fallbackParams).toString();
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackJson.code !== 402) {
            markApiKeyUsed(cleanKey);
            apiKey = cleanKey;
            process.env.API_KEY = cleanKey;
            return fallbackJson;
          } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
            handleApiLimitError(cleanKey);
          }
        }
      }
      fallbackIndex++;
    }
    
    throw new Error("All API keys have reached their daily limit");
  }

  markApiKeyUsed(currentKey);
  return json;
};

/**
 * Get favorite recipes by IDs
 * @param ids - Array of recipe IDs as strings
 * @returns Promise with favorite recipes data
 * @throws Error if API key is not found
 */
export const getFavouriteRecipesByIDs = async (ids: string[]) => {
  const currentKey = getBestApiKey() || apiKey || getApiKey();
  if (!currentKey) {
    throw new Error("API Key not found");
  }

  const url = new URL("https://api.spoonacular.com/recipes/informationBulk");
  const params = {
    apiKey: currentKey,
    ids: ids.join(","),
  };
  url.search = new URLSearchParams(params).toString();

  const searchResponse = await fetch(url);
  const json = await searchResponse.json();

  // Check if API returned an error (e.g., daily limit reached)
  if (!searchResponse.ok || json.status === "failure" || json.code === 402) {
    handleApiLimitError(currentKey);
    // Try fallback keys
    let fallbackIndex = 2;
    while (fallbackIndex <= 10) {
      const fallbackKey = process.env[`API_KEY_${fallbackIndex}`];
      if (fallbackKey) {
        const cleanKey = fallbackKey.replace(/^["']|["']$/g, "");
        if (cleanKey && cleanKey !== currentKey) {
          const fallbackUrl = new URL("https://api.spoonacular.com/recipes/informationBulk");
          fallbackUrl.search = new URLSearchParams({
            apiKey: cleanKey,
            ids: ids.join(","),
          }).toString();
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackJson.code !== 402) {
            markApiKeyUsed(cleanKey);
            apiKey = cleanKey;
            process.env.API_KEY = cleanKey;
            return { results: fallbackJson };
          } else if (fallbackResponse.status === 402 || fallbackJson.code === 402) {
            handleApiLimitError(cleanKey);
          }
        }
      }
      fallbackIndex++;
    }
    
    // All keys exhausted
    const errorMessage = json.message || "All API keys have reached their daily limit";
    const error = new Error(errorMessage) as Error & {
      code?: number;
      status?: string;
    };
    error.code = json.code || 402;
    error.status = json.status || "failure";
    throw error;
  }

  markApiKeyUsed(currentKey);
  return { results: json };
};
