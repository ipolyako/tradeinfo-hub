
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { PaymentHeader } from "@/components/payments/PaymentHeader";
import { SubscriptionSection } from "@/components/payments/SubscriptionSection";
import { PaymentHistory } from "@/components/payments/PaymentHistory";
import { LoadingState } from "@/components/payments/LoadingState";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { toast } from "@/hooks/use-toast";
import { initializePayPalScript } from "@/lib/paypal";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  tier: number;
  paypal_subscription_id?: string;
}

const Payments = () => {
  const { loading, session } = useAuthRedirect("/account");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed" | "loading">("idle");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [accountValue] = useState(75000); // Example account value, in a real app would come from user data
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset payment status on mount and check subscription status
  useEffect(() => {
    if (!loading && session) {
      // Check if the user already has a subscription from Supabase
      checkSubscriptionStatus();
      
      // Don't show loading state for PayPal before user sees the button
      setPaymentStatus("idle");
    }
  }, [loading, session]);

  // Pre-initialize PayPal script once when page loads
  useEffect(() => {
    if (!loading && session && !paypalInitialized) {
      initializePayPalScript()
        .then(() => {
          console.log("PayPal pre-initialized successfully");
          setPaypalInitialized(true);
        })
        .catch((err) => {
          console.error("PayPal pre-initialization failed:", err);
        });
    }
  }, [loading, session, paypalInitialized]);
  
  // Check subscription status from Supabase
  const checkSubscriptionStatus = async () => {
    if (!session?.user) return;
    
    try {
      setSubscriptionLoading(true);
      
      // Query the subscriptions table for active subscriptions for this user
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching subscription status:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setHasActiveSubscription(true);
        setSubscription(data[0]);
        console.log("Found active subscription:", data[0]);
      } else {
        setHasActiveSubscription(false);
        setSubscription(null);
        console.log("No active subscription found");
        
        // Check if there are any cancelled subscriptions
        const { data: cancelledData, error: cancelledError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'CANCELLED')
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (cancelledError) {
          console.error("Error fetching cancelled subscriptions:", cancelledError);
        } else if (cancelledData && cancelledData.length > 0) {
          console.log("Found cancelled subscription:", cancelledData[0]);
        }
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus("idle");
    toast({
      title: "Retrying Payment",
      description: "Please wait while we set up the payment system...",
    });
  };
  
  const handleSubscriptionUpdate = async (hasSubscription: boolean, tier?: number) => {
    setHasActiveSubscription(hasSubscription);
    
    if (hasSubscription) {
      await checkSubscriptionStatus();
      toast({
        title: "Subscription Active",
        description: "Your subscription is now active. Thank you for your payment!",
      });
    } else {
      // If subscription was cancelled, refresh the status
      setSubscription(null);
      toast({
        title: "Subscription Updated",
        description: "Your subscription status has been updated.",
      });
    }
  };
  
  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing Status",
      description: "Checking your current subscription status...",
    });
    
    await checkSubscriptionStatus();
    
    setIsRefreshing(false);
    toast({
      title: "Status Updated",
      description: "Your subscription status has been refreshed.",
    });
  };

  // Force a cancellation in our database if needed
  const handleForceCancel = async () => {
    if (!subscription?.paypal_subscription_id) {
      toast({
        title: "Error",
        description: "No subscription ID found to cancel",
        variant: "destructive",
      });
      return;
    }
    
    if (!window.confirm("Force cancel this subscription in our database? Use this only if PayPal shows it's cancelled but our system still shows active.")) {
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscription.paypal_subscription_id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been marked as cancelled in our database.",
      });
      
      // Refresh subscription status
      await checkSubscriptionStatus();
      
    } catch (error) {
      console.error("Error forcing cancellation:", error);
      toast({
        title: "Error",
        description: "Could not cancel your subscription. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return <LoadingState />;
  }

  // If not logged in, already redirected in useAuthRedirect hook

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <PaymentHeader />
        
        <div className="mb-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshStatus}
            disabled={isRefreshing || subscriptionLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          
          {hasActiveSubscription && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceCancel}
              disabled={isRefreshing || subscriptionLoading}
              className="text-red-500 hover:text-red-600"
            >
              Force Cancel
            </Button>
          )}
        </div>
        
        <SubscriptionSection 
          hasActiveSubscription={hasActiveSubscription} 
          paymentStatus={paymentStatus}
          onRetry={handleRetry}
          onStatusChange={setPaymentStatus}
          onSubscriptionUpdate={handleSubscriptionUpdate}
          accountValue={accountValue}
          isLoading={subscriptionLoading}
          selectedTier={subscription?.tier}
          subscriptionId={subscription?.paypal_subscription_id}
        />
        
        <PaymentHistory hasActiveSubscription={hasActiveSubscription} />
      </div>
    </div>
  );
};

export default Payments;
