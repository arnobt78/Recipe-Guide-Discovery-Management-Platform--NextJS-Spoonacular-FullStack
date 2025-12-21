/**
 * Shopping List API Endpoint
 *
 * Handles CRUD operations for shopping lists
 * GET: Get all shopping lists for user
 * POST: Create shopping list from recipes
 * PUT: Update shopping list (mark complete, update items)
 * DELETE: Delete shopping list
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";
import { setCorsHeaders, handleCorsPreflight, requireAuth } from "../../lib/api-utils.js";

// Type definition for shopping list items (matches src/types.ts)
interface ShoppingListItem {
  name: string;
  quantity: string;
  unit?: string;
  category: string;
  recipeIds: number[];
  checked?: boolean;
}

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

    // GET: Get all shopping lists
    if (request.method === "GET") {
      const shoppingLists = await prisma.shoppingList.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return response.status(200).json(
        shoppingLists.map((list) => ({
          ...list,
          items: typeof list.items === "string" ? JSON.parse(list.items) : list.items,
          createdAt: list.createdAt.toISOString(),
          updatedAt: list.updatedAt.toISOString(),
        }))
      );
    }

    // POST: Create shopping list
    if (request.method === "POST") {
      const { name, recipeIds, items } = request.body;

      if (!name || !recipeIds || !Array.isArray(recipeIds) || !items) {
        return response.status(400).json({
          error: "Name, recipe IDs array, and items are required",
        });
      }

      const shoppingList = await prisma.shoppingList.create({
        data: {
          userId,
          name: name.trim(),
          recipeIds: recipeIds.map((id: number) => Number(id)),
          items: items,
        },
      });

      return response.status(201).json({
        ...shoppingList,
        items: typeof shoppingList.items === "string" ? JSON.parse(shoppingList.items) : shoppingList.items,
        createdAt: shoppingList.createdAt.toISOString(),
        updatedAt: shoppingList.updatedAt.toISOString(),
      });
    }

    // PUT: Update shopping list
    if (request.method === "PUT") {
      const { id, name, items, isCompleted } = request.body;

      if (!id) {
        return response.status(400).json({ error: "Shopping list ID is required" });
      }

      // Verify ownership
      const existing = await prisma.shoppingList.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return response.status(404).json({ error: "Shopping list not found" });
      }

      const updates: {
        name?: string;
        items?: ShoppingListItem[];
        isCompleted?: boolean;
      } = {};
      if (name !== undefined) updates.name = name.trim();
      if (items !== undefined) updates.items = items;
      if (isCompleted !== undefined) updates.isCompleted = isCompleted;

      const updated = await prisma.shoppingList.update({
        where: { id },
        data: updates,
      });

      return response.status(200).json({
        ...updated,
        items: typeof updated.items === "string" ? JSON.parse(updated.items) : updated.items,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    // DELETE: Delete shopping list
    if (request.method === "DELETE") {
      const { id } = request.body;

      if (!id) {
        return response.status(400).json({ error: "Shopping list ID is required" });
      }

      // Verify ownership
      const existing = await prisma.shoppingList.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return response.status(404).json({ error: "Shopping list not found" });
      }

      await prisma.shoppingList.delete({
        where: { id },
      });

      return response.status(204).end();
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling shopping list request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

