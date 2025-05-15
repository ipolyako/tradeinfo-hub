
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { usePayPalScript, CLIENT_ID, PLAN_ID } from "@/lib/paypal";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PayPalButtonProps {
  onStatusChange: (status: "idle" | "success" | "failed" | "loading") => void;
  onSubscriptionUpdate: (hasSubscription: boolean) => void;
  className?: string;
  accountValue?: number;
}

export const PayPalButton = ({ 
  onStatusChange, 
  onSubscriptionUpdate,
  className,
  accountValue = 0
}: PayPalButtonProps) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isScriptFailed, setIsScriptFailed] = useState(false);
  const subscriptionFee = accountValue < 100000 ? 200 : 300;
  
  const { loaded, error } = usePayPalScript({
    clientId: CLIENT_ID,
    currency: 'USD',
    components: 'buttons',
    vault: true
  });

  // Handle initial loading state
  useEffect(() => {
    if (loaded) {
      onStatusChange("idle");
    } else if (!error) {
      onStatusChange("loading");
    }
  }, [loaded, error, onStatusChange]);

  // Function to retry loading the PayPal script
  const handleRetryLoading = () => {
    setIsScriptFailed(false);
    onStatusChange("loading");
    // Force reload by removing existing script tags
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
    existingScripts.forEach(script => {
      document.body.removeChild(script);
    });
    // Clear the global PayPal object to force a reload
    if (window.paypal) {
      // @ts-ignore
      delete window.paypal;
    }
    // The useEffect in usePayPalScript will detect the missing script and reload it
    window.location.reload(); // Last resort - reload the page
  };

  // Render PayPal buttons when the script is loaded
  useEffect(() => {
    if (!loaded || !buttonContainerRef.current || !window.paypal) {
      return;
    }

    // Clear any existing buttons
    if (buttonContainerRef.current.firstChild) {
      buttonContainerRef.current.innerHTML = '';
    }

    try {
      console.log('Setting up PayPal buttons with plan ID:', PLAN_ID);
      
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data: any, actions: any) {
          console.log('Creating subscription with plan ID:', PLAN_ID);
          return actions.subscription.create({
            'plan_id': PLAN_ID,
            'application_context': {
              'shipping_preference': 'NO_SHIPPING'
            }
          });
        },
        onApprove: function(data: any) {
          console.log("Subscription approved:", data.subscriptionID);
          toast({
            title: "Subscription Successful",
            description: "Your subscription has been processed successfully.",
          });
          onStatusChange("success");
          onSubscriptionUpdate(true);
        },
        onError: function(err: any) {
          console.error("PayPal error:", err);
          toast({
            title: "Payment Failed",
            description: "There was an issue processing your payment.",
            variant: "destructive",
          });
          onStatusChange("failed");
        },
        onCancel: function() {
          console.log("Payment cancelled");
          onStatusChange("idle");
          toast({
            title: "Payment Cancelled",
            description: "You've cancelled the payment process.",
          });
        }
      }).render(buttonContainerRef.current)
        .catch((err: Error) => {
          console.error('PayPal button render error:', err);
          setIsScriptFailed(true);
          onStatusChange("failed");
          toast({
            title: "PayPal Error",
            description: "Could not initialize PayPal buttons. Please try again later.",
            variant: "destructive",
          });
        });
    } catch (err) {
      console.error("Failed to initialize PayPal buttons:", err);
      setIsScriptFailed(true);
      onStatusChange("failed");
    }
  }, [loaded, onStatusChange, onSubscriptionUpdate]);

  // Handle script loading error
  useEffect(() => {
    if (error) {
      console.error("Failed to load PayPal script:", error);
      setIsScriptFailed(true);
      toast({
        title: "PayPal Error",
        description: "Could not load payment system. Please try again later.",
        variant: "destructive",
      });
      onStatusChange("failed");
    }
  }, [error, onStatusChange]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Subscription Fee:</span>
        <span className="font-bold">${subscriptionFee}.00 USD / month</span>
      </div>
      
      {isScriptFailed ? (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertDescription className="py-2">
            <p className="mb-3">Failed to load PayPal payment system. This could be due to:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Network connectivity issues</li>
              <li>Ad blockers or browser extensions</li>
              <li>Temporary PayPal service unavailability</li>
            </ul>
            <Button onClick={handleRetryLoading} className="w-full">
              Retry Loading PayPal
            </Button>
          </AlertDescription>
        </Alert>
      ) : (!loaded ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading PayPal...
          </p>
        </div>
      ) : (
        <div ref={buttonContainerRef} className="w-full min-h-[150px]">
          {/* PayPal Buttons will render here */}
        </div>
      ))}
      
      <div className="text-center text-sm text-muted-foreground">
        By proceeding with the payment, you agree to our
        <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
        and
        <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};
