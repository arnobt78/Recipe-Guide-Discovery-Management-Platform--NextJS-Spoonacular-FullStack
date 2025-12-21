/**
 * Vercel Serverless Function: GET /api/recipes/autocomplete
 * 
 * Autocomplete recipe search using Spoonacular API
 * 
 * Query Parameters:
 * - query: string (required) - Partial search query (min 2 characters)
 * - number: number (optional) - Number of results to return (1-25, default: 10)
 * 
 * @param request - Vercel request object
 * @returns JSON response with autocomplete recipes array
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { autocompleteRecipes } from "../../lib/recipe-api.js";
import { setCorsHeaders, handleCorsPreflight } from "../../lib/api-utils.js";

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
    const query = request.query.query as string;
    const number = request.query.number 
      ? parseInt(request.query.number as string, 10) 
      : 10;

    if (!query || query.trim().length < 2) {
      return response.status(400).json({ error: "Query must be at least 2 characters" });
    }

    // Validate number parameter
    if (isNaN(number) || number < 1 || number > 25) {
      return response.status(400).json({ error: "Number must be between 1 and 25" });
    }

    const results = await autocompleteRecipes(query, number);

    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Autocomplete API] Error handling request:", error);
    console.error("❌ [Autocomplete API] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("❌ [Autocomplete API] Error message:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error("❌ [Autocomplete API] Error stack:", error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;

    return response.status(statusCode).json({ 
      error: "Failed to autocomplete recipes",
      message: errorMessage
    });
  }
}

