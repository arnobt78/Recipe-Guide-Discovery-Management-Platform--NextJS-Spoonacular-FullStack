/**
 * Reusable Search Input Component with Autocomplete
 *
 * Features:
 * - ShadCN Input component
 * - Autocomplete suggestions from Spoonacular API
 * - Search icon
 * - Gradient glow styling
 * - Responsive design (phone-screen and sm:desktop-screen)
 * - Accessible and reusable
 * 
 * Following SPOONACULAR_API_DOCS.md: Uses /recipes/autocomplete endpoint
 */

import { memo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { AiOutlineSearch } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { useAutocompleteRecipes } from "../hooks/useRecipes";
import { getRecipeImageUrl } from "../utils/imageUtils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
}

/**
 * Reusable Search Input Component with Autocomplete (Memoized for performance)
 *
 * Features:
 * - ShadCN Input component
 * - Autocomplete dropdown with recipe suggestions
 * - Debounced autocomplete API calls
 * - Responsive design
 * - Accessible and reusable
 */
const SearchInput = memo(
  ({
    value,
    onChange,
    onSubmit,
    placeholder = "Find your favourite recipe...",
  }: SearchInputProps) => {
    const router = useRouter();
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(value);
    const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track user interaction
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce autocomplete query (300ms delay)
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedQuery(value);
      }, 300);

      return () => clearTimeout(timer);
    }, [value]);

    // Fetch autocomplete suggestions
    const { data: autocompleteResults = [], isLoading: isLoadingAutocomplete } = useAutocompleteRecipes(
      debouncedQuery,
      10,
      debouncedQuery.trim().length >= 2
    );

    // Show autocomplete only when user has interacted AND there are results
    // This prevents auto-expanding on page load/navigation return
    useEffect(() => {
      if (hasUserInteracted) {
        setShowAutocomplete(
          value.trim().length >= 2 &&
          autocompleteResults.length > 0 &&
          !isLoadingAutocomplete
        );
      } else {
        // Don't show autocomplete if user hasn't interacted yet
        setShowAutocomplete(false);
      }
    }, [value, autocompleteResults, isLoadingAutocomplete, hasUserInteracted]);

    // Handle clicking outside to close autocomplete
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setShowAutocomplete(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle autocomplete selection
    const handleAutocompleteSelect = useCallback((recipeId: number) => {
      setShowAutocomplete(false);
      router.push(`/recipe/${recipeId}`);
    }, [router]);

    // Handle form submit
    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      setShowAutocomplete(false);
      onSubmit(e);
    }, [onSubmit]);

    return (
      <div ref={containerRef} className="relative w-full">
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-2 border border-purple-500/30 shadow-glow"
        >
          <Input
            ref={inputRef}
            type="text"
            required
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              setHasUserInteracted(true); // Mark as interacted when user types
              onChange(e.target.value);
            }}
            onFocus={() => {
              setHasUserInteracted(true); // Mark as interacted when user focuses
              if (value.trim().length >= 2 && autocompleteResults.length > 0) {
                setShowAutocomplete(true);
              }
              
              // Smooth scroll to search content on responsive screens (mobile/tablet)
              // Only scroll if we're on a small screen (below md breakpoint)
              if (window.innerWidth < 768) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                  const searchContent = document.querySelector('[data-search-content]');
                  if (searchContent) {
                    searchContent.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start',
                      inline: 'nearest'
                    });
                  }
                }, 100);
              }
            }}
            className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 text-lg sm:text-2xl border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Search recipes"
            aria-required="true"
            aria-autocomplete="list"
            aria-expanded={showAutocomplete}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="p-2 sm:p-3 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 transition-colors flex-shrink-0"
            aria-label="Search recipes"
          >
            <AiOutlineSearch className="h-6 w-6 sm:h-10 sm:w-10" />
          </Button>
        </motion.form>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showAutocomplete && autocompleteResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <Card className="bg-slate-800/95 backdrop-blur-md border-purple-500/30 shadow-lg max-h-96 overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-1">
                  {autocompleteResults.map((recipe) => {
                    const imageUrl = recipe.imageType
                      ? getRecipeImageUrl(recipe.id, recipe.imageType)
                      : null;

                    return (
                      <button
                        key={recipe.id}
                        onClick={() => handleAutocompleteSelect(recipe.id)}
                        className="w-full flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-purple-500/20 transition-colors text-left group"
                      >
                        {/* Recipe Image */}
                        {imageUrl && (
                          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-purple-500/20">
                            <img
                              src={imageUrl}
                              alt={recipe.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}

                        {/* Recipe Title */}
                        <span className="flex-1 text-white group-hover:text-purple-200 font-medium text-sm sm:text-base break-words">
                          {recipe.title}
                        </span>

                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs flex-shrink-0">
                          View
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
