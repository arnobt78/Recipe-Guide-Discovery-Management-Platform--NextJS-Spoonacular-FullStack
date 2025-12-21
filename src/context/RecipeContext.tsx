/**
 * Recipe Context - Centralized state management for recipe-related data
 *
 * Provides:
 * - Selected recipe state
 * - Search term state
 * - Tab state
 * - Query params synchronization (read from URL on mount, write on user changes)
 *
 * Following DEVELOPMENT_RULES.md and REACT_QUERY_SETUP_GUIDE.md patterns
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { Recipe, TabType, RecipeCollection } from "../types";

interface RecipeContextType {
  selectedRecipe: Recipe | undefined;
  setSelectedRecipe: (recipe: Recipe | undefined) => void;
  selectedCollection: RecipeCollection | undefined;
  setSelectedCollection: (collection: RecipeCollection | undefined) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

/**
 * Recipe Provider Component
 * Manages recipe state and syncs with URL query params
 *
 * URL Sync Strategy:
 * - Read from URL on initial mount only
 * - Write to URL only when user explicitly changes state (not on mount)
 * - Preserves clean URLs (no params added unless user interacts)
 */
export function RecipeProvider({ children }: { children: ReactNode }) {
  // Track if this is the initial mount to prevent writing to URL on mount
  const isInitialMount = useRef(true);
  const hasInitializedFromUrl = useRef(false);

  // Initialize state from URL on mount, otherwise use defaults
  const getInitialState = useCallback(() => {
    if (typeof window === "undefined") {
      return {
        selectedRecipe: undefined,
        searchTerm: "",
        selectedTab: "search" as TabType,
        currentPage: 1,
      };
    }

    const params = new URLSearchParams(window.location.search);
    const urlSearchTerm = params.get("search") || "";
    const urlTab = (params.get("tab") as TabType | null) || "search";
    // Note: urlRecipeId can be handled by components that need it
    // We don't auto-load recipes from URL to avoid unnecessary API calls

    // Validate tab value - support all tab types
    const validTab: TabType =
      urlTab === "search" ||
      urlTab === "favourites" ||
      urlTab === "collections" ||
      urlTab === "meal-plan" ||
      urlTab === "shopping"
        ? urlTab
        : "search";

    return {
      selectedRecipe: undefined, // Recipe will be loaded separately if needed
      searchTerm: urlSearchTerm,
      selectedTab: validTab,
      currentPage: 1,
    };
  }, []);

  const initialState = getInitialState();
  const [selectedRecipe, setSelectedRecipeState] = useState<Recipe | undefined>(
    initialState.selectedRecipe
  );
  const [selectedCollection, setSelectedCollectionState] = useState<RecipeCollection | undefined>(
    undefined
  );
  const [searchTerm, setSearchTermState] = useState<string>(initialState.searchTerm);
  const [selectedTab, setSelectedTabState] = useState<TabType>(initialState.selectedTab);
  const [currentPage, setCurrentPageState] = useState<number>(initialState.currentPage);

  // Initialize from URL on mount (only once)
  useEffect(() => {
    if (hasInitializedFromUrl.current) return;
    hasInitializedFromUrl.current = true;

    const params = new URLSearchParams(window.location.search);
    const urlSearchTerm = params.get("search");
    const urlTab = params.get("tab") as TabType | null;
    // Note: urlRecipeId can be handled by components that need it
    // We don't auto-load recipes from URL to avoid unnecessary API calls

    if (urlSearchTerm) {
      setSearchTermState(urlSearchTerm);
    }

    if (
      urlTab &&
      (urlTab === "search" ||
        urlTab === "favourites" ||
        urlTab === "collections" ||
        urlTab === "meal-plan" ||
        urlTab === "shopping")
    ) {
      setSelectedTabState(urlTab);
    }

    // Recipe ID in URL can be handled by components that need it
    // For now, we don't auto-load recipes from URL to avoid unnecessary API calls
  }, []);

  // Memoized setters that sync to URL (only after initial mount)
  const handleSetSelectedRecipe = useCallback((recipe: Recipe | undefined) => {
    setSelectedRecipeState(recipe);

    // Sync to URL only if not initial mount
    if (!isInitialMount.current) {
      const params = new URLSearchParams(window.location.search);

      if (recipe) {
        params.set("recipeId", recipe.id.toString());
      } else {
        params.delete("recipeId");
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);

    // Sync to URL only if not initial mount
    if (!isInitialMount.current) {
      const params = new URLSearchParams(window.location.search);

      if (term.trim()) {
        params.set("search", term);
      } else {
        params.delete("search");
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleSetSelectedTab = useCallback((tab: TabType) => {
    setSelectedTabState(tab);

    // Sync to URL only if not initial mount
    if (!isInitialMount.current) {
      const params = new URLSearchParams(window.location.search);

      // Only add tab param if it's not the default "search"
      // This keeps URLs clean (no ?tab=search) while preserving other tabs
      if (tab !== "search") {
        params.set("tab", tab);
      } else {
        // Remove tab param for "search" (default) to keep URL clean
        params.delete("tab");
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleSetCurrentPage = useCallback(
    (page: number | ((prev: number) => number)) => {
      if (typeof page === "function") {
        setCurrentPageState((prev) => {
          const newPage = page(prev);
          return newPage;
        });
      } else {
        setCurrentPageState(page);
      }
    },
    []
  );

  // Mark initial mount as complete after first render
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      selectedRecipe,
      setSelectedRecipe: handleSetSelectedRecipe,
      selectedCollection,
      setSelectedCollection: setSelectedCollectionState,
      searchTerm,
      setSearchTerm: handleSetSearchTerm,
      selectedTab,
      setSelectedTab: handleSetSelectedTab,
      currentPage,
      setCurrentPage: handleSetCurrentPage,
    }),
    [
      selectedRecipe,
      handleSetSelectedRecipe,
      selectedCollection,
      searchTerm,
      handleSetSearchTerm,
      selectedTab,
      handleSetSelectedTab,
      currentPage,
      handleSetCurrentPage,
    ]
  );

  return (
    <RecipeContext.Provider value={contextValue}>{children}</RecipeContext.Provider>
  );
}

/**
 * Hook to use Recipe Context
 */
export function useRecipeContext() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error("useRecipeContext must be used within a RecipeProvider");
  }
  return context;
}

