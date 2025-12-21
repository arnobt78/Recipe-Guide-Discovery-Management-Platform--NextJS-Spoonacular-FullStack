/**
 * Reusable Error Message Component
 * 
 * Features:
 * - Consistent error styling
 * - Animated appearance
 * - Reusable across the app
 */

import { memo } from "react";
import { motion } from "framer-motion";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

/**
 * Reusable Error Message Component (Memoized for performance)
 *
 * Features:
 * - Consistent error styling
 * - Animated appearance
 * - Reusable across the app
 */
const ErrorMessage = memo(({ message, className = "" }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`text-red-400 font-medium text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30 ${className}`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </motion.div>
  );
});

ErrorMessage.displayName = "ErrorMessage";

export default ErrorMessage;

