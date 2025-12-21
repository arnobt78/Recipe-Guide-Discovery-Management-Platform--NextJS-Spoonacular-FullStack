/**
 * Collections API Endpoint
 *
 * Handles CRUD operations for user recipe collections
 * GET: Get all collections for authenticated user
 * POST: Create a new collection
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";
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
    // Authenticate request (JWT token or x-user-id header)
    const userId = await requireAuth(request, response);
    if (!userId) {
      return; // Response already sent by requireAuth
    }

    // GET: Get all collections for user
    if (request.method === "GET") {
      const collections = await prisma.recipeCollection.findMany({
        where: { userId },
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const collectionsWithCount = collections.map((collection) => ({
        ...collection,
        itemCount: collection._count.items,
        createdAt: collection.createdAt.toISOString(),
        updatedAt: collection.updatedAt.toISOString(),
      }));

      return response.status(200).json(collectionsWithCount);
    }

    // POST: Create new collection
    if (request.method === "POST") {
      const { name, description, color } = request.body;

      if (!name || !name.trim()) {
        return response.status(400).json({ error: "Collection name is required" });
      }

      const collection = await prisma.recipeCollection.create({
        data: {
          userId,
          name: name.trim(),
          description: description?.trim(),
          color,
        },
      });

      return response.status(201).json({
        ...collection,
        createdAt: collection.createdAt.toISOString(),
        updatedAt: collection.updatedAt.toISOString(),
      });
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling collections request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

