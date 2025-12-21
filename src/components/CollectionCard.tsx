/**
 * Reusable Collection Card Component
 *
 * Features:
 * - ShadCN Card component
 * - Gradient glow effects
 * - Collection info display
 * - Item count badge
 * - Hover animations
 * - Memoized for performance
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, optimized performance
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Folder, Trash2, Edit2 } from "lucide-react";
import { RecipeCollection } from "../types";

interface CollectionCardProps {
  collection: RecipeCollection;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Collection Card Component (Memoized for performance)
 *
 * Displays collection information with actions
 */
const CollectionCard = memo(({
  collection,
  onClick,
  onEdit,
  onDelete,
}: CollectionCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card
        className="glow-card group h-full flex flex-col"
        style={{
          borderColor: collection.color
            ? `${collection.color}40`
            : "rgba(139, 92, 246, 0.3)",
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: collection.color
                    ? `${collection.color}20`
                    : "rgba(139, 92, 246, 0.2)",
                }}
              >
                <Folder
                  className="w-6 h-6"
                  style={{
                    color: collection.color || "#8b5cf6",
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-white line-clamp-1 group-hover:text-purple-200 transition-colors">
                  {collection.name}
                </CardTitle>
                {collection.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20"
                  aria-label="Edit collection"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                  aria-label="Delete collection"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="glow-badge"
              style={{
                borderColor: collection.color
                  ? `${collection.color}40`
                  : "rgba(139, 92, 246, 0.3)",
              }}
            >
              {collection.itemCount || 0} {collection.itemCount === 1 ? "recipe" : "recipes"}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(collection.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CollectionCard.displayName = "CollectionCard";

export default CollectionCard;

