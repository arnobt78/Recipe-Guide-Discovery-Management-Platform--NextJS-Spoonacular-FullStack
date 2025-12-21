/**
 * Dish Pairing for Wine Component
 * 
 * Reusable component for displaying dish pairing information for a given wine
 * Shows dishes that go well with a specific wine type
 * 
 * @see https://spoonacular.com/food-api/docs#Dish-Pairing-for-Wine
 */

import { memo } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Wine, UtensilsCrossed } from "lucide-react";
import { DishPairingForWine as DishPairingForWineType } from "../types";

interface DishPairingForWineProps {
  dishPairing: DishPairingForWineType;
  wineType: string;
  className?: string;
}

/**
 * Dish Pairing for Wine Component (Memoized for performance)
 * 
 * Displays:
 * - Recommended dishes (pairings array) as badges
 * - Descriptive text explaining the pairing
 */
const DishPairingForWine = memo(({ 
  dishPairing, 
  wineType,
  className = ""
}: DishPairingForWineProps) => {
  if (!dishPairing || (!dishPairing.pairings || dishPairing.pairings.length === 0)) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 p-4 sm:p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-500/20 rounded-lg flex-shrink-0">
          <Wine className="h-6 w-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              Dishes for {wineType.charAt(0).toUpperCase() + wineType.slice(1)}
            </h3>
            <UtensilsCrossed className="h-5 w-5 text-purple-400" />
          </div>
          
          {/* Recommended Dishes */}
          {dishPairing.pairings && dishPairing.pairings.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Recommended Dishes:</p>
              <div className="flex flex-wrap gap-2">
                {dishPairing.pairings.map((dish, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm px-3 py-1"
                  >
                    {dish}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pairing Text */}
          {dishPairing.text && (
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              {dishPairing.text}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
});

DishPairingForWine.displayName = "DishPairingForWine";

export default DishPairingForWine;

