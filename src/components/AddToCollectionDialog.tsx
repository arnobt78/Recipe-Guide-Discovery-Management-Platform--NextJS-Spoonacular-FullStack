/**
 * Reusable Add to Collection Dialog Component
 *
 * Features:
 * - Display all collections
 * - Add recipe to selected collection
 * - Create new collection option
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollections, useAddRecipeToCollection, useCreateCollection } from "../hooks/useCollections";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Folder, Plus, X } from "lucide-react";
import { Recipe, RecipeCollection } from "../types";
import { toast } from "sonner";

interface AddToCollectionDialogProps {
  recipe: Recipe;
  onClose: () => void;
  onCollectionCreated?: () => void;
}

/**
 * Add to Collection Dialog Component (Memoized for performance)
 *
 * Allows users to add a recipe to a collection
 */
const AddToCollectionDialog = memo(({
  recipe,
  onClose,
  onCollectionCreated,
}: AddToCollectionDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const { data: collections = [], isLoading } = useCollections();
  const addToCollection = useAddRecipeToCollection();
  const createCollection = useCreateCollection();

  const handleAddToCollection = useCallback(
    (collectionId: string) => {
      addToCollection.mutate(
        {
          collectionId,
          recipe,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    },
    [recipe, addToCollection, onClose]
  );

  const handleCreateAndAdd = useCallback(() => {
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    createCollection.mutate(
      {
        name: newCollectionName.trim(),
      },
      {
        onSuccess: (newCollection) => {
          handleAddToCollection(newCollection.id);
          setNewCollectionName("");
          setIsCreating(false);
          onCollectionCreated?.();
        },
      }
    );
  }, [newCollectionName, createCollection, handleAddToCollection, onCollectionCreated]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="glow-card border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Add to Collection</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-2">{recipe.title}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create New Collection */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20"
                >
                  <Input
                    placeholder="Collection name *"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateAndAdd();
                      }
                    }}
                    className="bg-slate-900/50 border-purple-500/30 text-white"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCreateAndAdd}
                      disabled={!newCollectionName.trim() || createCollection.isPending}
                      className="glow-button flex-1"
                      aria-label={createCollection.isPending ? "Creating collection and adding recipe" : "Create collection and add recipe"}
                    >
                      {createCollection.isPending ? "Creating..." : "Create & Add"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsCreating(false);
                        setNewCollectionName("");
                      }}
                      className="text-gray-400 hover:text-white"
                      aria-label="Cancel creating collection"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collections List */}
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">Loading collections...</div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-400">No collections yet.</p>
                {!isCreating && (
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="glow-button flex items-center gap-2 mx-auto"
                    aria-label="Create new collection"
                  >
                    <Plus className="h-4 w-4" />
                    Create Collection
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {collections.map((collection: RecipeCollection) => (
                  <motion.div
                    key={collection.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleAddToCollection(collection.id)}
                      disabled={addToCollection.isPending}
                      className="w-full justify-start gap-3 p-4 h-auto hover:bg-purple-500/20"
                      aria-label={`Add recipe to ${collection.name} collection`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: collection.color
                            ? `${collection.color}20`
                            : "rgba(139, 92, 246, 0.2)",
                        }}
                      >
                        <Folder
                          className="w-5 h-5"
                          style={{
                            color: collection.color || "#8b5cf6",
                          }}
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-white truncate">{collection.name}</p>
                        {collection.description && (
                          <p className="text-sm text-gray-400 truncate">
                            {collection.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="glow-badge flex-shrink-0"
                        style={{
                          borderColor: collection.color
                            ? `${collection.color}40`
                            : "rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        {collection.itemCount || 0}
                      </Badge>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Create New Collection Button */}
            {!isCreating && collections.length > 0 && (
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                className="w-full glow-button flex items-center gap-2 border-purple-500/30"
                aria-label="Create new collection"
              >
                <Plus className="h-4 w-4" />
                Create New Collection
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});

AddToCollectionDialog.displayName = "AddToCollectionDialog";

export default AddToCollectionDialog;

