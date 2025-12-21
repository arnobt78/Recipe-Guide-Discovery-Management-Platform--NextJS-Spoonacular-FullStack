/**
 * Consolidated Collections API Handler (Catch-All Route)
 * 
 * Handles all collection-related endpoints using Vercel catch-all routing:
 * - /api/collections → handled when path is empty (GET: list, POST: create)
 * - /api/collections/[collectionId] → handled via path[0] === collectionId, path[1] === undefined
 * - /api/collections/[collectionId]/items → handled via path[0] === collectionId, path[1] === "items"
 * 
 * All original code preserved, consolidated to reduce serverless function count.
 * Frontend calls remain exactly the same - no changes needed.
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";
import { setCorsHeaders, handleCorsPreflight, requireAuth } from "../../lib/api-utils.js";

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

    // Extract path segments from catch-all route
    const pathParam = request.query.path;
    let pathArray: string[] = [];
    
    if (Array.isArray(pathParam)) {
      pathArray = pathParam;
    } else if (typeof pathParam === "string") {
      pathArray = pathParam.split("/").filter(Boolean);
    }
    
    // Fallback: extract from URL if path param not available
    if (pathArray.length === 0 && request.url) {
      try {
        const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
        const segments = url.pathname.split("/").filter(Boolean);
        const collectionsIndex = segments.indexOf("collections");
        if (collectionsIndex !== -1) {
          pathArray = segments.slice(collectionsIndex + 1);
        }
      } catch {
        // URL parsing failed
      }
    }

    // Catch-all route only handles nested paths (not root /api/collections)
    // Root is handled by /api/collections/index.ts
    if (pathArray.length === 0) {
      return response.status(404).json({ error: "Endpoint not found" });
    }

    // Extract collectionId - could be from path array or from dynamic route param
    let collectionId = pathArray[0];
    // Also check if collectionId is in query params (from dynamic route [collectionId])
    if (!collectionId && request.query.collectionId) {
      collectionId = request.query.collectionId as string;
    }
    const subPath = pathArray[1];

    if (!collectionId) {
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
    }

    // Handle /api/collections/[collectionId]/items
    if (subPath === "items") {
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
    }

    // Handle /api/collections/[collectionId] (collection detail operations)
    if (collectionId && !subPath) {
      // GET: Get collection with items
      if (request.method === "GET") {
        const collection = await prisma.recipeCollection.findFirst({
          where: {
            id: collectionId,
            userId, // Ensure user owns the collection
          },
          include: {
            items: {
              orderBy: { order: "asc" },
            },
            _count: {
              select: { items: true },
            },
          },
        });

        if (!collection) {
          return response.status(404).json({ error: "Collection not found" });
        }

        return response.status(200).json({
          ...collection,
          itemCount: collection._count.items,
          createdAt: collection.createdAt.toISOString(),
          updatedAt: collection.updatedAt.toISOString(),
          items: collection.items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
        });
      }

      // PUT: Update collection
      if (request.method === "PUT") {
        const { name, description, color } = request.body;

        const collection = await prisma.recipeCollection.updateMany({
          where: {
            id: collectionId,
            userId, // Ensure user owns the collection
          },
          data: {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description?.trim() }),
            ...(color !== undefined && { color }),
          },
        });

        if (collection.count === 0) {
          return response.status(404).json({ error: "Collection not found" });
        }

        const updated = await prisma.recipeCollection.findUnique({
          where: { id: collectionId },
        });

        return response.status(200).json({
          ...updated,
          createdAt: updated!.createdAt.toISOString(),
          updatedAt: updated!.updatedAt.toISOString(),
        });
      }

      // DELETE: Delete collection
      if (request.method === "DELETE") {
        const deleted = await prisma.recipeCollection.deleteMany({
          where: {
            id: collectionId,
            userId, // Ensure user owns the collection
          },
        });

        if (deleted.count === 0) {
          return response.status(404).json({ error: "Collection not found" });
        }

        return response.status(204).end();
      }

      return response.status(405).json({ error: "Method not allowed" });
    }

    // Path not recognized
    return response.status(404).json({ error: "Endpoint not found" });
  } catch (error) {
    console.error("Error handling collections request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

