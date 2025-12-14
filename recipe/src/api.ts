import {
  Recipe,
  SearchRecipesResponse,
  FavouriteRecipesResponse,
  RecipeSummary,
  RecipeInformation,
  SimilarRecipe,
  AutocompleteRecipe,
  DishPairingForWine,
  WinePairing,
  RecipeCollection,
  CollectionItem,
  RecipeNote,
  MealPlan,
  MealPlanItem,
  ShoppingList,
  ShoppingListItem,
  RecipeImage,
} from "./types";

// Use relative paths for API calls - works with Vercel serverless functions
// In local dev: Vercel CLI serves both frontend and API on same origin (any port)
// In production: Both frontend and API are on same Vercel deployment
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get the full API URL for a given path
 * 
 * - If VITE_API_URL is set: Use it (for production or custom backend)
 * - If VITE_API_URL is empty: Use relative paths with current origin (dynamic port support)
 * 
 * This ensures:
 * - Localhost works on any port (3000, 5173, etc.) automatically
 * - Production works with Vercel deployment URL
 * - Can override with custom API URL if needed
 */
function getApiUrl(path: string): string {
  if (API_URL) {
    // If API_URL is set, use it (production or custom backend)
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  }
  
  // Use relative path - fetch() will use current origin (window.location.origin)
  // This automatically works with any port on localhost
  return path;
}

/**
 * Extract error message from API response
 * 
 * Tries to get error message from response body (JSON),
 * falls back to status text or default message
 * 
 * @param response - Fetch Response object
 * @param defaultMessage - Default error message if extraction fails
 * @returns Error message string
 */
async function extractErrorMessage(
  response: Response,
  defaultMessage: string = "An error occurred"
): Promise<string> {
  try {
    const errorData = await response.json();
    // Try common error message fields
    return (
      errorData.message ||
      errorData.error ||
      errorData.detail ||
      errorData.title ||
      defaultMessage
    );
  } catch {
    // If response is not JSON, use status text or default
    return response.statusText || defaultMessage;
  }
}

/**
 * Search recipes by term and page
 * Supports advanced filtering via optional parameters
 * 
 * @param searchTerm - Search query string
 * @param page - Page number for pagination
 * @param options - Optional search filters and parameters
 * @returns Promise with search results
 * @throws Error if request fails
 */
export const searchRecipes = async (
  searchTerm: string,
  page: number,
  options?: {
    fillIngredients?: boolean;
    addRecipeInformation?: boolean;
    addRecipeInstructions?: boolean;
    addRecipeNutrition?: boolean;
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
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
    minCarbs?: number;
    maxCarbs?: number;
    minFat?: number;
    maxFat?: number;
    // Additional nutrition filters (comprehensive API support)
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
): Promise<SearchRecipesResponse> => {
  const apiPath = getApiUrl("/api/recipes/search");
  
  // Build URL with query params
  // If API_URL is set, apiPath is already full URL; otherwise it's relative
  const url = API_URL 
    ? new URL(apiPath) 
    : new URL(apiPath, window.location.origin);
  
  url.searchParams.append("searchTerm", searchTerm);
  url.searchParams.append("page", String(page));

  // Add optional parameters (comprehensive support for all API parameters)
  if (options) {
    if (options.fillIngredients !== undefined) {
      url.searchParams.append("fillIngredients", String(options.fillIngredients));
    }
    if (options.addRecipeInformation !== undefined) {
      url.searchParams.append("addRecipeInformation", String(options.addRecipeInformation));
    }
    if (options.addRecipeInstructions !== undefined) {
      url.searchParams.append("addRecipeInstructions", String(options.addRecipeInstructions));
    }
    if (options.addRecipeNutrition !== undefined) {
      url.searchParams.append("addRecipeNutrition", String(options.addRecipeNutrition));
    }
    if (options.cuisine) {
      url.searchParams.append("cuisine", options.cuisine);
    }
    if (options.excludeCuisine) {
      url.searchParams.append("excludeCuisine", options.excludeCuisine);
    }
    if (options.diet) {
      url.searchParams.append("diet", options.diet);
    }
    if (options.intolerances) {
      url.searchParams.append("intolerances", options.intolerances);
    }
    if (options.equipment) {
      url.searchParams.append("equipment", options.equipment);
    }
    if (options.includeIngredients) {
      url.searchParams.append("includeIngredients", options.includeIngredients);
    }
    if (options.excludeIngredients) {
      url.searchParams.append("excludeIngredients", options.excludeIngredients);
    }
    if (options.type) {
      url.searchParams.append("type", options.type);
    }
    if (options.instructionsRequired !== undefined) {
      url.searchParams.append("instructionsRequired", String(options.instructionsRequired));
    }
    if (options.maxReadyTime !== undefined) {
      url.searchParams.append("maxReadyTime", String(options.maxReadyTime));
    }
    if (options.minServings !== undefined) {
      url.searchParams.append("minServings", String(options.minServings));
    }
    if (options.maxServings !== undefined) {
      url.searchParams.append("maxServings", String(options.maxServings));
    }
    if (options.ignorePantry !== undefined) {
      url.searchParams.append("ignorePantry", String(options.ignorePantry));
    }
    if (options.sort) {
      url.searchParams.append("sort", options.sort);
    }
    if (options.sortDirection) {
      url.searchParams.append("sortDirection", options.sortDirection);
    }
    // Nutrition filters
    if (options.minCalories !== undefined) {
      url.searchParams.append("minCalories", String(options.minCalories));
    }
    if (options.maxCalories !== undefined) {
      url.searchParams.append("maxCalories", String(options.maxCalories));
    }
    if (options.minProtein !== undefined) {
      url.searchParams.append("minProtein", String(options.minProtein));
    }
    if (options.maxProtein !== undefined) {
      url.searchParams.append("maxProtein", String(options.maxProtein));
    }
    if (options.minCarbs !== undefined) {
      url.searchParams.append("minCarbs", String(options.minCarbs));
    }
    if (options.maxCarbs !== undefined) {
      url.searchParams.append("maxCarbs", String(options.maxCarbs));
    }
    if (options.minFat !== undefined) {
      url.searchParams.append("minFat", String(options.minFat));
    }
    if (options.maxFat !== undefined) {
      url.searchParams.append("maxFat", String(options.maxFat));
    }
    // Additional nutrition filters
    if (options.minAlcohol !== undefined) {
      url.searchParams.append("minAlcohol", String(options.minAlcohol));
    }
    if (options.maxAlcohol !== undefined) {
      url.searchParams.append("maxAlcohol", String(options.maxAlcohol));
    }
    if (options.minCaffeine !== undefined) {
      url.searchParams.append("minCaffeine", String(options.minCaffeine));
    }
    if (options.maxCaffeine !== undefined) {
      url.searchParams.append("maxCaffeine", String(options.maxCaffeine));
    }
    if (options.minCopper !== undefined) {
      url.searchParams.append("minCopper", String(options.minCopper));
    }
    if (options.maxCopper !== undefined) {
      url.searchParams.append("maxCopper", String(options.maxCopper));
    }
    if (options.minCalcium !== undefined) {
      url.searchParams.append("minCalcium", String(options.minCalcium));
    }
    if (options.maxCalcium !== undefined) {
      url.searchParams.append("maxCalcium", String(options.maxCalcium));
    }
    if (options.minCholine !== undefined) {
      url.searchParams.append("minCholine", String(options.minCholine));
    }
    if (options.maxCholine !== undefined) {
      url.searchParams.append("maxCholine", String(options.maxCholine));
    }
    if (options.minCholesterol !== undefined) {
      url.searchParams.append("minCholesterol", String(options.minCholesterol));
    }
    if (options.maxCholesterol !== undefined) {
      url.searchParams.append("maxCholesterol", String(options.maxCholesterol));
    }
    if (options.minFluoride !== undefined) {
      url.searchParams.append("minFluoride", String(options.minFluoride));
    }
    if (options.maxFluoride !== undefined) {
      url.searchParams.append("maxFluoride", String(options.maxFluoride));
    }
    if (options.minSaturatedFat !== undefined) {
      url.searchParams.append("minSaturatedFat", String(options.minSaturatedFat));
    }
    if (options.maxSaturatedFat !== undefined) {
      url.searchParams.append("maxSaturatedFat", String(options.maxSaturatedFat));
    }
    if (options.minVitaminA !== undefined) {
      url.searchParams.append("minVitaminA", String(options.minVitaminA));
    }
    if (options.maxVitaminA !== undefined) {
      url.searchParams.append("maxVitaminA", String(options.maxVitaminA));
    }
    if (options.minVitaminC !== undefined) {
      url.searchParams.append("minVitaminC", String(options.minVitaminC));
    }
    if (options.maxVitaminC !== undefined) {
      url.searchParams.append("maxVitaminC", String(options.maxVitaminC));
    }
    if (options.minVitaminD !== undefined) {
      url.searchParams.append("minVitaminD", String(options.minVitaminD));
    }
    if (options.maxVitaminD !== undefined) {
      url.searchParams.append("maxVitaminD", String(options.maxVitaminD));
    }
    if (options.minVitaminE !== undefined) {
      url.searchParams.append("minVitaminE", String(options.minVitaminE));
    }
    if (options.maxVitaminE !== undefined) {
      url.searchParams.append("maxVitaminE", String(options.maxVitaminE));
    }
    if (options.minVitaminK !== undefined) {
      url.searchParams.append("minVitaminK", String(options.minVitaminK));
    }
    if (options.maxVitaminK !== undefined) {
      url.searchParams.append("maxVitaminK", String(options.maxVitaminK));
    }
    if (options.minVitaminB1 !== undefined) {
      url.searchParams.append("minVitaminB1", String(options.minVitaminB1));
    }
    if (options.maxVitaminB1 !== undefined) {
      url.searchParams.append("maxVitaminB1", String(options.maxVitaminB1));
    }
    if (options.minVitaminB2 !== undefined) {
      url.searchParams.append("minVitaminB2", String(options.minVitaminB2));
    }
    if (options.maxVitaminB2 !== undefined) {
      url.searchParams.append("maxVitaminB2", String(options.maxVitaminB2));
    }
    if (options.minVitaminB5 !== undefined) {
      url.searchParams.append("minVitaminB5", String(options.minVitaminB5));
    }
    if (options.maxVitaminB5 !== undefined) {
      url.searchParams.append("maxVitaminB5", String(options.maxVitaminB5));
    }
    if (options.minVitaminB3 !== undefined) {
      url.searchParams.append("minVitaminB3", String(options.minVitaminB3));
    }
    if (options.maxVitaminB3 !== undefined) {
      url.searchParams.append("maxVitaminB3", String(options.maxVitaminB3));
    }
    if (options.minVitaminB6 !== undefined) {
      url.searchParams.append("minVitaminB6", String(options.minVitaminB6));
    }
    if (options.maxVitaminB6 !== undefined) {
      url.searchParams.append("maxVitaminB6", String(options.maxVitaminB6));
    }
    if (options.minVitaminB12 !== undefined) {
      url.searchParams.append("minVitaminB12", String(options.minVitaminB12));
    }
    if (options.maxVitaminB12 !== undefined) {
      url.searchParams.append("maxVitaminB12", String(options.maxVitaminB12));
    }
    if (options.minFiber !== undefined) {
      url.searchParams.append("minFiber", String(options.minFiber));
    }
    if (options.maxFiber !== undefined) {
      url.searchParams.append("maxFiber", String(options.maxFiber));
    }
    if (options.minFolate !== undefined) {
      url.searchParams.append("minFolate", String(options.minFolate));
    }
    if (options.maxFolate !== undefined) {
      url.searchParams.append("maxFolate", String(options.maxFolate));
    }
    if (options.minFolicAcid !== undefined) {
      url.searchParams.append("minFolicAcid", String(options.minFolicAcid));
    }
    if (options.maxFolicAcid !== undefined) {
      url.searchParams.append("maxFolicAcid", String(options.maxFolicAcid));
    }
    if (options.minIodine !== undefined) {
      url.searchParams.append("minIodine", String(options.minIodine));
    }
    if (options.maxIodine !== undefined) {
      url.searchParams.append("maxIodine", String(options.maxIodine));
    }
    if (options.minIron !== undefined) {
      url.searchParams.append("minIron", String(options.minIron));
    }
    if (options.maxIron !== undefined) {
      url.searchParams.append("maxIron", String(options.maxIron));
    }
    if (options.minMagnesium !== undefined) {
      url.searchParams.append("minMagnesium", String(options.minMagnesium));
    }
    if (options.maxMagnesium !== undefined) {
      url.searchParams.append("maxMagnesium", String(options.maxMagnesium));
    }
    if (options.minManganese !== undefined) {
      url.searchParams.append("minManganese", String(options.minManganese));
    }
    if (options.maxManganese !== undefined) {
      url.searchParams.append("maxManganese", String(options.maxManganese));
    }
    if (options.minPhosphorus !== undefined) {
      url.searchParams.append("minPhosphorus", String(options.minPhosphorus));
    }
    if (options.maxPhosphorus !== undefined) {
      url.searchParams.append("maxPhosphorus", String(options.maxPhosphorus));
    }
    if (options.minPotassium !== undefined) {
      url.searchParams.append("minPotassium", String(options.minPotassium));
    }
    if (options.maxPotassium !== undefined) {
      url.searchParams.append("maxPotassium", String(options.maxPotassium));
    }
    if (options.minSelenium !== undefined) {
      url.searchParams.append("minSelenium", String(options.minSelenium));
    }
    if (options.maxSelenium !== undefined) {
      url.searchParams.append("maxSelenium", String(options.maxSelenium));
    }
    if (options.minSodium !== undefined) {
      url.searchParams.append("minSodium", String(options.minSodium));
    }
    if (options.maxSodium !== undefined) {
      url.searchParams.append("maxSodium", String(options.maxSodium));
    }
    if (options.minSugar !== undefined) {
      url.searchParams.append("minSugar", String(options.minSugar));
    }
    if (options.maxSugar !== undefined) {
      url.searchParams.append("maxSugar", String(options.maxSugar));
    }
    if (options.minZinc !== undefined) {
      url.searchParams.append("minZinc", String(options.minZinc));
    }
    if (options.maxZinc !== undefined) {
      url.searchParams.append("maxZinc", String(options.maxZinc));
    }
    // Additional search parameters
    if (options.author) {
      url.searchParams.append("author", options.author);
    }
    if (options.tags) {
      url.searchParams.append("tags", options.tags);
    }
    if (options.recipeBoxId !== undefined) {
      url.searchParams.append("recipeBoxId", String(options.recipeBoxId));
    }
    if (options.titleMatch) {
      url.searchParams.append("titleMatch", options.titleMatch);
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to search recipes. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<SearchRecipesResponse>;
};

/**
 * Get recipe summary by ID
 * 
 * @param recipeId - Recipe ID string
 * @returns Promise with recipe summary
 * @throws Error if request fails
 */
export const getRecipeSummary = async (recipeId: string): Promise<RecipeSummary> => {
  const apiPath = getApiUrl(`/api/recipes/${recipeId}/summary`);
  
  // fetch() handles relative paths automatically using current origin
  // If API_URL is set, apiPath is already a full URL
  const response = await fetch(apiPath);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to get recipe summary. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeSummary>;
};

/**
 * Get full recipe information by ID
 * Returns complete recipe data including sourceUrl, ingredients, nutrition, etc.
 * 
 * @param recipeId - Recipe ID string
 * @param options - Optional parameters for additional data
 * @returns Promise with full recipe information
 * @throws Error if request fails
 */
export const getRecipeInformation = async (
  recipeId: string,
  options?: {
    includeNutrition?: boolean;
    addWinePairing?: boolean;
    addTasteData?: boolean;
  }
): Promise<RecipeInformation> => {
  // Build query string from options
  const queryParams = new URLSearchParams();
  if (options?.includeNutrition) {
    queryParams.append("includeNutrition", "true");
  }
  if (options?.addWinePairing) {
    queryParams.append("addWinePairing", "true");
  }
  if (options?.addTasteData) {
    queryParams.append("addTasteData", "true");
  }
  
  const queryString = queryParams.toString();
  const apiPath = getApiUrl(
    `/api/recipes/${recipeId}/information${queryString ? `?${queryString}` : ""}`
  );
  
  const response = await fetch(apiPath);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to get recipe information. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeInformation>;
};

/**
 * Get similar recipes by recipe ID
 * 
 * @param recipeId - Recipe ID string
 * @param number - Number of similar recipes to return (1-100, default: 10)
 * @returns Promise with similar recipes array
 * @throws Error if request fails
 */
export const getSimilarRecipes = async (
  recipeId: string,
  number: number = 10
): Promise<SimilarRecipe[]> => {
  const apiPath = getApiUrl(
    `/api/recipes/${recipeId}/similar?number=${Math.max(1, Math.min(100, number))}`
  );
  
  const response = await fetch(apiPath);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to get similar recipes. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<SimilarRecipe[]>;
};

/**
 * Autocomplete recipe search
 * Suggests possible recipe names based on partial input
 * 
 * @param query - Partial search query string
 * @param number - Number of results to return (1-25, default: 10)
 * @returns Promise with autocomplete recipes array
 * @throws Error if request fails
 */
export const autocompleteRecipes = async (
  query: string,
  number: number = 10
): Promise<AutocompleteRecipe[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const apiPath = getApiUrl(
    `/api/recipes/autocomplete?query=${encodeURIComponent(query)}&number=${Math.max(1, Math.min(25, number))}`
  );
  
  const response = await fetch(apiPath);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to autocomplete recipes. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<AutocompleteRecipe[]>;
};

/**
 * Get dish pairing for wine
 * Finds dishes that go well with a given wine type
 * 
 * @param wine - Wine type (e.g., "merlot", "riesling", "malbec")
 * @returns Promise with dish pairing information
 * @throws Error if request fails
 */
export const getDishPairingForWine = async (
  wine: string
): Promise<DishPairingForWine> => {
  const apiPath = getApiUrl(
    `/api/food/wine/dishes?wine=${encodeURIComponent(wine)}`
  );
  
  const response = await fetch(apiPath);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to get dish pairing for wine. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<DishPairingForWine>;
};

/**
 * Get wine pairing for food
 * Finds wines that go well with a given food (dish, ingredient, or cuisine)
 * 
 * @param food - Food name (e.g., "steak", "salmon", "italian")
 * @param maxPrice - Optional maximum price for wine recommendation in USD
 * @returns Promise with wine pairing information
 * @throws Error if request fails
 */
export const getWinePairing = async (
  food: string,
  maxPrice?: number
): Promise<WinePairing> => {
  let apiPath = getApiUrl(
    `/api/food/wine/pairing?food=${encodeURIComponent(food)}`
  );
  
  if (maxPrice !== undefined) {
    apiPath += `&maxPrice=${encodeURIComponent(maxPrice)}`;
  }
  
  const response = await fetch(apiPath);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to get wine pairing for food. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<WinePairing>;
};

/**
 * Get all favourite recipes
 * 
 * @returns Promise with favourite recipes array
 * @throws Error if request fails
 */
export const getFavouriteRecipes = async (): Promise<FavouriteRecipesResponse> => {
  const apiPath = getApiUrl("/api/recipes/favourite");
  
  // fetch() handles relative paths automatically using current origin
  // If API_URL is set, apiPath is already a full URL
  const response = await fetch(apiPath);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to get favourite recipes. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<FavouriteRecipesResponse>;
};

/**
 * Add recipe to favourites
 * 
 * @param recipe - Recipe to add to favourites
 * @returns Promise that resolves when recipe is added
 * @throws Error if request fails
 */
export const addFavouriteRecipe = async (recipe: Recipe): Promise<void> => {
  const apiPath = getApiUrl("/api/recipes/favourite");
  const body = {
    recipeId: recipe.id,
  };

  // fetch() handles relative paths automatically using current origin
  // If API_URL is set, apiPath is already a full URL
  const response = await fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Failed to add recipe to favourites. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};

/**
 * Remove recipe from favourites
 * 
 * @param recipe - Recipe to remove from favourites
 * @returns Promise that resolves when recipe is removed
 * @throws Error if request fails
 */
export const removeFavouriteRecipe = async (recipe: Recipe): Promise<void> => {
  const apiPath = getApiUrl("/api/recipes/favourite");
  const body = {
    recipeId: recipe.id,
  };

  // fetch() handles relative paths automatically using current origin
  // If API_URL is set, apiPath is already a full URL
  const response = await fetch(apiPath, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};

/**
 * Get authentication headers for authenticated requests
 * Includes user ID and Auth0 JWT access token
 *
 * Note: AuthContext stores both userId and access token in localStorage
 * Backend should validate the JWT token for proper security
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Get user ID from localStorage (set by AuthContext when user logs in)
  // SSR-safe: Only access localStorage on client side
  const userId = typeof window !== "undefined" ? localStorage.getItem("auth0_user_id") : null;
  if (userId) {
    headers["x-user-id"] = userId;
  }

  // Get Auth0 access token (JWT) for proper authentication
  // Backend should validate this token instead of relying solely on x-user-id
  // SSR-safe: Only access localStorage on client side
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("auth0_access_token") : null;
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Get all recipe collections for authenticated user
 *
 * @returns Promise with collections array
 * @throws Error if request fails
 */
export const getCollections = async (): Promise<RecipeCollection[]> => {
  const apiPath = getApiUrl("/api/collections");
  const response = await fetch(apiPath, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeCollection[]>;
};

/**
 * Create a new recipe collection
 *
 * @param name - Collection name
 * @param description - Optional description
 * @param color - Optional hex color
 * @returns Promise with created collection
 * @throws Error if request fails
 */
export const createCollection = async (
  name: string,
  description?: string,
  color?: string
): Promise<RecipeCollection> => {
  const apiPath = getApiUrl("/api/collections");
  const response = await fetch(apiPath, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ name, description, color }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeCollection>;
};

/**
 * Get collection details with items
 *
 * @param collectionId - Collection ID
 * @returns Promise with collection and items
 * @throws Error if request fails
 */
export const getCollection = async (
  collectionId: string
): Promise<RecipeCollection & { items: CollectionItem[] }> => {
  const apiPath = getApiUrl(`/api/collections/${collectionId}`);
  const response = await fetch(apiPath, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Collection not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Update a collection
 *
 * @param collectionId - Collection ID
 * @param updates - Collection updates
 * @returns Promise with updated collection
 * @throws Error if request fails
 */
export const updateCollection = async (
  collectionId: string,
  updates: { name?: string; description?: string; color?: string }
): Promise<RecipeCollection> => {
  const apiPath = getApiUrl(`/api/collections/${collectionId}`);
  const response = await fetch(apiPath, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Collection not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeCollection>;
};

/**
 * Delete a collection
 *
 * @param collectionId - Collection ID
 * @returns Promise that resolves when collection is deleted
 * @throws Error if request fails
 */
export const deleteCollection = async (collectionId: string): Promise<void> => {
  const apiPath = getApiUrl(`/api/collections/${collectionId}`);
  const response = await fetch(apiPath, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Collection not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};

/**
 * Add recipe to collection
 *
 * @param collectionId - Collection ID
 * @param recipe - Recipe to add
 * @param order - Optional order position
 * @returns Promise with created collection item
 * @throws Error if request fails
 */
export const addRecipeToCollection = async (
  collectionId: string,
  recipe: Recipe,
  order?: number
): Promise<CollectionItem> => {
  const apiPath = getApiUrl(`/api/collections/${collectionId}/items`);
  const response = await fetch(apiPath, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
      order,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<CollectionItem>;
};

/**
 * Remove recipe from collection
 *
 * @param collectionId - Collection ID
 * @param recipeId - Recipe ID to remove
 * @returns Promise that resolves when recipe is removed
 * @throws Error if request fails
 */
export const removeRecipeFromCollection = async (
  collectionId: string,
  recipeId: number
): Promise<void> => {
  const apiPath = getApiUrl(`/api/collections/${collectionId}/items`);
  const response = await fetch(apiPath, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ recipeId }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};

/**
 * Get recipe note for a recipe
 *
 * @param recipeId - Recipe ID
 * @returns Promise with recipe note or null if not found
 * @throws Error if request fails
 */
export const getRecipeNote = async (
  recipeId: number
): Promise<RecipeNote | null> => {
  const apiPath = getApiUrl(`/api/recipes/notes?recipeId=${recipeId}`);
  const response = await fetch(apiPath, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeNote>;
};

/**
 * Create or update recipe note
 *
 * @param recipeId - Recipe ID
 * @param note - Note data
 * @returns Promise with saved note
 * @throws Error if request fails
 */
export const saveRecipeNote = async (
  recipeId: number,
  note: {
    title?: string;
    content: string;
    rating?: number;
    tags?: string[];
  }
): Promise<RecipeNote> => {
  const apiPath = getApiUrl("/api/recipes/notes");
  const response = await fetch(apiPath, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      recipeId,
      ...note,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeNote>;
};

/**
 * Delete recipe note
 *
 * @param recipeId - Recipe ID
 * @returns Promise that resolves when note is deleted
 * @throws Error if request fails
 */
export const deleteRecipeNote = async (recipeId: number): Promise<void> => {
  const apiPath = getApiUrl("/api/recipes/notes");
  const response = await fetch(apiPath, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ recipeId }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Note not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};

/**
 * Get meal plan for a week
 */
export const getMealPlan = async (weekStart: string): Promise<MealPlan> => {
  const apiPath = getApiUrl(`/api/meal-plan?weekStart=${weekStart}`);
  const response = await fetch(apiPath, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Meal plan not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<MealPlan>;
};

/**
 * Add recipe to meal plan
 */
export const addMealPlanItem = async (mealPlanData: {
  weekStart: string;
  recipeId: number;
  recipeTitle: string;
  recipeImage?: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings?: number;
}): Promise<MealPlanItem> => {
  const apiPath = getApiUrl("/api/meal-plan");
  const response = await fetch(apiPath, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(mealPlanData),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<MealPlanItem>;
};

/**
 * Remove meal plan item
 */
export const removeMealPlanItem = async (itemId: string): Promise<void> => {
  const apiPath = getApiUrl("/api/meal-plan");
  const response = await fetch(apiPath, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ itemId }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Meal plan item not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};

/**
 * Get all shopping lists for user
 */
export const getShoppingLists = async (): Promise<ShoppingList[]> => {
  const apiPath = getApiUrl("/api/shopping-list");
  const response = await fetch(apiPath, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<ShoppingList[]>;
};

/**
 * Create shopping list from recipes
 */
export const createShoppingList = async (shoppingListData: {
  name: string;
  recipeIds: number[];
  items: ShoppingListItem[];
}): Promise<ShoppingList> => {
  const apiPath = getApiUrl("/api/shopping-list");
  const response = await fetch(apiPath, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(shoppingListData),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<ShoppingList>;
};

/**
 * Update shopping list
 */
export const updateShoppingList = async (
  id: string,
  updates: {
    name?: string;
    items?: ShoppingListItem[];
    isCompleted?: boolean;
  }
): Promise<ShoppingList> => {
  const apiPath = getApiUrl("/api/shopping-list");
  const response = await fetch(apiPath, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ id, ...updates }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Shopping list not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<ShoppingList>;
};

/**
 * Delete shopping list
 */
export const deleteShoppingList = async (id: string): Promise<void> => {
  const apiPath = getApiUrl("/api/shopping-list");
  const response = await fetch(apiPath, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Shopping list not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (
  imageFile: File | Blob,
  folder?: string
): Promise<{ imageUrl: string; publicId: string; width: number; height: number }> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const apiPath = getApiUrl("/api/upload");
  const response = await fetch(apiPath, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      imageData: base64,
      folder,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Get recipe images
 */
export const getRecipeImages = async (recipeId: number): Promise<RecipeImage[]> => {
  const apiPath = getApiUrl(`/api/recipes/images?recipeId=${recipeId}`);
  const response = await fetch(apiPath, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeImage[]>;
};

/**
 * Add image to recipe
 */
export const addRecipeImage = async (imageData: {
  recipeId: number;
  imageUrl: string;
  imageType: "step" | "final" | "ingredient" | "custom";
  order?: number;
  caption?: string;
}): Promise<RecipeImage> => {
  const apiPath = getApiUrl("/api/recipes/images");
  const response = await fetch(apiPath, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(imageData),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }

  return response.json() as Promise<RecipeImage>;
};

/**
 * Remove recipe image
 */
export const removeRecipeImage = async (id: string): Promise<void> => {
  const apiPath = getApiUrl("/api/recipes/images");
  const response = await fetch(apiPath, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Image not found");
    }
    const errorMessage = await extractErrorMessage(
      response,
      `Request failed. Status: ${response.status}`
    );
    throw new Error(errorMessage);
  }
};
