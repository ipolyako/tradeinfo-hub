
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Activity, Play, Square } from "lucide-react";

const Account = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "running" | "stopped">("idle");
  const { toast } = useToast();

  // OAuth authentication function
  const handleLogin = (provider: string) => {
    // Prepare the redirect URL back to this page after authentication
    const redirectUrl = encodeURIComponent(window.location.origin + "/account");
    
    // Set up OAuth URLs for different providers
    const authUrls: Record<string, string> = {
      Google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUrl}&response_type=code&scope=profile email&prompt=select_account`,
      Facebook: `https://www.facebook.com/v13.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=${redirectUrl}&state=random_state_string&scope=email,public_profile`,
      Outlook: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUrl}&response_type=code&scope=openid profile email`
    };

    // In a demo environment, we'll simulate the login
    if (process.env.NODE_ENV !== "production") {
      console.log(`Demo mode: Would redirect to ${authUrls[provider]}`);
      setTimeout(() => {
        setIsAuthenticated(true);
        toast({
          title: "Demo Login Successful",
          description: `You've been authenticated with ${provider} (demo mode)`,
        });
      }, 1000);
      return;
    }

    // In production, redirect to the authentication URL
    window.location.href = authUrls[provider];
  };

  const handleStart = () => {
    setStatus("running");
    setResults("Algorithm started. Processing market data...");
    toast({
      title: "Algorithm Started",
      description: "Your trading algorithm is now running",
    });
  };

  const handleStop = () => {
    setStatus("stopped");
    setResults(prev => `${prev}\nAlgorithm stopped at ${new Date().toLocaleTimeString()}`);
    toast({
      title: "Algorithm Stopped",
      description: "Your trading algorithm has been stopped",
    });
  };

  const handleStatus = () => {
    const statusMessage = `Current status: ${status}\nTimestamp: ${new Date().toLocaleTimeString()}`;
    setResults(prev => `${prev}\n${statusMessage}`);
    toast({
      title: "Status Updated",
      description: `Algorithm is currently ${status}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        
        {!isAuthenticated ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Sign in using one of the following methods to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleLogin("Google")}
              >
                Sign in with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleLogin("Facebook")}
              >
                Sign in with Facebook
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleLogin("Outlook")}
              >
                Sign in with Outlook
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Control Panel</CardTitle>
                <CardDescription>
                  Manage and monitor your algorithmic trading operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Button 
                    onClick={handleStart}
                    disabled={status === "running"}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                  <Button 
                    onClick={handleStop}
                    disabled={status === "idle" || status === "stopped"}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                  <Button 
                    onClick={handleStatus}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Status
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Results</h3>
                  <div className="bg-muted p-4 rounded-md h-[200px] overflow-y-auto font-mono text-sm whitespace-pre-line">
                    {results || "No results to display. Start the algorithm to see output."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
