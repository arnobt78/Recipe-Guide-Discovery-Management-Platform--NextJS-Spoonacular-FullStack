/**
 * Reusable Collection Manager Component
 *
 * Features:
 * - Create new collections
 * - Display all collections
 * - Edit/delete collections
 * - Add recipes to collections
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
} from "../../hooks/useCollections";
import CollectionCard from "./CollectionCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, X, FolderOpen } from "lucide-react";
import { RecipeCollection } from "../../types";
import EmptyState from "../common/EmptyState";
import SkeletonRecipeGrid from "../skeletons/SkeletonRecipeGrid";
import ConfirmationDialog from "../common/ConfirmationDialog";

interface CollectionManagerProps {
  onCollectionClick?: (collection: RecipeCollection) => void;
  onCollectionSelect?: (collection: RecipeCollection) => void;
}

/**
 * Collection Manager Component (Memoized for performance)
 *
 * Manages user's recipe collections
 */
const CollectionManager = memo(
  ({ onCollectionClick, onCollectionSelect }: CollectionManagerProps) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionDescription, setNewCollectionDescription] =
      useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [collectionToDelete, setCollectionToDelete] =
      useState<RecipeCollection | null>(null);

    const { data: collections, isLoading } = useCollections();
    const createCollection = useCreateCollection();
    const deleteCollection = useDeleteCollection();

    const handleCreate = useCallback(() => {
      if (!newCollectionName.trim()) return;

      createCollection.mutate(
        {
          name: newCollectionName.trim(),
          description: newCollectionDescription.trim() || undefined,
        },
        {
          onSuccess: () => {
            setNewCollectionName("");
            setNewCollectionDescription("");
            setIsCreating(false);
          },
        }
      );
    }, [newCollectionName, newCollectionDescription, createCollection]);

    const handleDeleteClick = useCallback((collection: RecipeCollection) => {
      setCollectionToDelete(collection);
      setDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
      if (collectionToDelete) {
        deleteCollection.mutate(collectionToDelete.id);
        setCollectionToDelete(null);
      }
    }, [collectionToDelete, deleteCollection]);

    // Only show skeleton if loading AND no data exists yet (data is undefined, not empty array)
    if (isLoading && collections === undefined) {
      return <SkeletonRecipeGrid count={4} />;
    }

    // Use empty array as fallback for rendering
    const displayCollections = collections || [];

    return (
      <div className="space-y-6">
        {/* Collections Header */}
        <Card className="glow-card border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl self-stretch flex items-center">
                  <FolderOpen className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    My Collections
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    Organize your favourite recipes into custom collections for easy access.
                  </p>
                </div>
              </div>
              {!isCreating && (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="glow-button flex items-center gap-2"
                  aria-label="Create new collection"
                >
                  <Plus className="h-4 w-4" />
                  New Collection
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Create Collection Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glow-card border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Create New Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Collection name *"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white"
                    aria-label="Collection name"
                    aria-required="true"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newCollectionDescription}
                    onChange={(e) =>
                      setNewCollectionDescription(e.target.value)
                    }
                    className="bg-slate-800/50 border-purple-500/30 text-white"
                    aria-label="Collection description"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCreate}
                      disabled={
                        !newCollectionName.trim() || createCollection.isPending
                      }
                      className="glow-button"
                      aria-label={
                        createCollection.isPending
                          ? "Creating collection"
                          : "Create collection"
                      }
                    >
                      {createCollection.isPending ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsCreating(false);
                        setNewCollectionName("");
                        setNewCollectionDescription("");
                      }}
                      className="text-gray-400 hover:text-white"
                      aria-label="Cancel creating collection"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collections Grid */}
        {displayCollections.length === 0 ? (
          <EmptyState message="No collections yet. Create your first collection to organize recipes!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => {
                  onCollectionClick?.(collection);
                  onCollectionSelect?.(collection);
                }}
                onDelete={() => handleDeleteClick(collection)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Collection"
          description={`Are you sure you want to delete "${collectionToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    );
  }
);

CollectionManager.displayName = "CollectionManager";

export default CollectionManager;
