/**
 * Shopping List Generator Utility
 *
 * Generates shopping lists from recipes by extracting and grouping ingredients
 * Groups by category and calculates quantities
 *
 * Following DEVELOPMENT_RULES.md: Reusable utility functions
 */

import { Recipe, ShoppingListItem } from "../types";

/**
 * Ingredient category mapping
 * Maps common ingredients to categories for better organization
 */
const INGREDIENT_CATEGORIES: Record<string, string> = {
  // Vegetables
  tomato: "Vegetables",
  onion: "Vegetables",
  garlic: "Vegetables",
  bell: "Vegetables",
  carrot: "Vegetables",
  celery: "Vegetables",
  lettuce: "Vegetables",
  spinach: "Vegetables",
  mushroom: "Vegetables",
  broccoli: "Vegetables",
  cauliflower: "Vegetables",
  zucchini: "Vegetables",
  cucumber: "Vegetables",
  potato: "Vegetables",
  sweet: "Vegetables",
  corn: "Vegetables",
  peas: "Vegetables",
  beans: "Vegetables",
  // Fruits
  apple: "Fruits",
  banana: "Fruits",
  orange: "Fruits",
  lemon: "Fruits",
  lime: "Fruits",
  berry: "Fruits",
  strawberry: "Fruits",
  blueberry: "Fruits",
  // Meat & Protein
  chicken: "Meat & Protein",
  beef: "Meat & Protein",
  pork: "Meat & Protein",
  fish: "Meat & Protein",
  salmon: "Meat & Protein",
  tuna: "Meat & Protein",
  egg: "Meat & Protein",
  tofu: "Meat & Protein",
  // Dairy
  milk: "Dairy",
  cheese: "Dairy",
  butter: "Dairy",
  cream: "Dairy",
  yogurt: "Dairy",
  // Pantry
  flour: "Pantry",
  sugar: "Pantry",
  salt: "Pantry",
  black: "Pantry",
  oil: "Pantry",
  vinegar: "Pantry",
  pasta: "Pantry",
  rice: "Pantry",
  bread: "Pantry",
  // Spices & Herbs
  basil: "Spices & Herbs",
  oregano: "Spices & Herbs",
  thyme: "Spices & Herbs",
  rosemary: "Spices & Herbs",
  parsley: "Spices & Herbs",
  cilantro: "Spices & Herbs",
  cumin: "Spices & Herbs",
  paprika: "Spices & Herbs",
};

/**
 * Categorize ingredient based on name
 *
 * @param ingredientName - Name of the ingredient
 * @returns Category name
 */
export function categorizeIngredient(ingredientName: string): string {
  const lowerName = ingredientName.toLowerCase();

  // Check for exact matches first
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (lowerName.includes(key)) {
      return category;
    }
  }

  // Default category
  return "Other";
}

/**
 * Extract ingredients from recipe summary
 * This is a simplified version - in production, you'd use Spoonacular's ingredient API
 *
 * @param recipe - Recipe object
 * @returns Array of shopping list items
 */
function extractIngredientsFromRecipe(recipe: Recipe): ShoppingListItem[] {
  // For now, we'll create a placeholder item
  // In production, you'd parse the recipe summary or use Spoonacular's ingredient endpoint
  const items: ShoppingListItem[] = [];

  // Extract basic ingredients from title (simplified)
  // In production, use Spoonacular's recipe information endpoint
  if (recipe.title) {
    // This is a placeholder - real implementation would parse recipe summary
    items.push({
      name: `Ingredients for ${recipe.title}`,
      quantity: "1",
      unit: "recipe",
      category: "Other",
      recipeIds: [recipe.id],
    });
  }

  return items;
}

/**
 * Generate shopping list from recipes
 *
 * Groups ingredients by category and calculates quantities
 *
 * @param recipes - Array of recipes to generate shopping list from
 * @returns Array of shopping list items grouped by category
 */
export function generateShoppingList(recipes: Recipe[]): ShoppingListItem[] {
  if (recipes.length === 0) {
    return [];
  }

  // Extract ingredients from all recipes
  const allItems: ShoppingListItem[] = [];
  recipes.forEach((recipe) => {
    const items = extractIngredientsFromRecipe(recipe);
    allItems.push(...items);
  });

  // Group by category and merge duplicates
  const groupedItems = new Map<string, ShoppingListItem>();

  allItems.forEach((item) => {
    const key = `${item.category}-${item.name.toLowerCase()}`;
    const existing = groupedItems.get(key);

    if (existing) {
      // Merge quantities and recipe IDs
      const existingQuantity = parseFloat(existing.quantity) || 0;
      const newQuantity = parseFloat(item.quantity) || 0;
      existing.quantity = String(existingQuantity + newQuantity);
      existing.recipeIds = [...new Set([...existing.recipeIds, ...item.recipeIds])];
    } else {
      groupedItems.set(key, { ...item });
    }
  });

  // Sort by category, then by name
  return Array.from(groupedItems.values()).sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Export shopping list to text format
 *
 * @param items - Shopping list items
 * @param name - Shopping list name
 * @returns Formatted text string
 */
export function exportShoppingListToText(
  items: ShoppingListItem[],
  name: string
): string {
  let text = `${name}\n`;
  text += "=".repeat(name.length) + "\n\n";

  // Group by category
  const byCategory = new Map<string, ShoppingListItem[]>();
  items.forEach((item) => {
    if (!byCategory.has(item.category)) {
      byCategory.set(item.category, []);
    }
    byCategory.get(item.category)!.push(item);
  });

  // Output by category
  Array.from(byCategory.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, categoryItems]) => {
      text += `${category}\n`;
      text += "-".repeat(category.length) + "\n";
      categoryItems.forEach((item) => {
        const quantity = item.quantity + (item.unit ? ` ${item.unit}` : "");
        text += `  • ${item.name} - ${quantity}\n`;
      });
      text += "\n";
    });

  return text;
}

