/**
 * Business Insights Page Component (Client-Side)
 *
 * Features:
 * - Wraps dashboard with providers
 * - Client-side rendering for interactive features
 * - Glassmorphic background design
 *
 * Following DEVELOPMENT_RULES.md: Server/Client component separation
 */

"use client";

import { AuthProvider } from "../../context/AuthContext";
import { RecipeProvider } from "../../context/RecipeContext";
import BusinessInsightsDashboard from "../insights/BusinessInsightsDashboard";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

/**
 * Business Insights Page Client Component
 * Contains all client-side logic and providers
 */
export default function BusinessInsightsPageClient() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <div
          className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col"
          style={{
            backgroundImage: "url(/recipe-bg-4.avif)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <Navbar />
          <main className="flex-1 max-w-9xl mx-auto px-2 sm:px-4 md:px-6 xl:px-8 py-8 w-full">
            <BusinessInsightsDashboard />
          </main>
          <Footer />
        </div>
      </RecipeProvider>
    </AuthProvider>
  );
}
