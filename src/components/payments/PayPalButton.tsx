
import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CLIENT_ID, PLAN_ID } from "@/lib/paypal";
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
  
  useEffect(() => {
    // Start with loading state
    onStatusChange("loading");
    
    // Check if PayPal SDK is loaded
    if (!window.paypal) {
      console.error('PayPal SDK not loaded.');
      onStatusChange("failed");
      toast({
        title: "PayPal Error",
        description: "Could not load payment system. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    onStatusChange("idle");

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
        containerRef.current.innerHTML = '';
        paypalButtons.render(containerRef.current);
      }
    } catch (err) {
      console.error("Failed to initialize PayPal buttons:", err);
      onStatusChange("failed");
      toast({
        title: "PayPal Error",
        description: "Could not initialize subscription system. Please try again later.",
        variant: "destructive",
      });
    }
  }, [onStatusChange, onSubscriptionUpdate]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Subscription:</span>
        <span className="font-bold">Monthly Plan</span>
      </div>
      
      <div ref={containerRef} className="w-full min-h-[150px]" id="paypal-button-container">
        {/* PayPal Buttons will render here */}
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading PayPal...
          </p>
        </div>
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
