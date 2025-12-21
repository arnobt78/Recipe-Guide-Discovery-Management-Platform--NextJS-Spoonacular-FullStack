/**
 * Reusable Navbar Component
 *
 * Features:
 * - Modern gradient design with glow effects
 * - Responsive navigation
 * - Logo and navigation links
 * - ShadCN UI components
 * - Memoized for performance
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, optimized performance
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  ChefHat,
  Heart,
  Folder,
  Calendar,
  ShoppingCart,
  User,
  LogOut,
} from "lucide-react";
import { useRecipeContext } from "../context/RecipeContext";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar Component (Memoized for performance)
 *
 * Provides navigation between all tabs (Search, Favourites, Collections, Meal Plan, Shopping)
 * Uses context for state management
 * Shows Collections, Meal Plan, and Shopping tabs only for authenticated users
 */
const Navbar = memo(() => {
  const { selectedTab, setSelectedTab } = useRecipeContext();
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-md"
    >
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-0">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <img
              src="/chef.svg"
              alt="Recipe App Logo"
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <h1 className="text-xl md:text-2xl font-bold gradient-text">
              Recipe Guide
            </h1>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTab === "search" ? "default" : "ghost"}
              onClick={() => setSelectedTab("search")}
              className={`flex items-center gap-2 ${
                selectedTab === "search"
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
                  : "text-gray-300 hover:text-white hover:bg-purple-500/20"
              }`}
            >
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <Button
              variant={selectedTab === "favourites" ? "default" : "ghost"}
              onClick={() => setSelectedTab("favourites")}
              className={`flex items-center gap-2 ${
                selectedTab === "favourites"
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
                  : "text-gray-300 hover:text-white hover:bg-purple-500/20"
              }`}
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favourites</span>
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant={selectedTab === "collections" ? "default" : "ghost"}
                  onClick={() => setSelectedTab("collections")}
                  className={`flex items-center gap-2 ${
                    selectedTab === "collections"
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
                      : "text-gray-300 hover:text-white hover:bg-purple-500/20"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  <span className="hidden sm:inline">Collections</span>
                </Button>
                <Button
                  variant={selectedTab === "meal-plan" ? "default" : "ghost"}
                  onClick={() => setSelectedTab("meal-plan")}
                  className={`flex items-center gap-2 ${
                    selectedTab === "meal-plan"
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
                      : "text-gray-300 hover:text-white hover:bg-purple-500/20"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Meal Plan</span>
                </Button>
                <Button
                  variant={selectedTab === "shopping" ? "default" : "ghost"}
                  onClick={() => setSelectedTab("shopping")}
                  className={`flex items-center gap-2 ${
                    selectedTab === "shopping"
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
                      : "text-gray-300 hover:text-white hover:bg-purple-500/20"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Shopping</span>
                </Button>
              </>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-purple-500/20">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {user?.picture && (
                    <img
                      src={user.picture}
                      alt={user.name || "User"}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="hidden md:inline">
                    {user?.name || user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="text-gray-300 hover:text-white hover:bg-purple-500/20"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => loginWithRedirect()}
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-purple-500/20 ml-2 pl-2 border-l border-purple-500/20"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
