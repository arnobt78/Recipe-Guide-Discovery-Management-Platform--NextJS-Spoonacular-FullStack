/**
 * Shopping List Generator Component
 *
 * Features:
 * - Generate shopping lists from selected recipes
 * - Group ingredients by category
 * - Export to text format
 * - View and manage shopping lists
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  useShoppingLists,
  useCreateShoppingList,
  useUpdateShoppingList,
  useDeleteShoppingList,
} from "../hooks/useShoppingList";
import { useFavouriteRecipes } from "../hooks/useRecipes";
import { generateShoppingList, exportShoppingListToText } from "../utils/shoppingListGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ShoppingCart, Plus, X, Download, CheckCircle2, Circle } from "lucide-react";
import { ShoppingList, Recipe } from "../types";
import EmptyState from "./EmptyState";
import SkeletonShoppingList from "./SkeletonShoppingList";
import ConfirmationDialog from "./ConfirmationDialog";

// Note: onRecipeClick removed - RecipeCard handles navigation internally via useNavigate
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ShoppingListGeneratorProps {
  // Empty interface - props removed as RecipeCard handles navigation internally
}

/**
 * Shopping List Generator Component (Memoized for performance)
 *
 * Generate and manage shopping lists from recipes
 */
const ShoppingListGenerator = memo((_props: ShoppingListGeneratorProps) => {
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [listName, setListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null);

  const { data: shoppingLists = [], isLoading, error: shoppingListsError } = useShoppingLists();
  const { data: favouriteRecipes = [], error: favouritesError } = useFavouriteRecipes();

  // Handle errors with toast notifications
  useEffect(() => {
    if (shoppingListsError) {
      toast.error("Failed to load shopping lists. Please try again.");
    }
  }, [shoppingListsError]);

  useEffect(() => {
    if (favouritesError) {
      toast.error("Failed to load favourite recipes.");
    }
  }, [favouritesError]);
  const createShoppingList = useCreateShoppingList();
  const updateShoppingList = useUpdateShoppingList();
  const deleteShoppingList = useDeleteShoppingList();

  // Generate shopping list items from selected recipes
  const shoppingListItems = useMemo(() => {
    if (selectedRecipes.length === 0) return [];
    return generateShoppingList(selectedRecipes);
  }, [selectedRecipes]);

  const handleToggleRecipe = useCallback(
    (recipe: Recipe) => {
      setSelectedRecipes((prev) => {
        const isSelected = prev.some((r) => r.id === recipe.id);
        if (isSelected) {
          return prev.filter((r) => r.id !== recipe.id);
        } else {
          return [...prev, recipe];
        }
      });
    },
    []
  );

  const handleCreateList = useCallback(() => {
    if (!listName.trim() || selectedRecipes.length === 0) return;

    createShoppingList.mutate(
      {
        name: listName.trim(),
        recipeIds: selectedRecipes.map((r) => r.id),
        items: shoppingListItems,
      },
      {
        onSuccess: () => {
          setListName("");
          setSelectedRecipes([]);
          setIsCreating(false);
        },
      }
    );
  }, [listName, selectedRecipes, shoppingListItems, createShoppingList]);

  const handleToggleComplete = useCallback(
    (list: ShoppingList) => {
      updateShoppingList.mutate({
        id: list.id,
        updates: {
          isCompleted: !list.isCompleted,
        },
      });
    },
    [updateShoppingList]
  );

  const handleDelete = useCallback(
    (list: ShoppingList) => {
      setListToDelete(list);
      setDeleteDialogOpen(true);
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (listToDelete) {
      deleteShoppingList.mutate(listToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setListToDelete(null);
        },
      });
    }
  }, [listToDelete, deleteShoppingList]);

  const handleExport = useCallback((list: ShoppingList) => {
    const text = exportShoppingListToText(list.items, list.name);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  if (isLoading) {
    return <SkeletonShoppingList />;
  }

  return (
    <div className="space-y-6">
      {/* Create New Shopping List */}
      <Card className="glow-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="gradient-text flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCreating ? (
            <Button
              onClick={() => setIsCreating(true)}
              className="glow-button w-full"
              variant="default"
              aria-label="Create new shopping list"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Shopping List
            </Button>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Shopping list name..."
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="glow-card"
                aria-label="Shopping list name"
                aria-required="true"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Select Recipes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {favouriteRecipes.length === 0 ? (
                    <EmptyState message="No favourite recipes. Add some from the search tab!" />
                  ) : (
                    favouriteRecipes.map((recipe) => {
                      const isSelected = selectedRecipes.some((r) => r.id === recipe.id);
                      return (
                        <motion.div
                          key={recipe.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`glow-card cursor-pointer transition-all ${
                              isSelected
                                ? "border-purple-500 bg-purple-500/20"
                                : "border-purple-500/30"
                            }`}
                            onClick={() => handleToggleRecipe(recipe)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {recipe.image && (
                                  <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-16 h-16 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{recipe.title}</p>
                                  {isSelected && (
                                    <Badge variant="outline" className="glow-badge mt-1 text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
              {shoppingListItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Generated Items ({shoppingListItems.length}):
                  </p>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                    {shoppingListItems.map((item, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-slate-800/50 rounded border border-purple-500/20"
                      >
                        <span className="font-medium">{item.name}</span> - {item.quantity}{" "}
                        {item.unit || ""} ({item.category})
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateList}
                  disabled={!listName.trim() || selectedRecipes.length === 0}
                  className="glow-button flex-1"
                  aria-label="Create shopping list"
                >
                  Create List
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setListName("");
                    setSelectedRecipes([]);
                  }}
                  aria-label="Cancel creating shopping list"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Shopping Lists */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold gradient-text">Your Shopping Lists</h3>
        {shoppingLists.length === 0 ? (
          <EmptyState message="No shopping lists yet. Create one above!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {shoppingLists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card
                    className={`glow-card border-purple-500/30 ${
                      list.isCompleted ? "opacity-60" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {list.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400" />
                          )}
                          {list.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDelete(list)}
                          aria-label={`Delete shopping list ${list.name}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-400">
                        {list.items.length} items • {list.recipeIds.length} recipes
                      </div>
                      <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                        {list.items.slice(0, 5).map((item, index) => (
                          <div key={index} className="text-xs text-gray-300">
                            • {item.name} - {item.quantity} {item.unit || ""}
                          </div>
                        ))}
                        {list.items.length > 5 && (
                          <div className="text-xs text-gray-400">
                            +{list.items.length - 5} more items
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleComplete(list)}
                          className="flex-1 text-xs"
                          aria-label={list.isCompleted ? `Mark ${list.name} as incomplete` : `Mark ${list.name} as complete`}
                        >
                          {list.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(list)}
                          className="flex-1 text-xs"
                          aria-label={`Export shopping list ${list.name}`}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Shopping List"
        description={`Are you sure you want to delete "${listToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
});

ShoppingListGenerator.displayName = "ShoppingListGenerator";

export default ShoppingListGenerator;

