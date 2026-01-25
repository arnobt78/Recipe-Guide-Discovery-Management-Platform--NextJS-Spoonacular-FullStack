/**
 * React Query hooks for blog posts from Contentful CMS
 *
 * Features:
 * - Fetches blog posts from Contentful CMS
 * - Caches blog posts (24 hours stale time)
 * - Centralized error handling with toast notifications
 *
 * Following REACT_QUERY_SETUP_GUIDE.md patterns:
 * - staleTime: 24 hours (blog posts don't change frequently)
 * - refetchOnMount: true = Refetch ONLY when data is stale
 * - Result: Cache for 24 hours, then refetch once
 */

import { useQuery } from "@tanstack/react-query";
import * as api from "../api";
import { BlogPost, BlogPostsResponse } from "../types";

/**
 * Hook to get blog posts list
 *
 * @param options - Query options (skip, limit, category)
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with blog posts list
 */
export function useBlogPosts(
  options?: {
    skip?: number;
    limit?: number;
    category?: string;
  },
  enabled: boolean = true
) {
  return useQuery<BlogPostsResponse, Error>({
    queryKey: ["blog", "posts", options],
    queryFn: () => api.getBlogPosts(options),
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - blog posts don't change frequently
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Hook to get single blog post by slug
 *
 * @param slug - Blog post slug
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with blog post
 */
export function useBlogPost(slug: string | null, enabled: boolean = true) {
  return useQuery<BlogPost, Error>({
    queryKey: ["blog", "post", slug],
    queryFn: () => {
      if (!slug) {
        throw new Error("Slug is required");
      }
      return api.getBlogPost(slug);
    },
    enabled: enabled && slug !== null && slug.trim().length > 0,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - blog posts don't change frequently
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
}
