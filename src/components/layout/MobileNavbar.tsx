"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Home,
  BookOpen,
  BarChart3,
  Activity,
  FileText,
  ChefHat,
  Heart,
  FolderOpen,
  Calendar,
  ShoppingCart,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRecipeContext } from "../../context/RecipeContext";
import { TabType } from "../../types";

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  className?: string;
};

type TabItem = {
  value: TabType;
  label: string;
  icon: React.ReactNode;
};

const MAIN_NAV: NavItem[] = [
  { label: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Blog", path: "/blog", icon: <BookOpen className="h-5 w-5" /> },
  {
    label: "Insights",
    path: "/business-insights",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "API Status",
    path: "/api-status",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: "API Docs",
    path: "/api-docs",
    icon: <FileText className="h-5 w-5" />,
  },
];

const TAB_ITEMS: TabItem[] = [
  { value: "search", label: "Recipe Search", icon: <ChefHat className="h-5 w-5" /> },
  { value: "favourites", label: "Favourites", icon: <Heart className="h-5 w-5" /> },
  { value: "collections", label: "Collections", icon: <FolderOpen className="h-5 w-5" /> },
  { value: "meal-plan", label: "Meal Plan", icon: <Calendar className="h-5 w-5" /> },
  { value: "shopping", label: "Shopping List", icon: <ShoppingCart className="h-5 w-5" /> },
];

/** Shared class for mobile nav icons (burger + user) - use in Navbar for consistency */
export const MOBILE_NAV_ICON_CLASS =
  "inline-flex items-center justify-center h-10 w-10 min-w-10 rounded-md p-0 text-gray-300 hover:text-white hover:bg-green-500/20 transition-all duration-300";

interface MobileNavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

const MobileNavbar = memo(({ onLoginClick, onRegisterClick }: MobileNavbarProps) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { setSelectedTab } = useRecipeContext();
  const [open, setOpen] = useState(false);

  const handleNavClick = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleTabClick = (tab: TabType) => {
    setOpen(false);
    setSelectedTab(tab);
    router.push("/");
  };

  const handleLoginClick = () => {
    setOpen(false);
    onLoginClick?.();
  };

  const handleRegisterClick = () => {
    setOpen(false);
    onRegisterClick?.();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${MOBILE_NAV_ICON_CLASS} sm:hidden`}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(320px,85vw)] bg-slate-900/98 backdrop-blur-md border-emerald-500/20"
      >
        <SheetHeader className="border-b border-emerald-500/20 pb-4">
          <SheetTitle className="text-white text-left font-bold gradient-text">
            Menu
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Main Navigation */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Pages
            </p>
            <nav className="flex flex-col gap-1">
              {MAIN_NAV.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-emerald-500/20 transition-colors text-left"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Navigation (Home page tabs) */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Recipe Tabs
            </p>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => handleTabClick("search")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-emerald-500/20 transition-colors text-left"
              >
                <ChefHat className="h-5 w-5" />
                <span>Recipe Search</span>
              </button>
              {isAuthenticated &&
                TAB_ITEMS.slice(1).map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-emerald-500/20 transition-colors text-left"
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
            </nav>
          </div>

          {/* Auth Section */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Account
            </p>
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <div className="px-3 py-2.5 rounded-lg bg-slate-800/50">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-emerald-500/20 transition-colors text-left"
                  >
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-emerald-500/20 transition-colors text-left"
                  >
                    <User className="h-5 w-5" />
                    <span>Register</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

MobileNavbar.displayName = "MobileNavbar";

export default MobileNavbar;
