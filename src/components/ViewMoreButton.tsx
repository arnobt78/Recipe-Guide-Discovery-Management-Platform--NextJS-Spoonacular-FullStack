/**
 * Reusable View More Button Component
 * 
 * Features:
 * - Consistent button styling
 * - Loading state handling
 * - Framer Motion animations
 * - Reusable across paginated lists
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface ViewMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Reusable View More Button Component (Memoized for performance)
 *
 * Features:
 * - Consistent button styling
 * - Loading state handling
 * - Framer Motion animations
 * - Reusable across paginated lists
 */
const ViewMoreButton = memo(({
  onClick,
  isLoading = false,
  className = "",
}: ViewMoreButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex justify-center items-center w-full my-8 ${className}`}
    >
      <Button
        onClick={onClick}
        disabled={isLoading}
        className="glow-button disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto px-8 sm:px-12"
        size="lg"
        aria-label={isLoading ? "Loading more recipes" : "Load more recipes"}
      >
        {isLoading ? "Loading..." : "View More"}
      </Button>
    </motion.div>
  );
});

ViewMoreButton.displayName = "ViewMoreButton";

export default ViewMoreButton;

