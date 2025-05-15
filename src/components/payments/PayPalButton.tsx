
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CLIENT_ID, PLAN_ID, initializePayPalScript } from "@/lib/paypal";
import { Loader2, RefreshCw } from "lucide-react";
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
  const paypalContainerId = `paypal-button-container-${Math.random().toString(36).substring(2, 15)}`;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);
  
  // Create a fresh container each render attempt
  const refreshPayPalContainer = () => {
    const container = document.getElementById(paypalContainerId);
    if (container) {
      container.innerHTML = '';
      setRenderAttempts(prev => prev + 1);
      setScriptError(false);
      loadPayPalScript();
    }
  };
  
  const loadPayPalScript = async () => {
    try {
      onStatusChange("loading");
      await initializePayPalScript();
      setScriptLoaded(true);
      onStatusChange("idle");
      
      // Short delay to ensure DOM is ready
      setTimeout(() => {
        renderPayPalButtons();
      }, 500);
    } catch (err) {
      console.error('Failed to load PayPal script:', err);
      setScriptError(true);
      onStatusChange("failed");
      toast({
        title: "PayPal Error",
        description: "Could not load payment system. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const renderPayPalButtons = () => {
    const container = document.getElementById(paypalContainerId);
    if (!window.paypal || !container) {
      console.error('PayPal not loaded or container not found');
      setScriptError(true);
      return;
    }
    
    try {
      // Clear any previous buttons
      container.innerHTML = '';
      
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
            quantity: 1,
            application_context: {
              brand_name: 'DECO GLOBAL SERVICES, INC.',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW',
              payment_method: {
                payer_selected: 'PAYPAL',
                payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
              }
            }
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
          setScriptError(true);
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
      paypalButtons.render(`#${paypalContainerId}`).catch((err: any) => {
        console.error('Failed to render PayPal buttons:', err);
        setScriptError(true);
      });
    } catch (err) {
      console.error("Failed to initialize PayPal buttons:", err);
      onStatusChange("failed");
      setScriptError(true);
      toast({
        title: "PayPal Error",
        description: "Could not initialize subscription system. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Load PayPal script on component mount
  useEffect(() => {
    loadPayPalScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Subscription:</span>
        <span className="font-bold">Monthly Plan</span>
      </div>
      
      <div className="w-full min-h-[150px]">
        {scriptError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <p className="mb-2">Could not load the payment system. Please try again.</p>
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={refreshPayPalContainer}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Payment System
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="w-full min-h-[150px]">
            <div id={paypalContainerId} className="w-full">
              {!scriptLoaded && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading PayPal...
                  </p>
                </div>
              )}
            </div>
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
