
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState = () => {
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
};
