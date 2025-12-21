/**
 * Recipe Autocomplete Endpoint
 * 
 * Handles: /api/recipes/autocomplete
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { autocompleteRecipes } from "../../lib/recipe-api.js";
import {
  setCorsHeaders,
  handleCorsPreflight,
} from "../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle CORS preflight
  if (handleCorsPreflight(request, response)) {
    return;
  }

  setCorsHeaders(response);

  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const query = request.query.query as string;
    const number = request.query.number
      ? parseInt(request.query.number as string, 10)
      : 10;

    if (!query || query.trim().length < 2) {
      return response
        .status(400)
        .json({ error: "Query must be at least 2 characters" });
    }

    if (isNaN(number) || number < 1 || number > 25) {
      return response
        .status(400)
        .json({ error: "Number must be between 1 and 25" });
    }

    const results = await autocompleteRecipes(query, number);

    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Autocomplete API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;
    return response.status(statusCode).json({
      error: "Internal server error",
      message: errorMessage,
    });
  }
}

