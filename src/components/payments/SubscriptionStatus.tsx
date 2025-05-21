
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface SubscriptionStatusProps {
  hasActiveSubscription: boolean;
  selectedTier?: number;
  isLoading?: boolean;
}

export const SubscriptionStatus = ({ 
  hasActiveSubscription, 
  selectedTier = 0,
  isLoading = false 
}: SubscriptionStatusProps) => {
  // Get tier display text
  const getTierText = (tier: number) => {
    switch(tier) {
      case 0: return "Basic Plan (up to $50,000)";
      case 1: return "Standard Plan ($50,001 - $100,000)";
      case 2: return "Premium Plan ($100,001 - $200,000)";
      default: return "Basic Plan";
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
            <Link to="/payments">
              <Button variant="outline" className="w-full sm:w-auto">Manage Subscription</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subscribe to our algorithmic trading service to access all features.
            </p>
            <Link to="/payments">
              <Button className="w-full sm:w-auto">Subscribe Now</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
