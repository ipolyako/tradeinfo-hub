import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TraderServiceAPI } from "@/utils/traderServiceAPI";
import { ToastProps } from "@/types/toast";

interface UserProfile {
  id: string;
  username: string | null;
  trader_service_name: string | null;
  trader_secret: string | null;
  server_URL: string | null;
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

type ServiceState = "idle" | "running" | "stopped" | "not_configured";

export const AlgorithmPanel = ({ session, userProfile }: AlgorithmPanelProps) => {
  const [results, setResults] = useState<string>("Click the Status button to check your bot status.");
  const [status, setStatus] = useState<ServiceState>("idle");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [tradingAmount, setTradingAmount] = useState<string>("");
  const { toast } = useToast();
  
  const traderAPI = new TraderServiceAPI(userProfile, setResults, toast as (props: ToastProps) => void);

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
        
        if (serviceStatus.active === "inactive" || serviceStatus.enabled === "disabled") {
          setStatus("not_configured");
          setResults(`Your trading service is not configured on the system.\n\nPlease contact customer support to set up your trading service.\n\nCurrent Status:\n• Service: ${serviceStatus.service}\n• Status: ${serviceStatus.active}\n• Enabled: ${serviceStatus.enabled}\n• Trading Amount: ${serviceStatus.amount}`);
          toast({
            title: "Service Not Configured",
            description: "Please contact customer support to set up your trading service",
            variant: "warning"
          });
        } else if (serviceStatus.active === "failed") {
          setStatus("stopped");
          setResults(`Your trading service is not running.\n\nYou can start it using the Start button above.\n\nCurrent Status:\n• Service: ${serviceStatus.service}\n• Status: ${serviceStatus.active}\n• Enabled: ${serviceStatus.enabled}\n• Trading Amount: ${serviceStatus.amount}`);
          toast({
            title: "Service Not Running",
            description: "You can start the service using the Start button",
            variant: "warning"
          });
        } else {
          setStatus("running");
          setResults(`Your trading service is running successfully.\n\nCurrent Status:\n• Service: ${serviceStatus.service}\n• Status: ${serviceStatus.active}\n• Enabled: ${serviceStatus.enabled}\n• Trading Amount: ${serviceStatus.amount}`);
          toast({
            title: "Service Running",
            description: "Your trading service is active and running",
          });
        }
      } else {
        // If response isn't in expected format
        setResults(`Unable to determine service status.\n\nReceived response:\n${responseStr}`);
      }
    } else {
      setResults("Unable to check service status. Please verify your connection and try again.");
      toast({
        title: "Connection Error",
        description: "Unable to connect to the trading service",
        variant: "warning"
      });
    }
  };

  const handleStart = async () => {
    setStatus("running");
    setResults("Starting your trading service...");
    
    // Call the start endpoint with POST method
    const apiResponse = await traderAPI.callAPI("start", "POST");
    if (apiResponse) {
      if (typeof apiResponse === 'object' && apiResponse.action === "started") {
        setResults(`Trading service started successfully.\n\nService: ${apiResponse.service}\nAction: ${apiResponse.action}`);
        toast({
          title: "Service Started",
          description: "Your trading service has been started successfully",
        });
        // After starting, check status again to update UI
        setTimeout(() => checkBotStatus(), 2000);
      } else {
        setResults(`Unexpected response from service:\n${JSON.stringify(apiResponse, null, 2)}`);
        toast({
          title: "Start Response Error",
          description: "Received unexpected response from service",
          variant: "warning"
        });
      }
    } else {
      setStatus("stopped");
      setResults("Failed to start trading service. Please try again.");
      toast({
        title: "Start Failed",
        description: "Unable to start trading service",
        variant: "destructive"
      });
    }
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
    } else {
      toast({
        title: "Stop Failed",
        description: "Unable to stop trading algorithm",
        variant: "warning"
      });
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
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button 
              onClick={handleStart}
              disabled={status === "running" || checkingStatus || status === "not_configured"}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
            <Button 
              onClick={handleStop}
              disabled={status !== "running" || checkingStatus || status === "not_configured"}
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
