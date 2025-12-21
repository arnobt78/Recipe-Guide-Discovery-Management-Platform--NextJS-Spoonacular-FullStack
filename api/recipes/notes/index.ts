/**
 * Recipe Notes API Endpoint
 *
 * Handles CRUD operations for user recipe notes
 * GET: Get note for a recipe (by recipeId)
 * POST: Create or update note for a recipe
 * DELETE: Delete note for a recipe
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../lib/prisma.js";
import { setCorsHeaders, handleCorsPreflight, requireAuth } from "../../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (handleCorsPreflight(request, response)) {
    return;
  }

  setCorsHeaders(response);

  try {
    const userId = await requireAuth(request, response);
    if (!userId) {
      return; // Response already sent by requireAuth
    }

    // GET: Get note for a recipe
    if (request.method === "GET") {
      const recipeId = request.query.recipeId as string;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      const note = await prisma.recipeNote.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId: Number(recipeId),
          },
        },
      });

      if (!note) {
        return response.status(404).json({ error: "Note not found" });
      }

      return response.status(200).json({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      });
    }

    // POST: Create or update note
    if (request.method === "POST") {
      const { recipeId, title, content, rating, tags } = request.body;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      if (!content || !content.trim()) {
        return response.status(400).json({ error: "Note content is required" });
      }

      // Validate rating if provided
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return response.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const note = await prisma.recipeNote.upsert({
        where: {
          userId_recipeId: {
            userId,
            recipeId: Number(recipeId),
          },
        },
        update: {
          title: title?.trim(),
          content: content.trim(),
          rating,
          tags: tags || [],
        },
        create: {
          userId,
          recipeId: Number(recipeId),
          title: title?.trim(),
          content: content.trim(),
          rating,
          tags: tags || [],
        },
      });

      return response.status(200).json({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      });
    }

    // DELETE: Delete note
    if (request.method === "DELETE") {
      const { recipeId } = request.body;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      const deleted = await prisma.recipeNote.deleteMany({
        where: {
          userId,
          recipeId: Number(recipeId),
        },
      });

      if (deleted.count === 0) {
        return response.status(404).json({ error: "Note not found" });
      }

      return response.status(204).end();
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling recipe notes request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

