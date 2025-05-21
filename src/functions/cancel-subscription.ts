
import { supabase } from "@/integrations/supabase/client";

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
};

// Simplified function that doesn't rely on the Edge Function
export async function mockCancelSubscription(subscriptionId: string, options?: { action?: 'check' | 'cancel' }) {
  try {
    console.log("Checking subscription status:", subscriptionId, options);

    // For development environments without PayPal credentials
    // Always simulate a successful subscription check/cancellation
    return {
      success: true,
      message: options?.action === 'cancel' ? 
        'Subscription cancelled successfully (simulation)' : 
        'Using simulated PayPal response for development',
      isActive: options?.action === 'cancel' ? false : true,
      paypalStatus: options?.action === 'cancel' ? 'CANCELLED_SIMULATED' : 'SIMULATED_ACTIVE',
      warning: options?.action === 'cancel' ? null : "PayPal API is not fully configured. Using simulated active subscription for development."
    };
  } catch (error) {
    console.error('Error in mockCancelSubscription:', error);
    
    // For development/testing environments, simulate an active subscription
    // This allows the UI to function without actual PayPal credentials
    return {
      success: true,
      message: 'Using simulated PayPal response for development',
      isActive: options?.action === 'cancel' ? false : true,
      paypalStatus: options?.action === 'cancel' ? 'CANCELLED_SIMULATED' : 'SIMULATED_ACTIVE',
      warning: options?.action === 'cancel' ? null : "PayPal API is not fully configured. Using simulated active subscription for development."
    };
  }
}
