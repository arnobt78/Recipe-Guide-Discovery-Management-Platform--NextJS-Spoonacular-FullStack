/**
 * Meal Planner Component
 *
 * Features:
 * - Weekly meal planning calendar
 * - Drag & drop recipes to days/meals
 * - View meal plan for current week
 * - Add/remove recipes from meal plan
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { startOfWeek, addDays, format } from "date-fns";
import { useMealPlan, useAddMealPlanItem, useRemoveMealPlanItem } from "../hooks/useMealPlan";
import { useFavouriteRecipes } from "../hooks/useRecipes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { MealPlanItem, Recipe } from "../types";
import EmptyState from "./EmptyState";
import SkeletonMealPlanner from "./SkeletonMealPlanner";
import ConfirmationDialog from "./ConfirmationDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import RecipeCard from "./RecipeCard";

// Note: onRecipeClick removed - RecipeCard handles navigation internally via useNavigate
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MealPlannerProps {
  // Empty interface - props removed as RecipeCard handles navigation internally
}

/**
 * Meal Planner Component (Memoized for performance)
 *
 * Weekly meal planning with calendar view
 */
const MealPlanner = memo((_props: MealPlannerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack" | null
  >(null);
  const [addRecipeDialogOpen, setAddRecipeDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<MealPlanItem | null>(null);

  const weekStartISO = useMemo(() => format(currentWeekStart, "yyyy-MM-dd"), [currentWeekStart]);
  const { data: mealPlan, isLoading, error: mealPlanError } = useMealPlan(weekStartISO, true);
  const { data: favouriteRecipes = [], error: favouritesError } = useFavouriteRecipes();
  const addMealPlanItem = useAddMealPlanItem();
  const removeMealPlanItem = useRemoveMealPlanItem();

  // Handle errors with toast notifications
  useEffect(() => {
    if (mealPlanError) {
      toast.error("Failed to load meal plan. Please try again.");
    }
  }, [mealPlanError]);

  useEffect(() => {
    if (favouritesError) {
      toast.error("Failed to load favourite recipes.");
    }
  }, [favouritesError]);

  // Get meals for a specific day
  const getMealsForDay = useCallback(
    (dayOfWeek: number) => {
      if (!mealPlan?.meals) return [];
      return mealPlan.meals.filter((meal) => meal.dayOfWeek === dayOfWeek);
    },
    [mealPlan]
  );

  // Get meals for a specific day and meal type
  const getMealsForDayAndType = useCallback(
    (dayOfWeek: number, mealType: string) => {
      return getMealsForDay(dayOfWeek).filter((meal) => meal.mealType === mealType);
    },
    [getMealsForDay]
  );

  // Week days array (Monday to Sunday)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekStart, i);
      return {
        dayOfWeek: i,
        date,
        dateString: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
      };
    });
  }, [currentWeekStart]);

  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  }, []);

  const handleAddRecipe = useCallback(
    (recipe: Recipe) => {
      if (selectedDay !== null && selectedMealType) {
        addMealPlanItem.mutate(
          {
            weekStart: weekStartISO,
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            recipeImage: recipe.image,
            dayOfWeek: selectedDay!,
            mealType: selectedMealType,
            servings: 1,
          },
          {
            onSuccess: () => {
              setAddRecipeDialogOpen(false);
              setSelectedDay(null);
              setSelectedMealType(null);
            },
          }
        );
      }
    },
    [selectedDay, selectedMealType, weekStartISO, addMealPlanItem]
  );

  const handleRemoveMeal = useCallback(
    (item: MealPlanItem) => {
      setItemToRemove(item);
      setRemoveDialogOpen(true);
    },
    []
  );

  const confirmRemove = useCallback(() => {
    if (itemToRemove) {
      removeMealPlanItem.mutate(
        { itemId: itemToRemove.id, weekStart: weekStartISO },
        {
          onSuccess: () => {
            setRemoveDialogOpen(false);
            setItemToRemove(null);
          },
        }
      );
    }
  }, [itemToRemove, weekStartISO, removeMealPlanItem]);

  const mealTypes: Array<{ value: "breakfast" | "lunch" | "dinner" | "snack"; label: string }> =
    [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
      { value: "snack", label: "Snack" },
    ];

  if (isLoading) {
    return <SkeletonMealPlanner />;
  }

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card className="glow-card border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="gradient-text flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Meal Planner
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousWeek}
                className="glow-button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-4">
                {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextWeek}
                className="glow-button"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <Card key={day.dayOfWeek} className="glow-card border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-center">
                <div>{day.dayName}</div>
                <div className="text-xs text-gray-400">{day.dayNumber}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mealTypes.map((mealType) => {
                const meals = getMealsForDayAndType(day.dayOfWeek, mealType.value);
                return (
                  <div key={mealType.value} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="glow-badge text-xs">
                        {mealType.label}
                      </Badge>
                      <Dialog
                        open={
                          addRecipeDialogOpen &&
                          selectedDay === day.dayOfWeek &&
                          selectedMealType === mealType.value
                        }
                        onOpenChange={(open) => {
                          setAddRecipeDialogOpen(open);
                          if (!open) {
                            setSelectedDay(null);
                            setSelectedMealType(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              setSelectedDay(day.dayOfWeek);
                              setSelectedMealType(mealType.value);
                              setAddRecipeDialogOpen(true);
                            }}
                            aria-label={`Add recipe to ${mealType.label} on ${day.dayName}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
                          <DialogHeader>
                            <DialogTitle>Add Recipe to {mealType.label}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {favouriteRecipes.length === 0 ? (
                              <EmptyState message="No favourite recipes. Add some from the search tab!" />
                            ) : (
                              favouriteRecipes.map((recipe) => (
                                <RecipeCard
                                  key={recipe.id}
                                  recipe={recipe}
                                  isFavourite={true}
                                  onClick={() => {
                                    handleAddRecipe(recipe);
                                  }}
                                  onFavouriteButtonClick={() => {}}
                                />
                              ))
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <AnimatePresence>
                      {meals.map((meal) => (
                        <motion.div
                          key={meal.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="relative group"
                        >
                          <Card className="glow-card border-purple-500/20 p-2">
                            <div className="flex items-start gap-2">
                              {meal.recipeImage && (
                                <img
                                  src={meal.recipeImage}
                                  alt={meal.recipeTitle}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{meal.recipeTitle}</p>
                                {meal.servings > 1 && (
                                  <p className="text-xs text-gray-400">{meal.servings} servings</p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveMeal(meal)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Remove Confirmation Dialog */}
      <ConfirmationDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={confirmRemove}
        title="Remove Recipe from Meal Plan"
        description={`Are you sure you want to remove "${itemToRemove?.recipeTitle}" from your meal plan?`}
      />
    </div>
  );
});

MealPlanner.displayName = "MealPlanner";

export default MealPlanner;

