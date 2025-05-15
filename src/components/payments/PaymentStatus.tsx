
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentStatusProps {
  status: "success" | "failed" | "loading";
  onRetry?: () => void;
}

export const PaymentStatus = ({ status, onRetry }: PaymentStatusProps) => {
  if (status === "loading") {
    return (
      <div className="py-4 text-center">
        <div className="mb-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h3 className="text-xl font-medium">Processing Payment</h3>
        <p className="mt-2 text-muted-foreground">Please wait while we process your payment...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="py-4 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-green-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-medium text-green-700">Subscription Successful!</h3>
        <p className="mt-2">Thank you for your subscription. Our team will review your application and contact you shortly.</p>
      </div>
    );
  }

  return (
    <div className="py-4 text-center">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-red-100 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-medium text-red-700">Payment Cancelled</h3>
      <p className="mt-2">Your payment was not processed. Please try again or contact our support team.</p>
      {onRetry && <Button className="mt-4" onClick={onRetry}>Try Again</Button>}
    </div>
  );
};
