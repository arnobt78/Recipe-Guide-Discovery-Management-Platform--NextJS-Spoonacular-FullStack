/**
 * Weather Widget Component
 *
 * Features:
 * - Fetches weather data from OpenWeather API
 * - Displays weather widget with current conditions
 * - Supports geolocation or manual city input
 * - Compact display for hero section
 * - Passes weather data up to parent for recipe suggestions
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWeatherSuggestions } from "../../hooks/useWeatherSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Cloud,
  MapPin,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { WeatherSuggestionsResponse } from "../../types";

interface WeatherWidgetProps {
  className?: string;
  onWeatherDataChange?: (
    data: WeatherSuggestionsResponse | null,
    isLoading: boolean,
    error: Error | null,
  ) => void;
}

/**
 * Weather Widget Component (Memoized for performance)
 *
 * Displays weather input and conditions, passes recipe suggestions to parent
 */
const WeatherWidget = memo(
  ({ className = "", onWeatherDataChange }: WeatherWidgetProps) => {
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
      location !== null,
    );

    // Pass weather data to parent whenever it changes
    useEffect(() => {
      if (onWeatherDataChange) {
        onWeatherDataChange(data || null, isLoading, error || null);
      }
    }, [data, isLoading, error, onWeatherDataChange]);

    // Auto-refetch when showing cached "API Limit Reached" - better UX
    // This ensures fresh data is fetched when user switches to weather mode
    // Use removeQueries to clear old data so loading skeleton shows instead of stale error
    useEffect(() => {
      if (location && data?.apiLimitReached && !isLoading) {
        // Cached API limit response - remove old data and refetch fresh
        // This shows loading state instead of the old "API Limit Reached" message
        queryClient.removeQueries({
          queryKey: ["weather", "suggestions", location],
        });
        refetch();
      }
    }, [location, data?.apiLimitReached, isLoading, queryClient, refetch]);

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
              "Unable to get your location. Please enter a city name.",
            );
            setUseGeolocation(false);
            toast.error("Location access denied. Please enter a city name.");
          },
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
      // Notify parent that weather data is cleared
      if (onWeatherDataChange) {
        onWeatherDataChange(null, false, null);
      }
      toast.info("Location cleared. Enter a new city or enable geolocation.");
    }, [onWeatherDataChange]);

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

    return (
      <Card
        className={`glow-card border-blue-500/30 w-full min-w-0 overflow-hidden ${className}`}
      >
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
            <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex-shrink-0 flex items-center">
                <Cloud className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent text-start break-words">
                  Weather-Based Suggestions
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-400 break-words mt-0.5 w-full text-start">
                  Recipes perfect for your current weather
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 justify-center sm:justify-end sm:self-start w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || !location}
                className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
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
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4">
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
                <div className="text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {locationError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
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
                  className="flex-1 min-w-0 bg-slate-900/30 backdrop-blur-sm border-blue-500/30 text-white text-sm sm:text-base rounded-xl focus:border-blue-400 focus:ring-blue-400/20"
                />
                <Button
                  onClick={handleCitySubmit}
                  className="bg-gradient-to-r from-blue-500/70 via-blue-500/50 to-cyan-500/30 hover:from-blue-500/80 hover:via-blue-500/60 hover:to-cyan-500/40 rounded-xl flex-shrink-0"
                >
                  Search
                </Button>
              </div>
            </div>
          )}

          {/* Location Display and Clear Button */}
          {data?.weather && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 min-w-0">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-300 min-w-0 w-full sm:w-auto">
                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{data.weather.location}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="text-gray-400 hover:text-white hover:bg-red-500/20 flex-shrink-0 border-2 border-white/10"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="text-sm">Clear Location</span>
              </Button>
            </div>
          )}

          {/* Weather Display */}
          {data?.weather && (
            <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 min-w-0">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Thermometer className="h-5 w-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Temperature</p>
                  <p className="text-base sm:text-lg font-semibold text-white truncate">
                    {data.weather.temperature}°C
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 min-w-0">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Cloud className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Condition</p>
                  <p className="text-base sm:text-lg font-semibold text-white capitalize truncate">
                    {data.weather.condition}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 min-w-0">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Droplets className="h-5 w-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Humidity</p>
                  <p className="text-base sm:text-lg font-semibold text-white truncate">
                    {data.weather.humidity}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 min-w-0">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Wind className="h-5 w-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Wind</p>
                  <p className="text-base sm:text-lg font-semibold text-white truncate">
                    {data.weather.windSpeed} m/s
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {data?.reasoning && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-300 break-words">
                <span className="font-semibold">AI Insight: </span>
                {data.reasoning}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

WeatherWidget.displayName = "WeatherWidget";

export default WeatherWidget;
