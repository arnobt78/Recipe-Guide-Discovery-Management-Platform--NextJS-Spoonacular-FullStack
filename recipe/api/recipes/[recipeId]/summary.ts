/**
 * Vercel Serverless Function: GET /api/recipes/[recipeId]/summary
 * 
 * Get recipe summary by ID using Spoonacular API
 * 
 * Path Parameters:
 * - recipeId: string - Recipe ID
 * 
 * @param request - Vercel request object
 * @returns JSON response with recipe summary
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getRecipeSummary } from "../../../lib/recipe-api.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow GET method
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get recipeId from route parameter (Vercel dynamic route)
    // In Vercel, dynamic route params are in request.query with the bracket name
    const recipeId = request.query.recipeId as string;

    if (!recipeId) {
      return response.status(400).json({ error: "Recipe ID is required" });
    }

    const results = await getRecipeSummary(recipeId);

    // Set CORS headers
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return response.status(200).json(results);
  } catch (error) {
    console.error("Error fetching recipe summary:", error);
    return response.status(500).json({ 
      error: "Failed to fetch recipe summary",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

