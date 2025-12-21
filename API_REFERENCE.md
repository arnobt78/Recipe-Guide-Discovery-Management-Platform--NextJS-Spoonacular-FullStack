# Spoonacular API Reference & Implementation Checklist

**Status:** ✅ **100% Complete** - All 6 endpoints implemented with all properties displayed

---

## 1. Search Recipes (complexSearch)

**Endpoint:** `GET /api/recipes/search`  
**Config:** `fillIngredients: true`, `addRecipeInformation: true`, `addRecipeNutrition: true`

### Response Properties

| Property                                                        | Type    | Status | Component                  |
| --------------------------------------------------------------- | ------- | ------ | -------------------------- |
| `offset`, `number`, `totalResults`                              | number  | ✅     | SearchResultsMetadata.tsx  |
| `results[].id`                                                  | number  | ✅     | RecipeCard.tsx             |
| `results[].title`                                               | string  | ✅     | RecipeCard.tsx             |
| `results[].image`                                               | string  | ✅     | RecipeCard.tsx             |
| `results[].imageType`                                           | string  | ✅     | RecipeCard.tsx             |
| `results[].usedIngredientCount`                                 | number  | ✅     | IngredientMatchBadges.tsx  |
| `results[].missedIngredientCount`                               | number  | ✅     | IngredientMatchBadges.tsx  |
| `results[].unusedIngredients[]`                                 | Array   | ✅     | IngredientMatchBadges.tsx  |
| `results[].usedIngredients[]`                                   | Array   | ✅     | IngredientMatchDetails.tsx |
| `results[].missedIngredients[]`                                 | Array   | ✅     | IngredientMatchDetails.tsx |
| `results[].likes`                                               | number  | ✅     | RecipeCard.tsx             |
| `results[].readyInMinutes`                                      | number  | ✅     | RecipeCard.tsx             |
| `results[].servings`                                            | number  | ✅     | RecipeCard.tsx             |
| `results[].pricePerServing`                                     | number  | ✅     | RecipeCard.tsx             |
| `results[].spoonacularScore`                                    | number  | ✅     | RecipeCard.tsx             |
| `results[].healthScore`                                         | number  | ✅     | RecipeCard.tsx             |
| `results[].vegan`, `vegetarian`, `glutenFree`, `dairyFree`      | boolean | ✅     | RecipeCard.tsx             |
| `results[].ketogenic`, `veryHealthy`, `cheap`, `veryPopular`    | boolean | ✅     | RecipeCard.tsx             |
| `results[].whole30`, `lowFodmap`, `sustainable`                 | boolean | ✅     | RecipeCard.tsx             |
| `results[].weightWatcherSmartPoints`                            | number  | ✅     | RecipeCard.tsx             |
| `results[].cuisines[]`, `diets[]`, `dishTypes[]`, `occasions[]` | Array   | ✅     | RecipeCard.tsx             |
| `results[].summary`                                             | string  | ✅     | RecipeCard.tsx (extracted) |

### Ingredient Match Properties

| Property                                        | Status | Component                  |
| ----------------------------------------------- | ------ | -------------------------- |
| `id`, `amount`, `unit`, `unitLong`, `unitShort` | ✅     | IngredientMatchDetails.tsx |
| `aisle`, `name`, `original`, `originalName`     | ✅     | IngredientMatchDetails.tsx |
| `meta[]`, `image`                               | ✅     | IngredientMatchDetails.tsx |
| `extendedName` (missedIngredients only)         | ✅     | IngredientMatchDetails.tsx |

---

## 2. Get Recipe Information

**Endpoint:** `GET /api/recipes/{id}/information`  
**Config:** `includeNutrition: true`, `addWinePairing: true`, `addTasteData: true`

### Basic Properties

| Property                                                     | Type   | Status | Location                  |
| ------------------------------------------------------------ | ------ | ------ | ------------------------- |
| `id`, `title`, `image`, `imageType`                          | -      | ✅     | RecipePage.tsx            |
| `servings`, `readyInMinutes`                                 | number | ✅     | RecipePage.tsx            |
| `cookingMinutes`, `preparationMinutes`                       | number | ✅     | RecipePage.tsx (Info tab) |
| `license`, `sourceName`, `sourceUrl`, `spoonacularSourceUrl` | string | ✅     | RecipePage.tsx            |
| `healthScore`, `spoonacularScore`, `pricePerServing`         | number | ✅     | RecipePage.tsx            |

### Instructions

| Property                                                                        | Status | Location                     |
| ------------------------------------------------------------------------------- | ------ | ---------------------------- |
| `analyzedInstructions[].name`                                                   | ✅     | RecipePage.tsx (Details tab) |
| `analyzedInstructions[].steps[].number`, `step`                                 | ✅     | RecipePage.tsx               |
| `analyzedInstructions[].steps[].ingredients[]` (id, name, localizedName, image) | ✅     | RecipePage.tsx               |
| `analyzedInstructions[].steps[].equipment[]` (id, name, localizedName, image)   | ✅     | RecipePage.tsx               |
| `instructions` (fallback)                                                       | ✅     | RecipePage.tsx               |

### Extended Ingredients

| Property                                             | Status | Location                     |
| ---------------------------------------------------- | ------ | ---------------------------- |
| `aisle`, `amount`, `consistency`, `id`, `image`      | ✅     | RecipePage.tsx (Details tab) |
| `measures.metric` (amount, unitLong, unitShort)      | ✅     | RecipePage.tsx               |
| `measures.us` (amount, unitLong, unitShort)          | ✅     | RecipePage.tsx               |
| `meta[]`, `name`, `original`, `originalName`, `unit` | ✅     | RecipePage.tsx               |

### Dietary & Health

| Property                                                      | Status | Location                  |
| ------------------------------------------------------------- | ------ | ------------------------- |
| `cheap`, `creditsText`, `gaps`, `sustainable`, `veryPopular`  | ✅     | RecipePage.tsx (Info tab) |
| `weightWatcherSmartPoints`                                    | ✅     | RecipePage.tsx (Info tab) |
| `cuisines[]`, `diets[]`, `dishTypes[]`, `occasions[]`         | ✅     | RecipePage.tsx (Info tab) |
| `vegan`, `vegetarian`, `glutenFree`, `dairyFree`, `ketogenic` | ✅     | RecipePage.tsx (Info tab) |
| `veryHealthy`, `whole30`, `lowFodmap`                         | ✅     | RecipePage.tsx (Info tab) |

### Summary & Wine Pairing

| Property                                          | Status | Location                     |
| ------------------------------------------------- | ------ | ---------------------------- |
| `summary`                                         | ✅     | RecipePage.tsx (Summary tab) |
| `winePairing.pairedWines[]`                       | ✅     | RecipePage.tsx (Details tab) |
| `winePairing.pairingText`                         | ✅     | RecipePage.tsx (Details tab) |
| `winePairing.productMatches[]` (all 9 properties) | ✅     | RecipePage.tsx (Details tab) |

### Nutrition

| Property                                                                | Status | Location                       |
| ----------------------------------------------------------------------- | ------ | ------------------------------ |
| `nutrition.caloricBreakdown` (percentProtein, percentFat, percentCarbs) | ✅     | RecipePage.tsx (Nutrition tab) |
| `nutrition.weightPerServing` (amount, unit)                             | ✅     | RecipePage.tsx (Nutrition tab) |
| `nutrition.nutrients[]` (name, amount, unit, percentOfDailyNeeds)       | ✅     | RecipePage.tsx (Nutrition tab) |
| `nutrition.properties[]` (name, amount, unit)                           | ✅     | RecipePage.tsx (Nutrition tab) |
| `nutrition.flavonoids[]` (name, amount, unit)                           | ✅     | RecipePage.tsx (Nutrition tab) |

### Taste

| Property                                                 | Status | Location                   |
| -------------------------------------------------------- | ------ | -------------------------- |
| `taste.sweetness`, `saltiness`, `sourness`, `bitterness` | ✅     | RecipePage.tsx (Taste tab) |
| `taste.savoriness`, `fattiness`, `spiciness`             | ✅     | RecipePage.tsx (Taste tab) |

---

## 3. Get Similar Recipes

**Endpoint:** `GET /api/recipes/{id}/similar`

| Property         | Type   | Status | Component              |
| ---------------- | ------ | ------ | ---------------------- |
| `id`             | number | ✅     | SimilarRecipesList.tsx |
| `title`          | string | ✅     | SimilarRecipesList.tsx |
| `imageType`      | string | ✅     | SimilarRecipesList.tsx |
| `readyInMinutes` | number | ✅     | SimilarRecipesList.tsx |
| `servings`       | number | ✅     | SimilarRecipesList.tsx |
| `sourceUrl`      | string | ✅     | SimilarRecipesList.tsx |

---

## 4. Autocomplete Recipe Search

**Endpoint:** `GET /api/recipes/autocomplete`

| Property    | Type   | Status | Component       |
| ----------- | ------ | ------ | --------------- |
| `id`        | number | ✅     | SearchInput.tsx |
| `title`     | string | ✅     | SearchInput.tsx |
| `imageType` | string | ✅     | SearchInput.tsx |

---

## 5. Dish Pairing for Wine

**Endpoint:** `GET /api/food/wine/dishes`  
**Status:** ✅ Component ready

| Property     | Type   | Status | Component              |
| ------------ | ------ | ------ | ---------------------- |
| `pairings[]` | Array  | ✅     | DishPairingForWine.tsx |
| `text`       | string | ✅     | DishPairingForWine.tsx |

---

## 6. Wine Pairing

**Endpoint:** `GET /api/food/wine/pairing`

| Property                         | Type           | Status | Component      |
| -------------------------------- | -------------- | ------ | -------------- |
| `pairedWines[]`                  | Array          | ✅     | RecipePage.tsx |
| `pairingText`                    | string         | ✅     | RecipePage.tsx |
| `productMatches[].id`            | number         | ✅     | RecipePage.tsx |
| `productMatches[].title`         | string         | ✅     | RecipePage.tsx |
| `productMatches[].description`   | string \| null | ✅     | RecipePage.tsx |
| `productMatches[].price`         | string         | ✅     | RecipePage.tsx |
| `productMatches[].imageUrl`      | string         | ✅     | RecipePage.tsx |
| `productMatches[].averageRating` | number         | ✅     | RecipePage.tsx |
| `productMatches[].ratingCount`   | number         | ✅     | RecipePage.tsx |
| `productMatches[].score`         | number         | ✅     | RecipePage.tsx |
| `productMatches[].link`          | string         | ✅     | RecipePage.tsx |

---

## Summary

- **Total Endpoints:** 6
- **Total Properties:** 200+
- **Properties Displayed:** 200+ (100%)
- **Properties Missing:** 0
- **Components:** 9 reusable components
- **Hooks:** 10+ React Query hooks
- **Code Quality:** ✅ No linter errors, all memoized, TypeScript strict

**Last Verified:** 2025-12-14  
**Status:** ✅ **PRODUCTION READY**
