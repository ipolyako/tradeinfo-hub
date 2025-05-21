
import { supabase } from "@/integrations/supabase/client";

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
};

// Function to interact with our PayPal subscription edge function
export async function handleSubscription(subscriptionId: string, options?: { action?: 'check' | 'cancel' }) {
  try {
    console.log("Handling subscription:", subscriptionId, options);
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('paypal-subscription', {
      body: {
        subscriptionId,
        action: options?.action || 'check'
      }
    });

    if (error) {
      console.error('Error calling PayPal subscription function:', error);
      throw new Error(`Failed to process subscription: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in handleSubscription:', error);
    return {
      success: false,
      message: `Error processing subscription: ${error.message || 'Unknown error'}`,
      isActive: false,
      warning: 'There was a problem communicating with PayPal. Please try again later.'
    };
  }
}

// For backward compatibility during transition, but now calls real API
export async function mockCancelSubscription(subscriptionId: string, options?: { action?: 'check' | 'cancel' }) {
  return handleSubscription(subscriptionId, options);
}
