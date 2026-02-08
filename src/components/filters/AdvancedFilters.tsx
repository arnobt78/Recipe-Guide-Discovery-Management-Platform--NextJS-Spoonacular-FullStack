/**
 * Advanced Filters Component
 *
 * Features:
 * - Comprehensive recipe filtering (diet, cuisine, meal type, time, nutrition)
 * - Real-time filter application
 * - AI-powered filter suggestions based on preferences
 * - Save/load filter presets
 * - Visual filter badges
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import {
  Filter,
  X,
  Sparkles,
  SlidersHorizontal,
  Clock,
  UtensilsCrossed,
  Apple,
  Flame,
  Loader2,
} from "lucide-react";
import { AdvancedFilterOptions } from "../../types";
import { toast } from "sonner";
import FilterPresets from "./FilterPresets";

interface AdvancedFiltersProps {
  filters: AdvancedFilterOptions;
  onFiltersChange: (filters: AdvancedFilterOptions) => void;
  onApplyFilters: () => void;
  isSearching?: boolean;
  className?: string;
}

/**
 * Diet options for filtering
 */
const DIET_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten free", label: "Gluten Free" },
  { value: "ketogenic", label: "Ketogenic" },
  { value: "paleo", label: "Paleo" },
  { value: "primal", label: "Primal" },
  { value: "whole30", label: "Whole30" },
  { value: "pescetarian", label: "Pescetarian" },
];

/**
 * Cuisine options for filtering
 */
const CUISINE_OPTIONS = [
  { value: "african", label: "African" },
  { value: "american", label: "American" },
  { value: "british", label: "British" },
  { value: "cajun", label: "Cajun" },
  { value: "caribbean", label: "Caribbean" },
  { value: "chinese", label: "Chinese" },
  { value: "eastern european", label: "Eastern European" },
  { value: "european", label: "European" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "greek", label: "Greek" },
  { value: "indian", label: "Indian" },
  { value: "irish", label: "Irish" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "jewish", label: "Jewish" },
  { value: "korean", label: "Korean" },
  { value: "latin american", label: "Latin American" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "mexican", label: "Mexican" },
  { value: "middle eastern", label: "Middle Eastern" },
  { value: "nordic", label: "Nordic" },
  { value: "southern", label: "Southern" },
  { value: "spanish", label: "Spanish" },
  { value: "thai", label: "Thai" },
  { value: "vietnamese", label: "Vietnamese" },
];

/**
 * Meal type options
 */
const MEAL_TYPE_OPTIONS = [
  { value: "main course", label: "Main Course" },
  { value: "side dish", label: "Side Dish" },
  { value: "dessert", label: "Dessert" },
  { value: "appetizer", label: "Appetizer" },
  { value: "salad", label: "Salad" },
  { value: "bread", label: "Bread" },
  { value: "breakfast", label: "Breakfast" },
  { value: "soup", label: "Soup" },
  { value: "beverage", label: "Beverage" },
  { value: "sauce", label: "Sauce" },
  { value: "marinade", label: "Marinade" },
  { value: "fingerfood", label: "Finger Food" },
  { value: "snack", label: "Snack" },
  { value: "drink", label: "Drink" },
];

/**
 * Intolerance options
 */
const INTOLERANCE_OPTIONS = [
  { value: "dairy", label: "Dairy" },
  { value: "egg", label: "Egg" },
  { value: "gluten", label: "Gluten" },
  { value: "grain", label: "Grain" },
  { value: "peanut", label: "Peanut" },
  { value: "seafood", label: "Seafood" },
  { value: "sesame", label: "Sesame" },
  { value: "shellfish", label: "Shellfish" },
  { value: "soy", label: "Soy" },
  { value: "sulfite", label: "Sulfite" },
  { value: "tree nut", label: "Tree Nut" },
  { value: "wheat", label: "Wheat" },
];

/**
 * Advanced Filters Component (Memoized for performance)
 *
 * Comprehensive recipe filtering with AI suggestions
 */
const AdvancedFilters = memo(
  ({
    filters,
    onFiltersChange,
    onApplyFilters,
    isSearching = false,
    className = "",
  }: AdvancedFiltersProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [isApplyingFilters, setIsApplyingFilters] = useState(false);

    // Count active filters
    useEffect(() => {
      let count = 0;
      if (filters.diet) count++;
      if (filters.cuisine) count++;
      if (filters.mealType) count++;
      if (filters.maxReadyTime) count++;
      if (filters.minCalories || filters.maxCalories) count++;
      if (filters.minProtein || filters.maxProtein) count++;
      if (filters.minCarbs || filters.maxCarbs) count++;
      if (filters.minFat || filters.maxFat) count++;
      if (filters.intolerances) count++;
      if (filters.excludeIngredients) count++;
      if (filters.includeIngredients) count++;
      setActiveFilterCount(count);
    }, [filters]);

    // Update filter value
    const updateFilter = useCallback(
      (key: keyof AdvancedFilterOptions, value: string | number | undefined) => {
        // Handle special "none" value (clear the filter)
        if (value === "__none__" || !value) {
          const newFilters = { ...filters };
          delete newFilters[key];
          onFiltersChange(newFilters);
        } else {
          onFiltersChange({
            ...filters,
            [key]: value,
          });
        }
      },
      [filters, onFiltersChange]
    );

    // Clear all filters
    const clearFilters = useCallback(() => {
      onFiltersChange({});
      toast.success("Filters cleared");
    }, [onFiltersChange]);

    // Handle apply filters with loading state
    const handleApplyFilters = useCallback(() => {
      setIsApplyingFilters(true);
      onApplyFilters();
      // Don't close dialog yet - wait for search to complete
    }, [onApplyFilters]);

    // Close dialog when search completes (isSearching becomes false)
    useEffect(() => {
      if (isApplyingFilters && !isSearching) {
        // Search completed, close dialog and show notification
        setIsOpen(false);
        setIsApplyingFilters(false);
        toast.success("Filters applied successfully");
      }
    }, [isSearching, isApplyingFilters]);

    // Clear specific filter
    const clearFilter = useCallback(
      (key: keyof AdvancedFilterOptions) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFiltersChange(newFilters);
      },
      [filters, onFiltersChange]
    );

    return (
      <div className={className}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="relative inline-flex items-center gap-2 border-purple-500/30 bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 hover:from-purple-500/30 hover:via-purple-500/20 hover:to-purple-500/30 self-start"
            >
              <SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Advanced </span>
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 bg-purple-500 text-white text-xs px-1.5 py-0.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            onInteractOutside={(e) => {
              // Prevent closing dialog while applying filters
              if (isSearching || isApplyingFilters) {
                e.preventDefault();
              }
            }}
            onEscapeKeyDown={(e) => {
              // Prevent closing dialog while applying filters
              if (isSearching || isApplyingFilters) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-400" />
                Advanced Recipe Filters
                {(isSearching || isApplyingFilters) && (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin text-purple-400" />
                )}
              </DialogTitle>
              <DialogDescription>
                {isSearching || isApplyingFilters
                  ? "Applying filters and searching recipes..."
                  : "Refine your recipe search with detailed filters. Use AI suggestions for personalized recommendations."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4 relative">
              {/* Loading Overlay */}
              {(isSearching || isApplyingFilters) && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                    <p className="text-sm text-gray-300">
                      Applying filters and searching recipes...
                    </p>
                    <p className="text-xs text-gray-400">
                      Please wait while we find the perfect recipes for you
                    </p>
                  </div>
                </div>
              )}

              {/* Filter Presets Section */}
              <div className="border-b border-slate-700/50 pb-4">
                <FilterPresets
                  onPresetSelect={(preset) => {
                    onFiltersChange(preset.filters as AdvancedFilterOptions);
                    toast.success(`Loaded preset: ${preset.name}`);
                  }}
                  currentFilters={filters}
                />
              </div>

              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Diet */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Apple className="h-4 w-4" />
                    Diet
                  </label>
                  <Select
                    value={filters.diet || "__none__"}
                    onValueChange={(value) => updateFilter("diet", value)}
                  >
                    <SelectTrigger className="bg-slate-900/30 border-slate-400/30 text-white">
                      <SelectValue placeholder="Select diet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {DIET_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.diet && (
                    <Badge
                      variant="outline"
                      className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                      onClick={() => clearFilter("diet")}
                    >
                      {DIET_OPTIONS.find((d) => d.value === filters.diet)?.label}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>

                {/* Cuisine */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4" />
                    Cuisine
                  </label>
                  <Select
                    value={filters.cuisine || "__none__"}
                    onValueChange={(value) => updateFilter("cuisine", value)}
                  >
                    <SelectTrigger className="bg-slate-900/30 border-slate-400/30 text-white">
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {CUISINE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.cuisine && (
                    <Badge
                      variant="outline"
                      className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                      onClick={() => clearFilter("cuisine")}
                    >
                      {CUISINE_OPTIONS.find((c) => c.value === filters.cuisine)?.label}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>

                {/* Meal Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4" />
                    Meal Type
                  </label>
                  <Select
                    value={filters.mealType || "__none__"}
                    onValueChange={(value) => updateFilter("mealType", value)}
                  >
                    <SelectTrigger className="bg-slate-900/30 border-slate-400/30 text-white">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {MEAL_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.mealType && (
                    <Badge
                      variant="outline"
                      className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                      onClick={() => clearFilter("mealType")}
                    >
                      {MEAL_TYPE_OPTIONS.find((m) => m.value === filters.mealType)?.label}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>

                {/* Max Ready Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Max Ready Time (minutes)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="300"
                    placeholder="e.g., 30"
                    value={filters.maxReadyTime || ""}
                    onChange={(e) =>
                      updateFilter("maxReadyTime", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="bg-slate-900/30 border-slate-400/30 text-white"
                  />
                  {filters.maxReadyTime && (
                    <Badge
                      variant="outline"
                      className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                      onClick={() => clearFilter("maxReadyTime")}
                    >
                      {filters.maxReadyTime} min
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              </div>

              {/* Nutrition Filters */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    Nutrition Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Calories */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Min Calories</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 100"
                        value={filters.minCalories || ""}
                        onChange={(e) =>
                          updateFilter("minCalories", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Max Calories</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 500"
                        value={filters.maxCalories || ""}
                        onChange={(e) =>
                          updateFilter("maxCalories", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Min Protein (g)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 10"
                        value={filters.minProtein || ""}
                        onChange={(e) =>
                          updateFilter("minProtein", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Max Protein (g)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 50"
                        value={filters.maxProtein || ""}
                        onChange={(e) =>
                          updateFilter("maxProtein", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Min Carbs (g)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 20"
                        value={filters.minCarbs || ""}
                        onChange={(e) =>
                          updateFilter("minCarbs", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Max Carbs (g)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 100"
                        value={filters.maxCarbs || ""}
                        onChange={(e) =>
                          updateFilter("maxCarbs", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Min Fat (g)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 5"
                        value={filters.minFat || ""}
                        onChange={(e) =>
                          updateFilter("minFat", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Max Fat (g)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 30"
                        value={filters.maxFat || ""}
                        onChange={(e) =>
                          updateFilter("maxFat", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients & Intolerances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Include Ingredients */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Include Ingredients (comma-separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., chicken, tomatoes, garlic"
                    value={filters.includeIngredients || ""}
                    onChange={(e) => updateFilter("includeIngredients", e.target.value || undefined)}
                    className="bg-slate-900/30 border-slate-400/30 text-white"
                  />
                </div>

                {/* Exclude Ingredients */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Exclude Ingredients (comma-separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., nuts, dairy, eggs"
                    value={filters.excludeIngredients || ""}
                    onChange={(e) => updateFilter("excludeIngredients", e.target.value || undefined)}
                    className="bg-slate-900/30 border-slate-400/30 text-white"
                  />
                </div>

                {/* Intolerances */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">
                    Intolerances (comma-separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., gluten, dairy, soy"
                    value={filters.intolerances || ""}
                    onChange={(e) => updateFilter("intolerances", e.target.value || undefined)}
                    className="bg-slate-900/30 border-slate-400/30 text-white"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTOLERANCE_OPTIONS.map((intolerance) => {
                      const isSelected = filters.intolerances
                        ?.toLowerCase()
                        .split(",")
                        .map((i) => i.trim())
                        .includes(intolerance.value.toLowerCase());
                      return (
                        <Badge
                          key={intolerance.value}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer ${
                            isSelected
                              ? "bg-purple-500 text-white"
                              : "bg-slate-800/50 text-gray-300 border-slate-600 hover:bg-purple-500/20"
                          }`}
                          onClick={() => {
                            const current = filters.intolerances
                              ?.split(",")
                              .map((i) => i.trim())
                              .filter((i) => i) || [];
                            if (isSelected) {
                              updateFilter(
                                "intolerances",
                                current.filter((i) => i !== intolerance.value).join(", ") || undefined
                              );
                            } else {
                              updateFilter("intolerances", [...current, intolerance.value].join(", "));
                            }
                          }}
                        >
                          {intolerance.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFilterCount > 0 && (
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-300">
                          {activeFilterCount} active filter{activeFilterCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Clear All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  onClick={handleApplyFilters}
                  disabled={isSearching || isApplyingFilters}
                  className="flex-1 bg-gradient-to-r from-purple-500/70 via-purple-500/50 to-purple-500/30 hover:from-purple-500/80 hover:via-purple-500/60 hover:to-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching || isApplyingFilters ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying Filters...
                    </>
                  ) : (
                    "Apply Filters"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setIsApplyingFilters(false);
                  }}
                  disabled={isSearching || isApplyingFilters}
                  className="border-slate-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

AdvancedFilters.displayName = "AdvancedFilters";

export default AdvancedFilters;

