
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PaymentHistoryProps {
  hasActiveSubscription: boolean;
}

export const PaymentHistory = ({ hasActiveSubscription }: PaymentHistoryProps) => {
  // Get current date for most recent payment
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View your previous payments</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <div className="space-y-4">
            <div className="border rounded-lg divide-y">
              <div className="flex items-center justify-between p-4 touch-manipulation">
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  <p className="text-sm text-muted-foreground">Algorithmic Trading Service</p>
                </div>
                <span className="font-bold">$150.00</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-6 text-muted-foreground">No payment history available</p>
        )}
      </CardContent>
    </Card>
  );
};
