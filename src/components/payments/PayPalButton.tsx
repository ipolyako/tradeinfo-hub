
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { usePayPalScript, CLIENT_ID, PLAN_ID, type PayPalButtonsConfig } from "@/lib/paypal";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, PaypalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayPalButtonProps {
  onStatusChange: (status: "idle" | "success" | "failed" | "loading") => void;
  onSubscriptionUpdate: (hasSubscription: boolean) => void;
  className?: string;
}

export const PayPalButton = ({ 
  onStatusChange, 
  onSubscriptionUpdate,
  className
}: PayPalButtonProps) => {
  const [activeTab, setActiveTab] = useState<'paypal' | 'card'>('paypal');
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  
  const { loaded, error } = usePayPalScript({
    clientId: CLIENT_ID,
    components: 'buttons,hosted-fields',
    currency: 'USD',
    intent: 'subscription',
    vault: true
  });

  // Render PayPal buttons when the script is loaded
  useEffect(() => {
    if (!loaded || !buttonContainerRef.current || !window.paypal) {
      return;
    }

    // Clear any existing buttons
    if (buttonContainerRef.current.firstChild) {
      buttonContainerRef.current.innerHTML = '';
    }

    const buttonsConfig: PayPalButtonsConfig = {
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe',
      },
      createSubscription: function(data, actions) {
        return actions.subscription.create({
          plan_id: PLAN_ID
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
        onStatusChange("idle");
        toast({
          title: "Payment Cancelled",
          description: "You've cancelled the payment process.",
          variant: "default",
        });
      }
    };

    if (activeTab === 'paypal' && buttonContainerRef.current) {
      window.paypal.Buttons(buttonsConfig).render(buttonContainerRef.current);
    }
  }, [loaded, activeTab, onStatusChange, onSubscriptionUpdate]);

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

  // Set loading state when script is loading
  useEffect(() => {
    if (!loaded) {
      onStatusChange("loading");
    } else {
      onStatusChange("idle");
    }
  }, [loaded, onStatusChange]);

  const handleCardPayment = () => {
    // In a production app, this would integrate with PayPal's hosted fields for credit card processing
    // For now, we'll simulate the flow with a basic UI
    onStatusChange("loading");
    
    // Simulate processing delay
    setTimeout(() => {
      toast({
        title: "Card Payment Initiated",
        description: "Credit card processing is in development. Please use PayPal option for now.",
        variant: "default",
      });
      onStatusChange("idle");
    }, 1500);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Subscription Fee:</span>
        <span className="font-bold">$199.00 USD / month</span>
      </div>
      
      <div className="flex space-x-2 border-b mb-4">
        <button 
          className={cn(
            "pb-2 px-4 text-sm font-medium",
            activeTab === 'paypal' ? "border-b-2 border-primary" : "text-muted-foreground"
          )}
          onClick={() => setActiveTab('paypal')}
        >
          PayPal
        </button>
        <button 
          className={cn(
            "pb-2 px-4 text-sm font-medium",
            activeTab === 'card' ? "border-b-2 border-primary" : "text-muted-foreground"
          )}
          onClick={() => setActiveTab('card')}
        >
          Credit Card
        </button>
      </div>
      
      {!loaded && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading payment options...</p>
        </div>
      )}
      
      {loaded && activeTab === 'paypal' && (
        <div ref={buttonContainerRef} className="w-full min-h-[150px]">
          {/* PayPal Buttons will render here */}
        </div>
      )}
      
      {loaded && activeTab === 'card' && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Credit Card Payment</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Process your subscription payment using a credit or debit card.
            </p>
            <Button 
              className="w-full" 
              onClick={handleCardPayment}
            >
              Pay with Card
            </Button>
          </div>
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

// Manually define PayPal icon since it's not in lucide-react
export const PaypalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="lucide lucide-paypal"
    {...props}
  >
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
    <path d="M7 15h11"></path>
    <path d="M7 11h5"></path>
    <path d="M15 11v4"></path>
    <path d="M18 11v4"></path>
    <path d="M7 7h2"></path>
    <path d="M12 7h4"></path>
  </svg>
);
