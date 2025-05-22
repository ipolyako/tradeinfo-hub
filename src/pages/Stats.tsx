
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CurrentYearPerformance } from "@/components/stats/CurrentYearPerformance";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

  const getReturnColor = (value: number | null) => {
    if (value === null) return "text-muted-foreground";
    if (value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

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
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-bold">Year</TableHead>
                          <TableHead className="font-bold text-right">Return %</TableHead>
                          <TableHead className="font-bold text-right">Profit and Loss</TableHead>
                          <TableHead className="font-bold">Data Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceData.map((row, index) => (
                          <TableRow 
                            key={index} 
                            className={`hover:bg-muted/40 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                          >
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="border-primary/30">{row.year}</Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${getReturnColor(row.pl_percent)}`}>
                              {row.pl_percent !== null ? `${row.pl_percent.toFixed(2)}%` : 'N/A'}
                            </TableCell>
                            <TableCell className={`text-right ${getReturnColor(row.result)}`}>
                              {row.result !== null ? (
                                <span className="font-bold text-primary dark:text-primary">
                                  ${row.result.toLocaleString()}
                                </span>
                              ) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full bg-muted text-xs">
                                {row.data_source || 'Unknown'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Current Year Performance Tab Content */}
          <TabsContent value="current" className="pt-2">
            <Card>
              <CardContent className="p-6">
                <CurrentYearPerformance />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stats;
