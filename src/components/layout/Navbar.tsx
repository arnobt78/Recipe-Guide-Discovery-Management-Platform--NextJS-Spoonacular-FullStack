/**
 * Reusable Navbar Component
 *
 * Features:
 * - Modern gradient design with glow effects
 * - Logo and brand name
 * - Authentication controls (Login/Logout)
 * - User profile dropdown with avatar when authenticated
 * - RoboHash avatar fallback for email/password users
 * - ShadCN UI components (DropdownMenu)
 * - Smooth login/logout transitions without page refresh
 * - Welcome/Goodbye toast messages
 * - Memoized for performance
 *
 * Note: Navigation tabs are handled by TabNavigation component below hero section
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, optimized performance
 */

import { memo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  User,
  LogOut,
  BookOpen,
  Heart,
  FolderOpen,
  Calendar,
  ShoppingCart,
  BarChart3,
  Home,
  Activity,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRecipeContext } from "../../context/RecipeContext";
import { LoginDialog } from "../auth/LoginDialog";
import { RegisterDialog } from "../auth/RegisterDialog";
import MobileNavbar, { MOBILE_NAV_ICON_CLASS } from "./MobileNavbar";
import { toast } from "sonner";

// Keys for persisting auth state in localStorage
const AUTH_STATE_KEY = "navbar_was_authenticated";
const OAUTH_PENDING_KEY = "oauth_login_pending";

/**
 * Navbar Component (Memoized for performance)
 *
 * Provides logo and authentication controls
 * Navigation tabs are handled by TabNavigation component below hero section
 */
const Navbar = memo(() => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { setSelectedTab } = useRecipeContext();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track if user was authenticated (persisted in localStorage for page refresh)
  // This prevents flicker by showing skeleton instead of Login during session loading
  // Initialize to false for SSR consistency - will be updated after mount
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

  // Track previous auth state to show welcome/goodbye messages
  const prevAuthRef = useRef<boolean | null>(null);
  const prevUserNameRef = useRef<string | null>(null);

  // Initialize wasAuthenticated from localStorage after mount (for SSR consistency)
  useEffect(() => {
    setMounted(true);
    const storedAuth = localStorage.getItem(AUTH_STATE_KEY) === "true";
    setWasAuthenticated(storedAuth);
  }, []);

  // Sync auth state to localStorage and update wasAuthenticated
  // Also handle OAuth pending cleanup
  useEffect(() => {
    // Only run after mounted to avoid SSR issues
    if (!mounted) return;

    const oauthPending = localStorage.getItem(OAUTH_PENDING_KEY) === "true";

    if (isAuthenticated) {
      // Login successful - set auth flag and clear OAuth pending
      localStorage.setItem(AUTH_STATE_KEY, "true");
      localStorage.removeItem(OAUTH_PENDING_KEY);
      setWasAuthenticated(true);
    } else if (!isLoading) {
      // Session finished loading and user is not authenticated
      if (oauthPending) {
        // OAuth login was attempted but failed (user cancelled or error)
        // Clear both flags
        localStorage.removeItem(AUTH_STATE_KEY);
        localStorage.removeItem(OAUTH_PENDING_KEY);
      } else {
        // Normal case - just clear auth flag
        localStorage.removeItem(AUTH_STATE_KEY);
      }
      setWasAuthenticated(false);
    }
  }, [isAuthenticated, isLoading, mounted]);

  // Show welcome message when user logs in, goodbye message when user logs out
  useEffect(() => {
    // Skip initial mount
    if (prevAuthRef.current === null) {
      prevAuthRef.current = isAuthenticated;
      prevUserNameRef.current = user?.name || null;
      return;
    }

    // User just logged in
    if (!prevAuthRef.current && isAuthenticated && user) {
      const firstName = user.name?.split(" ")[0] || "Chef";
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-2xl">👋</span>
          <div>
            <p className="font-semibold">Welcome back, {firstName}!</p>
            <p className="text-sm text-gray-400">
              Let&apos;s cook something amazing together!
            </p>
          </div>
        </div>,
        { duration: 4000 }
      );
      setIsLoggingOut(false);
    }

    // User just logged out
    if (prevAuthRef.current && !isAuthenticated && isLoggingOut) {
      const firstName = prevUserNameRef.current?.split(" ")[0] || "Chef";
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-2xl">👋</span>
          <div>
            <p className="font-semibold">Goodbye, {firstName}!</p>
            <p className="text-sm text-gray-400">
              We&apos;ll cook together again soon!
            </p>
          </div>
        </div>,
        { duration: 4000 }
      );
      setIsLoggingOut(false);
    }

    // Update refs
    prevAuthRef.current = isAuthenticated;
    prevUserNameRef.current = user?.name || null;
  }, [isAuthenticated, user, isLoggingOut]);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.image, user?.email]);

  /**
   * Get user avatar URL
   * Uses Google image if available, otherwise RoboHash fallback
   */
  const getAvatarUrl = () => {
    // If avatar failed to load, use RoboHash
    if (avatarError) {
      return `https://robohash.org/${
        user?.name || user?.email || "user"
      }.png?size=80x80`;
    }
    // Check for user image from OAuth (Google)
    if (user?.image && user.image.trim() !== "") {
      return user.image;
    }
    // Fallback to RoboHash for email/password users
    return `https://robohash.org/${
      user?.name || user?.email || "user"
    }.png?size=80x80`;
  };

  /**
   * Handle menu item click - navigate to tab
   */
  const handleMenuItemClick = (
    tab: "favourites" | "collections" | "meal-plan" | "shopping"
  ) => {
    setSelectedTab(tab);
    router.push("/");
  };

  /**
   * Handle logout - smooth transition without page refresh
   */
  const handleLogout = async () => {
    // Set logging out state to track for goodbye message
    setIsLoggingOut(true);
    // Immediately clear persisted auth state to prevent skeleton on next render
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STATE_KEY);
      localStorage.removeItem(OAUTH_PENDING_KEY);
    }
    setWasAuthenticated(false);
    // Perform logout (no page refresh)
    await logout();
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full min-w-0 border-b border-green-500/20 bg-slate-900/80 backdrop-blur-md shadow-lg shadow-green-500/10"
    >
      <div className="max-w-9xl w-full mx-auto px-2 sm:px-4 md:px-6 xl:px-8 min-w-0 overflow-hidden">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Image
              src="/chef.svg"
              alt="Recipe App Logo"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10 cursor-pointer"
              style={{ width: "auto" }}
              onClick={() => router.push("/")}
            />
            <h1
              className="text-xl md:text-2xl font-bold gradient-text drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] cursor-pointer"
              onClick={() => router.push("/")}
            >
              Recipe Guide
            </h1>
          </motion.div>

          {/* Navigation & Auth Buttons */}
          <div className="flex items-center gap-2">
            {/* Home Link */}
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white hover:bg-green-500/20 hover:shadow-md hover:shadow-green-500/20 transition-all duration-300"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            {/* Blog Link */}
            <Button
              variant="ghost"
              onClick={() => router.push("/blog")}
              className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white hover:bg-purple-500/20 hover:shadow-md hover:shadow-purple-500/20 transition-all duration-300"
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog</span>
            </Button>
            {/* Business Insights Link */}
            <Button
              variant="ghost"
              onClick={() => router.push("/business-insights")}
              className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white hover:bg-cyan-500/20 hover:shadow-md hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Insights</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/api-status")}
              className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white hover:bg-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <Activity className="h-4 w-4" />
              <span>API Status</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/api-docs")}
              className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white hover:bg-violet-500/20 hover:shadow-md hover:shadow-violet-500/20 transition-all duration-300"
            >
              <FileText className="h-4 w-4" />
              <span>API Docs</span>
            </Button>
            {/* Auth Section - Three states (SSR-safe):
                1. Authenticated → Profile dropdown
                2. Mounted + Loading + wasAuthenticated → Skeleton (prevents Login flicker on refresh)
                3. Not authenticated OR not mounted → Login button (default for SSR consistency)
            */}
            {isAuthenticated ? (
              /* Authenticated - Show profile dropdown */
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-emerald-500/50 transition-all duration-300"
                  >
                    <div className="h-9 w-9 rounded-full border-2 border-emerald-500/50 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarUrl()}
                        alt={user?.name || "User"}
                        className="h-full w-full object-cover"
                        onError={() => setAvatarError(true)}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-slate-900/95 backdrop-blur-md border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  align="end"
                  forceMount
                >
                  {/* User Info */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-emerald-500/20" />

                  {/* Navigation Items */}
                  <DropdownMenuItem
                    onClick={() => handleMenuItemClick("favourites")}
                    className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-emerald-500/20"
                  >
                    <Heart className="mr-2 h-4 w-4 text-red-400" />
                    <span>Favourites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleMenuItemClick("collections")}
                    className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-emerald-500/20"
                  >
                    <FolderOpen className="mr-2 h-4 w-4 text-yellow-400" />
                    <span>Collections</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleMenuItemClick("meal-plan")}
                    className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-emerald-500/20"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                    <span>Meal Plan</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleMenuItemClick("shopping")}
                    className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-emerald-500/20"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4 text-purple-400" />
                    <span>Shopping List</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-emerald-500/20" />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : mounted && isLoading && wasAuthenticated ? (
              /* Loading + was authenticated - Show skeleton to prevent Login flicker
                 Only render after mount to avoid SSR hydration mismatch */
              <Skeleton className="h-9 w-9 rounded-full bg-slate-700/50" />
            ) : (
              /* Not Authenticated - Show login button */
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsLoginDialogOpen(true)}
                  className={`${MOBILE_NAV_ICON_CLASS} sm:gap-2 sm:min-w-0 sm:w-auto sm:px-4`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
                <LoginDialog
                  open={isLoginDialogOpen}
                  onOpenChange={setIsLoginDialogOpen}
                  onSwitchToRegister={() => setIsRegisterDialogOpen(true)}
                />
                <RegisterDialog
                  open={isRegisterDialogOpen}
                  onOpenChange={setIsRegisterDialogOpen}
                  onSwitchToLogin={() => setIsLoginDialogOpen(true)}
                />
              </>
            )}
            {/* Mobile: Burger menu - right of user icon */}
            <MobileNavbar
              onLoginClick={() => setIsLoginDialogOpen(true)}
              onRegisterClick={() => setIsRegisterDialogOpen(true)}
            />
          </div>
        </div>
      </div>
    </motion.nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
