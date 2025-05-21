
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

interface Subscription {
  id: string;
  status: string;
  tier: number;
}

const Payments = () => {
  const { loading, session } = useAuthRedirect("/account");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed" | "loading">("idle");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [accountValue] = useState(75000); // Example account value, in a real app would come from user data
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

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
        
        <SubscriptionSection 
          hasActiveSubscription={hasActiveSubscription} 
          paymentStatus={paymentStatus}
          onRetry={handleRetry}
          onStatusChange={setPaymentStatus}
          onSubscriptionUpdate={handleSubscriptionUpdate}
          accountValue={accountValue}
          isLoading={subscriptionLoading}
          selectedTier={subscription?.tier}
        />
        
        <PaymentHistory hasActiveSubscription={hasActiveSubscription} />
      </div>
    </div>
  );
};

export default Payments;
