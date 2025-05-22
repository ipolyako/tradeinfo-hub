
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PerformanceData {
  year: string;
  result: number | null;
  pl_percent: number | null;
  data_source: string | null;
}

const Stats = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("historical");
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  // Fetch historical performance data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('performance')
          .select('*')
          .order('year', { ascending: false });
        
        if (error) {
          throw new Error(`Error fetching performance data: ${error.message}`);
        }
        
        setPerformanceData(data || []);
      } catch (err: any) {
        console.error("Failed to load historical data:", err);
        toast({
          variant: "destructive",
          title: "Data loading error",
          description: "Could not load historical performance data"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "historical") {
      fetchHistoricalData();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-6">Trading Performance</h1>
        
        <Tabs defaultValue="historical" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="historical" className="flex-1 md:flex-none">Historical Performance</TabsTrigger>
            <TabsTrigger value="current" className="flex-1 md:flex-none">Current Year Performance</TabsTrigger>
          </TabsList>
          
          {/* Historical Performance Tab Content */}
          <TabsContent value="historical" className="pt-2">
            <Card>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : performanceData.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No historical performance data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Year</th>
                          <th className="py-3 px-4 text-right">Return %</th>
                          <th className="py-3 px-4 text-right">P&L</th>
                          <th className="py-3 px-4 text-left">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceData.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{row.year}</td>
                            <td className="py-3 px-4 text-right">
                              {row.pl_percent !== null ? `${row.pl_percent.toFixed(2)}%` : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {row.result !== null ? `$${row.result.toLocaleString()}` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">{row.data_source || 'Unknown'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Current Year Performance Tab Content */}
          <TabsContent value="current" className="pt-2">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stats;
