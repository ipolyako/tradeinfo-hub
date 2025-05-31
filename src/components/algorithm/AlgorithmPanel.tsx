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
  service: string;
  amount: string;
  platform: string;
  symbols: string;
  runStatus: string;
  deploymentStatus: string;
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
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [tradingAmount, setTradingAmount] = useState<string>("");
  const { toast } = useToast();
  
  const traderAPI = new TraderServiceAPI(userProfile, setResults, toast as (props: ToastProps) => void);

  // Helper function to check if service is in a valid state for operations
  const isServiceOperational = (currentStatus: ServiceState): boolean => {
    return currentStatus === "stopped" || currentStatus === "running";
  };

  // Helper function to check if service is running
  const isServiceRunning = (currentStatus: ServiceState): boolean => {
    return currentStatus === "running";
  };

  // Helper function to format status message
  const formatStatusMessage = (serviceStatus: ServiceStatus): string => {
    const platformValue = serviceStatus.platform.includes('=') 
      ? serviceStatus.platform.split('=')[1] 
      : serviceStatus.platform;

    return `Status: ${serviceStatus.runStatus === 'active' ? 'Running' : 'Stopped'}
Trading Symbols: ${serviceStatus.symbols}
Platform: ${platformValue}
Deployment Status: ${serviceStatus.deploymentStatus === 'enabled' ? 'Service Configured' : 'Service is NOT configured'}`;
  };

  // Check bot status function
  const checkBotStatus = async () => {
    if (!userProfile?.trader_service_name || !userProfile?.trader_secret) {
      setResults("Please configure your trading service credentials first.");
      toast({
        title: "Configuration Required",
        description: "Please set up your trading service credentials",
        variant: "warning"
      });
      return;
    }

    console.log("Checking bot status, userProfile:", userProfile);
    
    setCheckingStatus(true);
    setResults("Checking current bot status...");
    
    try {
      const statusResponse = await traderAPI.callAPI("status", "GET");
      
      if (statusResponse) {
        // Format the response as a string for display
        const responseStr = JSON.stringify(statusResponse);
        console.log("Status response received:", responseStr);
        
        // Parse the response and update UI based on "active" status
        if (typeof statusResponse === 'object' && statusResponse !== null) {
          const serviceStatus = statusResponse as ServiceStatus;
          
          // Set the trading amount from the response
          setTradingAmount(serviceStatus.amount || "N/A");
          
          // Case 1: Not configured (inactive + disabled)
          if (serviceStatus.active === "inactive" && serviceStatus.enabled === "disabled") {
            setStatus("not_configured");
            setResults(`Your trading service is not configured on the system.\n\nPlease contact customer support to set up your trading service.\n\n${formatStatusMessage(serviceStatus)}`);
            toast({
              title: "Service Not Configured",
              description: "Please contact customer support to set up your trading service",
              variant: "warning"
            });
          }
          // Case 2: Configured but stopped (inactive + enabled)
          else if (serviceStatus.active === "inactive" && serviceStatus.enabled === "enabled") {
            setStatus("stopped");
            setResults(`Your trading service is configured but not running.\n\nYou can start it using the Start button above.\n\n${formatStatusMessage(serviceStatus)}`);
            toast({
              title: "Service Stopped",
              description: "Your service is configured and ready to start",
            });
          }
          // Case 3: Configured and running (active + enabled)
          else if (serviceStatus.active === "active" && serviceStatus.enabled === "enabled") {
            setStatus("running");
            setResults(`Your trading service is running successfully.\n\n${formatStatusMessage(serviceStatus)}`);
            toast({
              title: "Service Running",
              description: "Your trading service is active and running",
            });
          }
          // Handle any unexpected combinations
          else {
            setStatus("stopped");
            setResults(`Unexpected service state detected.\n\n${formatStatusMessage(serviceStatus)}`);
            toast({
              title: "Unexpected Status",
              description: "Service is in an unexpected state",
              variant: "warning"
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
    } catch (error) {
      console.error("Error checking status:", error);
      setResults(`Error checking service status: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast({
        title: "Error",
        description: "Failed to check service status",
        variant: "destructive"
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleStart = async () => {
    if (!userProfile?.trader_service_name || !userProfile?.trader_secret) {
      setResults("Please configure your trading service credentials first.");
      toast({
        title: "Configuration Required",
        description: "Please set up your trading service credentials",
        variant: "warning"
      });
      return;
    }

    setIsStarting(true);
    setResults("Starting your trading service...");
    
    try {
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
    } catch (error) {
      console.error("Error starting service:", error);
      setStatus("stopped");
      setResults(`Error starting service: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast({
        title: "Error",
        description: "Failed to start service",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (!userProfile?.trader_service_name || !userProfile?.trader_secret) {
      setResults("Please configure your trading service credentials first.");
      toast({
        title: "Configuration Required",
        description: "Please set up your trading service credentials",
        variant: "warning"
      });
      return;
    }

    setIsStopping(true);
    setResults("Stopping your trading service...");
    
    try {
      // Call the stop endpoint with POST method
      const apiResponse = await traderAPI.callAPI("stop", "POST");
      if (apiResponse) {
        setResults(`Trading service stopped successfully.\n\nService: ${apiResponse.service}\nAction: ${apiResponse.action || "stopped"}`);
        toast({
          title: "Service Stopped",
          description: "Your trading service has been stopped successfully",
        });
        // After stopping, check status again to update UI
        setTimeout(() => checkBotStatus(), 2000);
      } else {
        setResults("Failed to stop trading service. Please try again.");
        toast({
          title: "Stop Failed",
          description: "Unable to stop trading service",
          variant: "warning"
        });
      }
    } catch (error) {
      console.error("Error stopping service:", error);
      setResults(`Error stopping service: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast({
        title: "Error",
        description: "Failed to stop service",
        variant: "destructive"
      });
    } finally {
      setIsStopping(false);
    }
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
              disabled={!isServiceOperational(status) || checkingStatus || isServiceRunning(status) || isStarting || isStopping}
              className="flex items-center gap-2"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isStarting ? "Starting..." : "Start"}
            </Button>
            <Button 
              onClick={handleStop}
              disabled={!isServiceOperational(status) || checkingStatus || !isServiceRunning(status) || isStarting || isStopping}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isStopping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {isStopping ? "Stopping..." : "Stop"}
            </Button>
            <Button 
              onClick={checkBotStatus}
              variant="outline"
              disabled={checkingStatus || isStarting || isStopping}
              className="flex items-center gap-2"
            >
              {checkingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {checkingStatus ? "Checking..." : "Check Status"}
            </Button>
            
            {tradingAmount && (
              <div className="text-sm py-2 px-3 bg-muted rounded-md">
                <span className="font-medium">Trading Amount:</span> {tradingAmount}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Click <strong>Check Status</strong> to view current service state
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <div className="bg-muted p-4 rounded-md">
              <table className="min-w-full text-sm">
                <tbody>
                  {checkingStatus || isStarting || isStopping ? (
                    <tr>
                      <td colSpan={2} className="py-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>
                            {checkingStatus ? "Checking current status..." :
                             isStarting ? "Starting service..." :
                             "Stopping service..."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    results
                      .split('\n')
                      .filter(line => line.includes(':'))
                      .map((line, idx) => {
                        const [key, ...rest] = line.split(':');
                        const value = rest.join(':').trim();
                        return (
                          <tr key={idx} className="even:bg-muted/50">
                            <td className="py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap align-top">{key.trim()}</td>
                            <td className="py-2 text-foreground break-all align-top">{value}</td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
