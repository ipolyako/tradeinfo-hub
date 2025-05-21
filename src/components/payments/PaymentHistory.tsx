
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PaymentHistoryProps {
  hasActiveSubscription: boolean;
}

interface Payment {
  paypal_subscription_id: string;
  last_payment_date: string;
  price: number;
  status: string;
}

export const PaymentHistory = ({ hasActiveSubscription }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch payment history from Supabase
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data, error } = await supabase
          .from('subscriptions')
          .select('paypal_subscription_id, last_payment_date, price, status')
          .eq('user_id', user.id)
          .order('last_payment_date', { ascending: false })
          .limit(5);
          
        if (error) {
          console.error("Error fetching payment history:", error);
          return;
        }
        
        if (data) {
          setPayments(data);
        }
      } catch (error) {
        console.error("Error in fetchPaymentHistory:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentHistory();
  }, []);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your previous payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View your previous payments</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="space-y-4">
            <div className="border rounded-lg divide-y">
              {payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">
                      {payment.last_payment_date ? new Date(payment.last_payment_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Date not available'}
                    </p>
                    <p className="text-sm text-muted-foreground">Algorithmic Trading Service</p>
                    <p className="text-xs text-muted-foreground mt-1">Subscription ID: {payment.paypal_subscription_id.substring(0, 10)}...</p>
                  </div>
                  <span className="font-bold">${payment.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center py-6 text-muted-foreground">No payment records found</p>
        )}
      </CardContent>
    </Card>
  );
};
