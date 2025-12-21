/**
 * Vercel Serverless Function: /api/recipes/favourite
 * 
 * Handle favorite recipes operations:
 * - POST: Add a recipe to favorites (requires authentication)
 * - GET: Get all favorite recipes (requires authentication)
 * - DELETE: Remove a recipe from favorites (requires authentication)
 * 
 * @param request - Vercel request object
 * @returns JSON response based on operation
 */

// Load environment variables first
import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";
import { getFavouriteRecipesByIDs } from "../../lib/recipe-api.js";
import { setCorsHeaders, handleCorsPreflight, requireAuth } from "../../lib/api-utils.js";

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
      // Require authentication for adding favourites
      const userId = await requireAuth(request, response);
      if (!userId) {
        return; // requireAuth already sent the response
      }

      const { recipeId } = request.body;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      // Check if recipe is already favourited by this user
      // Unique constraint is on (recipeId, userId), so we check both
      const existing = await prisma.favouriteRecipes.findUnique({
        where: {
          recipeId_userId: {
            recipeId: Number(recipeId),
            userId: userId,
          },
        },
      });

      // If already favourited by this user, return conflict
      if (existing) {
        return response.status(409).json({ 
          error: "Recipe is already in favorites" 
        });
      }

      // Create favourite with userId (for authenticated users)
      // Prisma will handle createdAt/updatedAt automatically if columns exist
      // If columns don't exist, we'll get an error which we'll handle
      try {
        const favouriteRecipe = await prisma.favouriteRecipes.create({
          data: {
            recipeId: Number(recipeId),
            userId: userId, // Link to authenticated user
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
        // If error is about missing createdAt column, try without it
        if (error.message.includes("createdAt") || error.message.includes("does not exist")) {
          console.warn("⚠️ [Favourite API] Database schema mismatch - createdAt column missing. Attempting workaround...");
          
          // Try using raw SQL as fallback (if database doesn't have createdAt)
          // For now, return a helpful error message
          return response.status(500).json({
            error: "Database schema needs migration",
            message: "Please run: npx prisma migrate deploy or npx prisma db push",
            details: error.message,
          });
        }
        throw createError;
      }
    }

    // GET: Get all favorite recipes
    if (request.method === "GET") {
      // Require authentication to get user's favourites
      const userId = await requireAuth(request, response);
      if (!userId) {
        return; // requireAuth already sent the response
      }

      // Get only this user's favourites
      const recipes = await prisma.favouriteRecipes.findMany({
        where: {
          userId: userId,
        },
        select: {
          recipeId: true,
        },
      });
      const recipeIds = recipes.map((recipe) => recipe.recipeId.toString());

      // If no favorites, return empty results
      if (recipeIds.length === 0) {
        return response.status(200).json({ results: [] });
      }

      // Try to get recipe details from Spoonacular API
      // If API limit is reached, still return the recipe IDs so favourites are visible
      try {
        const favourites = await getFavouriteRecipesByIDs(recipeIds);
        return response.status(200).json(favourites);
      } catch (apiError: unknown) {
        // If Spoonacular API fails (e.g., daily limit reached), 
        // return the recipe IDs from database so favourites are still visible
        const error = apiError as { code?: number; message?: string };
        const isApiLimitError = error?.code === 402 || 
                                error?.message?.includes("points limit") ||
                                error?.message?.includes("daily limit");
        
        if (isApiLimitError) {
          console.warn("⚠️ [Favourite API] Spoonacular API daily limit reached. Favourites exist in database but details unavailable.");
          
          // Return recipe IDs with minimal info so user knows favourites are saved
          return response.status(200).json({
            results: recipeIds.map(id => ({
              id: parseInt(id),
              title: `Recipe #${id} (Details unavailable - API limit reached)`,
              image: null,
              _apiUnavailable: true, // Flag to indicate we couldn't fetch full details
            })),
            _message: "Your favourites are saved, but recipe details are temporarily unavailable due to API daily limit. They will appear once the limit resets."
          });
        }
        
        // For other API errors, re-throw to be handled by outer catch block
        throw apiError;
      }
    }

    // DELETE: Remove favorite recipe
    if (request.method === "DELETE") {
      // Require authentication for removing favourites
      const userId = await requireAuth(request, response);
      if (!userId) {
        return; // requireAuth already sent the response
      }

      const { recipeId } = request.body;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      // Delete only if it belongs to this user
      // Use delete with unique constraint
      try {
        await prisma.favouriteRecipes.delete({
          where: {
            recipeId_userId: {
              recipeId: Number(recipeId),
              userId: userId,
            },
          },
        });
      } catch (deleteError: unknown) {
        // If not found, that's okay (idempotent operation)
        const error = deleteError as { code?: string };
        if (error.code !== "P2025") {
          // P2025 is "Record not found" - that's fine
          throw deleteError;
        }
      }

      return response.status(204).end();
    }

    // Method not allowed
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("❌ [Favourite API] Error handling favourite request:");
    console.error("❌ [Favourite API] Error type:", error?.constructor?.name);
    console.error("❌ [Favourite API] Error message:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error("❌ [Favourite API] Error stack:", error.stack);
      
      // Check for Prisma-specific errors
      if (error.message.includes("Authentication failed")) {
        console.error("❌ [Favourite API] DATABASE CONNECTION ERROR!");
        console.error("❌ [Favourite API] DATABASE_URL is:", process.env.DATABASE_URL ? "SET" : "NOT SET");
        if (process.env.DATABASE_URL) {
          console.error("❌ [Favourite API] DATABASE_URL length:", process.env.DATABASE_URL.length);
          console.error("❌ [Favourite API] DATABASE_URL preview:", process.env.DATABASE_URL.substring(0, 50) + "...");
        }
      }
    }
    
    // Handle Prisma unique constraint error (recipe already favorited)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return response.status(409).json({ 
        error: "Recipe is already in favorites" 
      });
    }

    return response.status(500).json({ 
      error: "Oops, something went wrong",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
