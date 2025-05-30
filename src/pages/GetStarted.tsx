import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const GetStarted = () => {
  return (
    <div className="page-container bg-background">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Getting Started</h1>
        
        <div className="space-y-6 text-lg">
          <p>To begin using our algorithmic trading service, please follow these steps:</p>
          
          <ol className="space-y-8">
            <li>
              <strong>Open a Brokerage Account:</strong>
              <p className="mt-2">You'll need to create and fund a trading account with either Charles Schwab or TradeStation. These are the currently supported brokers where our algorithms will execute trades. The minimum recommended account balance is $30,000.</p>
              <div className="mt-2 space-y-2">
                <p>
                  <a href="https://drive.google.com/file/d/1lf4q2T7Zq4-4pZFaJZlOjP29cum89gHa/view?usp=sharing" 
                     className="text-primary hover:underline" 
                     target="_blank" 
                     rel="noopener noreferrer">
                    For detailed Schwab account setup instructions, please follow this guide.
                  </a>
                </p>
                <p>
                  <a href="https://drive.google.com/file/d/1ZUlb2eoiHIundJiowODjh5Q2sCjJT67a/view?usp=sharing" 
                     className="text-primary hover:underline" 
                     target="_blank" 
                     rel="noopener noreferrer">
                    For detailed TradeStation account setup instructions, please follow this guide.
                  </a>
                </p>
              </div>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  While we recommend a minimum account balance of $30,000, you can trade with a smaller amount. You are not required to use your entire available balance for trading.
                </p>
              </div>
            </li>
            
            <li>
              <strong>Contact Customer Service:</strong>
              <p className="mt-2">Once your brokerage account is set up, please notify Deco Global Customer Services at <a href="mailto:support@decoglobal.us" className="text-primary hover:underline">support@decoglobal.us</a></p>
            </li>
            
            <li>
              <strong>Create an Account:</strong>
              <p className="mt-2">Sign up for an account on our platform to access your trading dashboard and complete the payment process.</p>
              <div className="mt-4">
                <Link to="/account">
                  <Button>Create Account</Button>
                </Link>
              </div>
            </li>
            
            <li>
              <strong>Await Further Instructions:</strong>
              <p className="mt-2">Our team will review your application and contact you with detailed instructions for the next steps.</p>
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
