import { Recipe } from "./types";

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

export const searchRecipes = async (searchTerm: string, page: number) => {
  const apiPath = getApiUrl("/api/recipes/search");
  
  // Build URL with query params
  // If API_URL is set, apiPath is already full URL; otherwise it's relative
  const url = API_URL 
    ? new URL(apiPath) 
    : new URL(apiPath, window.location.origin);
  
  url.searchParams.append("searchTerm", searchTerm);
  url.searchParams.append("page", String(page));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

export const getRecipeSummary = async (recipeId: string) => {
  const apiPath = getApiUrl(`/api/recipes/${recipeId}/summary`);
  
  // fetch() handles relative paths automatically using current origin
  // If API_URL is set, apiPath is already a full URL
  const response = await fetch(apiPath);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

export const getFavouriteRecipes = async () => {
  const apiPath = getApiUrl("/api/recipes/favourite");
  
  // fetch() handles relative paths automatically using current origin
  // If API_URL is set, apiPath is already a full URL
  const response = await fetch(apiPath);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

export const addFavouriteRecipe = async (recipe: Recipe) => {
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
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
};

export const removeFavouriteRecipe = async (recipe: Recipe) => {
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
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
};
