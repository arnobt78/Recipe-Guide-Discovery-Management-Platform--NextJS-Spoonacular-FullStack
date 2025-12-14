/**
 * Vercel Serverless Function: GET /api/recipes/[recipeId]/information
 * 
 * Get full recipe information by ID using Spoonacular API
 * Returns complete recipe data including sourceUrl, ingredients, nutrition, etc.
 * 
 * Path Parameters:
 * - recipeId: string - Recipe ID
 * 
 * Query Parameters:
 * - includeNutrition: boolean (optional) - Include nutrition data
 * 
 * @param request - Vercel request object
 * @returns JSON response with full recipe information
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getRecipeInformation } from "../../../lib/recipe-api.js";
import { setCorsHeaders, handleCorsPreflight } from "../../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle CORS preflight
  if (handleCorsPreflight(request, response)) {
    return;
  }

  // Only allow GET method
  if (request.method !== "GET") {
    setCorsHeaders(response);
    return response.status(405).json({ error: "Method not allowed" });
  }

  setCorsHeaders(response);

  try {
    // Get recipeId from route parameter (Vercel dynamic route)
    const recipeId = request.query.recipeId as string;
    
    // Extract optional parameters
    const options = {
      includeNutrition: request.query.includeNutrition === "true",
      addWinePairing: request.query.addWinePairing === "true",
      addTasteData: request.query.addTasteData === "true",
    };

    if (!recipeId) {
      return response.status(400).json({ error: "Recipe ID is required" });
    }

    const results = await getRecipeInformation(recipeId, options);

    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Recipe Information API] Error handling request:", error);
    console.error("❌ [Recipe Information API] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("❌ [Recipe Information API] Error message:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error("❌ [Recipe Information API] Error stack:", error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;

    return response.status(statusCode).json({ 
      error: "Failed to fetch recipe information",
      message: errorMessage
    });
  }
}

