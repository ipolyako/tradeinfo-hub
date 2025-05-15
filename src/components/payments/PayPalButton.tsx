
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CLIENT_ID, PLAN_ID, initializePayPalScript, isFirefox } from "@/lib/paypal";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [showFirefoxHelp, setShowFirefoxHelp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isFirefoxBrowser = isFirefox();
  const containerId = `paypal-button-container-${PLAN_ID}`;
  
  // Show Firefox help dialog if user is on Firefox
  useEffect(() => {
    if (isFirefoxBrowser) {
      const timer = setTimeout(() => {
        setShowFirefoxHelp(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirefoxBrowser]);
  
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
      
      const buttonConfig = {
        style: {
          shape: 'rect',
          color: 'silver',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            plan_id: PLAN_ID,
            quantity: 1
          });
        },
        // Firefox-specific configuration
        onApprove: function(data) {
          console.log("Subscription successful:", data.subscriptionID);
          toast({
            title: "Subscription Successful",
            description: "Your subscription has been processed successfully.",
          });
          onStatusChange("success");
          onSubscriptionUpdate(true);
          return true; // Explicit return to ensure Firefox handles this properly
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

  // Render buttons when script is loaded
  useEffect(() => {
    if (scriptLoaded && window.paypal) {
      // Add delay to ensure DOM is ready, longer on mobile
      const delay = isMobile ? 500 : 200;
      const timer = setTimeout(() => {
        renderPayPalButtons();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, renderAttempts, isMobile]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Subscription:</span>
        <span className="font-bold">Monthly Plan</span>
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
            
            {isFirefoxBrowser && (
              <div className="w-full mb-4">
                <Alert className="mb-2 bg-amber-50 border-amber-200">
                  <AlertDescription className="text-amber-800">
                    <p>Firefox users: If the payment window closes automatically, please click the button again and allow pop-ups for this site.</p>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <div 
              ref={containerRef}
              id={containerId}
              className="w-full paypal-button-container"
              key={`paypal-container-${renderAttempts}`}
              style={{ minHeight: isMobile ? "150px" : "120px" }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Firefox help dialog */}
      <Dialog open={showFirefoxHelp} onOpenChange={setShowFirefoxHelp}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4 p-2">
            <h3 className="text-lg font-medium">Firefox PayPal Instructions</h3>
            <p>Firefox may block the PayPal popup window. To complete your subscription:</p>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Look for the popup blocker icon in your Firefox address bar</li>
              <li>Click "Allow popups for this site"</li>
              <li>Try the PayPal button again</li>
            </ol>
            <div className="flex justify-end">
              <Button onClick={() => setShowFirefoxHelp(false)}>I understand</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="text-center text-sm text-muted-foreground">
        By proceeding with the subscription, you agree to our
        <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
        and
        <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};
