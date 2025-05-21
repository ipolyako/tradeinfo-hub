
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { pricingTiers, getAccountBalanceText } from "./PayPalButton";

interface ActiveSubscriptionProps {
  accountValue?: number;
  selectedTier?: number;
}

export const ActiveSubscription = ({ accountValue = 0, selectedTier = 0 }: ActiveSubscriptionProps) => {
  // Get the appropriate tier based on selection or default to first tier
  const tierIndex = selectedTier !== undefined ? selectedTier : 0;
  
  // Look up the tier data from the pricingTiers array
  const currentTier = pricingTiers[tierIndex >= 0 && tierIndex < pricingTiers.length ? tierIndex : 0];
  
  // Use the price directly from the selected tier
  const currentPrice = currentTier?.price || 0;
  
  // Get the hardcoded quantity for display
  const quantity = currentTier?.quantity || 5; // Default to free trial quantity
  
  // Get account balance text based on selected tier
  const accountBalanceText = selectedTier !== undefined 
    ? getAccountBalanceText(selectedTier) 
    : "Free Trial";
  
  // Convert zero-based index to human-readable tier number (1-based)
  const displayTierNumber = tierIndex + 1;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <p className="font-medium">Active Subscription</p>
            <p className="text-sm text-muted-foreground">Algorithmic Trading Service</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">
            {currentPrice === 0 
              ? "Monthly Plan: Free Trial" 
              : `Monthly Plan: $${currentPrice}/month`}
          </p>
          <p className="text-xs text-muted-foreground">
            Tier {displayTierNumber} • Account balance: {accountBalanceText}
          </p>
          <p className="text-xs text-muted-foreground">Quantity: {quantity.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Renewed: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <Button variant="outline">Manage Subscription</Button>
    </div>
  );
};
