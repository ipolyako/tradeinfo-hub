import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CLIENT_ID, PLAN_ID, initializePayPalScript, isFirefox, PayPalButtonConfig } from "@/lib/paypal";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PayPalButtonProps {
  onStatusChange: (status: "idle" | "success" | "failed" | "loading") => void;
  onSubscriptionUpdate: (hasSubscription: boolean, selectedTier?: number) => void;
  className?: string;
  accountValue?: number;
}

// Define pricing tiers
export const pricingTiers = [
  { min: 1, max: 100000, price: 200, quantity: 1 },
  { min: 100001, max: 200000, price: 350, quantity: 2 },
  { min: 200001, max: 300000, price: 500, quantity: 3 },
  { min: 300001, max: 400000, price: 600, quantity: 4 },
  { min: 400001, max: Infinity, price: 1000, quantity: 5 }
];

// Get the price based on account value
export const getPriceForAccount = (accountValue: number): number => {
  if (accountValue <= 0) return 200; // Default price
  
  for (const tier of pricingTiers) {
    if (accountValue >= tier.min && accountValue <= tier.max) {
      return tier.price;
    }
  }
  return 1000; // Default to highest tier if not found
};

// Function to get display text for account balance range
export const getAccountBalanceText = (tierIndex: number): string => {
  const tier = pricingTiers[tierIndex];
  if (!tier) return "under $100,000";
  
  if (tier.max === Infinity) {
    return `over $${tier.min.toLocaleString()}`;
  }
  
  return `$${tier.min.toLocaleString()} - $${tier.max.toLocaleString()}`;
};

export const PayPalButton = ({ 
  onStatusChange, 
  onSubscriptionUpdate,
  className,
  accountValue = 0
}: PayPalButtonProps) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [selectedTier, setSelectedTier] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isFirefoxBrowser = isFirefox();
  const containerId = `paypal-button-container-${PLAN_ID}`;
  
  // Find the default tier based on account value
  const defaultTierIndex = pricingTiers.findIndex(
    tier => accountValue >= tier.min && accountValue <= tier.max
  );
  
  // Calculate the applicable price based on selected tier or account value
  const selectedTierObj = selectedTier !== undefined && selectedTier >= 0 && selectedTier < pricingTiers.length
    ? pricingTiers[selectedTier]
    : undefined;
  
  const currentPrice = selectedTierObj
    ? selectedTierObj.price
    : getPriceForAccount(accountValue);
    
  const currentQuantity = selectedTierObj
    ? selectedTierObj.quantity
    : pricingTiers[defaultTierIndex >= 0 ? defaultTierIndex : 0].quantity;

  // Get account balance display text based on selected tier
  const accountBalanceText = selectedTier !== undefined 
    ? getAccountBalanceText(selectedTier)
    : "under $100,000";
  
  const refreshPayPalContainer = () => {
    setRenderAttempts(prev => prev + 1);
    setScriptError(false);
    setScriptLoaded(false);
    loadPayPalScript();
  };
  
  const loadPayPalScript = async () => {
    try {
      onStatusChange("loading");
      await initializePayPalScript();
      setScriptLoaded(true);
      onStatusChange("idle");
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
    if (!window.paypal || !containerRef.current) {
      console.error('PayPal SDK not loaded or container not found');
      setScriptError(true);
      return;
    }
    
    try {
      // Clear any previous buttons to ensure clean rendering
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      // Define button config with proper TypeScript types
      const buttonConfig: PayPalButtonConfig = {
        style: {
          shape: "rect",
          color: "silver",
          layout: "vertical",
          label: "subscribe"
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            plan_id: PLAN_ID,
            quantity: currentQuantity
          });
        },
        onApprove: function(data) {
          console.log("Subscription successful:", data.subscriptionID);
          toast({
            title: "Subscription Successful",
            description: "Your subscription has been processed successfully.",
          });
          onStatusChange("success");
          onSubscriptionUpdate(true, selectedTier);
          return true;
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
      };
      
      // Add event listeners to capture popup events for Firefox
      if (isFirefoxBrowser) {
        window.addEventListener('focus', () => {
          console.log('Window refocused after PayPal popup');
        });
      }
      
      // Render with direct selector
      window.paypal.Buttons(buttonConfig).render(`#${containerId}`);
      console.log('PayPal buttons rendered using direct selector');
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
    
    return () => {
      console.log('PayPal button component unmounting');
    };
  }, []);

  // Render buttons when script is loaded or when selected tier changes
  useEffect(() => {
    if (scriptLoaded && window.paypal) {
      // Add delay to ensure DOM is ready, longer on mobile
      const delay = isMobile ? 500 : 200;
      const timer = setTimeout(() => {
        renderPayPalButtons();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, renderAttempts, isMobile, selectedTier, currentQuantity]);

  const handleTierChange = (value: string) => {
    const tierIndex = parseInt(value, 10);
    setSelectedTier(tierIndex);
    // Re-render PayPal buttons with new quantity
    if (scriptLoaded) {
      renderPayPalButtons();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Subscription:</span>
          <span className="font-bold">Monthly Plan</span>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 border">
          <h3 className="font-medium mb-2">Pricing Tier</h3>
          <div className="flex justify-between items-center">
            <span>Your account balance:</span>
            <span className="font-bold">{accountBalanceText}</span>
          </div>
          
          <div className="mt-4">
            <label htmlFor="tier-select" className="text-sm font-medium mb-2 block">
              Select your pricing tier:
            </label>
            <Select 
              value={selectedTier?.toString() || defaultTierIndex.toString()} 
              onValueChange={handleTierChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pricing tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pricingTiers.map((tier, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      ${tier.price}/mo: {tier.min.toLocaleString()} - {tier.max === Infinity ? "Unlimited" : tier.max.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span>Monthly subscription:</span>
            <span className="font-bold text-primary">${currentPrice.toLocaleString()}/month</span>
          </div>
        </div>
      </div>
      
      <div className="w-full min-h-[250px]">
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
          <div className="w-full min-h-[250px] flex flex-col items-center justify-center">
            {!scriptLoaded && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading PayPal...
                </p>
              </div>
            )}
            
            <div 
              ref={containerRef}
              id={containerId}
              className="w-full paypal-button-container"
              key={`paypal-container-${renderAttempts}-${selectedTier}`}
              style={{ minHeight: isMobile ? "150px" : "120px" }}
            ></div>
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
