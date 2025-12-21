/**
 * Recipe Summary Endpoint
 * 
 * Handles: /api/recipes/[recipeId]/summary
 * 
 * This is a specific route file to handle numeric recipe IDs,
 * as Vercel's catch-all route doesn't always match numeric segments
 * when running from parent directory with Root Directory setting.
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getRecipeSummary } from "../../../lib/recipe-api.js";
import {
  setCorsHeaders,
  handleCorsPreflight,
} from "../../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  console.log("🚀 [Recipe Summary API] Handler called:", {
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
    console.error("❌ [Recipe Summary API] Invalid recipeId:", recipeId);
    return response.status(400).json({ error: "Valid recipe ID is required" });
  }

  // Only allow GET method
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("✅ [Recipe Summary API] Fetching summary for recipeId:", recipeId);
    const results = await getRecipeSummary(recipeId);
    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Recipe Summary API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;
    return response.status(statusCode).json({ 
      error: "Failed to fetch recipe summary",
      message: errorMessage
    });
  }
}

