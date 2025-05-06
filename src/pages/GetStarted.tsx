
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const GetStarted = () => {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");

  // Initialize PayPal script
  useEffect(() => {
    if (paymentStatus === "idle") {
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
  }, [paymentStatus]);

  const handleRetry = () => {
    setPaymentStatus("idle");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Getting Started</h1>
        
        <div className="space-y-6 text-lg">
          <p>To begin using our algorithmic trading service, please follow these steps:</p>
          
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Open a Brokerage Account:</strong>
              <p className="mt-2">You'll need to create and fund a trading account with either Charles Schwab or TradeStation. These are the currently supported brokers where our algorithms will execute trades. The minimum recommended account balance is $30,000.</p>
            </li>
            
            <li>
              <strong>Contact Customer Service:</strong>
              <p className="mt-2">Once your brokerage account is set up, please notify Deco Global Customer Services at <a href="mailto:support@decoglobal.us" className="text-primary hover:underline">support@decoglobal.us</a></p>
            </li>

            <li>
              <strong>Complete Initial Payment:</strong>
              <p className="mt-2">Please complete the one-time setup fee payment to proceed with your account activation.</p>
              
              <Card className="mt-4">
                <CardContent className="pt-6">
                  {paymentStatus === "idle" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Subscription Fee:</span>
                        <span className="font-bold">$199.00 USD</span>
                      </div>
                      
                      <div id="paypal-button-container" className="w-full">
                        {/* PayPal Button will be rendered here */}
                      </div>
                      
                      <div className="text-center text-sm text-muted-foreground">
                        By proceeding with the payment, you agree to our
                        <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
                        and
                        <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
                      </div>
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
                </CardContent>
              </Card>
            </li>
            
            <li>
              <strong>Await Further Instructions:</strong>
              <p className="mt-2">Our team will review your application and contact you with detailed instructions for the next steps, including account linking and strategy selection.</p>
            </li>
          </ol>
          
          <div className="bg-secondary p-6 rounded-lg mt-8">
            <h2 className="text-xl font-semibold mb-4">Important Note</h2>
            <p>For security and compliance reasons, we follow a careful onboarding process. Our team will guide you through each step to ensure a smooth setup of your algorithmic trading account.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
