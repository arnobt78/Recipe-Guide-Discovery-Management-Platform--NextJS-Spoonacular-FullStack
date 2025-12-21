/**
 * Mock Data Utilities
 *
 * Provides mock data for development when API limit is reached
 * or when testing without API access
 *
 * Following DEVELOPMENT_RULES.md: Mock data for development
 */

import { Recipe, SearchRecipesResponse, RecipeSummary } from "../types";

/**
 * Generate mock recipe data
 *
 * @param id - Recipe ID
 * @param title - Recipe title
 * @returns Mock recipe object
 */
function createMockRecipe(id: number, title: string): Recipe {
  return {
    id,
    title,
    image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop&q=80`,
    imageType: "jpg",
  };
}

/**
 * Mock search results for development
 *
 * @param searchTerm - Search query
 * @param page - Page number
 * @returns Mock search response
 */
export function getMockSearchResults(
  searchTerm: string,
  page: number = 1
): SearchRecipesResponse {
  const mockRecipes: Recipe[] = [
    createMockRecipe(1, `${searchTerm} Recipe 1`),
    createMockRecipe(2, `${searchTerm} Recipe 2`),
    createMockRecipe(3, `${searchTerm} Recipe 3`),
    createMockRecipe(4, `${searchTerm} Recipe 4`),
    createMockRecipe(5, `${searchTerm} Recipe 5`),
    createMockRecipe(6, `${searchTerm} Recipe 6`),
    createMockRecipe(7, `${searchTerm} Recipe 7`),
    createMockRecipe(8, `${searchTerm} Recipe 8`),
  ];

  return {
    results: mockRecipes,
    offset: (page - 1) * 10,
    number: mockRecipes.length,
    totalResults: 50,
  };
}

/**
 * Mock recipe summary for development
 *
 * @param recipeId - Recipe ID
 * @param title - Recipe title
 * @returns Mock recipe summary
 */
export function getMockRecipeSummary(
  recipeId: string | number,
  title: string = "Mock Recipe"
): RecipeSummary {
  return {
    id: Number(recipeId),
    title,
    summary: `<p>This is a <b>mock recipe summary</b> for development purposes. The actual recipe details would be fetched from the Spoonacular API in production.</p><p>Recipe ID: ${recipeId}</p>`,
  };
}

/**
 * Check if mock data should be used
 *
 * @returns True if mock data should be used
 */
export function shouldUseMockData(): boolean {
  try {
    return localStorage.getItem("recipe_app_use_mock_data") === "true";
  } catch {
    return false;
  }
}

/**
 * Enable/disable mock data mode
 *
 * @param enabled - Whether to use mock data
 */
export function setUseMockData(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem("recipe_app_use_mock_data", "true");
      console.log("🎭 Mock data mode enabled");
    } else {
      localStorage.removeItem("recipe_app_use_mock_data");
      console.log("🎭 Mock data mode disabled");
    }
  } catch (error) {
    console.warn("Failed to set mock data mode:", error);
  }
}

