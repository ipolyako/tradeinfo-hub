
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

  // Initialize PayPal SDK on mount
  useEffect(() => {
    initializePayPalScript();
  }, []);

  // Reset payment status on mount
  useEffect(() => {
    if (!loading && session) {
      // Check if the user already has a subscription
      // This would normally come from your backend
      // For demo purposes, we'll just use localStorage
      const savedSubscription = localStorage.getItem("hasSubscription");
      if (savedSubscription === "true") {
        setHasActiveSubscription(true);
      }
    }
  }, [loading, session]);

  const handleRetry = () => {
    setPaymentStatus("idle");
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
