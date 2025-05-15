
import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CLIENT_ID } from "@/lib/paypal";
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
  const subscriptionFee = accountValue < 100000 ? 200 : 300;
  
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
          layout: 'vertical', 
          color: 'gold', 
          shape: 'pill', 
          label: 'paypal' 
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              { amount: { value: subscriptionFee.toString() } }
            ]
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            console.log("Payment successful:", details);
            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully.",
            });
            onStatusChange("success");
            onSubscriptionUpdate(true);
          } catch (err) {
            console.error("Payment capture error:", err);
            toast({
              title: "Payment Failed",
              description: "There was an issue processing your payment.",
              variant: "destructive",
            });
            onStatusChange("failed");
          }
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          toast({
            title: "Payment Failed",
            description: "There was an issue processing your payment.",
            variant: "destructive",
          });
          onStatusChange("failed");
        },
        onCancel: () => {
          console.log("Payment cancelled");
          onStatusChange("idle");
          toast({
            title: "Payment Cancelled",
            description: "You've cancelled the payment process.",
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
        description: "Could not initialize payment system. Please try again later.",
        variant: "destructive",
      });
    }
  }, [subscriptionFee, onStatusChange, onSubscriptionUpdate]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Payment Amount:</span>
        <span className="font-bold">${subscriptionFee}.00 USD</span>
      </div>
      
      <div ref={containerRef} className="w-full min-h-[150px]">
        {/* PayPal Buttons will render here */}
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading PayPal...
          </p>
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        By proceeding with the payment, you agree to our
        <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
        and
        <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};
