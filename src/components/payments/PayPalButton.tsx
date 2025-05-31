
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CLIENT_ID, PLAN_IDS, initializePayPalScript, isFirefox, PayPalButtonConfig } from "@/lib/paypal";
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
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

// Define pricing tiers based on the subscription structure
export const pricingTiers = [
  { min: 0, max: 0, price: 0, quantity: 5, planId: "P-62G67528SN204230HNAXCOEA", name: "Free Trial" },
  { min: 25000, max: 50000, price: 150, quantity: 10, planId: PLAN_IDS.TIER_1 },
  { min: 50001, max: 100000, price: 200, quantity: 50010, planId: PLAN_IDS.TIER_2 },
  { min: 100001, max: 200000, price: 300, quantity: 100010, planId: PLAN_IDS.TIER_3 }
];

// Get the quantity value for a specific tier
export const getQuantityForTier = (tierIndex: number): number => {
  const tier = pricingTiers[tierIndex];
  if (!tier) return 10; // Default to lowest tier if not found
  return tier.quantity;
};

// Get the price based on account value - always default to first tier ($150)
export const getPriceForAccount = (accountValue: number): number => {
  // Default to first paid tier price of $150
  return 150;
};

// Function to get display text for account balance range
export const getAccountBalanceText = (tierIndex: number): string => {
  const tier = pricingTiers[tierIndex];
  if (!tier) return "under $100,000";
  
  if (tierIndex === 0) {
    return "Free Trial";
  } else if (tierIndex === 1) {
    return `$${tier.min.toLocaleString()} - $${tier.max.toLocaleString()}`;
  } else {
    return `$${tier.min.toLocaleString()} - $${tier.max.toLocaleString()}`;
  }
};

// Define the PayPalButtonProps interface
interface PayPalButtonProps {
  onStatusChange: (status: "idle" | "success" | "failed" | "loading") => void;
  onSubscriptionUpdate: (hasSubscription: boolean, tier?: number) => void;
  className?: string;
  accountValue?: number;
}

export const PayPalButton = ({ 
  onStatusChange, 
  onSubscriptionUpdate,
  className,
  accountValue = 0
}: PayPalButtonProps) => {
  // Always default to the free trial (index 0) as the first option
  const defaultTierIndex = 0;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [selectedTier, setSelectedTier] = useState<number | undefined>(defaultTierIndex);
  const [paypalButtonsVisible, setPaypalButtonsVisible] = useState(false);
  const [initializationTimeout, setInitializationTimeout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isFirefoxBrowser = isFirefox();
  const containerId = `paypal-button-container-${selectedTier !== undefined ? selectedTier : 0}`;
  
  // Get the selected tier object
  const selectedTierObj = selectedTier !== undefined && selectedTier >= 0 && selectedTier < pricingTiers.length
    ? pricingTiers[selectedTier]
    : pricingTiers[0]; // Default to first tier
  
  const currentPrice = selectedTierObj.price;
  const currentQuantity = selectedTierObj.quantity;
  
  // Get account balance display text based on selected tier
  const accountBalanceText = selectedTier !== undefined 
    ? getAccountBalanceText(selectedTier)
    : "Free Trial"; // Default to free trial text
  
  const refreshPayPalContainer = () => {
    console.log('Refreshing PayPal container...');
    setRenderAttempts(prev => prev + 1);
    setScriptError(false);
    setScriptLoaded(false);
    setPaypalButtonsVisible(false);
    setInitializationTimeout(false);
    onStatusChange("idle");
    loadPayPalScript();
  };
  
  const loadPayPalScript = async () => {
    try {
      console.log('Loading PayPal script...');
      onStatusChange("loading");
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('PayPal script loading timeout');
        setInitializationTimeout(true);
        setScriptError(true);
        onStatusChange("failed");
      }, 15000); // 15 second timeout
      
      await initializePayPalScript();
      clearTimeout(timeoutId);
      
      console.log('PayPal script loaded successfully');
      setScriptLoaded(true);
      setInitializationTimeout(false);
      onStatusChange("idle");
    } catch (err) {
      console.error('Failed to load PayPal script:', err);
      setScriptError(true);
      setInitializationTimeout(false);
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
      console.log('Rendering PayPal buttons...');
      // Clear any previous buttons to ensure clean rendering
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      // Get the current tier's plan ID
      const chosenTierIndex = selectedTier !== undefined ? selectedTier : defaultTierIndex;
      const tier = pricingTiers[chosenTierIndex >= 0 ? chosenTierIndex : 0];
      const planId = tier.planId;
      
      // Define button config with proper TypeScript types
      const buttonConfig: PayPalButtonConfig = {
        style: {
          shape: "rect",
          color: "silver",
          layout: "vertical",
          label: "subscribe"
        },
        createSubscription: function(data, actions) {
          // Get the correct tier object based on selection
          const chosenTierIndex = selectedTier !== undefined ? selectedTier : defaultTierIndex;
          const tier = pricingTiers[chosenTierIndex >= 0 ? chosenTierIndex : 0];
          
          // Use the hardcoded quantity value for this tier
          const quantity = tier.quantity;
          
          // Display the actual tier number (human-readable, 1-based) in the log
          const displayTierNumber = chosenTierIndex + 1;
          const tierName = tier.name || `Tier ${displayTierNumber}`;
          
          // Log subscription details for debugging
          console.log(`Creating subscription with ${tierName}, price $${tier.price}, quantity ${quantity}, plan ID ${tier.planId}`);
          
          // Create subscription with the tier-specific plan ID
          return actions.subscription.create({
            plan_id: tier.planId,
            custom_id: `tier_${chosenTierIndex + 1}_price_${tier.price}_qty_${quantity}`,
            application_context: {
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },
        onApprove: async function(data) {
          console.log("Subscription successful:", data.subscriptionID);
          
          try {
            // Get the current user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              throw new Error("User not authenticated");
            }
            
            // Get the tier details
            const chosenTierIndex = selectedTier !== undefined ? selectedTier : defaultTierIndex;
            const tier = pricingTiers[chosenTierIndex];
            
            // Create subscription record in Supabase
            const { error: insertError } = await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                paypal_subscription_id: data.subscriptionID,
                status: 'ACTIVE',
                plan_id: tier.planId,
                tier: chosenTierIndex,
                price: tier.price,
                last_payment_date: new Date().toISOString()
              });
              
            if (insertError) {
              console.error("Error saving subscription to database:", insertError);
              throw insertError;
            }
            
            toast({
              title: "Subscription Successful",
              description: tier.price === 0 
                ? "Your free trial has been activated" 
                : "Your subscription has been processed and saved to your account.",
            });
            
          } catch (error) {
            console.error("Error processing subscription:", error);
            toast({
              title: "Subscription Processed",
              description: "Your PayPal subscription was processed, but we had trouble updating your account. Please contact support if you don't see your subscription active.",
              variant: "destructive",
            });
          }
          
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
      
      // Render buttons ensuring visibility on mobile
      const rendered = window.paypal.Buttons(buttonConfig);
      
      // Check if the buttons can be rendered
      if (rendered.isEligible()) {
        rendered.render(`#${containerId}`);
        console.log('PayPal buttons rendered successfully');
        setPaypalButtonsVisible(true);
      } else {
        console.error('PayPal buttons are not eligible for rendering');
        setScriptError(true);
        onStatusChange("failed");
      }
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
    console.log('PayPal button component mounting...');
    loadPayPalScript();
    
    return () => {
      console.log('PayPal button component unmounting');
    };
  }, []);

  // Render buttons when script is loaded or when selected tier changes
  useEffect(() => {
    if (scriptLoaded && window.paypal && !scriptError) {
      console.log('Script loaded, rendering buttons...');
      // Add delay to ensure DOM is ready, longer on mobile
      const delay = isMobile ? 800 : 200;
      const timer = setTimeout(() => {
        renderPayPalButtons();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, renderAttempts, isMobile, selectedTier]);

  const handleTierChange = (value: string) => {
    console.log('Tier changed to:', value);
    const tierIndex = parseInt(value, 10);
    setSelectedTier(tierIndex);
    // Re-render PayPal buttons with new quantity
    if (scriptLoaded && !scriptError) {
      // Hide PayPal buttons during re-render
      setPaypalButtonsVisible(false);
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
            <Label htmlFor="account-balance" className="font-medium">Account Balance:</Label>
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
              <SelectTrigger className="w-full" id="tier-select">
                <SelectValue placeholder="Select pricing tier" />
              </SelectTrigger>
              <SelectContent 
                position="popper" 
                className="bg-background z-[100]"
                align="start"
                sideOffset={5}
              >
                <SelectGroup>
                  {pricingTiers.map((tier, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {index === 0 ? 
                        `Free Trial: $${tier.price}/mo` : 
                        `$${tier.min.toLocaleString()} - $${tier.max.toLocaleString()}: $${tier.price}/mo`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span>Monthly subscription:</span>
            <span className="font-bold text-primary">
              {currentPrice === 0 ? 
                "Free Trial" :
                `$${currentPrice.toLocaleString()}/month`}
            </span>
          </div>
        </div>
      </div>
      
      {/* Improved mobile styling for PayPal buttons */}
      <div className="w-full mt-8 mb-8">
        {(scriptError || initializationTimeout) ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <p className="mb-2">
                {initializationTimeout 
                  ? "Payment system is taking too long to load. Please check your connection and try again."
                  : "Could not load the payment system. Please try again."
                }
              </p>
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
          <div className="w-full flex flex-col items-center justify-center">
            {!scriptLoaded && !initializationTimeout && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading PayPal...
                </p>
              </div>
            )}
            
            {/* The PayPal button container with improved styling */}
            <div 
              ref={containerRef}
              id={containerId}
              className={cn(
                "w-full paypal-button-container", 
                {
                  "hidden": !paypalButtonsVisible
                }
              )}
              key={`paypal-container-${renderAttempts}-${selectedTier}`}
              style={{ 
                minHeight: isMobile ? "200px" : "150px",
                marginBottom: "20px",
                marginTop: "20px",
                zIndex: 50,
                position: "relative"
              }}
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
