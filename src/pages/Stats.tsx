
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Stats = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-6">Trading Performance</h1>
        <Card>
          <CardContent className="p-0">
            {isMobile ? (
              // Mobile: Display the static image
              <div className="w-full">
                <img 
                  src="/lovable-uploads/8adef1c5-046a-4493-b544-de1837284437.png" 
                  alt="Trading Performance Data" 
                  className="w-full h-auto"
                />
              </div>
            ) : (
              // Desktop: Use the Google Sheets embed
              <div className="w-full aspect-[16/9]">
                <iframe
                  src="https://docs.google.com/spreadsheets/d/1QfIyxlP73oPx5FDwimzG6thbKIhRb6jgMNRkbNLfVd8/edit?usp=sharing"
                  className="w-full h-full border-0"
                  title="Trading Statistics"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
