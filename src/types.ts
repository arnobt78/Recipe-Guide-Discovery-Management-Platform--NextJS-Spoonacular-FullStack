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
 * Recipe Modification Response interface
 * Contains AI-generated recipe modifications (dietary conversion or simplification)
 */
export interface RecipeModificationResponse {
  modifiedIngredients?: Array<{
    original: string;
    substitute: string;
    reason?: string;
  }>;
  modifiedInstructions?: string;
  explanation?: string;
  simplifiedIngredients?: Array<{
    original: string;
    simplified: string;
    reason?: string;
  }>;
  simplifiedInstructions?: string;
  tips?: string[];
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
  aiOptimized?: boolean; // Indicates if search was AI-optimized
  originalQuery?: string; // Original natural language query
  searchParams?: Record<string, unknown>; // AI-extracted search parameters
  apiLimitReached?: boolean; // Indicates if all API keys have reached their daily limit
}

/**
 * Recipe Recommendation Response interface
 * Contains AI-generated recipe recommendations with context
 */
export interface RecipeRecommendationResponse {
  recipes: Recipe[];
  reason?: string; // AI explanation for why these recipes were recommended
  context?: string; // Context used for recommendations (dietary preferences, ingredients, etc.)
}

/**
 * Recipe Analysis Response interface
 * Contains AI-generated recipe analysis including nutrition, health score, substitutions, allergens, etc.
 */
export interface RecipeAnalysisResponse {
  healthScore?: {
    score: number; // 0-100 health score
    explanation?: string; // AI explanation of health score
  };
  nutritionAnalysis?: {
    summary?: string; // Overall nutrition summary
    strengths?: string[]; // Positive nutritional aspects
    concerns?: string[]; // Areas for improvement
  };
  ingredientSubstitutions?: Array<{
    original: string; // Original ingredient name
    substitute: string; // Suggested substitute
    reason?: string; // Why this substitution is recommended
    dietaryBenefit?: string; // Dietary benefit of substitution
  }>;
  allergens?: Array<{
    allergen: string; // Allergen name (e.g., "gluten", "dairy", "nuts")
    severity: "low" | "medium" | "high"; // Severity level
    sources?: string[]; // Ingredients that contain this allergen
  }>;
  cookingDifficulty?: {
    level: "beginner" | "intermediate" | "advanced"; // Difficulty level
    explanation?: string; // Why this difficulty level
    tips?: string[]; // Tips for cooking this recipe
  };
  timeValidation?: {
    estimatedTime?: number; // AI-estimated cooking time in minutes
    discrepancy?: string; // If there's a discrepancy with recipe time
  };
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

/**
 * Email sharing request interface
 */
export interface ShareRecipeEmailRequest {
  recipeId: number;
  recipeTitle: string;
  recipeImage?: string;
  recipientEmail: string;
  senderName?: string;
  message?: string;
}

/**
 * Email sharing response interface
 */
export interface ShareRecipeEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Email meal plan request interface
 */
export interface EmailMealPlanRequest {
  mealPlanId: string;
  recipientEmail: string;
  senderName?: string;
  message?: string;
}

/**
 * Newsletter subscription request interface
 */
export interface NewsletterSubscriptionRequest {
  email: string;
  name?: string;
}

/**
 * Weather data interface from OpenWeather API
 */
export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
}

/**
 * Weather-based recipe suggestions response
 */
export interface WeatherSuggestionsResponse {
  weather: WeatherData;
  suggestions: Recipe[];
  reasoning: string;
  apiLimitReached?: boolean;
  message?: string;
}

/**
 * Advanced filter options interface
 */
export interface AdvancedFilterOptions {
  diet?: string;
  cuisine?: string;
  mealType?: string;
  maxReadyTime?: number;
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minFat?: number;
  maxFat?: number;
  intolerances?: string;
  excludeIngredients?: string;
  includeIngredients?: string;
}

/**
 * Filter preset interface
 */
export interface FilterPreset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  filters: AdvancedFilterOptions;
  createdAt: string;
  updatedAt: string;
}

/**
 * Recipe video interface
 */
export interface RecipeVideo {
  id: string;
  recipeId: number;
  userId: string;
  videoUrl: string;
  videoType: "youtube" | "vimeo" | "custom";
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contentful Blog Post interface
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // Rich text content (markdown or HTML)
  featuredImage?: {
    url: string;
    title?: string;
    description?: string;
  };
  author?: {
    name: string;
    avatar?: string;
  };
  category?: string;
  tags?: string[];
  publishedAt: string;
  updatedAt: string;
}

/**
 * Blog posts list response interface
 */
export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  skip: number;
  limit: number;
}
