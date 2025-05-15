
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { PaymentHeader } from "@/components/payments/PaymentHeader";
import { SubscriptionSection } from "@/components/payments/SubscriptionSection";
import { PaymentHistory } from "@/components/payments/PaymentHistory";
import { LoadingState } from "@/components/payments/LoadingState";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { toast } from "@/hooks/use-toast";
import { initializePayPalScript } from "@/lib/paypal";

const Payments = () => {
  const { loading, session } = useAuthRedirect("/account");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed" | "loading">("idle");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [accountValue] = useState(75000); // Example account value, in a real app would come from user data
  const [paypalInitialized, setPaypalInitialized] = useState(false);

  // Reset payment status on mount and check subscription status
  useEffect(() => {
    if (!loading && session) {
      // Check if the user already has a subscription
      // This would normally come from your backend
      const savedSubscription = localStorage.getItem("hasSubscription");
      if (savedSubscription === "true") {
        setHasActiveSubscription(true);
      }
      
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

  const handleRetry = () => {
    setPaymentStatus("idle");
    toast({
      title: "Retrying Payment",
      description: "Please wait while we set up the payment system...",
    });
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
          onSubscriptionUpdate={(hasSubscription) => {
            setHasActiveSubscription(hasSubscription);
            if (hasSubscription) {
              localStorage.setItem("hasSubscription", "true");
              toast({
                title: "Subscription Active",
                description: "Your subscription is now active. Thank you for your payment!",
              });
            }
          }}
          accountValue={accountValue}
        />
        
        <PaymentHistory hasActiveSubscription={hasActiveSubscription} />
      </div>
    </div>
  );
};

export default Payments;
