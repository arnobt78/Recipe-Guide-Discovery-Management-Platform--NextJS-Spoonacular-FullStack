/**
 * Home Page Client Component
 *
 * Features:
 * - Wraps AppContent with auth and recipe providers
 * - Client-side rendering for interactive features
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */

"use client";

import { AuthProvider } from "../../context/AuthContext";
import { RecipeProvider } from "../../context/RecipeContext";
import AppContent from "../layout/AppContent";

/**
 * Home Page Client Component
 * Contains all client-side logic and providers
 */
export default function HomePageClient() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <AppContent />
      </RecipeProvider>
    </AuthProvider>
  );
}
