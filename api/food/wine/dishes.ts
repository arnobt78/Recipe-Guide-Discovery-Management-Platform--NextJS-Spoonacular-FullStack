/**
 * Vercel Serverless Function: GET /api/food/wine/dishes
 * 
 * Get dish pairing for wine using Spoonacular API
 * 
 * Query Parameters:
 * - wine: string (required) - Wine type (e.g., "merlot", "riesling", "malbec")
 * 
 * @param request - Vercel request object
 * @returns JSON response with dish pairing information
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getDishPairingForWine } from "../../../lib/recipe-api.js";
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
    const wine = request.query.wine as string;

    if (!wine || wine.trim().length === 0) {
      return response.status(400).json({ error: "Wine type is required" });
    }

    const results = await getDishPairingForWine(wine);

    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Dish Pairing API] Error handling request:", error);
    console.error("❌ [Dish Pairing API] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("❌ [Dish Pairing API] Error message:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error("❌ [Dish Pairing API] Error stack:", error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;

    return response.status(statusCode).json({ 
      error: "Failed to get dish pairing for wine",
      message: errorMessage
    });
  }
}

