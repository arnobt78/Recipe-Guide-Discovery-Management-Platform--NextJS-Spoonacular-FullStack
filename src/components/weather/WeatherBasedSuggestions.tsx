/**
 * Weather-Based Recipe Suggestions Component
 *
 * Features:
 * - Fetches weather data from OpenWeather API
 * - Gets AI-powered recipe suggestions based on weather
 * - Displays weather widget with current conditions
 * - Shows weather-appropriate recipe recommendations
 * - Supports geolocation or manual city input
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWeatherSuggestions } from "../../hooks/useWeatherSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Cloud,
  MapPin,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  X,
} from "lucide-react";
import RecipeGrid from "../recipes/RecipeGrid";
import SkeletonRecipeGrid from "../skeletons/SkeletonRecipeGrid";
import EmptyState from "../common/EmptyState";
import { toast } from "sonner";
import { Recipe } from "../../types";
import {
  useFavouriteRecipes,
  useAddFavouriteRecipe,
  useRemoveFavouriteRecipe,
} from "../../hooks/useRecipes";

interface WeatherBasedSuggestionsProps {
  className?: string;
}

/**
 * Weather-Based Suggestions Component (Memoized for performance)
 *
 * Displays weather-appropriate recipe suggestions based on current weather conditions
 */
const WeatherBasedSuggestions = memo(
  ({ className = "" }: WeatherBasedSuggestionsProps) => {
    const [location, setLocation] = useState<{
      lat?: number;
      lon?: number;
      city?: string;
      units?: "metric" | "imperial";
    } | null>(null);
    const [cityInput, setCityInput] = useState("");
    const [useGeolocation, setUseGeolocation] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const { data, isLoading, error, refetch } = useWeatherSuggestions(
      location,
      location !== null
    );
    const { data: favouriteRecipes = [] } = useFavouriteRecipes();
    const addFavourite = useAddFavouriteRecipe();
    const removeFavourite = useRemoveFavouriteRecipe();

    // Get user's geolocation
    useEffect(() => {
      if (useGeolocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              units: "metric",
            });
            setLocationError(null);
          },
          (_error) => {
            setLocationError(
              "Unable to get your location. Please enter a city name."
            );
            setUseGeolocation(false);
            toast.error("Location access denied. Please enter a city name.");
          }
        );
      }
    }, [useGeolocation]);

    // Handle city input submission
    const handleCitySubmit = useCallback(() => {
      if (!cityInput.trim()) {
        toast.error("Please enter a city name");
        return;
      }
      setLocation({
        city: cityInput.trim(),
        units: "metric",
      });
      setLocationError(null);
    }, [cityInput]);

    // Handle clear location
    const handleClearLocation = useCallback(() => {
      setLocation(null);
      setCityInput("");
      setLocationError(null);
      setUseGeolocation(false);
      toast.info("Location cleared. Enter a new city or enable geolocation.");
    }, []);

    // Handle refresh with cache invalidation
    const handleRefresh = useCallback(() => {
      if (location) {
        // Invalidate cache to force fresh fetch
        queryClient.invalidateQueries({
          queryKey: ["weather", "suggestions", location],
        });
        refetch();
        toast.info("Refreshing weather suggestions...");
      }
    }, [location, refetch, queryClient]);

    // Handle favourite toggle
    const handleFavouriteToggle = useCallback(
      (
        recipe: { id: number; title: string; image: string; imageType: string },
        isFavourite: boolean
      ) => {
        if (isFavourite) {
          removeFavourite.mutate(recipe as Recipe, {
            onSuccess: () => {
              toast.success(`Removed "${recipe.title}" from favourites`);
            },
          });
        } else {
          addFavourite.mutate(recipe, {
            onSuccess: () => {
              toast.success(`Added "${recipe.title}" to favourites`);
            },
          });
        }
      },
      [addFavourite, removeFavourite]
    );

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Weather Widget Header */}
        <Card className="glow-card border-blue-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl self-stretch flex items-center">
                  <Cloud className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent text-start">
                    Weather-Based Suggestions
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    Recipes perfect for your current weather
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading || !location}
                  className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                {location && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLocation}
                    className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Location Input */}
            {!location && (
              <div className="space-y-3">
                {useGeolocation && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>Getting your location...</span>
                  </div>
                )}
                {locationError && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    {locationError}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter city name (e.g., London, New York)"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCitySubmit();
                      }
                    }}
                    className="bg-slate-900/30 backdrop-blur-sm border-blue-500/30 text-white text-base rounded-xl focus:border-blue-400 focus:ring-blue-400/20"
                  />
                  <Button
                    onClick={handleCitySubmit}
                    className="bg-gradient-to-r from-blue-500/70 via-blue-500/50 to-cyan-500/30 hover:from-blue-500/80 hover:via-blue-500/60 hover:to-cyan-500/40 rounded-xl"
                  >
                    Search
                  </Button>
                </div>
              </div>
            )}

            {/* Location Display and Clear Button */}
            {data?.weather && (
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>{data.weather.location}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLocation}
                  className="text-gray-400 hover:text-white hover:bg-red-500/20"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Location
                </Button>
              </div>
            )}

            {/* Weather Display */}
            {data?.weather && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Thermometer className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Temperature</p>
                    <p className="text-lg font-semibold text-white">
                      {data.weather.temperature}°C
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Cloud className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Condition</p>
                    <p className="text-lg font-semibold text-white capitalize">
                      {data.weather.condition}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Droplets className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Humidity</p>
                    <p className="text-lg font-semibold text-white">
                      {data.weather.humidity}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Wind className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Wind</p>
                    <p className="text-lg font-semibold text-white">
                      {data.weather.windSpeed} m/s
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {data?.reasoning && (
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">AI Insight: </span>
                  {data.reasoning}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipe Suggestions */}
        {isLoading && <SkeletonRecipeGrid count={6} />}

        {error && (
          <Card className="bg-slate-800/50 border-red-500/30 p-4">
            <CardContent className="p-6 text-center">
              <p className="text-red-400 mb-2">
                Failed to load weather suggestions
              </p>
              <p className="text-sm text-gray-400">
                {error.message || "Please try again later"}
              </p>
              <Button
                onClick={handleRefresh}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {data && !isLoading && !error && (
          <>
            {data.suggestions && data.suggestions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Perfect Recipes for This Weather
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {data.suggestions.length} recipes
                  </Badge>
                </div>
                <RecipeGrid
                  recipes={data.suggestions}
                  favouriteRecipes={favouriteRecipes}
                  onFavouriteToggle={handleFavouriteToggle}
                />
              </div>
            ) : data.apiLimitReached ? (
              <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
                <CardContent className="p-6 text-center">
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-500/20 rounded-lg inline-block mx-auto">
                      <Cloud className="h-8 w-8 text-amber-400 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      API Limit Reached
                    </h3>
                    <p className="text-sm text-gray-300">
                      {data.message ||
                        "Daily API limit reached. Recipe suggestions will be available tomorrow."}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Weather data is still available above. You can still
                      search for recipes manually using the search bar!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                message="No weather-based suggestions available"
                subtitle="Try refreshing or checking your location"
              />
            )}
          </>
        )}
      </div>
    );
  }
);

WeatherBasedSuggestions.displayName = "WeatherBasedSuggestions";

export default WeatherBasedSuggestions;
