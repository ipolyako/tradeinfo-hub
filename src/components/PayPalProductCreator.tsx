
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { create5DayFreeProduct } from "@/functions/create-paypal-product";

export const PayPalProductCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreateProduct = async () => {
    setIsCreating(true);
    setResult(null);
    
    try {
      const response = await create5DayFreeProduct();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>PayPal Product Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleCreateProduct}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Product...
            </>
          ) : (
            "Create 5-Day Free Product"
          )}
        </Button>
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Status:</strong> {result.success ? "Success" : "Failed"}</p>
                <p><strong>Message:</strong> {result.message}</p>
                {result.data && (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
