
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatusProps {
  hasActiveSubscription: boolean;
  selectedTier?: number;
  isLoading?: boolean;
  status?: string;
  subscriptionId?: string;
  onSubscriptionUpdate?: (hasSubscription: boolean) => void;
}

export const SubscriptionStatus = ({ 
  hasActiveSubscription, 
  selectedTier = 0,
  isLoading = false,
  status = "ACTIVE",
  subscriptionId,
  onSubscriptionUpdate
}: SubscriptionStatusProps) => {
  const [cancelLoading, setCancelLoading] = useState(false);
  
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
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been successfully cancelled.",
        });
        
        // Notify parent component
        if (onSubscriptionUpdate) {
          onSubscriptionUpdate(false);
        }
      } else {
        throw new Error(data.message || "Failed to cancel subscription");
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

  // Loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking subscription status...</p>
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
          {hasActiveSubscription ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex flex-col">
                <span className="font-medium text-green-600">Active Subscription</span>
                <span className="text-sm text-muted-foreground">{getTierText(selectedTier || 0)}</span>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="font-medium text-muted-foreground">No Active Subscription</span>
            </>
          )}
        </div>
        
        {hasActiveSubscription ? (
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
