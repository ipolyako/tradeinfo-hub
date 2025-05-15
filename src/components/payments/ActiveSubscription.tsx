
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface ActiveSubscriptionProps {
  accountValue?: number;
}

export const ActiveSubscription = ({ accountValue = 0 }: ActiveSubscriptionProps) => {
  const paymentAmount = accountValue < 100000 ? 200 : 300;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <p className="font-medium">Payment Complete</p>
            <p className="text-sm text-muted-foreground">Algorithmic Trading Service</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">${paymentAmount}.00</p>
          <p className="text-xs text-muted-foreground">Processed: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <Button variant="outline">View Receipt</Button>
    </div>
  );
};
