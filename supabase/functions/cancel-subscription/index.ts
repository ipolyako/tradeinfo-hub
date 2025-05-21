
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3"

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    // Parse request body
    const { subscriptionId } = await req.json();
    
    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create a Supabase client with the auth context of the logged-in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    );
    
    // Get the current user from the authorization header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    console.log(`Cancelling subscription: ${subscriptionId} for user: ${user.id}`);
    
    // In a real implementation, this would make API calls to PayPal
    // For example:
    // 1. Get PayPal access token first
    // const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': `Basic ${btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_SECRET')}`)}`
    //   },
    //   body: 'grant_type=client_credentials'
    // });
    // const tokenData = await tokenResponse.json();
    // const paypalAccessToken = tokenData.access_token;
    
    // 2. Then cancel the subscription
    // const paypalResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${paypalAccessToken}`
    //   },
    //   body: JSON.stringify({
    //     reason: 'User requested cancellation'
    //   })
    // });
    
    // Update the subscription status in our database
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId)
      .eq('user_id', user.id);
      
    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update subscription in database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Subscription cancelled successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error in cancel subscription:", error);
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
