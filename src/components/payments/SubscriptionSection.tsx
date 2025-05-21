
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PayPalButton, getPriceForAccount } from "./PayPalButton";
import { PaymentStatus } from "./PaymentStatus";
import { ActiveSubscription } from "./ActiveSubscription";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { isFirefox } from "@/lib/paypal";

interface SubscriptionSectionProps {
  hasActiveSubscription: boolean;
  paymentStatus: "idle" | "success" | "failed" | "loading";
  onRetry: () => void;
  onStatusChange: (status: "idle" | "success" | "failed" | "loading") => void;
  onSubscriptionUpdate: (hasSubscription: boolean) => void;
  accountValue?: number;
}

export const SubscriptionSection = ({ 
  hasActiveSubscription, 
  paymentStatus, 
  onRetry, 
  onStatusChange,
  onSubscriptionUpdate,
  accountValue = 0
}: SubscriptionSectionProps) => {
  const [forceRefresh, setForceRefresh] = useState(0);
  const [selectedTier, setSelectedTier] = useState<number | undefined>(undefined);
  const isFirefoxBrowser = isFirefox();
  
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
    setSelectedTier(tier);
    onSubscriptionUpdate(hasSubscription);
  };

  const currentPrice = getPriceForAccount(accountValue);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete payment to access our algorithmic trading service</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <ActiveSubscription accountValue={accountValue} selectedTier={selectedTier} />
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
