
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { AlgorithmPanel } from "@/components/algorithm/AlgorithmPanel";
import { SubscriptionStatus } from "@/components/payments/SubscriptionStatus";

interface UserProfile {
  id: string;
  username: string | null;
  trader_service_name: string | null;
  trader_secret: string | null;
}

interface Subscription {
  id: string;
  status: string;
  tier: number;
  price: number;
}

const Account = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, trader_service_name, trader_secret')
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

  // Check subscription status from Supabase
  const checkSubscriptionStatus = async (userId: string) => {
    try {
      setSubscriptionLoading(true);
      
      // Query the subscriptions table for active subscriptions for this user
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching subscription status:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setHasActiveSubscription(true);
        setUserSubscription(data[0]);
        console.log("Found active subscription:", data[0]);
      } else {
        setHasActiveSubscription(false);
        setUserSubscription(null);
        console.log("No active subscription found");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setSubscriptionLoading(false);
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
            <SubscriptionStatus 
              hasActiveSubscription={hasActiveSubscription} 
              selectedTier={userSubscription?.tier}
              isLoading={subscriptionLoading} 
            />
            <AlgorithmPanel session={session} userProfile={userProfile} />
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
