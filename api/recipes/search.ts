/**
 * Recipe Search Endpoint
 * 
 * Handles: /api/recipes/search
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { searchRecipes } from "../../lib/recipe-api.js";
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
    const searchTerm = (request.query.searchTerm as string) || "";
    const page = parseInt((request.query.page as string) || "0", 10);

    // Extract optional search parameters (comprehensive support for all API parameters)
    const searchOptions: Parameters<typeof searchRecipes>[2] = {
      fillIngredients: request.query.fillIngredients === "true",
      addRecipeInformation: request.query.addRecipeInformation === "true",
      addRecipeInstructions: request.query.addRecipeInstructions === "true",
      addRecipeNutrition: request.query.addRecipeNutrition === "true",
      cuisine: request.query.cuisine as string | undefined,
      excludeCuisine: request.query.excludeCuisine as string | undefined,
      diet: request.query.diet as string | undefined,
      intolerances: request.query.intolerances as string | undefined,
      equipment: request.query.equipment as string | undefined,
      includeIngredients: request.query.includeIngredients as string | undefined,
      excludeIngredients: request.query.excludeIngredients as string | undefined,
      type: request.query.type as string | undefined,
      instructionsRequired: request.query.instructionsRequired === "true",
      maxReadyTime: request.query.maxReadyTime
        ? parseInt(request.query.maxReadyTime as string, 10)
        : undefined,
      minServings: request.query.minServings
        ? parseInt(request.query.minServings as string, 10)
        : undefined,
      maxServings: request.query.maxServings
        ? parseInt(request.query.maxServings as string, 10)
        : undefined,
      ignorePantry: request.query.ignorePantry === "true",
      sort: request.query.sort as string | undefined,
      sortDirection: request.query.sortDirection as "asc" | "desc" | undefined,
      minCalories: request.query.minCalories
        ? parseInt(request.query.minCalories as string, 10)
        : undefined,
      maxCalories: request.query.maxCalories
        ? parseInt(request.query.maxCalories as string, 10)
        : undefined,
      minProtein: request.query.minProtein
        ? parseInt(request.query.minProtein as string, 10)
        : undefined,
      maxProtein: request.query.maxProtein
        ? parseInt(request.query.maxProtein as string, 10)
        : undefined,
      minCarbs: request.query.minCarbs
        ? parseInt(request.query.minCarbs as string, 10)
        : undefined,
      maxCarbs: request.query.maxCarbs
        ? parseInt(request.query.maxCarbs as string, 10)
        : undefined,
      minFat: request.query.minFat
        ? parseInt(request.query.minFat as string, 10)
        : undefined,
      maxFat: request.query.maxFat
        ? parseInt(request.query.maxFat as string, 10)
        : undefined,
      minAlcohol: request.query.minAlcohol
        ? parseInt(request.query.minAlcohol as string, 10)
        : undefined,
      maxAlcohol: request.query.maxAlcohol
        ? parseInt(request.query.maxAlcohol as string, 10)
        : undefined,
      minCaffeine: request.query.minCaffeine
        ? parseInt(request.query.minCaffeine as string, 10)
        : undefined,
      maxCaffeine: request.query.maxCaffeine
        ? parseInt(request.query.maxCaffeine as string, 10)
        : undefined,
      minCopper: request.query.minCopper
        ? parseInt(request.query.minCopper as string, 10)
        : undefined,
      maxCopper: request.query.maxCopper
        ? parseInt(request.query.maxCopper as string, 10)
        : undefined,
      minCalcium: request.query.minCalcium
        ? parseInt(request.query.minCalcium as string, 10)
        : undefined,
      maxCalcium: request.query.maxCalcium
        ? parseInt(request.query.maxCalcium as string, 10)
        : undefined,
      minCholine: request.query.minCholine
        ? parseInt(request.query.minCholine as string, 10)
        : undefined,
      maxCholine: request.query.maxCholine
        ? parseInt(request.query.maxCholine as string, 10)
        : undefined,
      minCholesterol: request.query.minCholesterol
        ? parseInt(request.query.minCholesterol as string, 10)
        : undefined,
      maxCholesterol: request.query.maxCholesterol
        ? parseInt(request.query.maxCholesterol as string, 10)
        : undefined,
      minFluoride: request.query.minFluoride
        ? parseInt(request.query.minFluoride as string, 10)
        : undefined,
      maxFluoride: request.query.maxFluoride
        ? parseInt(request.query.maxFluoride as string, 10)
        : undefined,
      minSaturatedFat: request.query.minSaturatedFat
        ? parseInt(request.query.minSaturatedFat as string, 10)
        : undefined,
      maxSaturatedFat: request.query.maxSaturatedFat
        ? parseInt(request.query.maxSaturatedFat as string, 10)
        : undefined,
      minVitaminA: request.query.minVitaminA
        ? parseInt(request.query.minVitaminA as string, 10)
        : undefined,
      maxVitaminA: request.query.maxVitaminA
        ? parseInt(request.query.maxVitaminA as string, 10)
        : undefined,
      minVitaminC: request.query.minVitaminC
        ? parseInt(request.query.minVitaminC as string, 10)
        : undefined,
      maxVitaminC: request.query.maxVitaminC
        ? parseInt(request.query.maxVitaminC as string, 10)
        : undefined,
      minVitaminD: request.query.minVitaminD
        ? parseInt(request.query.minVitaminD as string, 10)
        : undefined,
      maxVitaminD: request.query.maxVitaminD
        ? parseInt(request.query.maxVitaminD as string, 10)
        : undefined,
      minVitaminE: request.query.minVitaminE
        ? parseInt(request.query.minVitaminE as string, 10)
        : undefined,
      maxVitaminE: request.query.maxVitaminE
        ? parseInt(request.query.maxVitaminE as string, 10)
        : undefined,
      minVitaminK: request.query.minVitaminK
        ? parseInt(request.query.minVitaminK as string, 10)
        : undefined,
      maxVitaminK: request.query.maxVitaminK
        ? parseInt(request.query.maxVitaminK as string, 10)
        : undefined,
      minVitaminB1: request.query.minVitaminB1
        ? parseInt(request.query.minVitaminB1 as string, 10)
        : undefined,
      maxVitaminB1: request.query.maxVitaminB1
        ? parseInt(request.query.maxVitaminB1 as string, 10)
        : undefined,
      minVitaminB2: request.query.minVitaminB2
        ? parseInt(request.query.minVitaminB2 as string, 10)
        : undefined,
      maxVitaminB2: request.query.maxVitaminB2
        ? parseInt(request.query.maxVitaminB2 as string, 10)
        : undefined,
      minVitaminB5: request.query.minVitaminB5
        ? parseInt(request.query.minVitaminB5 as string, 10)
        : undefined,
      maxVitaminB5: request.query.maxVitaminB5
        ? parseInt(request.query.maxVitaminB5 as string, 10)
        : undefined,
      minVitaminB3: request.query.minVitaminB3
        ? parseInt(request.query.minVitaminB3 as string, 10)
        : undefined,
      maxVitaminB3: request.query.maxVitaminB3
        ? parseInt(request.query.maxVitaminB3 as string, 10)
        : undefined,
      minVitaminB6: request.query.minVitaminB6
        ? parseInt(request.query.minVitaminB6 as string, 10)
        : undefined,
      maxVitaminB6: request.query.maxVitaminB6
        ? parseInt(request.query.maxVitaminB6 as string, 10)
        : undefined,
      minVitaminB12: request.query.minVitaminB12
        ? parseInt(request.query.minVitaminB12 as string, 10)
        : undefined,
      maxVitaminB12: request.query.maxVitaminB12
        ? parseInt(request.query.maxVitaminB12 as string, 10)
        : undefined,
      minFiber: request.query.minFiber
        ? parseInt(request.query.minFiber as string, 10)
        : undefined,
      maxFiber: request.query.maxFiber
        ? parseInt(request.query.maxFiber as string, 10)
        : undefined,
      minFolate: request.query.minFolate
        ? parseInt(request.query.minFolate as string, 10)
        : undefined,
      maxFolate: request.query.maxFolate
        ? parseInt(request.query.maxFolate as string, 10)
        : undefined,
      minFolicAcid: request.query.minFolicAcid
        ? parseInt(request.query.minFolicAcid as string, 10)
        : undefined,
      maxFolicAcid: request.query.maxFolicAcid
        ? parseInt(request.query.maxFolicAcid as string, 10)
        : undefined,
      minIodine: request.query.minIodine
        ? parseInt(request.query.minIodine as string, 10)
        : undefined,
      maxIodine: request.query.maxIodine
        ? parseInt(request.query.maxIodine as string, 10)
        : undefined,
      minIron: request.query.minIron
        ? parseInt(request.query.minIron as string, 10)
        : undefined,
      maxIron: request.query.maxIron
        ? parseInt(request.query.maxIron as string, 10)
        : undefined,
      minMagnesium: request.query.minMagnesium
        ? parseInt(request.query.minMagnesium as string, 10)
        : undefined,
      maxMagnesium: request.query.maxMagnesium
        ? parseInt(request.query.maxMagnesium as string, 10)
        : undefined,
      minManganese: request.query.minManganese
        ? parseInt(request.query.minManganese as string, 10)
        : undefined,
      maxManganese: request.query.maxManganese
        ? parseInt(request.query.maxManganese as string, 10)
        : undefined,
      minPhosphorus: request.query.minPhosphorus
        ? parseInt(request.query.minPhosphorus as string, 10)
        : undefined,
      maxPhosphorus: request.query.maxPhosphorus
        ? parseInt(request.query.maxPhosphorus as string, 10)
        : undefined,
      minPotassium: request.query.minPotassium
        ? parseInt(request.query.minPotassium as string, 10)
        : undefined,
      maxPotassium: request.query.maxPotassium
        ? parseInt(request.query.maxPotassium as string, 10)
        : undefined,
      minSelenium: request.query.minSelenium
        ? parseInt(request.query.minSelenium as string, 10)
        : undefined,
      maxSelenium: request.query.maxSelenium
        ? parseInt(request.query.maxSelenium as string, 10)
        : undefined,
      minSodium: request.query.minSodium
        ? parseInt(request.query.minSodium as string, 10)
        : undefined,
      maxSodium: request.query.maxSodium
        ? parseInt(request.query.maxSodium as string, 10)
        : undefined,
      minSugar: request.query.minSugar
        ? parseInt(request.query.minSugar as string, 10)
        : undefined,
      maxSugar: request.query.maxSugar
        ? parseInt(request.query.maxSugar as string, 10)
        : undefined,
      minZinc: request.query.minZinc
        ? parseInt(request.query.minZinc as string, 10)
        : undefined,
      maxZinc: request.query.maxZinc
        ? parseInt(request.query.maxZinc as string, 10)
        : undefined,
      author: request.query.author as string | undefined,
      tags: request.query.tags as string | undefined,
      recipeBoxId: request.query.recipeBoxId
        ? parseInt(request.query.recipeBoxId as string, 10)
        : undefined,
      titleMatch: request.query.titleMatch as string | undefined,
    };

    // Remove undefined values
    const cleanOptions = Object.fromEntries(
      Object.entries(searchOptions).filter(([_, v]) => v !== undefined)
    );

    const results = await searchRecipes(
      searchTerm,
      page,
      Object.keys(cleanOptions).length > 0 ? cleanOptions : undefined
    );

    return response.status(200).json(results);
  } catch (error) {
    console.error("❌ [Search API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;
    return response.status(statusCode).json({
      error: "Internal server error",
      message: errorMessage,
    });
  }
}

