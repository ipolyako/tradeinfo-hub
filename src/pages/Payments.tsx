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
import { mockCancelSubscription } from "@/functions/cancel-subscription";

interface Subscription {
  id: string;
  tier: number;
  paypal_subscription_id?: string;
  price: number;
}

const Payments = () => {
  const { loading, session } = useAuthRedirect("/account");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed" | "loading">("idle");
  const [isActive, setIsActive] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [accountValue] = useState(75000); // Example account value, in a real app would come from user data
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset payment status on mount and check subscription status
  useEffect(() => {
    if (!loading && session) {
      // Check if the user already has a subscription from Supabase
      fetchSubscriptionInfo();
      
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
  
  // Fetch subscription information
  const fetchSubscriptionInfo = async () => {
    if (!session?.user) return;
    
    try {
      setSubscriptionLoading(true);
      
      // Query the subscriptions table for subscriptions for this user
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, tier, price, paypal_subscription_id')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching subscription info:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setSubscription(data[0]);
        console.log("Found subscription:", data[0]);
        
        // Check status with PayPal
        if (data[0].paypal_subscription_id) {
          await checkPayPalStatus(data[0].paypal_subscription_id);
        } else {
          setIsActive(false);
        }
      } else {
        setSubscription(null);
        setIsActive(false);
        console.log("No subscription found");
      }
    } catch (error) {
      console.error("Error checking subscription info:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };
  
  // Check PayPal status
  const checkPayPalStatus = async (subscriptionId: string) => {
    try {
      const response = await mockCancelSubscription(subscriptionId, { action: 'check' });
      
      if (response.success) {
        setIsActive(response.isActive);
        console.log("PayPal status:", response.paypalStatus, "isActive:", response.isActive);
      } else {
        setIsActive(false);
        console.error("Failed to check PayPal status:", response.message);
      }
    } catch (error) {
      console.error("Error checking PayPal status:", error);
      setIsActive(false);
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
    setIsActive(hasSubscription);
    
    if (hasSubscription) {
      await fetchSubscriptionInfo();
      toast({
        title: "Subscription Active",
        description: "Your subscription is now active. Thank you for your payment!",
      });
    } else {
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
      description: "Checking your current subscription status with PayPal...",
    });
    
    if (subscription?.paypal_subscription_id) {
      await checkPayPalStatus(subscription.paypal_subscription_id);
    } else {
      await fetchSubscriptionInfo();
    }
    
    setIsRefreshing(false);
    toast({
      title: "Status Updated",
      description: "Your subscription status has been refreshed.",
    });
  };

  // Show loading state while checking auth
  if (loading) {
    return <LoadingState />;
  }

  // If not logged in, already redirected in useAuthRedirect hook

  return (
    <div className="page-container bg-background">
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
            Refresh PayPal Status
          </Button>
        </div>
        
        <SubscriptionSection 
          hasActiveSubscription={isActive} 
          paymentStatus={paymentStatus}
          onRetry={handleRetry}
          onStatusChange={setPaymentStatus}
          onSubscriptionUpdate={handleSubscriptionUpdate}
          accountValue={accountValue}
          isLoading={subscriptionLoading}
          selectedTier={subscription?.tier}
          subscriptionId={subscription?.paypal_subscription_id}
        />
        
        <PaymentHistory hasActiveSubscription={isActive} />
      </div>
    </div>
  );
};

export default Payments;
