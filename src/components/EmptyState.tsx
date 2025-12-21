/**
 * Reusable Empty State Component
 * 
 * Features:
 * - Consistent empty state UI
 * - SVG icon integration
 * - Customizable message
 * - Enhanced design with cards and badges
 * - Reusable across the app
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Heart, BookOpen } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: string;
  className?: string;
  subtitle?: string;
  fullWidth?: boolean; // Make card full width instead of max-w-md
}

/**
 * Reusable Empty State Component (Memoized for performance)
 *
 * Features:
 * - Consistent empty state UI
 * - SVG icon integration
 * - Customizable message
 * - Enhanced design with cards and badges
 * - Reusable across the app
 */
const EmptyState = memo(({
  message,
  icon = "/diet.svg",
  className = "",
  subtitle,
  fullWidth = false,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center min-h-[400px] ${className}`}
    >
      <Card className={`glow-card border-purple-500/30 ${fullWidth ? "w-full" : "max-w-md w-full"} bg-gradient-to-br from-slate-800/50 to-purple-900/30`}>
        <CardContent className="p-4 sm:p-6 md:p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
              <div className="relative p-4 sm:p-5 md:p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                <img
                  src={icon}
                  alt="Empty state"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto opacity-80"
                />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3"
          >
            {message}
          </motion.h3>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base text-gray-400 mb-6 px-2 sm:px-0"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Action Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Search Recipes</span>
              <span className="sm:hidden">Search</span>
            </Badge>
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Add Favourites</span>
              <span className="sm:hidden">Favourites</span>
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Explore
            </Badge>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;
