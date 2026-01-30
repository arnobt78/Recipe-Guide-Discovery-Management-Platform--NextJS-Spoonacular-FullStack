/**
 * Hero Search Section Component
 *
 * Features:
 * - Toggle button system for Search/Weather modes
 * - Smooth fade-in animations with framer-motion
 * - SearchInput with Advanced Filters (Search mode)
 * - Compact weather message (Weather mode) - full results shown below hero
 * - Responsive design for mobile/desktop
 * - Memoized for performance
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, ShadCN UI, optimized performance
 */

"use client";

import { memo, useCallback, Suspense, lazy, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchInput from "../search/SearchInput";
import { AdvancedFilterOptions } from "../../types";

// Lazy load components for code splitting
const AdvancedFilters = lazy(() => import("../filters/AdvancedFilters"));

export type SearchMode = "search" | "weather";

interface HeroSearchSectionProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  searchFilters: AdvancedFilterOptions;
  onFiltersChange: (filters: AdvancedFilterOptions) => void;
  onApplyFilters: () => void;
  isSearching: boolean;
  activeMode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  className?: string;
}

/**
 * Hero Search Section Component (Memoized for performance)
 *
 * Displays toggle buttons for Search/Weather modes with smooth transitions
 * Only shows search bar in hero - weather results are displayed below hero
 */
const HeroSearchSection = memo(
  ({
    searchTerm,
    onSearchTermChange,
    onSearchSubmit,
    searchFilters,
    onFiltersChange,
    onApplyFilters,
    isSearching,
    activeMode,
    onModeChange,
    className = "",
  }: HeroSearchSectionProps) => {
    // Handle mode change with smooth transition
    const handleModeChange = useCallback((mode: SearchMode) => {
      onModeChange(mode);
    }, [onModeChange]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={cn("max-w-4xl mx-auto px-4", className)}
      >
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center p-1.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <ToggleButton
              active={activeMode === "search"}
              onClick={() => handleModeChange("search")}
              icon={<Search className="h-4 w-4" />}
              label="Search Recipes"
            />
            <ToggleButton
              active={activeMode === "weather"}
              onClick={() => handleModeChange("weather")}
              icon={<CloudSun className="h-4 w-4" />}
              label="Weather Magic"
            />
          </div>
        </div>

        {/* Content Area with AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          {activeMode === "search" ? (
            <motion.div
              key="search-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Search Input and Advanced Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[250px]">
                  <SearchInput
                    value={searchTerm}
                    onChange={onSearchTermChange}
                    onSubmit={onSearchSubmit}
                    placeholder="What would you like to cook today?"
                  />
                </div>
                <Suspense
                  fallback={
                    <div className="h-10 w-32 bg-slate-800/50 rounded-xl animate-pulse" />
                  }
                >
                  <AdvancedFilters
                    filters={searchFilters}
                    onFiltersChange={onFiltersChange}
                    onApplyFilters={onApplyFilters}
                    isSearching={isSearching}
                  />
                </Suspense>
              </div>

              {/* Quick Tips */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center text-sm text-gray-400"
              >
                Try &quot;quick healthy dinner&quot; or &quot;pasta with
                tomatoes&quot; for AI-powered search
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="weather-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-3"
            >
              {/* Weather Mode Message */}
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <CloudSun className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Weather-Based Suggestions</p>
                  <p className="text-sm text-gray-400">Recipes perfect for your current weather</p>
                </div>
              </div>
              <p className="text-sm text-blue-300/80">
                Scroll down to see weather details and recipe recommendations
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

HeroSearchSection.displayName = "HeroSearchSection";

/**
 * Toggle Button Sub-component
 */
interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ToggleButton = memo(
  ({ active, onClick, icon, label }: ToggleButtonProps) => {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
          active
            ? "bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg shadow-purple-500/30"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
      >
        {/* Active indicator glow */}
        {active && (
          <motion.div
            layoutId="activeToggle"
            className="absolute inset-0 bg-gradient-to-r from-purple-500/80 to-pink-500/80 rounded-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </span>
      </button>
    );
  }
);

ToggleButton.displayName = "ToggleButton";

export default HeroSearchSection;
