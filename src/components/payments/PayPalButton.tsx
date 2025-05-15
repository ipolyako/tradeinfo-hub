
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { usePayPalScript, CLIENT_ID, PLAN_ID } from "@/lib/paypal";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isRendering, setIsRendering] = useState(false);
  const subscriptionFee = accountValue < 100000 ? 200 : 300;
  
  const { loaded, error } = usePayPalScript({
    clientId: CLIENT_ID,
    components: 'buttons',
    currency: 'USD',
    intent: 'subscription'
  });

  // Handle initial loading state
  useEffect(() => {
    if (loaded) {
      onStatusChange("idle");
    }
  }, [loaded, onStatusChange]);

  // Render PayPal buttons when the script is loaded
  useEffect(() => {
    if (!loaded || !buttonContainerRef.current || !window.paypal) {
      return;
    }

    // Clear any existing buttons
    if (buttonContainerRef.current.firstChild) {
      buttonContainerRef.current.innerHTML = '';
    }

    // Set rendering flag to true
    setIsRendering(true);

    const buttonsConfig = {
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: function(data: any, actions: any) {
        return actions.subscription.create({
          plan_id: PLAN_ID,
          quantity: 1,
          application_context: {
            shipping_preference: 'NO_SHIPPING'
          }
        });
      },
      onApprove: function(data: any) {
        console.log("Subscription approved:", data.subscriptionID);
        toast({
          title: "Subscription Successful",
          description: "Your subscription has been processed successfully.",
          variant: "default",
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
        onStatusChange("idle");
        toast({
          title: "Payment Cancelled",
          description: "You've cancelled the payment process.",
          variant: "default",
        });
      }
    };

    window.paypal.Buttons(buttonsConfig)
      .render(buttonContainerRef.current)
      .then(() => {
        setIsRendering(false);
        onStatusChange("idle");
      })
      .catch((err: Error) => {
        console.error('PayPal button render error:', err);
        setIsRendering(false);
        onStatusChange("failed");
      });
  }, [loaded, onStatusChange, onSubscriptionUpdate]);

  // Handle script loading error
  useEffect(() => {
    if (error) {
      console.error("Failed to load PayPal script:", error);
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
      
      {(!loaded || isRendering) ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isRendering ? "Initializing PayPal..." : "Loading PayPal..."}
          </p>
        </div>
      ) : (
        <div ref={buttonContainerRef} className="w-full min-h-[150px]">
          {/* PayPal Buttons will render here */}
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground">
        By proceeding with the payment, you agree to our
        <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
        and
        <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};
