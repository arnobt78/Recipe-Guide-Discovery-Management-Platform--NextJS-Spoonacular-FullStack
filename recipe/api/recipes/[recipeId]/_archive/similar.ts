/**
 * Vercel Serverless Function: GET /api/recipes/[recipeId]/similar
 * 
 * Get similar recipes by recipe ID using Spoonacular API
 * 
 * Path Parameters:
 * - recipeId: string - Recipe ID
 * 
 * Query Parameters:
 * - number: number (optional) - Number of similar recipes to return (1-100, default: 10)
 * 
 * @param request - Vercel request object
 * @returns JSON response with similar recipes array
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getSimilarRecipes } from "../../../lib/recipe-api.js";
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
    const number = request.query.number 
      ? parseInt(request.query.number as string, 10) 
      : 10;

    if (!recipeId) {
      return response.status(400).json({ error: "Recipe ID is required" });
    }

    // Validate number parameter
    if (isNaN(number) || number < 1 || number > 100) {
      return response.status(400).json({ error: "Number must be between 1 and 100" });
    }

    const results = await getSimilarRecipes(recipeId, number);

    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Similar Recipes API] Error handling request:", error);
    console.error("❌ [Similar Recipes API] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("❌ [Similar Recipes API] Error message:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error("❌ [Similar Recipes API] Error stack:", error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;

    return response.status(statusCode).json({ 
      error: "Failed to fetch similar recipes",
      message: errorMessage
    });
  }
}

