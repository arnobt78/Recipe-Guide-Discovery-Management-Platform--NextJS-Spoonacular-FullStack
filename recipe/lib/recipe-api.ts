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

// Explicitly load .env.local for Vercel dev
if (existsSync(".env.local")) {
  config({ path: ".env.local" });
}

// Get API key and strip quotes if present
let apiKey = process.env.API_KEY;
if (apiKey) {
  apiKey = apiKey.replace(/^["']|["']$/g, "");
  process.env.API_KEY = apiKey;
}

if (!apiKey) {
  console.error("❌ [Recipe API] API_KEY is NOT set!");
}

/**
 * Search recipes using Spoonacular API
 * @param searchTerm - Search query string
 * @param page - Page number for pagination
 * @returns Promise with search results
 * @throws Error if API key is not found
 */
export const searchRecipes = async (searchTerm: string, page: number) => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");

  const queryParams = {
    apiKey,
    query: searchTerm,
    number: "10",
    offset: (page * 10).toString(),
  };
  url.search = new URLSearchParams(queryParams).toString();

  try {
    const searchResponse = await fetch(url);
    const resultsJson = await searchResponse.json();
    return resultsJson;
  } catch (error) {
    console.log(error);
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
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const url = new URL(
    `https://api.spoonacular.com/recipes/${recipeId}/summary`
  );
  const params = {
    apiKey: apiKey,
  };
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const json = await response.json();

  return json;
};

/**
 * Get favorite recipes by IDs
 * @param ids - Array of recipe IDs as strings
 * @returns Promise with favorite recipes data
 * @throws Error if API key is not found
 */
export const getFavouriteRecipesByIDs = async (ids: string[]) => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const url = new URL("https://api.spoonacular.com/recipes/informationBulk");
  const params = {
    apiKey: apiKey,
    ids: ids.join(","),
  };
  url.search = new URLSearchParams(params).toString();

  const searchResponse = await fetch(url);
  const json = await searchResponse.json();

  return { results: json };
};
