/**
 * Reusable Navbar Component
 *
 * Features:
 * - Modern gradient design with glow effects
 * - Logo and brand name
 * - Authentication controls (Login/Logout)
 * - User profile display when authenticated
 * - ShadCN UI components
 * - Memoized for performance
 *
 * Note: Navigation tabs are handled by TabNavigation component below hero section
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, optimized performance
 */

import { memo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { User, LogOut, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LoginDialog } from "../auth/LoginDialog";
import { RegisterDialog } from "../auth/RegisterDialog";

/**
 * Navbar Component (Memoized for performance)
 *
 * Provides logo and authentication controls
 * Navigation tabs are handled by TabNavigation component below hero section
 */
const Navbar = memo(() => {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full border-b border-green-500/20 bg-slate-900/80 backdrop-blur-md shadow-lg shadow-green-500/10"
    >
      <div className="w-full max-w-7xl mx-auto px-2 xl:px-0">
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
            {/* Blog Link */}
            <Button
              variant="ghost"
              onClick={() => router.push("/blog")}
              className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white hover:bg-purple-500/20 hover:shadow-md hover:shadow-purple-500/20 transition-all duration-300"
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog</span>
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {user?.picture && (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={user.picture}
                        alt={user.name || "User"}
                        fill
                        sizes="24px"
                        className="object-cover rounded-full"
                      />
                    </div>
                  )}
                  <span className="hidden md:inline">
                    {user?.name || user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="text-gray-300 hover:text-white hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/20 transition-all duration-300"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsLoginDialogOpen(true)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-green-500/20 hover:shadow-md hover:shadow-green-500/20 transition-all duration-300"
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
          </div>
        </div>
      </div>
    </motion.nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
