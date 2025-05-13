
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PayPalButton } from "./PayPalButton";
import { PaymentStatus } from "./PaymentStatus";
import { ActiveSubscription } from "./ActiveSubscription";

interface SubscriptionSectionProps {
  hasActiveSubscription: boolean;
  paymentStatus: "idle" | "success" | "failed";
  onRetry: () => void;
  onStatusChange: (status: "idle" | "success" | "failed") => void;
  onSubscriptionUpdate: (hasSubscription: boolean) => void;
}

export const SubscriptionSection = ({ 
  hasActiveSubscription, 
  paymentStatus, 
  onRetry, 
  onStatusChange,
  onSubscriptionUpdate 
}: SubscriptionSectionProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription to our algorithmic trading service</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <ActiveSubscription />
        ) : (
          <>
            {paymentStatus === "idle" && (
              <PayPalButton 
                onStatusChange={onStatusChange} 
                onSubscriptionUpdate={onSubscriptionUpdate} 
              />
            )}

            {paymentStatus === "success" && (
              <PaymentStatus status="success" />
            )}

            {paymentStatus === "failed" && (
              <PaymentStatus status="failed" onRetry={onRetry} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
