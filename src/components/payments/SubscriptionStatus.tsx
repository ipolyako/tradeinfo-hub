
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

interface SubscriptionStatusProps {
  hasActiveSubscription: boolean;
  selectedTier?: number;
}

export const SubscriptionStatus = ({ hasActiveSubscription, selectedTier = 0 }: SubscriptionStatusProps) => {
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
              <span className="font-medium text-green-600">Active Subscription</span>
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
