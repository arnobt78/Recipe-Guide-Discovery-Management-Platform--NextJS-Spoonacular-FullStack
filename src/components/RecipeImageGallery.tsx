/**
 * Recipe Image Gallery Component
 *
 * Features:
 * - Display multiple images for a recipe
 * - Add/remove images
 * - Image type categorization (step, final, ingredient, custom)
 * - Image upload integration
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  useRecipeImages,
  useAddRecipeImage,
  useRemoveRecipeImage,
} from "../hooks/useRecipeImages";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { X, Plus, Camera } from "lucide-react";
import { Recipe, RecipeImage } from "../types";
import { Skeleton } from "./ui/skeleton";
import ImageUploader from "./ImageUploader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import ConfirmationDialog from "./ConfirmationDialog";
import EmptyState from "./EmptyState";

interface RecipeImageGalleryProps {
  recipe: Recipe;
}

/**
 * Recipe Image Gallery Component (Memoized for performance)
 *
 * Displays and manages recipe images
 */
const RecipeImageGallery = memo(({ recipe }: RecipeImageGalleryProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState<
    "step" | "final" | "ingredient" | "custom"
  >("custom");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<RecipeImage | null>(null);

  const {
    data: images = [],
    isLoading,
    error: imagesError,
  } = useRecipeImages(recipe.id, true);
  const addRecipeImage = useAddRecipeImage();
  const removeRecipeImage = useRemoveRecipeImage();

  // Handle errors with toast notifications
  useEffect(() => {
    if (imagesError) {
      toast.error("Failed to load recipe images. Please try again.");
    }
  }, [imagesError]);

  const handleUploadComplete = useCallback(
    (imageUrl: string) => {
      addRecipeImage.mutate(
        {
          recipeId: recipe.id,
          imageUrl,
          imageType: selectedImageType,
        },
        {
          onSuccess: () => {
            setUploadDialogOpen(false);
          },
        }
      );
    },
    [recipe.id, selectedImageType, addRecipeImage]
  );

  const handleDelete = useCallback((image: RecipeImage) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (imageToDelete) {
      removeRecipeImage.mutate(
        { id: imageToDelete.id, recipeId: imageToDelete.recipeId },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setImageToDelete(null);
          },
        }
      );
    }
  }, [imageToDelete, removeRecipeImage]);

  // Group images by type
  const imagesByType = {
    final: images.filter((img) => img.imageType === "final"),
    step: images.filter((img) => img.imageType === "step"),
    ingredient: images.filter((img) => img.imageType === "ingredient"),
    custom: images.filter((img) => img.imageType === "custom"),
  };

  const imageTypeLabels: Record<string, string> = {
    final: "Final Dish",
    step: "Step-by-Step",
    ingredient: "Ingredients",
    custom: "Custom",
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <CardTitle className="gradient-text flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Recipe Images
        </CardTitle>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="glow-button"
              aria-label="Add image to recipe"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Recipe Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Image Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["final", "step", "ingredient", "custom"] as const).map(
                    (type) => (
                      <Button
                        key={type}
                        variant={
                          selectedImageType === type ? "default" : "outline"
                        }
                        onClick={() => setSelectedImageType(type)}
                        className="glow-button"
                        aria-label={`Select ${imageTypeLabels[type]} image type`}
                        aria-pressed={selectedImageType === type}
                      >
                        {imageTypeLabels[type]}
                      </Button>
                    )
                  )}
                </div>
              </div>
              <ImageUploader
                onUploadComplete={handleUploadComplete}
                folder={`recipes/${recipe.id}`}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Images by Type */}
      {images.length === 0 ? (
        <EmptyState message="No images yet. Add some images to showcase your recipe!" />
      ) : (
        <div className="space-y-6">
          {Object.entries(imagesByType).map(
            ([type, typeImages]) =>
              typeImages.length > 0 && (
                <div key={type} className="space-y-3">
                  <h4 className="text-sm font-semibold text-purple-300">
                    {imageTypeLabels[type]} ({typeImages.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {typeImages.map((image, imageIndex) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative group"
                        >
                          <Card className="glow-card border-purple-500/30 overflow-hidden">
                            <div className="aspect-square relative">
                              <img
                                src={image.imageUrl}
                                alt={image.caption || `Recipe ${type} image`}
                                className="w-full h-full object-cover"
                                loading={imageIndex < 3 ? "eager" : "lazy"}
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                                onClick={() => handleDelete(image)}
                                aria-label={`Delete ${
                                  image.caption || image.imageType
                                } image`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {image.caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-xs text-white truncate">
                                  {image.caption}
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
      />
    </div>
  );
});

RecipeImageGallery.displayName = "RecipeImageGallery";

export default RecipeImageGallery;
