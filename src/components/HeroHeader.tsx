/**
 * Reusable Hero Header Component
 *
 * Features:
 * - Full-width hero image with elegant overlay
 * - Modern gradient text effects
 * - SVG icons integration with animations
 * - Memoized to prevent unnecessary re-renders
 * - Image preloaded for instant display
 * - Responsive design
 *
 * Following DEVELOPMENT_RULES.md: Memoized component, optimized performance
 */

import { memo } from "react";
import { motion } from "framer-motion";

interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  icons?: string[];
  className?: string;
}

/**
 * Hero Header Component (Memoized for performance)
 *
 * Full-width hero section with modern design
 * Prevents unnecessary re-renders and image reloads
 * Image is preloaded in index.html for instant display
 */
const HeroHeader = memo(
  ({
    subtitle,
    imageSrc = "/hero-image.webp",
    className = "",
  }: HeroHeaderProps) => {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden ${className}`}
      >
        {/* Full-width hero image */}
        <div className="absolute inset-0">
          <img
            src={imageSrc}
            alt="Delicious Recipes"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          {/* Enhanced gradient overlay for modern look */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-pink-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        </div>

        {/* Animated gradient orbs for visual interest */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-2 sm:px-0 max-w-7xl mx-auto">
            {/* Innovative subtitle with modern typography */}
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="space-y-6"
              >
                {/* Main subtitle with gradient text effect */}
                <motion.h2
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight mb-6"
                  style={{
                    background:
                      "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.5))",
                  }}
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {subtitle}
                </motion.h2>

                {/* Decorative accent line with glow */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="relative mx-auto w-32 h-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full" />
                </motion.div>

                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => {
                    const delay = i * 0.3;
                    const duration = 3 + (i % 3);
                    const xOffset = i % 2 === 0 ? 30 : -30;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{
                          opacity: [0, 0.6, 0],
                          y: [-50, -150],
                          x: [0, xOffset],
                        }}
                        transition={{
                          duration,
                          repeat: Infinity,
                          delay,
                          ease: "easeOut",
                        }}
                        className="absolute w-2 h-2 bg-purple-400 rounded-full blur-sm"
                        style={{
                          left: `${15 + i * 14}%`,
                          top: `${40 + (i % 3) * 15}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom wave effect */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 via-purple-900/50 to-transparent" />
      </motion.section>
    );
  }
);

HeroHeader.displayName = "HeroHeader";

export default HeroHeader;
