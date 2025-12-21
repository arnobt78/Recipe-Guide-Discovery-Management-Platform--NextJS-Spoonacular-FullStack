/**
 * Image Utility Functions
 * 
 * Reusable functions for constructing image URLs from Spoonacular API
 * Following DEVELOPMENT_RULES.md: Centralized utilities, no code duplication
 */

/**
 * Construct recipe image URL from recipe ID and imageType
 * Per SPOONACULAR_API_DOCS.md: https://img.spoonacular.com/recipes/{id}-312x231.{imageType}
 * 
 * @param recipeId - Recipe ID
 * @param imageType - Image type (jpg, png, etc.)
 * @returns Image URL string
 */
export function getRecipeImageUrl(recipeId: number, imageType: string): string {
  return `https://img.spoonacular.com/recipes/${recipeId}-312x231.${imageType}`;
}

/**
 * Get full-size recipe image URL (556x370)
 * Per SPOONACULAR_API_DOCS.md: https://img.spoonacular.com/recipes/{id}-556x370.{imageType}
 * 
 * @param recipeId - Recipe ID
 * @param imageType - Image type (jpg, png, etc.)
 * @returns Image URL string
 */
export function getRecipeImageUrlFull(recipeId: number, imageType: string): string {
  return `https://img.spoonacular.com/recipes/${recipeId}-556x370.${imageType}`;
}

/**
 * Get ingredient image URL
 * Per SPOONACULAR_API_DOCS.md: https://img.spoonacular.com/cdn/ingredients_100x100/{image}
 * 
 * @param imageName - Image filename from ingredient data
 * @returns Image URL string
 */
export function getIngredientImageUrl(imageName: string): string {
  return `https://img.spoonacular.com/cdn/ingredients_100x100/${imageName}`;
}

/**
 * Get equipment image URL
 * Per SPOONACULAR_API_DOCS.md: https://img.spoonacular.com/cdn/equipment_100x100/{image}
 * 
 * @param imageName - Image filename from equipment data
 * @returns Image URL string
 */
export function getEquipmentImageUrl(imageName: string): string {
  return `https://img.spoonacular.com/cdn/equipment_100x100/${imageName}`;
}

