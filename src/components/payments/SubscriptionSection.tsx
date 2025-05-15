
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PayPalButton } from "./PayPalButton";
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

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete payment to access our algorithmic trading service</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <ActiveSubscription accountValue={accountValue} />
        ) : (
          <>
            {paymentStatus === "idle" && (
              <PayPalButton 
                key={`paypal-button-${forceRefresh}`}
                onStatusChange={onStatusChange} 
                onSubscriptionUpdate={onSubscriptionUpdate}
                accountValue={accountValue}
              />
            )}

            {(paymentStatus === "success" || paymentStatus === "failed" || paymentStatus === "loading") && (
              <PaymentStatus status={paymentStatus} onRetry={onRetry} />
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
                
                {isFirefoxBrowser && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Firefox users: Make sure to allow pop-ups for this site in your browser settings.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
