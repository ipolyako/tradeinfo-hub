
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CLIENT_ID, PLAN_ID, initializePayPalScript } from "@/lib/paypal";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  
  useEffect(() => {
    // Start with loading state
    onStatusChange("loading");
    
    let isMounted = true;
    
    const loadPayPalScript = async () => {
      try {
        await initializePayPalScript();
        if (isMounted) {
          setScriptLoaded(true);
          onStatusChange("idle");
        }
      } catch (err) {
        console.error('Failed to load PayPal script:', err);
        if (isMounted) {
          setScriptError(true);
          onStatusChange("failed");
          toast({
            title: "PayPal Error",
            description: "Could not load payment system. Please try again later.",
            variant: "destructive",
          });
        }
      }
    };
    
    loadPayPalScript();
    
    return () => {
      isMounted = false;
    };
  }, [onStatusChange]);
  
  // Effect to render PayPal buttons once the script is loaded
  useEffect(() => {
    if (!scriptLoaded || !window.paypal || !containerRef.current) {
      return;
    }
    
    // Clear any previous content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    try {
      const paypalButtons = window.paypal.Buttons({
        style: { 
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            plan_id: PLAN_ID,
            quantity: 1
          });
        },
        onApprove: function(data) {
          console.log("Subscription successful:", data.subscriptionID);
          toast({
            title: "Subscription Successful",
            description: "Your subscription has been processed successfully.",
          });
          onStatusChange("success");
          onSubscriptionUpdate(true);
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          toast({
            title: "Subscription Failed",
            description: "There was an issue processing your subscription.",
            variant: "destructive",
          });
          onStatusChange("failed");
        },
        onCancel: () => {
          console.log("Subscription cancelled");
          onStatusChange("idle");
          toast({
            title: "Subscription Cancelled",
            description: "You've cancelled the subscription process.",
          });
        }
      });

      // Render the PayPal button
      if (containerRef.current) {
        paypalButtons.render(containerRef.current);
      }
    } catch (err) {
      console.error("Failed to initialize PayPal buttons:", err);
      onStatusChange("failed");
      setScriptError(true);
      toast({
        title: "PayPal Error",
        description: "Could not initialize subscription system. Please try again later.",
        variant: "destructive",
      });
    }
  }, [scriptLoaded, onStatusChange, onSubscriptionUpdate]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Subscription:</span>
        <span className="font-bold">Monthly Plan</span>
      </div>
      
      <div className="w-full min-h-[150px]" id="paypal-button-container">
        {scriptError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Could not load the payment system. Please refresh the page or try again later.
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div ref={containerRef} className="w-full min-h-[150px]">
            {!scriptLoaded && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading PayPal...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        By proceeding with the subscription, you agree to our
        <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
        and
        <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};
