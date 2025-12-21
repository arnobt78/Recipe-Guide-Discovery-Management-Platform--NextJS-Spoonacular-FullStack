/**
 * Favourite Recipes Endpoint
 * 
 * Handles: /api/recipes/favourite
 * - GET: Get all favorite recipes
 * - POST: Add favorite recipe
 * - DELETE: Remove favorite recipe
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";
import { getFavouriteRecipesByIDs } from "../../lib/recipe-api.js";
import {
  setCorsHeaders,
  handleCorsPreflight,
  requireAuth,
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

  try {
    // POST: Add favorite recipe
    if (request.method === "POST") {
      const userId = await requireAuth(request, response);
      if (!userId) {
        return;
      }

      const { recipeId } = request.body;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      const existing = await prisma.favouriteRecipes.findFirst({
        where: {
          recipeId: Number(recipeId),
          userId: userId,
        },
      });

      if (existing) {
        return response.status(409).json({
          error: "Recipe is already in favorites",
        });
      }

      try {
        const favouriteRecipe = await prisma.favouriteRecipes.create({
          data: {
            recipeId: Number(recipeId),
            userId: userId,
          },
          select: {
            id: true,
            recipeId: true,
            userId: true,
          },
        });

        return response.status(201).json(favouriteRecipe);
      } catch (createError: unknown) {
        const error = createError as Error;
        if (
          error.message.includes("createdAt") ||
          error.message.includes("does not exist")
        ) {
          console.warn("⚠️ [Favourite API] Database schema mismatch");

          return response.status(500).json({
            error: "Database schema needs migration",
            message:
              "Please run: npx prisma migrate deploy or npx prisma db push",
            details: error.message,
          });
        }
        throw createError;
      }
    }

    // GET: Get all favorite recipes
    if (request.method === "GET") {
      const userId = await requireAuth(request, response);
      if (!userId) {
        return;
      }

      const recipes = await prisma.favouriteRecipes.findMany({
        where: {
          userId: userId,
        },
        select: {
          recipeId: true,
        },
      });
      const recipeIds = recipes.map((recipe) => recipe.recipeId.toString());

      if (recipeIds.length === 0) {
        return response.status(200).json({ results: [] });
      }

      try {
        const favourites = await getFavouriteRecipesByIDs(recipeIds);
        return response.status(200).json(favourites);
      } catch (apiError: unknown) {
        const error = apiError as { code?: number; message?: string };
        const isApiLimitError =
          error?.code === 402 ||
          error?.message?.includes("points limit") ||
          error?.message?.includes("daily limit");

        if (isApiLimitError) {
          console.warn(
            "⚠️ [Favourite API] Spoonacular API daily limit reached."
          );

          return response.status(200).json({
            results: recipeIds.map((id) => ({
              id: parseInt(id),
              title: `Recipe #${id} (Details unavailable - API limit reached)`,
              image: null,
              _apiUnavailable: true,
            })),
            _message:
              "Your favourites are saved, but recipe details are temporarily unavailable due to API daily limit.",
          });
        }

        throw apiError;
      }
    }

    // DELETE: Remove favorite recipe
    if (request.method === "DELETE") {
      const userId = await requireAuth(request, response);
      if (!userId) {
        return;
      }

      const { recipeId } = request.body;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      try {
        // Find the record first using the compound unique constraint
        const existing = await prisma.favouriteRecipes.findFirst({
          where: {
            recipeId: Number(recipeId),
            userId: userId,
          },
        });

        // Delete by id if found
        if (existing) {
          await prisma.favouriteRecipes.delete({
            where: {
              id: existing.id,
            },
          });
        }
      } catch (deleteError: unknown) {
        const error = deleteError as { code?: string };
        if (error.code !== "P2025") {
          throw deleteError;
        }
      }

      return response.status(204).end();
    }

    // Method not allowed
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("❌ [Favourite API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return response.status(409).json({
        error: "Recipe is already in favorites",
      });
    }

    const statusCode =
      errorMessage.includes("limit") || errorMessage.includes("402")
        ? 402
        : 500;

    return response.status(statusCode).json({
      error: "Internal server error",
      message: errorMessage,
    });
  }
}

