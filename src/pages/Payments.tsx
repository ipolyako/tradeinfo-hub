
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Payments = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Check authentication status
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
      
      // If not logged in, redirect to login
      if (!currentSession) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access payment options.",
          variant: "destructive",
        });
        navigate("/account");
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      // If logged out during session, redirect to login
      if (event === 'SIGNED_OUT') {
        navigate("/account");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Initialize PayPal script when component mounts
  useEffect(() => {
    if (paymentStatus === "idle" && session) {
      // Create PayPal script element
      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=ARrwQMysQqyFM7j3lPuiPnUII7WXGkNWzBLTdVm2HvVUa-shV1LA0EMANtgTSMKWa-UQ-Leig0VywPD7&vault=true";
      script.setAttribute("data-sdk-integration-source", "button-factory");
      script.async = true;
      
      // When the script loads, render the PayPal buttons
      script.onload = () => {
        if (window.paypal) {
          window.paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'vertical',
              label: 'subscribe',
            },
            createSubscription: function(data, actions) {
              return actions.subscription.create({
                'plan_id': 'P-64T954128V783625HL3ITKJY'
              });
            },
            onApprove: function(data) {
              console.log("Subscription approved:", data.subscriptionID);
              toast({
                title: "Subscription Successful",
                description: "Your subscription has been processed successfully.",
                variant: "default",
              });
              setPaymentStatus("success");
              setHasActiveSubscription(true);
            },
            onError: function(err) {
              console.error("PayPal error:", err);
              toast({
                title: "Payment Failed",
                description: "There was an issue processing your payment.",
                variant: "destructive",
              });
              setPaymentStatus("failed");
            },
            onCancel: function() {
              setPaymentStatus("failed");
            }
          }).render('#paypal-button-container');
        }
      };
      
      // Add script to document
      document.body.appendChild(script);
      
      // Clean up
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [paymentStatus, session]);

  const handleRetry = () => {
    setPaymentStatus("idle");
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <h1 className="text-3xl font-bold mb-8">Payments</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-6">Loading payment options...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If not logged in, already redirected in useEffect

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/account" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Account
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Payments</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription to our algorithmic trading service</CardDescription>
          </CardHeader>
          <CardContent>
            {hasActiveSubscription ? (
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
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subscription Fee:</span>
                  <span className="font-bold">$199.00 USD / month</span>
                </div>
                
                {paymentStatus === "idle" && (
                  <div id="paypal-button-container" className="w-full">
                    {/* PayPal Button will be rendered here */}
                  </div>
                )}

                {paymentStatus === "success" && (
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
                )}

                {paymentStatus === "failed" && (
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
                    <Button className="mt-4" onClick={handleRetry}>Try Again</Button>
                  </div>
                )}
                
                <div className="text-center text-sm text-muted-foreground">
                  By proceeding with the payment, you agree to our
                  <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
                  and
                  <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View your previous payments</CardDescription>
          </CardHeader>
          <CardContent>
            {hasActiveSubscription ? (
              <div className="space-y-4">
                <div className="border rounded-lg divide-y">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">May 6, 2025</p>
                      <p className="text-sm text-muted-foreground">Algorithmic Trading Service</p>
                    </div>
                    <span className="font-bold">$199.00</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">No payment history available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
