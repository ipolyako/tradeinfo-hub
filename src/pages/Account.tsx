import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { AlgorithmPanel } from "@/components/algorithm/AlgorithmPanel";
import { SubscriptionStatus } from "@/components/payments/SubscriptionStatus";
import { CLIENT_ID } from "@/lib/paypal";

interface UserProfile {
  id: string;
  username: string | null;
  trader_service_name: string | null;
  trader_secret: string | null;
  server_URL: string | null;
}

interface Subscription {
  id: string;
  status: string;
  tier: number;
  price: number;
  paypal_subscription_id?: string;
}

// Function to verify subscription with PayPal API
const checkPayPalSubscriptionStatus = async (subscriptionId: string) => {
  try {
    // PayPal API requires OAuth token first
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(CLIENT_ID + ':')}`, // In production, use your secret key securely
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!tokenResponse.ok) {
      console.error('Failed to get PayPal OAuth token:', await tokenResponse.text());
      return null;
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Now fetch subscription details
    const subscriptionResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!subscriptionResponse.ok) {
      console.error('Failed to fetch subscription details:', await subscriptionResponse.text());
      return null;
    }
    
    const subscriptionData = await subscriptionResponse.json();
    return subscriptionData.status;
  } catch (error) {
    console.error('Error checking PayPal subscription:', error);
    return null;
  }
};

// Function to sync subscription status with our database
const syncSubscriptionStatus = async (userId: string, subscriptionId: string, paypalStatus: string) => {
  try {
    // Map PayPal status to our status format
    let ourStatus = "INACTIVE";
    if (paypalStatus === "ACTIVE" || paypalStatus === "APPROVED") {
      ourStatus = "ACTIVE";
    } else if (paypalStatus === "SUSPENDED") {
      ourStatus = "SUSPENDED";
    } else if (paypalStatus === "CANCELLED" || paypalStatus === "EXPIRED") {
      ourStatus = "CANCELLED";
    }
    
    // Update our database with the latest status from PayPal
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: ourStatus, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('paypal_subscription_id', subscriptionId);
      
    if (error) {
      console.error('Error updating subscription status in database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing subscription status:', error);
    return false;
  }
};

// Function to sync subscription status with PayPal
const syncSubscriptionWithPayPal = async (subscriptionId: string) => {
  try {
    // Call our Edge Function to check/sync the status
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { 
        subscriptionId,
        forceSync: true 
      }
    });
    
    if (error) {
      console.error('Error syncing subscription status:', error);
      return { success: false, message: error.message };
    }
    
    return { 
      success: true, 
      message: 'Subscription status checked',
      data 
    };
  } catch (error) {
    console.error('Error in syncSubscriptionStatus:', error);
    return { success: false, message: 'Failed to check subscription status' };
  }
};

// Function to force update subscription status in our database
const forceUpdateSubscriptionStatus = async (subscriptionId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('paypal_subscription_id', subscriptionId);
      
    if (error) {
      console.error('Error updating subscription status:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: `Subscription marked as ${status}` };
  } catch (error) {
    console.error('Error in forceUpdateSubscriptionStatus:', error);
    return { success: false, message: 'Failed to update subscription status' };
  }
};

const Account = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [syncingPayPal, setSyncingPayPal] = useState(false);
  const [performingAction, setPerformingAction] = useState(false);
  const { toast } = useToast();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, trader_service_name, trader_secret, server_URL')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        console.log('Profile data fetched:', data);
        setUserProfile(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Check subscription status from Supabase and sync with PayPal
  const checkSubscriptionStatus = async (userId: string) => {
    try {
      setSubscriptionLoading(true);
      
      // Query the subscriptions table for active subscriptions for this user
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching subscription status:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const subscription = data[0];
        
        // Check if we need to verify with PayPal
        if (subscription.paypal_subscription_id) {
          setSyncingPayPal(true);
          
          // Instead of using PayPal API, force check with our own backend
          try {
            const { data: forceSyncData, error: forceSyncError } = await supabase.functions.invoke('cancel-subscription', {
              body: { 
                subscriptionId: subscription.paypal_subscription_id,
                forceCheck: true 
              }
            });
            
            if (forceSyncError) {
              console.error('Error checking subscription status with edge function:', forceSyncError);
            } else if (forceSyncData?.status === 'CANCELLED' && subscription.status !== 'CANCELLED') {
              // Our Edge Function reports this subscription as cancelled, but our database says active
              // Let's update our database
              await supabase
                .from('subscriptions')
                .update({ 
                  status: 'CANCELLED', 
                  updated_at: new Date().toISOString() 
                })
                .eq('id', subscription.id);
                
              subscription.status = 'CANCELLED';
              
              // Notify user about the status change
              toast({
                title: "Subscription Status Updated",
                description: "Your subscription has been marked as cancelled based on our verification.",
                variant: "warning",
              });
            }
          } catch (syncError) {
            console.error('Error syncing subscription status with edge function:', syncError);
          }
          
          setSyncingPayPal(false);
        }
        
        setHasActiveSubscription(subscription.status === "ACTIVE");
        setUserSubscription(subscription);
        console.log(`Subscription status: ${subscription.status}`, subscription);
      } else {
        setHasActiveSubscription(false);
        setUserSubscription(null);
        console.log("No subscription found");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Handle subscription updates from child components
  const handleSubscriptionUpdate = (hasSubscription: boolean) => {
    setHasActiveSubscription(hasSubscription);
    if (!hasSubscription) {
      setUserSubscription(null);
    } else {
      // Refresh subscription data if set to active
      if (session?.user) {
        checkSubscriptionStatus(session.user.id);
      }
    }
  };

  // Manual refresh of subscription status
  const handleRefreshSubscription = async () => {
    if (!session?.user) return;
    
    toast({
      title: "Checking subscription...",
      description: "Verifying your subscription status",
    });
    
    await checkSubscriptionStatus(session.user.id);
    
    toast({
      title: "Subscription Status Updated",
      description: hasActiveSubscription 
        ? "Your subscription is active" 
        : "You don't have an active subscription",
    });
  };
  
  // Force mark subscription as ACTIVE
  const handleForceActivate = async () => {
    if (!userSubscription?.paypal_subscription_id) {
      toast({
        title: "Error",
        description: "No subscription found to activate",
        variant: "destructive",
      });
      return;
    }
    
    const confirmed = window.confirm(
      "Force set this subscription as ACTIVE in our database? This is useful if you know the subscription is active in PayPal but our system shows it as cancelled."
    );
    
    if (!confirmed) return;
    
    setPerformingAction(true);
    
    try {
      const result = await forceUpdateSubscriptionStatus(userSubscription.paypal_subscription_id, 'ACTIVE');
      
      if (result.success) {
        toast({
          title: "Subscription Activated",
          description: "The subscription has been marked as active in our database.",
        });
        
        // Refresh data
        if (session?.user) {
          await checkSubscriptionStatus(session.user.id);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      toast({
        title: "Activation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setPerformingAction(false);
    }
  };

  // Check for authentication on component mount
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        // First check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session:', currentSession?.user?.id || 'none');
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
          await checkSubscriptionStatus(currentSession.user.id);
        }
        
        // Always set loading to false after initial check
        setLoading(false);

        // Then set up auth state listener to keep state updated
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            setSession(newSession);
            
            // When user logs in, fetch their profile
            if (event === 'SIGNED_IN' && newSession?.user) {
              console.log('User signed in, fetching profile');
              await fetchUserProfile(newSession.user.id);
              await checkSubscriptionStatus(newSession.user.id);
            } else if (event === 'SIGNED_OUT') {
              setUserProfile(null);
              setHasActiveSubscription(false);
              setUserSubscription(null);
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error checking auth status:", error);
        setLoading(false);
      }
    };

    getSession();
  }, []);

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
          <AuthPanel />
        ) : (
          <>
            <div className="relative">
              <div className="mb-4 flex justify-end space-x-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshSubscription}
                  disabled={subscriptionLoading || syncingPayPal || performingAction}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionLoading || syncingPayPal ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>
                
                {userSubscription && userSubscription.status === 'CANCELLED' && (
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={handleForceActivate}
                    disabled={performingAction || subscriptionLoading || syncingPayPal}
                    className="border-green-500 hover:bg-green-50 text-green-600"
                  >
                    {performingAction ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Force Activate
                  </Button>
                )}
              </div>
              
              <SubscriptionStatus 
                hasActiveSubscription={hasActiveSubscription} 
                selectedTier={userSubscription?.tier}
                isLoading={subscriptionLoading || syncingPayPal || performingAction} 
                subscriptionId={userSubscription?.paypal_subscription_id}
                onSubscriptionUpdate={handleSubscriptionUpdate}
                onRefreshStatus={handleRefreshSubscription}
              />
            </div>
            
            <AlgorithmPanel session={session} userProfile={userProfile} />
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
