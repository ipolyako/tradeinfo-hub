import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { pricingTiers, getAccountBalanceText } from "./PayPalButton";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockCancelSubscription } from "@/functions/cancel-subscription";

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
  const [paypalStatus, setPaypalStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Check subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!subscriptionId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await mockCancelSubscription(subscriptionId, { action: 'check' });
        
        if (response.success) {
          setPaypalStatus(response.paypalStatus);
          
          // If this is a simulated response, show a warning to the user
          if (response.warning) {
            setWarning(response.warning);
          } else if (response.paypalStatus === 'SIMULATED_ACTIVE') {
            setWarning("PayPal API is not fully configured. Using simulated active subscription for development.");
          }
        } else {
          setWarning("Unable to verify subscription status with PayPal");
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setWarning("Error checking subscription status");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [subscriptionId]);
  
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
      
      const response = await mockCancelSubscription(subscriptionId, { action: 'cancel' });
      
      console.log("Cancel subscription response:", response);
      
      if (response.success) {
        // Check if there's a warning to display
        if (response.warning) {
          setWarning(response.warning);
        }
        
        toast({
          title: "Subscription Cancelled",
          description: response.message || "Your subscription has been cancelled successfully."
        });
        
        // Update PayPal status
        setPaypalStatus(response.paypalStatus || 'CANCELLED');
        
        // Notify parent component
        if (onSubscriptionCancelled) {
          onSubscriptionCancelled();
        }
      } else {
        throw new Error(response.message || "Failed to cancel subscription");
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
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
          {paypalStatus && (
            <p className="text-xs text-muted-foreground">PayPal Status: {paypalStatus}</p>
          )}
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
