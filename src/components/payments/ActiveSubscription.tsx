
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export const ActiveSubscription = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <p className="font-medium">Active Subscription</p>
            <p className="text-sm text-muted-foreground">Algorithmic Trading Service</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">$199.00/month</p>
          <p className="text-xs text-muted-foreground">Next billing date: June 6, 2025</p>
        </div>
      </div>
      <Button variant="outline">Manage Subscription</Button>
    </div>
  );
};
