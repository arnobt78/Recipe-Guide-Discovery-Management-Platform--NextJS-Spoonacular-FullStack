/**
 * Similar Recipes Endpoint
 * 
 * Handles: /api/recipes/[recipeId]/similar
 * 
 * This is a specific route file to handle numeric recipe IDs,
 * as Vercel's catch-all route doesn't always match numeric segments
 * when running from parent directory with Root Directory setting.
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getSimilarRecipes } from "../../../lib/recipe-api.js";
import {
  setCorsHeaders,
  handleCorsPreflight,
} from "../../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  console.log("🚀 [Similar Recipes API] Handler called:", {
    method: request.method,
    url: request.url,
    recipeId: request.query.recipeId,
  });
  
  // Handle CORS preflight
  if (handleCorsPreflight(request, response)) {
    return;
  }

  setCorsHeaders(response);

  // Extract recipeId from dynamic route parameter [recipeId]
  const recipeId = (request.query.recipeId as string) || "";

  if (!recipeId || !/^\d+$/.test(recipeId)) {
    console.error("❌ [Similar Recipes API] Invalid recipeId:", recipeId);
    return response.status(400).json({ error: "Valid recipe ID is required" });
  }

  // Only allow GET method
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const number = request.query.number 
      ? parseInt(request.query.number as string, 10) 
      : 10;

    if (isNaN(number) || number < 1 || number > 100) {
      return response.status(400).json({ error: "Number must be between 1 and 100" });
    }

    console.log("✅ [Similar Recipes API] Fetching similar recipes for recipeId:", recipeId);
    const results = await getSimilarRecipes(recipeId, number);
    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Similar Recipes API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;
    return response.status(statusCode).json({ 
      error: "Failed to fetch similar recipes",
      message: errorMessage
    });
  }
}

