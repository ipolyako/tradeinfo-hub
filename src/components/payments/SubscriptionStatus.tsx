
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { mockCancelSubscription } from "@/functions/cancel-subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionStatusProps {
  subscriptionId?: string;
  selectedTier?: number;
  onSubscriptionUpdate?: (hasSubscription: boolean) => void;
  isLoading?: boolean;
}

export const SubscriptionStatus = ({ 
  selectedTier = 0,
  subscriptionId,
  onSubscriptionUpdate,
  isLoading = false
}: SubscriptionStatusProps) => {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [paypalStatus, setPaypalStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  // Get tier display text
  const getTierText = (tier: number) => {
    switch(tier) {
      case 0: return "Free Trial";
      case 1: return "Basic Plan (up to $50,000)";
      case 2: return "Standard Plan ($50,001 - $100,000)";
      case 3: return "Premium Plan ($100,001 - $200,000)";
      default: return "Basic Plan";
    }
  };

  // Function to check subscription status
  const checkSubscriptionStatus = async () => {
    if (!subscriptionId) {
      setCheckingStatus(false);
      setIsActive(false);
      return;
    }
    
    setCheckingStatus(true);
    setWarning(null);
    
    try {
      const response = await mockCancelSubscription(subscriptionId, { action: 'check' });
      
      if (response.success) {
        setIsActive(response.isActive);
        setPaypalStatus(response.paypalStatus);
        
        // If there's a warning in the response, show it
        if (response.warning) {
          setWarning(response.warning);
        }
      } else {
        setIsActive(false);
        setWarning(response.message || "Unable to verify subscription status with PayPal. Please try again later.");
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsActive(false);
      setWarning("Error checking subscription status. Please try again later.");
    } finally {
      setCheckingStatus(false);
    }
  };
  
  // Check subscription status on component mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, [subscriptionId]);

  // Function to cancel subscription
  const cancelSubscription = async () => {
    if (!subscriptionId) {
      toast({
        title: "Error",
        description: "Subscription ID not found",
        variant: "destructive",
      });
      return;
    }

    // Confirm before cancelling
    if (!window.confirm("Are you sure you want to cancel your subscription? This will end your access to premium features.")) {
      return;
    }

    setCancelLoading(true);
    setWarning(null);
    
    try {
      const response = await mockCancelSubscription(subscriptionId, { action: 'cancel' });
      
      if (response.success) {
        // Check if there's a warning to display
        if (response.warning) {
          setWarning(response.warning);
        }
        
        toast({
          title: "Subscription Cancelled",
          description: response.message || "Your subscription has been successfully cancelled.",
        });
        
        // Update local state
        setIsActive(false);
        setPaypalStatus('CANCELLED');
        
        // Notify parent component
        if (onSubscriptionUpdate) {
          onSubscriptionUpdate(false);
        }
      } else {
        throw new Error(response.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Failed",
        description: "There was a problem cancelling your subscription. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  // Loading state (waiting for subscription check or parent loading)
  if (isLoading || checkingStatus) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking subscription status with PayPal...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          {isActive ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex flex-col">
                <span className="font-medium text-green-600">Active Subscription</span>
                <span className="text-sm text-muted-foreground">{getTierText(selectedTier || 0)}</span>
                {paypalStatus && (
                  <span className="text-xs text-muted-foreground">PayPal Status: {paypalStatus}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="flex flex-col">
                <span className="font-medium text-muted-foreground">No Active Subscription</span>
                {paypalStatus && (
                  <span className="text-xs text-muted-foreground">PayPal Status: {paypalStatus}</span>
                )}
              </div>
            </>
          )}
        </div>
        
        {warning && (
          <Alert variant="warning" className="mb-4">
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        )}
        
        {isActive ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your algorithmic trading subscription is active. View your payment history and manage your subscription from the Payments page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/payments">
                <Button variant="outline" className="w-full sm:w-auto">Manage Subscription</Button>
              </Link>
              
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
                onClick={cancelSubscription}
                disabled={cancelLoading || !subscriptionId}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subscribe to our algorithmic trading service to access all features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/payments">
                <Button className="w-full sm:w-auto">Subscribe Now</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
