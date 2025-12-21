/**
 * Vercel Serverless Function: GET /api/food/wine/pairing
 * 
 * Get wine pairing for food using Spoonacular API
 * Finds wines that go well with a given food (dish, ingredient, or cuisine)
 * 
 * Query Parameters:
 * - food: string (required) - Food name (e.g., "steak", "salmon", "italian")
 * - maxPrice: number (optional) - Maximum price for wine recommendation in USD
 * 
 * @param request - Vercel request object
 * @returns JSON response with wine pairing information
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getWinePairing } from "../../../lib/recipe-api.js";
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
    const food = request.query.food as string;
    const maxPrice = request.query.maxPrice
      ? parseFloat(request.query.maxPrice as string)
      : undefined;

    if (!food || food.trim().length === 0) {
      return response.status(400).json({ error: "Food name is required" });
    }

    // Validate maxPrice if provided
    if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
      return response.status(400).json({ error: "maxPrice must be a positive number" });
    }

    const results = await getWinePairing(food, maxPrice);

    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Wine Pairing API] Error handling request:", error);
    console.error("❌ [Wine Pairing API] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("❌ [Wine Pairing API] Error message:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error("❌ [Wine Pairing API] Error stack:", error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;

    return response.status(statusCode).json({ 
      error: "Failed to get wine pairing for food",
      message: errorMessage
    });
  }
}

