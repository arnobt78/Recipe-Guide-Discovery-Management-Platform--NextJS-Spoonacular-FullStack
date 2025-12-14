/**
 * Consolidated Recipe Detail API Handler (Catch-All Route)
 * 
 * Handles multiple recipe detail endpoints using Vercel catch-all routing:
 * - /api/recipes/[recipeId]/information → handled via subpath[0] === "information"
 * - /api/recipes/[recipeId]/similar → handled via subpath[0] === "similar"
 * - /api/recipes/[recipeId]/summary → handled via subpath[0] === "summary"
 * 
 * All original code preserved, consolidated to reduce serverless function count.
 * Frontend calls remain exactly the same - no changes needed.
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getRecipeInformation, getSimilarRecipes, getRecipeSummary } from "../../../lib/recipe-api.js";
import { setCorsHeaders, handleCorsPreflight } from "../../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle CORS preflight
  if (handleCorsPreflight(request, response)) {
    return;
  }

  // Only allow GET method for all endpoints
  if (request.method !== "GET") {
    setCorsHeaders(response);
    return response.status(405).json({ error: "Method not allowed" });
  }

  setCorsHeaders(response);

  // Extract recipeId and subpath from route parameters
  const recipeId = request.query.recipeId as string;
  const subpathParam = request.query.subpath;
  
  let endpoint = "";
  if (Array.isArray(subpathParam)) {
    endpoint = subpathParam[0] || "";
  } else if (typeof subpathParam === "string") {
    const segments = subpathParam.split("/").filter(Boolean);
    endpoint = segments[0] || "";
  }
  
  // Fallback: extract from URL if subpath param not available
  if (!endpoint && request.url) {
    try {
      const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      const segments = url.pathname.split("/").filter(Boolean);
      const recipeIdIndex = segments.indexOf(recipeId);
      if (recipeIdIndex !== -1 && segments[recipeIdIndex + 1]) {
        endpoint = segments[recipeIdIndex + 1];
      }
    } catch {
      // URL parsing failed
    }
  }

  if (!recipeId) {
    return response.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    // Handle /api/recipes/[recipeId]/information
    if (endpoint === "information") {
      const options = {
        includeNutrition: request.query.includeNutrition === "true",
        addWinePairing: request.query.addWinePairing === "true",
        addTasteData: request.query.addTasteData === "true",
      };

      const results = await getRecipeInformation(recipeId, options);

      return response.status(200).json(results);
    }

    // Handle /api/recipes/[recipeId]/similar
    if (endpoint === "similar") {
      const number = request.query.number 
        ? parseInt(request.query.number as string, 10) 
        : 10;

      if (isNaN(number) || number < 1 || number > 100) {
        return response.status(400).json({ error: "Number must be between 1 and 100" });
      }

      const results = await getSimilarRecipes(recipeId, number);

      return response.status(200).json(results);
    }

    // Handle /api/recipes/[recipeId]/summary
    if (endpoint === "summary") {
      const results = await getRecipeSummary(recipeId);

      return response.status(200).json(results);
    }

    // Endpoint not found
    return response.status(404).json({ error: "Endpoint not found" });
  } catch (error) {
    console.error(`❌ [Recipe Detail API] Error handling ${endpoint} request:`, error);
    console.error(`❌ [Recipe Detail API] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
    console.error(`❌ [Recipe Detail API] Error message:`, error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error(`❌ [Recipe Detail API] Error stack:`, error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;

    const endpointName = endpoint || "recipe detail";
    return response.status(statusCode).json({ 
      error: `Failed to fetch ${endpointName}`,
      message: errorMessage
    });
  }
}

