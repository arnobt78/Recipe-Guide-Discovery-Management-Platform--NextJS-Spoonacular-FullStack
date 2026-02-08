/**
 * Reusable Tab Navigation Component
 *
 * Features:
 * - ShadCN Tabs component
 * - Query params synchronization
 * - Gradient styling
 * - Accessible navigation
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ChefHat, Heart, Folder, Calendar, ShoppingCart } from "lucide-react";
import { TabType } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface TabNavigationProps {
  value: TabType;
  onValueChange: (value: TabType) => void;
}

/**
 * Reusable Tab Navigation Component (Memoized for performance)
 *
 * Features:
 * - ShadCN Tabs component
 * - Query params synchronization
 * - Gradient styling
 * - Accessible navigation
 * - Collections tab (only for authenticated users)
 */
const TabNavigation = memo(({ value, onValueChange }: TabNavigationProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-4 sm:mb-6"
    >
      <Tabs value={value} onValueChange={(v) => onValueChange(v as TabType)}>
        <TabsList
          className={`grid w-full min-w-0 max-w-full ${
            isAuthenticated ? "max-w-9xl grid-cols-5" : "max-w-md grid-cols-1"
          } bg-slate-800/50 border border-green-500/30 shadow-lg shadow-green-500/10 overflow-x-auto overflow-y-hidden`}
        >
          <TabsTrigger
            value="search"
            title="Recipe Search"
            className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-900 data-[state=active]:via-emerald-700 data-[state=active]:to-green-800 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-700/50 text-xs sm:text-sm transition-all duration-300"
          >
            <ChefHat className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Recipe Search</span>
          </TabsTrigger>
          {isAuthenticated && (
            <>
              <TabsTrigger
                value="favourites"
                title="Favourites"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-900 data-[state=active]:via-emerald-700 data-[state=active]:to-green-800 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-700/50 text-xs sm:text-sm transition-all duration-300"
              >
                <Heart className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Favourites</span>
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                title="Collections"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-900 data-[state=active]:via-emerald-700 data-[state=active]:to-green-800 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-700/50 text-xs sm:text-sm transition-all duration-300"
              >
                <Folder className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Collections</span>
              </TabsTrigger>
              <TabsTrigger
                value="meal-plan"
                title="Meal Plan"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-900 data-[state=active]:via-emerald-700 data-[state=active]:to-green-800 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-700/50 text-xs sm:text-sm transition-all duration-300"
              >
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Meal Plan</span>
              </TabsTrigger>
              <TabsTrigger
                value="shopping"
                title="Shopping"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-900 data-[state=active]:via-emerald-700 data-[state=active]:to-green-800 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-700/50 text-xs sm:text-sm transition-all duration-300"
              >
                <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Shopping</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </Tabs>
    </motion.div>
  );
});

TabNavigation.displayName = "TabNavigation";

export default TabNavigation;
