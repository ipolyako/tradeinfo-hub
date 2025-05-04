
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Play, Square, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TraderServiceAPI } from "@/utils/traderServiceAPI";

interface UserProfile {
  id: string;
  username: string | null;
  trader_service_name: string | null;
  trader_secret: string | null;
}

interface ServiceStatus {
  active: string;
  enabled: string;
  pid: string;
  service: string;
  amount: string;
}

interface AlgorithmPanelProps {
  session: any;
  userProfile: UserProfile | null;
}

export const AlgorithmPanel = ({ session, userProfile }: AlgorithmPanelProps) => {
  const [results, setResults] = useState<string>("Click the Status button to check your bot status.");
  const [status, setStatus] = useState<"idle" | "running" | "stopped">("idle");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [tradingAmount, setTradingAmount] = useState<string>("");
  const { toast } = useToast();
  
  const traderAPI = new TraderServiceAPI(userProfile, setResults, toast);

  // Check bot status function
  const checkBotStatus = async () => {
    console.log("Checking bot status, userProfile:", userProfile);
    
    setCheckingStatus(true);
    setResults("Checking current bot status...");
    
    const statusResponse = await traderAPI.callAPI("status", "GET");
    setCheckingStatus(false);
    
    if (statusResponse) {
      // Format the response as a string for display
      const responseStr = JSON.stringify(statusResponse);
      console.log("Status response received:", responseStr);
      
      // Parse the response and update UI based on "active" status
      if (typeof statusResponse === 'object' && statusResponse !== null) {
        const serviceStatus = statusResponse as ServiceStatus;
        
        // Set the trading amount from the response
        setTradingAmount(serviceStatus.amount || "N/A");
        
        if (serviceStatus.active === "failed") {
          setStatus("stopped");
          setResults(`Bot is currently not running (status: ${serviceStatus.active}).\nYou can start it using the Start button.`);
          toast({
            title: "Bot Status",
            description: "Bot is currently not running",
          });
        } else {
          setStatus("running");
          setResults(`Bot is currently running (status: ${serviceStatus.active}).\nService: ${serviceStatus.service}\nPID: ${serviceStatus.pid}\nEnabled: ${serviceStatus.enabled}\nTrading Amount: ${serviceStatus.amount}`);
          toast({
            title: "Bot Status",
            description: "Bot is currently running",
          });
        }
      } else {
        // If response isn't in expected format
        setResults(`API Response: ${responseStr}\n\nUnable to determine bot status from response.`);
      }
    } else {
      setResults("Failed to check bot status. Verify your trader service configuration and try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Reset state
      setResults("");
      setStatus("idle");
      
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleStart = async () => {
    setStatus("running");
    setResults("Algorithm started. Processing market data...");
    
    // Call the start endpoint with POST method
    const apiResponse = await traderAPI.callAPI("start", "POST");
    if (apiResponse) {
      setResults(`API Response: ${JSON.stringify(apiResponse)}`);
      // After starting, check status again to update UI
      setTimeout(() => checkBotStatus(), 2000);
    }
    
    toast({
      title: "Algorithm Started",
      description: "Your trading algorithm is now running",
    });
  };

  const handleStop = async () => {
    setStatus("stopped");
    setResults("Sending stop command...");
    
    // Call the stop endpoint with POST method
    const apiResponse = await traderAPI.callAPI("stop", "POST");
    if (apiResponse) {
      setResults(`API Response: ${JSON.stringify(apiResponse)}`);
      // After stopping, check status again to update UI
      setTimeout(() => checkBotStatus(), 2000);
    }
    
    toast({
      title: "Algorithm Stopped",
      description: "Your trading algorithm has been stopped",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Algorithm Control Panel</CardTitle>
            <CardDescription>
              Manage and monitor your algorithmic trading operations
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Signed in as {session.user?.email}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button 
              onClick={handleStart}
              disabled={status === "running" || checkingStatus}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
            <Button 
              onClick={handleStop}
              disabled={status !== "running" || checkingStatus}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
            <Button 
              onClick={checkBotStatus}
              variant="outline"
              disabled={checkingStatus}
              className="flex items-center gap-2"
            >
              {checkingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Check Status
            </Button>
            
            {tradingAmount && (
              <div className="text-sm py-2 px-3 bg-muted rounded-md">
                <span className="font-medium">Trading Amount:</span> {tradingAmount}
              </div>
            )}
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md mb-6">
            <p className="text-sm text-center text-muted-foreground">
              Click the <strong>Check Status</strong> button to get the current status of your trading algorithm
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <div className="bg-muted p-4 rounded-md h-[200px] overflow-y-auto font-mono text-sm whitespace-pre-line">
              {checkingStatus ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking current bot status...</span>
                </div>
              ) : (
                results
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
