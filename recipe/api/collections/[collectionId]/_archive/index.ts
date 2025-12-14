/**
 * Collection Items API Endpoint
 *
 * Handles operations on collection items
 * POST: Add recipe to collection
 * DELETE: Remove recipe from collection
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../../lib/prisma.js";
import { setCorsHeaders, handleCorsPreflight, requireAuth } from "../../../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (handleCorsPreflight(request, response)) {
    return;
  }

  setCorsHeaders(response);

  try {
    const collectionId = request.query.collectionId as string;
    const userId = await requireAuth(request, response);
    if (!userId) {
      return; // Response already sent by requireAuth
    }

    if (!collectionId) {
      return response.status(400).json({ error: "Collection ID is required" });
    }

    // Verify collection belongs to user
    const collection = await prisma.recipeCollection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      return response.status(404).json({ error: "Collection not found" });
    }

    // POST: Add recipe to collection
    if (request.method === "POST") {
      const { recipeId, recipeTitle, recipeImage, order } = request.body;

      if (!recipeId || !recipeTitle) {
        return response.status(400).json({
          error: "Recipe ID and title are required",
        });
      }

      // Get current max order
      const maxOrder = await prisma.collectionItem.findFirst({
        where: { collectionId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const item = await prisma.collectionItem.create({
        data: {
          collectionId,
          recipeId: Number(recipeId),
          recipeTitle: recipeTitle.trim(),
          recipeImage,
          order: order ?? (maxOrder?.order ?? 0) + 1,
        },
      });

      return response.status(201).json({
        ...item,
        createdAt: item.createdAt.toISOString(),
      });
    }

    // DELETE: Remove recipe from collection
    if (request.method === "DELETE") {
      const { recipeId } = request.body;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      const deleted = await prisma.collectionItem.deleteMany({
        where: {
          collectionId,
          recipeId: Number(recipeId),
        },
      });

      if (deleted.count === 0) {
        return response.status(404).json({ error: "Item not found in collection" });
      }

      return response.status(204).end();
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling collection items request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

