/**
 * Vercel Serverless Function: GET /api/recipes/search
 * 
 * Search recipes using Spoonacular API
 * 
 * Query Parameters:
 * - searchTerm: string - Search query
 * - page: number - Page number for pagination
 * 
 * @param request - Vercel request object
 * @returns JSON response with search results
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { searchRecipes } from "../../lib/recipe-api.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow GET method
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const searchTerm = (request.query.searchTerm as string) || "";
    const page = parseInt((request.query.page as string) || "0", 10);

    const results = await searchRecipes(searchTerm, page);

    // Set CORS headers
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return response.status(200).json(results);
  } catch (error) {
    console.error("Error searching recipes:", error);
    return response.status(500).json({ 
      error: "Failed to search recipes",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

