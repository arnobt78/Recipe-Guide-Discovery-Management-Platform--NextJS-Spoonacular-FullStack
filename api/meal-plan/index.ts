/**
 * Meal Plan API Endpoint
 *
 * Handles CRUD operations for user meal plans
 * GET: Get meal plan for a week
 * POST: Create or update meal plan
 * DELETE: Remove meal plan item
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

    // GET: Get meal plan for a week
    if (request.method === "GET") {
      const weekStart = request.query.weekStart as string;

      if (!weekStart) {
        return response.status(400).json({ error: "Week start date is required" });
      }

      const mealPlan = await prisma.mealPlan.findUnique({
        where: {
          userId_weekStart: {
            userId,
            weekStart: new Date(weekStart),
          },
        },
        include: {
          meals: {
            orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }, { order: "asc" }],
          },
        },
      });

      if (!mealPlan) {
        return response.status(404).json({ error: "Meal plan not found" });
      }

      return response.status(200).json({
        ...mealPlan,
        weekStart: mealPlan.weekStart.toISOString(),
        createdAt: mealPlan.createdAt.toISOString(),
        updatedAt: mealPlan.updatedAt.toISOString(),
        meals: mealPlan.meals.map((meal) => ({
          ...meal,
          createdAt: meal.createdAt.toISOString(),
        })),
      });
    }

    // POST: Create or update meal plan item
    if (request.method === "POST") {
      const { weekStart, recipeId, recipeTitle, recipeImage, dayOfWeek, mealType, servings } =
        request.body;

      if (
        !weekStart ||
        recipeId === undefined ||
        !recipeTitle ||
        dayOfWeek === undefined ||
        !mealType
      ) {
        return response.status(400).json({
          error: "Week start, recipe ID, recipe title, day of week, and meal type are required",
        });
      }

      // Get or create meal plan
      const mealPlan = await prisma.mealPlan.upsert({
        where: {
          userId_weekStart: {
            userId,
            weekStart: new Date(weekStart),
          },
        },
        create: {
          userId,
          weekStart: new Date(weekStart),
        },
        update: {},
      });

      // Get max order for this day/meal type
      const maxOrder = await prisma.mealPlanItem.findFirst({
        where: {
          mealPlanId: mealPlan.id,
          dayOfWeek,
          mealType,
        },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      // Create meal plan item
      const mealItem = await prisma.mealPlanItem.create({
        data: {
          mealPlanId: mealPlan.id,
          recipeId: Number(recipeId),
          recipeTitle: recipeTitle.trim(),
          recipeImage,
          dayOfWeek: Number(dayOfWeek),
          mealType,
          servings: servings || 1,
          order: (maxOrder?.order ?? 0) + 1,
        },
      });

      return response.status(201).json({
        ...mealItem,
        createdAt: mealItem.createdAt.toISOString(),
      });
    }

    // DELETE: Remove meal plan item
    if (request.method === "DELETE") {
      const { itemId } = request.body;

      if (!itemId) {
        return response.status(400).json({ error: "Item ID is required" });
      }

      // Verify item belongs to user's meal plan
      const item = await prisma.mealPlanItem.findUnique({
        where: { id: itemId },
        include: { mealPlan: true },
      });

      if (!item || item.mealPlan.userId !== userId) {
        return response.status(404).json({ error: "Meal plan item not found" });
      }

      await prisma.mealPlanItem.delete({
        where: { id: itemId },
      });

      return response.status(204).end();
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling meal plan request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

