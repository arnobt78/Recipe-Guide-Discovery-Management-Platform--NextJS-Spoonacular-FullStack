"use client";

import { AuthProvider } from "@/context/AuthContext";
import { RecipeProvider } from "@/context/RecipeContext";
import AppContent from "@/components/AppContent";

/**
 * Home Page
 * Wraps AppContent with providers
 * Next.js App Router - Client Component
 */
export default function HomePage() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <AppContent />
      </RecipeProvider>
    </AuthProvider>
  );
}
