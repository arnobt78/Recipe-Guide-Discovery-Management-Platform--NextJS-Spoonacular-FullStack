/**
 * Reusable Loading State Component
 * 
 * Features:
 * - Consistent loading UI
 * - SVG icon integration
 * - Reusable across the app
 */

import { motion } from "framer-motion";

interface LoadingStateProps {
  message?: string;
  icon?: string;
  className?: string;
}

const LoadingState = ({
  message = "Loading...",
  icon = "/cooking.svg",
  className = "",
}: LoadingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center text-purple-300 text-xl py-12 ${className}`}
    >
      <div className="flex items-center justify-center gap-2">
        <img src={icon} alt="Loading" className="w-6 h-6 animate-spin" />
        <span>{message}</span>
      </div>
    </motion.div>
  );
};

export default LoadingState;

