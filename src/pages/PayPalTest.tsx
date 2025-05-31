
import { Navigation } from "@/components/Navigation";
import { PayPalProductCreator } from "@/components/PayPalProductCreator";

const PayPalTest = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">PayPal API Test</h1>
          <p className="text-muted-foreground mt-2">
            Test PayPal product creation using your stored credentials
          </p>
        </div>
        
        <div className="flex justify-center">
          <PayPalProductCreator />
        </div>
      </div>
    </div>
  );
};

export default PayPalTest;
