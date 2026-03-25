/**
 * Recipe Detail Sidebar Component
 *
 * Sidebar navigation for recipe detail page
 * Features:
 * - Logo and text at top (clickable to home)
 * - All tabs with icons + text (desktop) or icons only (mobile)
 * - Dynamic fit on screen
 * - Responsive design (15% width on mobile, sidebar on desktop)
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, ShadCN UI
 */

"use client";

import { memo } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import {
  UtensilsCrossed,
  ChefHat,
  Info,
  FlaskConical,
  Scale,
  TrendingUp,
  Flame,
  FileText,
  Image as ImageIcon,
  Leaf,
  Sparkles,
  ShoppingCart,
  List,
  Wine,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SidebarItem[];
}

interface RecipeDetailSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  hasNutrition?: boolean;
  hasTaste?: boolean;
  isAuthenticated?: boolean;
  className?: string;
  /** When true, renders for use inside Sheet (no fixed positioning, full labels). */
  embedded?: boolean;
  /** Optional callback when a tab is selected (e.g. to close Sheet on phone). */
  onNavigate?: () => void;
}

/**
 * Recipe Detail Sidebar Component (Memoized for performance)
 *
 * Provides sidebar navigation for recipe detail tabs
 */
const RecipeDetailSidebar = memo(
  ({
    activeTab,
    onTabChange,
    activeSubTab,
    onSubTabChange,
    hasNutrition = false,
    hasTaste = false,
    isAuthenticated = false,
    className = "",
    embedded = false,
    onNavigate,
  }: RecipeDetailSidebarProps) => {
    const handleTabChange = (tab: string) => {
      onTabChange(tab);
      onNavigate?.();
    };
    const handleSubTabChange = (subTab: string) => {
      onSubTabChange?.(subTab);
      onNavigate?.();
    };
    // Define all sidebar items
    const sidebarItems: SidebarItem[] = [
      {
        id: "summary",
        label: "Summary",
        icon: UtensilsCrossed,
      },
      {
        id: "info",
        label: "Info",
        icon: ChefHat,
      },
      {
        id: "details",
        label: "Details",
        icon: Info,
        subItems: [
          {
            id: "ingredients",
            label: "Ingredients",
            icon: ShoppingCart,
          },
          {
            id: "instructions",
            label: "Instructions",
            icon: List,
          },
          {
            id: "wine",
            label: "Wine Pairing",
            icon: Wine,
          },
        ],
      },
      {
        id: "analysis",
        label: "Analysis",
        icon: FlaskConical,
      },
      {
        id: "modifications",
        label: "Modifications",
        icon: Scale,
        subItems: [
          {
            id: "scale",
            label: "Scale",
            icon: Scale,
          },
          {
            id: "dietary",
            label: "Dietary",
            icon: Leaf,
          },
          {
            id: "simplify",
            label: "Simplify",
            icon: Sparkles,
          },
        ],
      },
      ...(hasNutrition
        ? [
            {
              id: "nutrition",
              label: "Nutrition",
              icon: TrendingUp,
            },
          ]
        : []),
      ...(hasTaste
        ? [
            {
              id: "taste",
              label: "Taste",
              icon: Flame,
            },
          ]
        : []),
      ...(isAuthenticated
        ? [
            {
              id: "notes",
              label: "Notes",
              icon: FileText,
            },
            {
              id: "images",
              label: "Images",
              icon: ImageIcon,
            },
            {
              id: "videos",
              label: "Videos",
              icon: Video,
            },
          ]
        : []),
    ];

    const Wrapper = embedded ? "div" : "aside";
    return (
      <Wrapper
        className={cn(
          "flex flex-col overflow-y-auto custom-scrollbar",
          "bg-slate-900/80 backdrop-blur-sm border-r border-green-500/20",
          embedded
            ? "relative h-full w-full min-w-0"
            : "fixed left-0 top-0 h-screen z-30 w-[15%] sm:w-64",
          className
        )}
      >
        {/* Logo Section - Clickable to Home */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-4 border-b border-green-500/20 hover:bg-slate-800/50 transition-colors"
        >
          <SafeImage
            src="/chef.svg"
            alt="Recipe App Logo"
            width={32}
            height={32}
            className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
            style={{ width: "auto" }}
          />
          <span
            className={cn(
              "text-sm sm:text-base font-bold gradient-text",
              embedded ? "inline" : "hidden sm:inline"
            )}
          >
            Recipe Guide
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                    "text-sm font-medium transition-all duration-200",
                    "hover:bg-green-500/20 hover:text-green-300",
                    "focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-slate-900",
                    isActive
                      ? "bg-green-600/30 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20"
                      : "text-gray-400"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span
                    className={cn(
                      "truncate",
                      embedded ? "inline" : "hidden sm:inline"
                    )}
                  >
                    {item.label}
                  </span>
                </button>

                {/* Sub-items */}
                {hasSubItems && isActive && onSubTabChange && (
                  <div className="ml-4 space-y-1 border-l border-green-500/20 pl-2">
                    {item.subItems!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeSubTab === subItem.id;

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubTabChange(subItem.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                            "text-xs sm:text-sm font-medium transition-all duration-200",
                            "hover:bg-green-500/20 hover:text-green-300",
                            "focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-slate-900",
                            isSubActive
                              ? "bg-green-600/30 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20"
                              : "text-gray-400"
                          )}
                          aria-current={isSubActive ? "page" : undefined}
                        >
                          <SubIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span
                            className={cn(
                              "truncate",
                              embedded ? "inline" : "hidden sm:inline"
                            )}
                          >
                            {subItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </Wrapper>
    );
  }
);

RecipeDetailSidebar.displayName = "RecipeDetailSidebar";

export default RecipeDetailSidebar;
