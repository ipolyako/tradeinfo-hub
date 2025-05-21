
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { pricingTiers, getAccountBalanceText } from "./PayPalButton";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActiveSubscriptionProps {
  accountValue?: number;
  selectedTier?: number;
  subscriptionId?: string;
  onSubscriptionCancelled?: () => void;
}

export const ActiveSubscription = ({ 
  accountValue = 0, 
  selectedTier = 0,
  subscriptionId,
  onSubscriptionCancelled
}: ActiveSubscriptionProps) => {
  const [cancelling, setCancelling] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  
  // Get the appropriate tier based on selection or default to first tier
  const tierIndex = selectedTier !== undefined ? selectedTier : 0;
  
  // Look up the tier data from the pricingTiers array
  const currentTier = pricingTiers[tierIndex >= 0 && tierIndex < pricingTiers.length ? tierIndex : 0];
  
  // Use the price directly from the selected tier
  const currentPrice = currentTier?.price || 0;
  
  // Get account balance text based on selected tier
  const accountBalanceText = selectedTier !== undefined 
    ? getAccountBalanceText(selectedTier) 
    : "Free Trial";
  
  // Convert zero-based index to human-readable tier number (1-based)
  const displayTierNumber = tierIndex + 1;
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!subscriptionId) {
      toast({
        title: "Error",
        description: "No subscription ID found to cancel",
        variant: "destructive",
      });
      return;
    }

    // Confirm before cancelling
    if (!window.confirm("Are you sure you want to cancel your subscription? This will end your access to premium features.")) {
      return;
    }

    setCancelling(true);
    setWarning(null);
    
    try {
      console.log("Attempting to cancel subscription:", subscriptionId);
      
      // Call the real Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId }
      });
      
      console.log("Cancel subscription response:", data || error);
      
      if (error) {
        throw new Error(error.message || "Error connecting to cancellation service");
      }
      
      if (data && data.success) {
        // Check if there's a warning to display
        if (data.warning) {
          setWarning(data.warning);
        }
        
        toast({
          title: "Subscription Cancelled",
          description: data.message || "Your subscription has been cancelled successfully."
        });
        
        // Notify parent component
        if (onSubscriptionCancelled) {
          onSubscriptionCancelled();
        }
      } else {
        throw new Error((data && data.message) || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };
  
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
          <p className="text-xs text-muted-foreground">Renewed: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      {warning && (
        <Alert variant="warning" className="mb-2">
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        variant={cancelling ? "outline" : "destructive"} 
        onClick={handleCancelSubscription}
        disabled={cancelling || !subscriptionId}
      >
        {cancelling ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Cancelling...
          </>
        ) : (
          "Cancel Subscription"
        )}
      </Button>
    </div>
  );
};
