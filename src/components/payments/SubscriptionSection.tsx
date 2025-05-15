
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PayPalButton } from "./PayPalButton";
import { PaymentStatus } from "./PaymentStatus";
import { ActiveSubscription } from "./ActiveSubscription";
import { useEffect } from "react";

interface SubscriptionSectionProps {
  hasActiveSubscription: boolean;
  paymentStatus: "idle" | "success" | "failed" | "loading";
  onRetry: () => void;
  onStatusChange: (status: "idle" | "success" | "failed" | "loading") => void;
  onSubscriptionUpdate: (hasSubscription: boolean) => void;
  accountValue?: number;
}

export const SubscriptionSection = ({ 
  hasActiveSubscription, 
  paymentStatus, 
  onRetry, 
  onStatusChange,
  onSubscriptionUpdate,
  accountValue = 0
}: SubscriptionSectionProps) => {
  // Ensure we start from a clean state when component remounts
  useEffect(() => {
    if (paymentStatus !== "success" && paymentStatus !== "loading") {
      onStatusChange("idle");
    }
  }, []);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete payment to access our algorithmic trading service</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <ActiveSubscription accountValue={accountValue} />
        ) : (
          <>
            {paymentStatus === "idle" && (
              <PayPalButton 
                onStatusChange={onStatusChange} 
                onSubscriptionUpdate={onSubscriptionUpdate}
                accountValue={accountValue}
              />
            )}

            {(paymentStatus === "success" || paymentStatus === "failed" || paymentStatus === "loading") && (
              <PaymentStatus status={paymentStatus} onRetry={onRetry} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
