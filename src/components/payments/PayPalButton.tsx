
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface PayPalButtonProps {
  onStatusChange: (status: "idle" | "success" | "failed") => void;
  onSubscriptionUpdate: (hasSubscription: boolean) => void;
}

export const PayPalButton = ({ onStatusChange, onSubscriptionUpdate }: PayPalButtonProps) => {
  // Initialize PayPal script when component mounts
  useEffect(() => {
    // Create PayPal script element
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=ARrwQMysQqyFM7j3lPuiPnUII7WXGkNWzBLTdVm2HvVUa-shV1LA0EMANtgTSMKWa-UQ-Leig0VywPD7&vault=true";
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.async = true;
    
    // When the script loads, render the PayPal buttons
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          },
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              'plan_id': 'P-64T954128V783625HL3ITKJY'
            });
          },
          onApprove: function(data) {
            console.log("Subscription approved:", data.subscriptionID);
            toast({
              title: "Subscription Successful",
              description: "Your subscription has been processed successfully.",
              variant: "default",
            });
            onStatusChange("success");
            onSubscriptionUpdate(true);
          },
          onError: function(err) {
            console.error("PayPal error:", err);
            toast({
              title: "Payment Failed",
              description: "There was an issue processing your payment.",
              variant: "destructive",
            });
            onStatusChange("failed");
          },
          onCancel: function() {
            onStatusChange("failed");
          }
        }).render('#paypal-button-container');
      }
    };
    
    // Add script to document
    document.body.appendChild(script);
    
    // Clean up
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onStatusChange, onSubscriptionUpdate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="font-medium">Subscription Fee:</span>
        <span className="font-bold">$199.00 USD / month</span>
      </div>
      
      <div id="paypal-button-container" className="w-full">
        {/* PayPal Button will be rendered here */}
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
