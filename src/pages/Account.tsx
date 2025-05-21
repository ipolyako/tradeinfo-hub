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
import { mockCancelSubscription } from "@/functions/cancel-subscription";

interface UserProfile {
  id: string;
  username: string | null;
  trader_service_name: string | null;
  trader_secret: string | null;
  server_URL: string | null;
}

interface Subscription {
  id: string;
  tier: number;
  price: number;
  paypal_subscription_id?: string;
}

const Account = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  // Fetch subscription information
  const fetchSubscriptionInfo = async (userId: string) => {
    try {
      setSubscriptionLoading(true);
      
      // Query the subscriptions table for subscriptions for this user
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, tier, price, paypal_subscription_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching subscription info:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setUserSubscription(data[0]);
        console.log("Found subscription:", data[0]);
        
        // Check status with PayPal
        if (data[0].paypal_subscription_id) {
          await checkPayPalStatus(data[0].paypal_subscription_id);
        } else {
          setIsActive(false);
        }
      } else {
        setUserSubscription(null);
        setIsActive(false);
        console.log("No subscription found");
      }
    } catch (error) {
      console.error("Error checking subscription info:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };
  
  // Check PayPal status
  const checkPayPalStatus = async (subscriptionId: string) => {
    try {
      const response = await mockCancelSubscription(subscriptionId, { action: 'check' });
      
      if (response.success) {
        setIsActive(response.isActive);
        console.log("PayPal status:", response.paypalStatus, "isActive:", response.isActive);
      } else {
        setIsActive(false);
        console.error("Failed to check PayPal status:", response.message);
      }
    } catch (error) {
      console.error("Error checking PayPal status:", error);
      setIsActive(false);
    }
  };

  // Handle subscription updates from child components
  const handleSubscriptionUpdate = (hasSubscription: boolean) => {
    setIsActive(hasSubscription);
    if (!hasSubscription) {
      setUserSubscription(null);
    } else {
      // Refresh subscription data if set to active
      if (session?.user) {
        fetchSubscriptionInfo(session.user.id);
      }
    }
  };

  // Manual refresh of subscription status
  const handleRefreshSubscription = async () => {
    if (!session?.user) return;
    
    setRefreshing(true);
    
    toast({
      title: "Checking subscription...",
      description: "Verifying your subscription status with PayPal",
    });
    
    if (userSubscription?.paypal_subscription_id) {
      await checkPayPalStatus(userSubscription.paypal_subscription_id);
    } else {
      await fetchSubscriptionInfo(session.user.id);
    }
    
    setRefreshing(false);
    
    toast({
      title: "Subscription Status Updated",
      description: isActive 
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
          await fetchSubscriptionInfo(currentSession.user.id);
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
              await fetchSubscriptionInfo(newSession.user.id);
            } else if (event === 'SIGNED_OUT') {
              setUserProfile(null);
              setUserSubscription(null);
              setIsActive(false);
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
                  disabled={subscriptionLoading || refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionLoading || refreshing ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>
              </div>
              
              <SubscriptionStatus 
                selectedTier={userSubscription?.tier}
                isLoading={subscriptionLoading || refreshing} 
                subscriptionId={userSubscription?.paypal_subscription_id}
                onSubscriptionUpdate={handleSubscriptionUpdate}
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
