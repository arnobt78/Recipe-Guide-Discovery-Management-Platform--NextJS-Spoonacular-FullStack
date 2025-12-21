/**
 * Reusable Recipe Notes Component
 *
 * Features:
 * - View recipe notes
 * - Create/edit notes
 * - Rating system
 * - Tags support
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback, useEffect } from "react";
import { useRecipeNote, useSaveRecipeNote, useDeleteRecipeNote } from "../hooks/useRecipeNotes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Star, Save, Trash2, Edit2, X, Plus } from "lucide-react";
import { Recipe } from "../types";
import SkeletonRecipeDetail from "./SkeletonRecipeDetail";
import ConfirmationDialog from "./ConfirmationDialog";

interface RecipeNotesProps {
  recipe: Recipe;
}

/**
 * Recipe Notes Component (Memoized for performance)
 *
 * Allows users to add personal notes, ratings, and tags to recipes
 */
const RecipeNotes = memo(({ recipe }: RecipeNotesProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { data: note, isLoading } = useRecipeNote(recipe.id, true);
  const saveNote = useSaveRecipeNote();
  const deleteNote = useDeleteRecipeNote();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize form with existing note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setRating(note.rating);
      setTags(note.tags || []);
      setIsEditing(false);
    } else {
      setTitle("");
      setContent("");
      setRating(undefined);
      setTags([]);
      setIsEditing(true);
    }
  }, [note]);

  const handleSave = useCallback(() => {
    if (!content.trim()) return;

    saveNote.mutate(
      {
        recipeId: recipe.id,
        title: title.trim() || undefined,
        content: content.trim(),
        rating,
        tags,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  }, [recipe.id, title, content, rating, tags, saveNote]);

  const handleDelete = useCallback(() => {
    deleteNote.mutate(recipe.id, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setRating(undefined);
        setTags([]);
        setIsEditing(true);
      },
    });
  }, [recipe.id, deleteNote]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags]
  );

  if (isLoading) {
    return <SkeletonRecipeDetail />;
  }

  return (
    <Card className="glow-card border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <img src="/food.svg" alt="Notes" className="w-5 h-5" />
            My Notes
          </CardTitle>
          {note && !isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-purple-400"
                aria-label="Edit note"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-gray-400 hover:text-red-400"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
              <Input
                placeholder="Note title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-800/50 border-purple-500/30 text-white"
                aria-label="Note title"
              />

            <Textarea
              placeholder="Write your notes here... (cooking tips, modifications, etc.)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-800/50 border-purple-500/30 text-white min-h-[120px]"
              required
              aria-label="Recipe notes content"
              aria-required="true"
            />

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? undefined : star)}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    aria-pressed={rating === star}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        rating && star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-500 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Tags</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-slate-800/50 border-purple-500/30 text-white flex-1"
                  aria-label="Add tag to recipe note"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="ghost"
                  size="icon"
                  className="text-purple-400 hover:text-purple-300"
                  aria-label="Add tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="glow-badge flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-400"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={!content.trim() || saveNote.isPending}
                className="glow-button flex items-center gap-2"
                aria-label={saveNote.isPending ? "Saving note" : "Save note"}
              >
                <Save className="h-4 w-4" />
                {saveNote.isPending ? "Saving..." : "Save Note"}
              </Button>
              {note && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to note values
                    if (note) {
                      setTitle(note.title || "");
                      setContent(note.content || "");
                      setRating(note.rating);
                      setTags(note.tags || []);
                    }
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
              )}
            </div>
          </>
        ) : note ? (
          <>
            {note.title && (
              <h3 className="text-lg font-semibold text-white">{note.title}</h3>
            )}
            <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
            {note.rating && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= note.rating!
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-500"
                    }`}
                  />
                ))}
              </div>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="glow-badge">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No notes yet. Click edit to add your first note!</p>
          </div>
        )}
      </CardContent>

      {/* Delete Note Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </Card>
  );
});

RecipeNotes.displayName = "RecipeNotes";

export default RecipeNotes;

