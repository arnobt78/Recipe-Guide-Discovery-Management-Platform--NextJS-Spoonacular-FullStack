/**
 * Recipe Images API Endpoint
 *
 * Handles CRUD operations for recipe images
 * GET: Get images for a recipe
 * POST: Add image to recipe
 * DELETE: Remove image from recipe
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

    // GET: Get images for a recipe
    if (request.method === "GET") {
      const recipeId = request.query.recipeId as string;

      if (!recipeId) {
        return response.status(400).json({ error: "Recipe ID is required" });
      }

      const images = await prisma.recipeImage.findMany({
        where: {
          userId,
          recipeId: Number(recipeId),
        },
        orderBy: [{ imageType: "asc" }, { order: "asc" }],
      });

      return response.status(200).json(
        images.map((img) => ({
          ...img,
          createdAt: img.createdAt.toISOString(),
          updatedAt: img.updatedAt.toISOString(),
        }))
      );
    }

    // POST: Add image to recipe
    if (request.method === "POST") {
      const { recipeId, imageUrl, imageType, order, caption } = request.body;

      if (!recipeId || !imageUrl || !imageType) {
        return response.status(400).json({
          error: "Recipe ID, image URL, and image type are required",
        });
      }

      // Get max order for this recipe/image type
      const maxOrder = await prisma.recipeImage.findFirst({
        where: {
          userId,
          recipeId: Number(recipeId),
          imageType,
        },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const image = await prisma.recipeImage.create({
        data: {
          userId,
          recipeId: Number(recipeId),
          imageUrl,
          imageType,
          order: order ?? (maxOrder?.order ?? 0) + 1,
          caption: caption?.trim(),
        },
      });

      return response.status(201).json({
        ...image,
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      });
    }

    // DELETE: Remove image
    if (request.method === "DELETE") {
      const { id } = request.body;

      if (!id) {
        return response.status(400).json({ error: "Image ID is required" });
      }

      // Verify ownership
      const existing = await prisma.recipeImage.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return response.status(404).json({ error: "Image not found" });
      }

      await prisma.recipeImage.delete({
        where: { id },
      });

      return response.status(204).end();
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling recipe images request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

