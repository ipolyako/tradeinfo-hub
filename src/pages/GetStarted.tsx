import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Getting Started with TradePro</h1>
        
        <div className="space-y-6 text-lg">
          <p>To begin using our algorithmic trading service, please follow these steps:</p>
          
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Open an Alpaca Account:</strong>
              <p className="mt-2">You'll need to create and fund a trading account with Alpaca Securities. This will be the account where our algorithms will execute trades.</p>
            </li>
            
            <li>
              <strong>Contact Customer Service:</strong>
              <p className="mt-2">Once your Alpaca account is set up, please notify Deco Global Customer Services at <span className="text-primary">support@decoglobal.com</span></p>
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