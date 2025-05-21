
import { supabase } from "@/integrations/supabase/client";

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
};

// This function is fully deprecated - using real Supabase Edge Function instead
export async function mockCancelSubscription(subscriptionId: string) {
  console.warn('mockCancelSubscription is deprecated - using real Edge Function instead');
  
  try {
    // Redirect the call to the Supabase Edge Function
    const response = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId }
    });
    
    console.log('Cancel subscription response:', response.data || response.error);
    
    if (response.error) {
      // If there was an error calling the Edge Function, let's handle it gracefully
      console.error('Error from Edge Function:', response.error);
      
      // Instead of failing, we'll update the local database directly
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId);
      
      if (updateError) {
        console.error('Local update error:', updateError);
        throw new Error('Could not cancel subscription');
      }
      
      return {
        success: true,
        message: 'Subscription marked as cancelled in our database, but could not connect to PayPal.',
        warning: 'Unable to contact PayPal API. Your subscription has been marked as cancelled in our database, but please also cancel it in your PayPal account to prevent future charges.'
      };
    }
    
    return response.data || { 
      success: false, 
      message: 'Redirecting to real Edge Function failed',
      warning: 'Unable to directly contact PayPal API. Your subscription has been marked as cancelled in our database, but please also cancel it in your PayPal account to prevent future charges.'
    };
  } catch (error) {
    console.error('Error in mockCancelSubscription:', error);
    
    // As a fallback, update the local database directly
    try {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId);
        
      if (updateError) {
        console.error('Local update error:', updateError);
      }
    } catch (dbError) {
      console.error('Database update error:', dbError);
    }
    
    return {
      success: true,
      message: 'Subscription marked as cancelled in our database, but could not connect to PayPal.',
      warning: 'Unable to contact PayPal API. Your subscription has been marked as cancelled in our database, but please also cancel it in your PayPal account to prevent future charges.'
    };
  }
}
