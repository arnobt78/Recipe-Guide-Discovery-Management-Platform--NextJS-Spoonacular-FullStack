/**
 * Footer Component
 *
 * Features:
 * - Dynamic current year
 * - Project branding with logo
 * - Coming soon pages (About, Privacy, Terms)
 * - Responsive design
 * - Smooth animations
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, ShadCN UI, optimized performance
 */

"use client";

import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type FooterPage = "about" | "privacy" | "terms" | null;

interface PageContent {
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
}

const pageContents: Record<Exclude<FooterPage, null>, PageContent> = {
  about: {
    title: "About FlavorVerse",
    icon: <Sparkles className="h-6 w-6 text-purple-400" />,
    description:
      "FlavorVerse is your ultimate culinary companion, bringing together AI-powered recipe discovery, weather-based suggestions, and personalized meal planning.",
    features: [
      "AI-powered smart recipe search",
      "Weather-based recipe recommendations",
      "Personalized collections & favorites",
      "Detailed nutritional information",
      "Step-by-step cooking instructions",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: <Heart className="h-6 w-6 text-pink-400" />,
    description:
      "Your privacy matters to us. We're committed to protecting your personal data and being transparent about how we use it.",
    features: [
      "We never sell your personal data",
      "Secure authentication with NextAuth",
      "Minimal data collection policy",
      "Full control over your account",
      "GDPR compliant practices",
    ],
  },
  terms: {
    title: "Terms of Service",
    icon: <ChefHat className="h-6 w-6 text-amber-400" />,
    description:
      "By using FlavorVerse, you agree to cook amazing meals and share the joy of food with others!",
    features: [
      "Free to use for personal cooking",
      "Recipe data from Spoonacular API",
      "User-generated collections",
      "Respectful community guidelines",
      "Fair usage of AI features",
    ],
  },
};

/**
 * Footer Component (Memoized for performance)
 */
const Footer = memo(() => {
  const [selectedPage, setSelectedPage] = useState<FooterPage>(null);
  const currentYear = new Date().getFullYear();

  const handlePageClick = useCallback((page: FooterPage) => {
    setSelectedPage(page);
    if (page) {
      toast.info(`${pageContents[page].title} - Coming Soon!`, {
        description: "We're working on this page. Stay tuned!",
        duration: 3000,
      });
    }
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedPage(null);
  }, []);

  return (
    <>
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full border-t border-purple-500/20 bg-slate-900/80 backdrop-blur-md"
      >
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Brand & Year */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl self-stretch flex items-center">
                <ChefHat className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    FlavorVerse
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm text-gray-400">{currentYear}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Discover, cook, and savor amazing recipes from around the world.
                </span>
              </div>
            </div>

            {/* Right: Footer Links */}
            <nav className="flex items-center gap-6">
              <FooterLink
                label="About"
                onClick={() => handlePageClick("about")}
              />
              <FooterLink
                label="Privacy"
                onClick={() => handlePageClick("privacy")}
              />
              <FooterLink
                label="Terms"
                onClick={() => handlePageClick("terms")}
              />
            </nav>
          </div>
        </div>
      </motion.footer>

      {/* Coming Soon Dialog */}
      <AnimatePresence>
        {selectedPage && (
          <Dialog open={!!selectedPage} onOpenChange={handleCloseDialog}>
            <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-purple-500/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  {pageContents[selectedPage].icon}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {pageContents[selectedPage].title}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* Coming Soon Badge */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm font-medium text-purple-300">
                    <Sparkles className="h-4 w-4" />
                    Coming Soon
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-center leading-relaxed">
                  {pageContents[selectedPage].description}
                </p>

                {/* Features List */}
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-purple-300 mb-3">
                    What to expect:
                  </p>
                  <ul className="space-y-2">
                    {pageContents[selectedPage].features.map(
                      (feature, index) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.05 }}
                          className="flex items-center gap-2 text-sm text-gray-400"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                          {feature}
                        </motion.li>
                      )
                    )}
                  </ul>
                </div>

                {/* Closing note */}
                <p className="text-center text-xs text-gray-500">
                  We&apos;re cooking up something special. Stay tuned!
                </p>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
});

Footer.displayName = "Footer";

/**
 * Footer Link Sub-component
 */
interface FooterLinkProps {
  label: string;
  onClick: () => void;
}

const FooterLink = memo(({ label, onClick }: FooterLinkProps) => {
  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 relative group"
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
    </button>
  );
});

FooterLink.displayName = "FooterLink";

export default Footer;
