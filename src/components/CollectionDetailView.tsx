/**
 * Reusable Collection Detail View Component
 *
 * Features:
 * - Display collection details
 * - Show recipes in collection
 * - Remove recipes from collection
 * - Edit collection
 * - Back navigation
 * - ShadCN UI components
 * - React Query integration
 * - Skeleton loading
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useCallback, useState } from "react";
import { useCollection, useRemoveRecipeFromCollection, useUpdateCollection, useDeleteCollection } from "../hooks/useCollections";
import RecipeGrid from "./RecipeGrid";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Edit2, Trash2, Folder } from "lucide-react";
import { RecipeCollection, CollectionItem, Recipe } from "../types";
import EmptyState from "./EmptyState";
import SkeletonCollectionDetail from "./SkeletonCollectionDetail";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { X, Save } from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";
import { toast } from "sonner";

interface CollectionDetailViewProps {
  collection: RecipeCollection;
  onBack: () => void;
  onRecipeClick?: (recipe: Recipe) => void;
  onDelete?: () => void;
}

/**
 * Collection Detail View Component (Memoized for performance)
 *
 * Displays collection details and recipes
 */
const CollectionDetailView = memo(({
  collection,
  onBack,
  onDelete,
}: CollectionDetailViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editDescription, setEditDescription] = useState(collection.description || "");

  const { data: collectionData, isLoading } = useCollection(collection.id, true);
  const removeRecipe = useRemoveRecipeFromCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [recipeToRemove, setRecipeToRemove] = useState<Recipe | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Convert collection items to Recipe format for RecipeGrid
  const recipes: Recipe[] = collectionData?.items?.map((item: CollectionItem) => ({
    id: item.recipeId,
    title: item.recipeTitle,
    image: item.recipeImage || "",
    imageType: "jpg",
  })) || [];

  const handleRemoveRecipeClick = useCallback((recipe: Recipe) => {
    setRecipeToRemove(recipe);
    setRemoveDialogOpen(true);
  }, []);

  const handleRemoveConfirm = useCallback(() => {
    if (recipeToRemove) {
      removeRecipe.mutate({
        collectionId: collection.id,
        recipeId: recipeToRemove.id,
      });
      setRecipeToRemove(null);
    }
  }, [recipeToRemove, collection.id, removeRecipe]);

  const handleSaveEdit = useCallback(() => {
    if (!editName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    updateCollection.mutate(
      {
        collectionId: collection.id,
        updates: {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  }, [collection.id, editName, editDescription, updateCollection]);

  const handleCancelEdit = useCallback(() => {
    setEditName(collection.name);
    setEditDescription(collection.description || "");
    setIsEditing(false);
  }, [collection]);

  if (isLoading) {
    return <SkeletonCollectionDetail />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-gray-400 hover:text-white hover:bg-purple-500/20"
          aria-label="Back to collections"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {isEditing ? (
          <Card className="glow-card border-purple-500/30 flex-1">
            <CardContent className="pt-6 space-y-4">
              <Input
                placeholder="Collection name *"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-800/50 border-purple-500/30 text-white"
                aria-label="Collection name"
                aria-required="true"
              />
              <Textarea
                placeholder="Description (optional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-slate-800/50 border-purple-500/30 text-white min-h-[80px]"
                aria-label="Collection description"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim() || updateCollection.isPending}
                  className="glow-button flex items-center gap-2"
                  aria-label={updateCollection.isPending ? "Saving collection changes" : "Save collection changes"}
                >
                  <Save className="h-4 w-4" />
                  {updateCollection.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-white"
                  aria-label="Cancel editing collection"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glow-card border-purple-500/30 flex-1">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: collection.color
                        ? `${collection.color}20`
                        : "rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <Folder
                      className="w-8 h-8"
                      style={{
                        color: collection.color || "#8b5cf6",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      {collectionData?.name || collection.name}
                    </CardTitle>
                    {collectionData?.description && (
                      <p className="text-gray-300">{collectionData.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <Badge
                        variant="outline"
                        className="glow-badge"
                        style={{
                          borderColor: collection.color
                            ? `${collection.color}40`
                            : "rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        {collectionData?.itemCount || recipes.length}{" "}
                        {recipes.length === 1 ? "recipe" : "recipes"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/20"
                    aria-label="Edit collection"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      aria-label="Delete collection"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Recipes Grid */}
      {recipes.length === 0 ? (
        <EmptyState message="No recipes in this collection yet. Add recipes from the search tab!" />
      ) : (
        <RecipeGrid
          recipes={recipes}
          favouriteRecipes={[]}
          onFavouriteToggle={(recipe, isFavourite) => {
            if (isFavourite) {
              handleRemoveRecipeClick(recipe);
            }
          }}
          showRemoveFromCollection={true}
        />
      )}

      {/* Remove Recipe Confirmation Dialog */}
      <ConfirmationDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove Recipe"
        description={`Remove "${recipeToRemove?.title}" from this collection?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveConfirm}
        variant="default"
      />

      {/* Delete Collection Confirmation Dialog */}
      {onDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Collection"
          description={`Are you sure you want to delete "${collectionData?.name || collection.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            deleteCollection.mutate(collection.id, {
              onSuccess: () => {
                onDelete();
              },
            });
          }}
          variant="destructive"
        />
      )}
    </div>
  );
});

CollectionDetailView.displayName = "CollectionDetailView";

export default CollectionDetailView;

