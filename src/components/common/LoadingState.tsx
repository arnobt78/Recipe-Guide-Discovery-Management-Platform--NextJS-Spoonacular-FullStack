/**
 * Reusable Loading State Component
 *
 * Features:
 * - Consistent loading UI
 * - SVG icon integration
 * - Reusable across the app
 */

import { motion } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";

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
        <SafeImage
          src={icon}
          alt="Loading"
          width={24}
          height={24}
          className="animate-spin"
        />
        <span>{message}</span>
      </div>
    </motion.div>
  );
};

export default LoadingState;
