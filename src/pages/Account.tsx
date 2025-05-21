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

const Account = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [syncingPayPal, setSyncingPayPal] = useState(false);
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
        if (subscription.status === "ACTIVE" && subscription.paypal_subscription_id) {
          setSyncingPayPal(true);
          
          // Verify with PayPal
          const paypalStatus = await checkPayPalSubscriptionStatus(subscription.paypal_subscription_id);
          
          if (paypalStatus && paypalStatus !== "ACTIVE" && paypalStatus !== "APPROVED") {
            // Subscription has changed in PayPal, update our database
            await syncSubscriptionStatus(userId, subscription.paypal_subscription_id, paypalStatus);
            
            // Refresh subscription data from database after sync
            const { data: refreshedData, error: refreshError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', userId)
              .eq('id', subscription.id)
              .single();
            
            if (!refreshError && refreshedData) {
              subscription.status = refreshedData.status;
              
              // Notify user if subscription is no longer active
              if (subscription.status !== "ACTIVE") {
                toast({
                  title: "Subscription Update",
                  description: "Your subscription status has changed. Please check your PayPal account for details.",
                  variant: "destructive",
                });
              }
            }
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
    }
  };

  // Manual refresh of subscription status
  const handleRefreshSubscription = async () => {
    if (!session?.user) return;
    
    toast({
      title: "Checking subscription...",
      description: "Verifying your subscription status with PayPal",
    });
    
    await checkSubscriptionStatus(session.user.id);
    
    toast({
      title: "Subscription Status Updated",
      description: hasActiveSubscription 
        ? "Your subscription is active" 
        : "You don't have an active subscription",
    });
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
              <SubscriptionStatus 
                hasActiveSubscription={hasActiveSubscription} 
                selectedTier={userSubscription?.tier}
                isLoading={subscriptionLoading || syncingPayPal} 
                subscriptionId={userSubscription?.paypal_subscription_id}
                onSubscriptionUpdate={handleSubscriptionUpdate}
              />
              
              {session && (
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleRefreshSubscription}
                    disabled={subscriptionLoading || syncingPayPal}
                  >
                    {subscriptionLoading || syncingPayPal ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="sr-only sm:not-sr-only sm:ml-1">Refresh</span>
                  </Button>
                </div>
              )}
            </div>
            
            <AlgorithmPanel session={session} userProfile={userProfile} />
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
