/**
 * TypeScript Type Definitions
 *
 * Centralized type definitions for the entire application
 * Ensures type safety and consistency across components
 *
 * Following DEVELOPMENT_RULES.md: Strict TypeScript with explicit types
 */

/**
 * Recipe interface - matches Spoonacular API complexSearch endpoint response
 * Used for displaying recipe cards and lists
 * Includes ALL properties from complexSearch endpoint per API documentation
 * 
 * @see https://spoonacular.com/food-api/docs#Search-Recipes
 */
export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  summary?: string; // Optional summary (when addRecipeInformation=true)
  // Properties from complexSearch when fillIngredients=true
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  usedIngredients?: Array<{
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
  }>;
  missedIngredients?: Array<{
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
    extendedName?: string;
  }>;
  unusedIngredients?: Array<{
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
  }>;
  likes?: number;
  // Additional properties when addRecipeInformation=true
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  sourceName?: string;
  spoonacularSourceUrl?: string;
  healthScore?: number;
  spoonacularScore?: number;
  pricePerServing?: number;
  cheap?: boolean;
  creditsText?: string;
  cuisines?: string[];
  dairyFree?: boolean;
  diets?: string[];
  gaps?: string;
  glutenFree?: boolean;
  ketogenic?: boolean;
  lowFodmap?: boolean;
  occasions?: string[];
  sustainable?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  veryHealthy?: boolean;
  veryPopular?: boolean;
  whole30?: boolean;
  weightWatcherSmartPoints?: number;
  dishTypes?: string[];
}

/**
 * Recipe Summary interface - matches Spoonacular API response
 * Used for displaying detailed recipe information
 */
export interface RecipeSummary {
  id: number;
  title: string;
  summary: string; // HTML string with recipe summary
}

/**
 * Recipe Information interface - matches Spoonacular API /recipes/{id}/information endpoint
 * Contains full recipe details including sourceUrl, ingredients, nutrition, etc.
 */
export interface RecipeInformation {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  cookingMinutes?: number;
  preparationMinutes?: number;
  license?: string;
  sourceName?: string;
  sourceUrl?: string; // The actual source URL for the recipe
  spoonacularSourceUrl?: string;
  healthScore?: number;
  spoonacularScore?: number;
  pricePerServing?: number;
  analyzedInstructions?: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
      ingredients?: Array<{ id: number; name: string; localizedName: string; image: string }>;
      equipment?: Array<{ id: number; name: string; localizedName: string; image: string }>;
    }>;
  }>;
  cheap?: boolean;
  creditsText?: string;
  cuisines?: string[];
  dairyFree?: boolean;
  diets?: string[];
  gaps?: string;
  glutenFree?: boolean;
  instructions?: string;
  ketogenic?: boolean;
  lowFodmap?: boolean;
  occasions?: string[];
  sustainable?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  veryHealthy?: boolean;
  veryPopular?: boolean;
  whole30?: boolean;
  weightWatcherSmartPoints?: number;
  dishTypes?: string[];
  extendedIngredients?: Array<{
    aisle: string;
    amount: number;
    consistency: string;
    id: number;
    image: string;
    measures: {
      metric: { amount: number; unitLong: string; unitShort: string };
      us: { amount: number; unitLong: string; unitShort: string };
    };
    meta: string[];
    name: string;
    original: string;
    originalName: string;
    unit: string;
  }>;
  summary?: string; // HTML string with recipe summary
  winePairing?: {
    pairedWines?: string[];
    pairingText?: string;
    productMatches?: Array<{
      id: number;
      title: string;
      description: string;
      price: string;
      imageUrl: string;
      averageRating: number;
      ratingCount: number;
      score: number;
      link: string;
    }>;
  };
  // Nutrition data (when includeNutrition=true)
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds?: number;
    }>;
    properties: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    flavonoids: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
    weightPerServing: {
      amount: number;
      unit: string;
    };
  };
  // Taste data (when addTasteData=true)
  taste?: {
    sweetness: number;
    saltiness: number;
    sourness: number;
    bitterness: number;
    savoriness: number;
    fattiness: number;
    spiciness: number;
  };
}

/**
 * Autocomplete Recipe interface - matches Spoonacular API /recipes/autocomplete endpoint
 */
export interface AutocompleteRecipe {
  id: number;
  title: string;
  imageType: string;
}

/**
 * Dish Pairing for Wine interface - matches Spoonacular API /food/wine/dishes endpoint
 */
export interface DishPairingForWine {
  pairings: string[];
  text: string;
}

/**
 * Wine Pairing interface - matches Spoonacular API /food/wine/pairing endpoint
 * Finds wines that go well with a given food
 */
export interface WinePairing {
  pairedWines: string[];
  pairingText: string;
  productMatches: Array<{
    id: number;
    title: string;
    description: string | null;
    price: string;
    imageUrl: string;
    averageRating: number;
    ratingCount: number;
    score: number;
    link: string;
  }>;
}

/**
 * Similar Recipe interface - matches Spoonacular API /recipes/{id}/similar endpoint
 */
export interface SimilarRecipe {
  id: number;
  title: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
}

/**
 * Search Recipes Response interface
 * Matches Spoonacular API search endpoint response
 */
export interface SearchRecipesResponse {
  results?: Recipe[];
  status?: "failure" | "success";
  code?: number; // HTTP status code or API error code (e.g., 402 for daily limit)
  message?: string; // Error message from API
  totalResults?: number;
  offset?: number;
  number?: number;
}

/**
 * Favourite Recipes Response interface
 * Matches our API endpoint response for favourite recipes
 */
export interface FavouriteRecipesResponse {
  results: Recipe[];
  status?: "failure"; // Added for API error handling
  code?: number; // Added for API error handling
  message?: string; // Added for API error handling
}

/**
 * Tab type for navigation
 * Used in TabNavigation component and RecipeContext
 */
export type TabType = "search" | "favourites" | "collections" | "meal-plan" | "shopping";

/**
 * User interface - Auth0 user information
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

/**
 * Recipe Collection interface
 */
export interface RecipeCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  itemCount?: number; // Optional count of items in collection
}

/**
 * Collection Item interface
 */
export interface CollectionItem {
  id: string;
  collectionId: string;
  recipeId: number;
  recipeTitle: string;
  recipeImage?: string;
  order: number;
  createdAt: string;
}

/**
 * Recipe Note interface
 */
export interface RecipeNote {
  id: string;
  userId: string;
  recipeId: number;
  title?: string;
  content: string;
  rating?: number; // 1-5
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Meal Plan interface
 */
export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  meals?: MealPlanItem[];
}

/**
 * Meal Plan Item interface
 */
export interface MealPlanItem {
  id: string;
  mealPlanId: string;
  recipeId: number;
  recipeTitle: string;
  recipeImage?: string;
  dayOfWeek: number; // 0-6 (Monday-Sunday)
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  order: number;
  createdAt: string;
}

/**
 * Shopping List interface
 */
export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  recipeIds: number[];
  items: ShoppingListItem[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shopping List Item interface
 */
export interface ShoppingListItem {
  name: string;
  quantity: string;
  unit?: string;
  category: string;
  recipeIds: number[]; // Which recipes need this ingredient
}

/**
 * Recipe Image interface
 */
export interface RecipeImage {
  id: string;
  userId: string;
  recipeId: number;
  imageUrl: string;
  imageType: "step" | "final" | "ingredient" | "custom";
  order: number;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}
