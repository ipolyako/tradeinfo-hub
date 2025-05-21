
import { supabase } from "@/integrations/supabase/client";

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
};

// This function calls the real Supabase Edge Function
export async function mockCancelSubscription(subscriptionId: string, options?: { action?: 'check' | 'cancel' }) {
  try {
    // Prepare request parameters
    const params = {
      subscriptionId,
      action: options?.action || 'check'
    };
    
    console.log("Calling Edge Function to manage subscription:", subscriptionId, params);
    const response = await supabase.functions.invoke('cancel-subscription', {
      body: params
    });
    
    console.log('Subscription function response:', response.data || response.error);
    
    if (response.error) {
      console.error('Error from Edge Function:', response.error);
      throw new Error(response.error.message || 'Error connecting to subscription service');
    }
    
    return response.data || { 
      success: false, 
      message: 'Subscription check failed',
      isActive: false
    };
  } catch (error) {
    console.error('Error in mockCancelSubscription:', error);
    throw error;
  }
}
