
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Activity, Play, Square, LogOut, Loader2, Mail, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

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
}

const Account = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [results, setResults] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "running" | "stopped">("idle");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize forms
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, trader_service_name, trader_secret')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        console.log('Profile data fetched:', data); // Debug log
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };
  
  // Call the trader service API - updated for new domain
  const callTraderServiceAPI = async (endpoint: string, method: 'GET' | 'POST' = 'GET') => {
    if (!userProfile?.trader_service_name || !userProfile?.trader_secret) {
      setResults(prev => `${prev}\nError: Missing trader service credentials`);
      toast({
        title: "API Error",
        description: "Missing trader service credentials",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      // Create URL for the API request with new domain
      const baseUrl = "https://auth.decoglobal.us:8443"; // Updated domain with SSL port
      const path = `/services/${userProfile.trader_service_name}/${endpoint}`;
      const url = `${baseUrl}${path}`;
      
      // Log request details for debugging
      console.log(`Making API ${method} call to: ${url}`);
      console.log(`Request path: ${path}`);
      
      // Make the API request
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${userProfile.trader_secret}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Parse and return the actual API response
      try {
        const data = await response.json();
        console.log('API Response:', data);
        return data;
      } catch (e) {
        // If we can't parse JSON, return a text response
        const text = await response.text();
        console.log('API Response (text):', text);
        return text;
      }
    } catch (error: any) {
      console.error('API call error:', error);
      setResults(prev => `${prev}\nAPI Error: ${error.message}`);
      toast({
        title: "API Error",
        description: error.message || "Failed to call trader service",
        variant: "destructive",
      });
      return null;
    }
  };

  // Check for authentication on component mount
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        // First set up auth state listener to keep state updated
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log('Auth state changed:', event); // Debug log
            setSession(currentSession);
            setLoading(false);
            
            // When user logs in, fetch their profile and check service status
            if (event === 'SIGNED_IN' && currentSession?.user) {
              console.log('User signed in, fetching profile'); // Debug log
              fetchUserProfile(currentSession.user.id).then(() => {
                // We use setTimeout to avoid any potential deadlocks with Supabase auth
                setTimeout(() => checkBotStatus(), 1000);
              });
            }
          }
        );

        // Then check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session:', currentSession?.user?.id || 'none'); // Debug log
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
          // Check bot status after profile is loaded
          setTimeout(() => checkBotStatus(), 1000);
        }
        
        setLoading(false);

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error checking auth status:", error);
        setLoading(false);
      }
    };

    getSession();
  }, []);

  // New function to check bot status
  const checkBotStatus = async () => {
    if (!userProfile?.trader_service_name) {
      console.log("No trader service name available yet");
      return;
    }
    
    setCheckingStatus(true);
    setResults("Checking current bot status...");
    
    const statusResponse = await callTraderServiceAPI("status", "GET");
    setCheckingStatus(false);
    
    if (statusResponse) {
      // Format the response as a string for display
      const responseStr = JSON.stringify(statusResponse);
      setResults(`API Response: ${responseStr}`);
      
      // Parse the response and update UI based on "active" status
      if (typeof statusResponse === 'object' && statusResponse !== null) {
        const serviceStatus = statusResponse as ServiceStatus;
        
        if (serviceStatus.active === "failed") {
          setStatus("stopped");
          setResults(`Bot is currently not running (status: ${serviceStatus.active}).
You can start it using the Start button.`);
          toast({
            title: "Bot Status",
            description: "Bot is currently not running",
          });
        } else {
          setStatus("running");
          setResults(`Bot is currently running (status: ${serviceStatus.active}).
Service: ${serviceStatus.service}
PID: ${serviceStatus.pid}
Enabled: ${serviceStatus.enabled}`);
          toast({
            title: "Bot Status",
            description: "Bot is currently running",
          });
        }
      }
    } else {
      setResults("Failed to check bot status. Please try again.");
    }
  };

  const handleLogin = async (formData: z.infer<typeof loginSchema>) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (formData: z.infer<typeof signupSchema>) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Successful",
          description: "Please check your email to verify your account.",
        });
        // Switch to login tab after successful signup
        setAuthTab("login");
      }
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Reset state
      setResults("");
      setStatus("idle");
      setUserProfile(null);
      
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
    const apiResponse = await callTraderServiceAPI("start", "POST");
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
    const apiResponse = await callTraderServiceAPI("stop", "POST");
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

  const handleStatus = async () => {
    await checkBotStatus();
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/account'
        }
      });

      if (error) {
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Google Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        
        {!session ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Account Access</CardTitle>
              <CardDescription>
                Sign in or create a new account to access your trading algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 mt-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" /> Login with Email
                          </>
                        )}
                      </Button>
                      
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleGoogleSignIn}
                        disabled={authLoading}
                      >
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262">
                          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"/>
                          <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"/>
                          <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"/>
                          <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="signup">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4 mt-4">
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                          </>
                        ) : (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" /> Create Account
                          </>
                        )}
                      </Button>
                      
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleGoogleSignIn}
                        disabled={authLoading}
                      >
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262">
                          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"/>
                          <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"/>
                          <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"/>
                          <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </CardFooter>
          </Card>
        ) : (
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
                <div className="flex flex-wrap gap-4 mb-6">
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
                    onClick={handleStatus}
                    variant="outline"
                    disabled={checkingStatus}
                    className="flex items-center gap-2"
                  >
                    {checkingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                    Status
                  </Button>
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
                      results || "No results to display. Start the algorithm to see output."
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">API Configuration</h3>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Service Name:</span> {userProfile?.trader_service_name || "Not configured"}
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">API Key Status:</span> {userProfile?.trader_secret ? "Configured" : "Not configured"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: To update these values, please contact your administrator.
                  </p>
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
