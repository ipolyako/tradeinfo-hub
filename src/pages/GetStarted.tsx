
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const GetStarted = () => {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
  };

  const handlePaymentCancel = () => {
    setPaymentStatus("failed");
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
                        <span className="font-medium">Setup Fee:</span>
                        <span className="font-bold">$199.00 USD</span>
                      </div>
                      
                      <div id="paypal-button-container" className="w-full">
                        {/* PayPal Button will be rendered here */}
                        <div className="flex flex-col space-y-4">
                          <div className="relative h-12 w-full overflow-hidden rounded border border-border">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img 
                                src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-large.png" 
                                alt="PayPal Checkout" 
                                className="h-full object-contain" 
                              />
                            </div>
                            <div className="absolute inset-0 opacity-0">
                              <Button 
                                className="h-full w-full" 
                                onClick={handlePaymentSuccess} 
                                aria-label="Pay with PayPal"
                              >
                                Pay with PayPal
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-center text-sm text-muted-foreground">
                            By clicking the payment button, you agree to our
                            <Link to="/terms-of-service" className="mx-1 text-primary hover:underline">Terms of Service</Link>
                            and
                            <Link to="/privacy" className="mx-1 text-primary hover:underline">Privacy Policy</Link>
                          </div>
                        </div>
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
                      <h3 className="text-xl font-medium text-green-700">Payment Successful!</h3>
                      <p className="mt-2">Thank you for your payment. Our team will review your application and contact you shortly.</p>
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
                      <Button className="mt-4" onClick={() => setPaymentStatus("idle")}>Try Again</Button>
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
