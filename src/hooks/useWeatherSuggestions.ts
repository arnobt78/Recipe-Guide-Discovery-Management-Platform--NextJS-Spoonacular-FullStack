/**
 * React Query hook for weather-based recipe suggestions
 *
 * Features:
 * - Fetches weather data from OpenWeather API
 * - Gets AI-powered recipe suggestions based on weather
 * - Caches weather data (1 hour stale time)
 * - Centralized error handling with toast notifications
 *
 * Following REACT_QUERY_SETUP_GUIDE.md patterns:
 * - staleTime: 1 hour (weather doesn't change frequently)
 * - refetchOnMount: true = Refetch ONLY when data is stale
 * - Result: Cache for 1 hour, then refetch once
 */

import { useQuery } from "@tanstack/react-query";
import * as api from "../api";
import { WeatherSuggestionsResponse } from "../types";

/**
 * Hook to get weather-based recipe suggestions
 *
 * @param location - Location object with lat/lon or city name
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with weather data and recipe suggestions
 */
export function useWeatherSuggestions(
  location: {
    lat?: number;
    lon?: number;
    city?: string;
    units?: "metric" | "imperial";
  } | null,
  enabled: boolean = true
) {
  return useQuery<WeatherSuggestionsResponse, Error>({
    queryKey: ["weather", "suggestions", location],
    queryFn: async () => {
      if (!location) {
        throw new Error("Location is required");
      }
      return api.getWeatherSuggestions(location);
    },
    enabled: enabled && location !== null,
    staleTime: 60 * 60 * 1000, // 1 hour - weather doesn't change frequently
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
}

