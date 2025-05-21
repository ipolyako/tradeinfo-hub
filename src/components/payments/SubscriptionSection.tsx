
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PayPalButton, getPriceForAccount } from "./PayPalButton";
import { PaymentStatus } from "./PaymentStatus";
import { ActiveSubscription } from "./ActiveSubscription";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { isFirefox } from "@/lib/paypal";

interface SubscriptionSectionProps {
  hasActiveSubscription: boolean;
  paymentStatus: "idle" | "success" | "failed" | "loading";
  onRetry: () => void;
  onStatusChange: (status: "idle" | "success" | "failed" | "loading") => void;
  onSubscriptionUpdate: (hasSubscription: boolean, tier?: number) => void;
  accountValue?: number;
  selectedTier?: number;
  isLoading?: boolean;
}

export const SubscriptionSection = ({ 
  hasActiveSubscription, 
  paymentStatus, 
  onRetry, 
  onStatusChange,
  onSubscriptionUpdate,
  accountValue = 0,
  selectedTier,
  isLoading = false
}: SubscriptionSectionProps) => {
  const [forceRefresh, setForceRefresh] = useState(0);
  const [localSelectedTier, setLocalSelectedTier] = useState<number | undefined>(selectedTier);
  const isFirefoxBrowser = isFirefox();
  
  // Update local tier when prop changes
  useEffect(() => {
    setLocalSelectedTier(selectedTier);
  }, [selectedTier]);
  
  // Listen for browser focus events (for Firefox popup handling)
  useEffect(() => {
    if (isFirefoxBrowser) {
      const handleFocus = () => {
        console.log('Window regained focus - Firefox specific handling');
      };
      
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isFirefoxBrowser]);
  
  // Ensure we start from a clean state when component remounts
  useEffect(() => {
    if (paymentStatus !== "success" && paymentStatus !== "loading") {
      onStatusChange("idle");
    }
  }, []);

  const handleRefresh = () => {
    setForceRefresh(prev => prev + 1);
    onStatusChange("idle");
  };

  const handleSubscriptionUpdate = (hasSubscription: boolean, tier?: number) => {
    setLocalSelectedTier(tier);
    onSubscriptionUpdate(hasSubscription, tier);
  };

  const currentPrice = getPriceForAccount(accountValue);

  // Show loading state while checking subscription status
  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Checking your subscription status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading subscription details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete payment to access our algorithmic trading service</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <ActiveSubscription accountValue={accountValue} selectedTier={localSelectedTier} />
        ) : (
          <>
            {paymentStatus === "idle" && (
              <PayPalButton 
                key={`paypal-button-${forceRefresh}`}
                onStatusChange={onStatusChange} 
                onSubscriptionUpdate={handleSubscriptionUpdate}
                accountValue={accountValue}
              />
            )}

            {(paymentStatus === "success" || paymentStatus === "failed" || paymentStatus === "loading") && (
              <PaymentStatus 
                status={paymentStatus} 
                onRetry={onRetry} 
                price={currentPrice}
              />
            )}
            
            {paymentStatus === "failed" && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again with New Payment Button
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
