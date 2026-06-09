"use client";

import { AuthProvider } from "../../context/AuthContext";
import { RecipeProvider } from "../../context/RecipeContext";
import ApiStatusDashboard from "../status/ApiStatusDashboard";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export type ApiStatusInitialData = {
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
    status: number;
    ok: boolean;
    latency: number;
    error?: string;
  }>;
  timestamp: string;
};

interface ApiStatusPageClientProps {
  initialStatus?: ApiStatusInitialData;
}

export default function ApiStatusPageClient({
  initialStatus,
}: ApiStatusPageClientProps) {
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
            <ApiStatusDashboard initialStatus={initialStatus} />
          </main>
          <Footer />
        </div>
      </RecipeProvider>
    </AuthProvider>
  );
}
