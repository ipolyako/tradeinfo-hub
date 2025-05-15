
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PayPalButton } from "./PayPalButton";
import { PaymentStatus } from "./PaymentStatus";
import { ActiveSubscription } from "./ActiveSubscription";

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
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Subscribe to our algorithmic trading service</CardDescription>
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
